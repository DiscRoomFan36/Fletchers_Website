package main

import (
	"fmt"
	"reflect"
	"slices"
	"syscall/js"
	"unsafe"
)

// will make 'parse_js_value_to_type()' panic if the js object has any extra fields
const STRICT_OBJECT_PARSING = true

// NOTE: I would make a test for this function, but syscall/js is not having a good time.
func parse_js_value_to_type[T any](js_value js.Value) (T, error) {
	var result T

	reflected_type := reflect.ValueOf(&result).Elem()
	err := parse_js_value_to_type_helper(js_value, reflected_type, "result")

	return result, err
}

// do not call this function, it is for internal use only
func parse_js_value_to_type_helper(js_value js.Value, reflected_type reflect.Value, name string) error {
	if !reflected_type.CanSet() { panic("cannot set reflected type for some reason?") }


	{ // quickly check the type of js.value
		current_type_kind := reflected_type.Kind()
		current_js_type   := js_value.Type()

		correct_js_type   := reflect_kind_to_js_type(current_type_kind)

		if correct_js_type != current_js_type {
			return fmt.Errorf("element of type '%s' expects a js.value of type '%s', got '%s' instead", current_type_kind.String(), correct_js_type.String(), current_js_type.String())
		}
	}


	switch reflected_type.Kind() {
	case reflect.Bool    : { reflected_type.SetBool (      js_value.Bool() ) }
	case reflect.Int     : { reflected_type.SetInt  (int64(js_value.Int()) ) }
	case reflect.Float32 : { reflected_type.SetFloat(      js_value.Float()) }

	case reflect.Struct: {

		// check if the type is js.value, this just means the user
		// has no idea how to type this thing correctly, so we are
		// just going to pass the whole thing to them
		if reflected_type.Type() == reflect.TypeFor[js.Value]() {

			reflected_type.Set(reflect.ValueOf(js_value))

		} else {

			// this wouldn't work anyway, but this is a better message
			if js_object_is_array(js_value) {
				return fmt.Errorf("expected to parse a struct, but js_value was an array, not an object.")
			}

			// if this is enabled, we make sure all the
			// fields are in the object, no more, no less
			if STRICT_OBJECT_PARSING {
				js_object_keys := js_get_keys_for_object(js_value)

				struct_keys := []string{}
				for i := range reflected_type.NumField() {
					Append(&struct_keys, reflected_type.Type().Field(i).Name)
				}

				// sort them so its easier to check what keys are there, and what are missing.
				slices.Sort(js_object_keys)
				slices.Sort(struct_keys)

				// keys the js object has that the struct doesn't
				extra_keys := []string{}
				// keys the struct has but the js object doesn't
				missing_keys := []string{}
				// // both share these keys
				// correct_keys := []string{}

				{
					j := 0
					for _, struct_key := range struct_keys {
						for js_object_keys[j] < struct_key {
							Append(&extra_keys, js_object_keys[j])
							j += 1
						}

						if struct_key == js_object_keys[j] {
							j += 1
							// Append(&correct_keys, struct_key)
							continue
						} else {
							Append(&missing_keys, struct_key)
						}
					}

					// the other keys that we missed
					Append(&extra_keys, js_object_keys[j:]...)
				}

				// oh no!
				is_missing_keys := len(missing_keys) > 0
				has_extra_keys  := len(extra_keys)   > 0
				if is_missing_keys || has_extra_keys {
					if is_missing_keys && !has_extra_keys {
						// only missing keys
						return fmt.Errorf("js object is missing keys, missing these key(s): %v", missing_keys)

					} else if has_extra_keys && !is_missing_keys {
						// js object has extra keys
						return fmt.Errorf("js object has extra keys, this is not allowed by STRICT_OBJECT_PARSING, extra key(s): %v", extra_keys)

					} else {
						// they have different sets of keys altogether
						return fmt.Errorf("js object is both: missing some keys (%v), and has extra fields than expected (%v), did you get your structure definitions right?", missing_keys, extra_keys)
					}
				}

				// everything is fine.
			}

			// lets parse all the fields!
			for i := range reflected_type.NumField() {
				field_value  := reflected_type.Field(i)
				struct_field := reflected_type.Type().Field(i)

				js_field     := js_value.Get(struct_field.Name)

				// fell down a massive rabbit hole, thank you random medium article.
				//
				// this funny check makes it so you can set unexported fields
				//
				// https://medium.com/@darshan.na185/modifying-private-variables-of-a-struct-in-go-using-unsafe-and-reflect-5447b3019a80
				if !field_value.CanSet() {
					// nice try golang, you cant stop me from touching this memory.
					pointer_to_field_anyway := unsafe.Pointer(field_value.UnsafeAddr())
					field_value = reflect.NewAt(field_value.Type(), pointer_to_field_anyway).Elem()
				}

				// lets get recursive!
				err := parse_js_value_to_type_helper(js_field, field_value, struct_field.Name)
				if err != nil {
					return fmt.Errorf("when parsing field %s in %s, got error: %v", struct_field.Name, name, err)
				}
			}
		}
	}

	case reflect.Slice: {
		// check if its an actual slice.
		if !js_object_is_array(js_value) {
			return fmt.Errorf("js object when trying to parse %v is not an array, it is an object with keys", name)
		}

		js_array_len := js_value.Length()

		reflected_type.Grow(js_array_len)
		reflected_type.SetLen(js_array_len)

		for array_index := range js_array_len {
			item_at_index := reflected_type.Index(array_index)

			err := parse_js_value_to_type_helper(js_value.Index(array_index), item_at_index, fmt.Sprintf("%s-%d", name, array_index))
			if err != nil {
				return fmt.Errorf("when parsing slice %s, got error: %v", name, err)
			}
		}
	}

	case reflect.Map: {
		key_type   := reflected_type.Type().Key()
		value_type := reflected_type.Type().Elem() // hope this is the right thing

		if key_type.Kind() != reflect.String {
			return fmt.Errorf("when trying to parse '%s', only maps with string keys are accepted, got type '%v'", name, key_type)
		}

		// check if this is actually an array, we do strict type checking here.
		if js_object_is_array(js_value) {
			return fmt.Errorf("when trying to parse '%s', js object was an array, not an object with keys.", name)
		}

		keys := js_get_keys_for_object(js_value)

		{ // make a new map, cannot assign to nil map
			new_reflected_map := reflect.MakeMapWithSize(reflected_type.Type(), len(keys))
			reflected_type.Set(new_reflected_map)
		}

		for _, key := range keys {
			new_js_field := js_value.Get(key)
			new_value := reflect.New(value_type).Elem()

			err := parse_js_value_to_type_helper(new_js_field, new_value, fmt.Sprintf("%s[%s]", name, key))
			if err != nil {
				return fmt.Errorf("when parsing %s into map[string]%s, with key '%s', got error: %v", name, value_type, key, err)
			}

			reflected_type.SetMapIndex(reflect.ValueOf(key), new_value)
		}
	}

	default: {
		fmt.Println("Got unknown type:", reflected_type.Type())
		panic("Unknown type")
		// fmt.Println("don't crash for now. lest just see how this goes")
	}
	}

	return nil
}


// func thing_to_js_value[T any](thing T) js.Value {
// 	var helper func(reflected_value reflect.Value) js.Value
// 	helper =   func(reflected_value reflect.Value) js.Value {

// 		switch reflected_value.Kind() {
// 		case reflect.Bool    : { return js.ValueOf(reflected_value.Bool()  ) }
// 		case reflect.Int     : { return js.ValueOf(reflected_value.Int()   ) }
// 		case reflect.Float32 : { return js.ValueOf(reflected_value.Float() ) }
// 		case reflect.Float64 : { return js.ValueOf(reflected_value.Float() ) }
// 		case reflect.String  : { return js.ValueOf(reflected_value.String()) }

// 		case reflect.Struct  : {
// 			new_js_value := js.ValueOf(make(map[string]any))

// 			struct_type := reflected_value.Type()
// 			for i := range reflected_value.NumField() {
// 				this_field        := reflected_value.Field(i)
// 				this_struct_field := struct_type.Field(i)

// 				new_js_value.Set(this_struct_field.Name, helper(this_field))
// 			}

// 			return new_js_value
// 		}

// 		default: { panic("thing_to_js_value: Unknown type in reflection") }
// 		}
// 	}

// 	return helper(reflect.ValueOf(thing))
// }


func js_object_is_array(js_value js.Value) bool {
	js_array_constructor := js.Global().Get("Array")
	is_a_js_array        := js_array_constructor.Call("isArray", js_value).Bool()
	return is_a_js_array
}

func js_get_keys_for_object(js_value js.Value) []string {
	// this thing has a lot of good functions in it.
	//
	// also this thing is known to exist.
	js_object_constructor := js.Global().Get("Object")

	keys_as_js_array := js_object_constructor.Call("keys", js_value)

	result := make([]string, keys_as_js_array.Length())
	for i := range keys_as_js_array.Length() {
		result[i] = keys_as_js_array.Index(i).String()
	}

	return result
}



// internal function
//
// for quick error checking
func reflect_kind_to_js_type(kind reflect.Kind) js.Type {
	switch kind {
	case reflect.Bool:    { return js.TypeBoolean }

	case reflect.Int:     { return js.TypeNumber  }
	case reflect.Float64: { return js.TypeNumber  }
	case reflect.Float32: { return js.TypeNumber  }

	case reflect.Struct:  { return js.TypeObject  }
	case reflect.Slice:   { return js.TypeObject  }
	case reflect.Map:     { return js.TypeObject  }

	case reflect.String:  { return js.TypeString  }

	default: { panic(fmt.Errorf("unknown kind of type %v", kind)) }
	}
}


