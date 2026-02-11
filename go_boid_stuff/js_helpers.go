package main

import (
	"fmt"
	"reflect"
	"strings"
	"syscall/js"
	"unsafe"
)

func js_value_to_json(value js.Value) string {
	b := strings.Builder{}

	switch value.Type() {
	case js.TypeBoolean: {
		as_bool := value.Bool()
		if as_bool { b.WriteString("True")
		} else     { b.WriteString("False") }
	}

	case js.TypeObject: {
		b.WriteString("json: ")
		b.WriteString(value.String())
	}

	default: {
		panic(fmt.Errorf("js_value_to_json: Unknown Type %s", value.Type().String()))
	}
	}

	return b.String()
}

func set_unsafe_pointer_to_T[T any](unsafe_pointer unsafe.Pointer, value T) {
	as_T_ptr := (*T)(unsafe_pointer)
	*as_T_ptr = value
}

// in my house, the error goes first. harder to ignore.
func js_value_to_struct[T any](value js.Value) (T, error) {

	var result T
	result_base_pointer := unsafe.Pointer(&result)

	type Item struct {
		type_to_parse    reflect.Type
		js_value         js.Value
		base_pointer     unsafe.Pointer
	}

	stack := []Item{}
	Append(&stack, Item{
		type_to_parse : reflect.TypeFor[T](),
		js_value      : value,
		base_pointer  : result_base_pointer,
	})

	// for quick error checking
	type_kind_to_js_type := func(kind reflect.Kind) js.Type {
		switch kind {
		case reflect.Bool:    { return js.TypeBoolean }

		case reflect.Int:     { return js.TypeNumber  }
		case reflect.Float64: { return js.TypeNumber  }
		case reflect.Float32: { return js.TypeNumber  }

		case reflect.Struct:  { return js.TypeObject  }
		case reflect.Slice:   { return js.TypeObject  }

		default: { panic(fmt.Errorf("unknown kind of type %v", kind)) }
		}
	}


	for len(stack) > 0 {
		item := Pop(&stack)

		if item.js_value.IsNull() || item.js_value.IsUndefined() {
			return result, fmt.Errorf("When trying to parse '%v' type, js.value was null or undefined", item.type_to_parse)
		}

		{ // quickly check the type of js.value
			current_type_kind := item.type_to_parse.Kind()
			current_js_type   := item.js_value.Type()

			correct_js_type := type_kind_to_js_type(current_type_kind)

			if correct_js_type != current_js_type {
				return result, fmt.Errorf("element of type '%s' expects a js.value of type '%s', got '%s' instead", current_type_kind.String(), correct_js_type.String(), current_js_type.String())
			}
		}

		switch item.type_to_parse.Kind() {
		case reflect.Bool: {
			set_unsafe_pointer_to_T(item.base_pointer, item.js_value.Bool())
		}

		case reflect.Int: {
			set_unsafe_pointer_to_T(item.base_pointer, int(item.js_value.Int()))
		}

		case reflect.Float64: {
			set_unsafe_pointer_to_T(item.base_pointer, item.js_value.Float())
		}

		case reflect.Float32: {
			set_unsafe_pointer_to_T(item.base_pointer, float32(item.js_value.Float()))
		}

		case reflect.Struct: {
			// heres where it all falls apart...

			// check if the type is js.value, this just means the user
			// has no idea how to type this thing correctly, so we are
			// just going to pass the whole thing to them
			//
			// also golang `rules for thee but not for me`
			if item.type_to_parse == reflect.TypeFor[js.Value]() {
				set_unsafe_pointer_to_T(item.base_pointer, item.js_value)
			} else {

				// loop over all fields, put into stack.
				for i := range item.type_to_parse.NumField() {
					new_field := item.type_to_parse.Field(i)
					new_value := item.js_value.Get(new_field.Name)

					if new_value.IsNull() || new_value.IsUndefined() {
						return result, fmt.Errorf("Cannot find field %s in js.value %s", new_field.Name, js_value_to_json(item.js_value))
					}

					Append(&stack, Item{
						type_to_parse : new_field.Type,
						js_value      : new_value,
						base_pointer  : unsafe.Add(item.base_pointer, new_field.Offset),
					})
				}
			}
		}

		case reflect.Slice: {
			slice_element_type := item.type_to_parse.Elem()

			// its funny, we cannot tell the difference between an array and a
			// "map", lets hope you got the types right!
			js_array_len := item.js_value.Length()

			// should i give this extra capacity? nah. it's confusing enough as is.
			generic_slice := reflect.MakeSlice(item.type_to_parse, js_array_len, js_array_len)


			// unsafe pointer actually points to the first element in the slice,
			// witch is not what we want.
			//
			// we want to set the base pointer to a slice with data = that pointer,
			// and len and cap be the right thing.
			first_element_in_generic_slice := generic_slice.UnsafePointer()

			// we need to set the slice header thats in the struct. unfortunately
			// the capacity is not saved, also i think the memory might leak?
			//
			// @Garbage-collector this real array probably isn correctly registered.
			// lets hope you copy the array out or something,
			fake_slice_but_real_header := unsafe.Slice((*byte)(first_element_in_generic_slice), js_array_len)
			set_unsafe_pointer_to_T(item.base_pointer, fake_slice_but_real_header)

			// now we just need to load the slice.
			//
			// lets hope the array isn't to long,
			for slice_index := range js_array_len {

				slice_base_pointer := generic_slice.UnsafePointer()

				pointer_to_element_in_slice := unsafe.Add(slice_base_pointer, slice_index * int(slice_element_type.Size()))

				Append(&stack, Item{
					type_to_parse : slice_element_type,
					// every element in array will get type check eventually.
					js_value      : item.js_value.Index(slice_index),
					// look! they match! very funny
					base_pointer  : pointer_to_element_in_slice,
				})
			}
		}

		default: {
			return result, fmt.Errorf("type '%s' is unknown, and is currently not settable", item.type_to_parse.String())
		}
		}
	}

	return result, nil
}


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



func parse_js_value_to_type[T any](js_value js.Value) (T, error) {
	var result T

	reflected_type := reflect.ValueOf(&result).Elem()
	err := parse_js_value_to_type_helper(js_value, reflected_type, "result")

	return result, err
}

// do not call this function, it is for internal use only
func parse_js_value_to_type_helper(js_value js.Value, reflected_type reflect.Value, name string) error {
	if !reflected_type.CanSet() { panic("cannot set reflected type for some reason?") }

	switch reflected_type.Kind() {
	case reflect.Bool    : { reflected_type.SetBool (      js_value.Bool() ) }
	case reflect.Int     : { reflected_type.SetInt  (int64(js_value.Int()) ) }
	case reflect.Float32 : { reflected_type.SetFloat(      js_value.Float()) }

	case reflect.Struct: {

		// check if the type is js.value, this just means the user
		// has no idea how to type this thing correctly, so we are
		// just going to pass the whole thing to them
		if reflected_type.Type() == reflect.TypeFor[js.Value]() {

			reflected_js_field := reflect.ValueOf(js_value)
			reflected_type.Set(reflected_js_field)

		} else {

			// lets parse all the fields!
			for i := range reflected_type.NumField() {
				field_value  := reflected_type.Field(i)
				struct_field := reflected_type.Type().Field(i)

				js_field     := js_value.Get(struct_field.Name)

				{ // quickly check the type of js.value
					current_type_kind := field_value.Kind()
					current_js_type   := js_field.Type()

					correct_js_type   := reflect_kind_to_js_type(current_type_kind)

					if correct_js_type != current_js_type {
						return fmt.Errorf("element of type '%s' expects a js.value of type '%s', got '%s' instead", current_type_kind.String(), correct_js_type.String(), current_js_type.String())
					}
				}

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


// NOTE: I would make a test here, but syscall/js is not having a good time.


func js_object_is_array(js_value js.Value) bool {
	js_array_constructor := js.Global().Get("Array")
	is_a_js_array        := js_array_constructor.Call("isArray", js_value).Bool()
	return is_a_js_array
}

// TODO error checking in here
func js_get_keys_for_object(js_value js.Value) []string {

	// this thing has a lot of good functions in it.
	js_object_constructor := js.Global().Get("Object")

	keys_as_js_array := js_object_constructor.Call("keys", js_value)

	result := make([]string, keys_as_js_array.Length())
	for i := range keys_as_js_array.Length() {
		result[i] = keys_as_js_array.Index(i).String()
	}

	return result
}

