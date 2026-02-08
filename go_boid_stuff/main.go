//go:build wasm

package main

import (
	"fmt"
	"log"
	"reflect"
	"strings"
	"syscall/js"
	"time"
	"unsafe"
)

var img Image

var boid_sim Boid_simulation
var input Input_Status

var last_frame_time time.Time

const BOID_FACTOR = 50
const BOID_BOUNDS_WIDTH = 16 * BOID_FACTOR
const BOID_BOUNDS_HEIGHT = 9 * BOID_FACTOR


// Javascript function
//
// Uses reflection to dynamically get the parameters of the simulation
func GetProperties(this js.Value, args []js.Value) any {
	if len(args) != 0 {
		log.Panicf("GetProperties: don't pass anything to this function")
	}

	property_structs := Get_property_structs()

	// We have to do this because js.FuncOf() expects this function to return a map to any. (aka a javascript object.)
	properties_to_any := make(map[string]any)
	for k, v := range property_structs { properties_to_any[k] = v.Tag_as_string }
	return properties_to_any
}

// Javascript function
//
// # Uses reflection to dynamically set the parameters of the simulation
//
// TODO this might be slightly stupid... make a method on boid_sim that accepts a map or something.
func SetProperties(this js.Value, args []js.Value) any {
	if len(args) != 1 {
		log.Panicf("SetProperties: please pass in a object with properties to set")
	}

	obj := args[0]
	if obj.Type().String() != "object" {
		log.Panicf("SetProperties: arg is not an object, it is a %v", args[0].Type().String())
	}

	the_map := make(map[string]Union_Like)
	for name, prop_struct := range Get_property_structs() {
		value := obj.Get(name)
		if value.IsUndefined() { continue }

		union := Union_Like{}

		// the .Float() and others will panic is something is not right. Good behavior
		switch prop_struct.Property_type {
		case Property_Float: union.As_float = value.Float()
		case Property_Int  : union.As_int   = value.Int()
		case Property_Bool : union.As_bool  = value.Bool()

		default: log.Panicf("%v: unknown property in 'SetProperty()'", name)
		}

		the_map[name] = union
	}

	if len(the_map) == 0 {
		log.Panicf("SetProperties: Did not set any properties!!\n")
	}

	boid_sim.Set_Properties_with_map(the_map)
	return len(the_map)
}


func js_to_Vector(obj js.Value) Vec2[Boid_Float] {
	result := Vec2[float64]{
		x: obj.Get("x").Float(),
		y: obj.Get("y").Float(),
	}
	return Transform[float64, Boid_Float](result)
}
func js_to_Rectangle(obj js.Value) Rectangle {
	result := Rectangle{
		x: Boid_Float(obj.Get("x").Float()),
		y: Boid_Float(obj.Get("y").Float()),
		w: Boid_Float(obj.Get("width").Float()),
		h: Boid_Float(obj.Get("height").Float()),
	}
	return result
}


type Get_Next_Frame_Arguments struct {
	width, height int
	buffer js.Value
	mouse Mouse
	rects []Rectangle_js
}

type Mouse struct {
	pos          Vec2[Boid_Float]
	left_down    bool
	middle_down  bool
	right_down   bool
}

type Rectangle_js struct {
	x, y, width, height Boid_Float
}


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
			as_bool_ptr := (*bool)(item.base_pointer)
			*as_bool_ptr = item.js_value.Bool()
		}

		case reflect.Int: {
			as_int_ptr := (*int)(item.base_pointer)
			*as_int_ptr = item.js_value.Int()
		}

		case reflect.Float64: {
			as_f64_ptr := (*float64)(item.base_pointer)
			*as_f64_ptr = item.js_value.Float()
		}

		case reflect.Float32: {
			as_f32_ptr := (*float32)(item.base_pointer)
			*as_f32_ptr = float32(item.js_value.Float())
		}

		case reflect.Struct: {
			// heres where it all falls apart...

			// check if the type is js.value, this just means the user
			// has no idea how to type this thing correctly, so we are
			// just going to pass the whole thing to them
			//
			// also golang `rules for thee but not for me`
			if item.type_to_parse == reflect.TypeFor[js.Value]() {
				as_js_value_ptr := (*js.Value)(item.base_pointer)
				*as_js_value_ptr = item.js_value
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

			// fmt.Println("before making slice")

			// should i give this extra capacity? nah.
			generic_slice := reflect.MakeSlice(item.type_to_parse, js_array_len, js_array_len)

			// fmt.Println("after making slice")

			// holy fuck, this is super funny.
			as_slice_ptr  :=  (*[]int)(item.base_pointer)
			*as_slice_ptr  = *(*[]int)(generic_slice.UnsafePointer())

			// fmt.Println("after unsafe pointer")

			// now we just need to load the slice.
			//
			// lets hope the array isn't to long,
			//
			// reverse iteration because this is going onto a stack,
			// and will be pop'd off in reverse append order.
			// might make this faster, I don't really know.
			for slice_index := js_array_len-1; slice_index >= 0; slice_index -= 1 {
				// fmt.Println("before funny pointer")
				generic_slice_at_index := generic_slice.Index(slice_index)
				// fmt.Printf("%+v, %+v\n", generic_slice_at_index.CanAddr(), generic_slice_at_index.UnsafeAddr())
				// fmt.Println("after funny pointer")

				addr_of_element_in_slice := generic_slice_at_index.UnsafeAddr()

				panic("TODO: something is wrong here...")

				Append(&stack, Item{
					type_to_parse : slice_element_type,
					// this weill be type checked properly,
					js_value      : item.js_value.Index(slice_index),
					// look! they match! very funny
					// base_pointer  : generic_slice.Index(slice_index).UnsafePointer(),
					base_pointer  : unsafe.Pointer(addr_of_element_in_slice),
				})
			}
		}

		default: {
			// fmt.Printf("%+v, %+v\n", item, item.current_type)
			return result, fmt.Errorf("type '%s' is unknown, and is currently not settable", item.type_to_parse.String())
		}
		}
	}

	return result, nil
}


// Javascript function
//
// Will pass back a bunch of pixels, (though array), in [RGBA] format
func GetNextFrame(this js.Value, args []js.Value) any {

	// mouse_from_json, err := js_value_to_struct[Mouse](args[0].Get("mouse"))
	next_frame_args, err := js_value_to_struct[Get_Next_Frame_Arguments](args[0])
	if err != nil {
		fmt.Println("got error from js_value_to_struct:", err)
		panic("crash for now")
		// log.Panicln("got error from js_value_to_struct:", err)
	} else {
		fmt.Printf("next_frame_args: %+v\n", next_frame_args)

		recs := next_frame_args.rects
		fmt.Println("rects:", recs, len(recs), cap(recs))

		panic("Quit for now")
	}

	width  := args[0].Get("width").Int()
	height := args[0].Get("height").Int()
	array  := args[0].Get("buffer")

	mouse := args[0].Get("mouse")

	mouse_pos := js_to_Vector(mouse.Get("pos"))
	mouse_pos = Mult(mouse_pos, BOID_SCALE)

	rect_array := args[0].Get("rects")
	rect_array_length := rect_array.Length()

	// TODO this is kinda fragile.
	if len(boid_sim.Rectangles) < rect_array_length {
		boid_sim.Rectangles = make([]Rectangle, rect_array_length)
	}

	for i := range rect_array.Length() {
		rect := js_to_Rectangle(rect_array.Index(i))
		boid_sim.Rectangles[i] = World_to_boid_rect(rect)
	}


	input = Update_Input(
		input,
		mouse.Get("left_down")  .Bool(),
		mouse.Get("middle_down").Bool(),
		mouse.Get("right_down") .Bool(),
		mouse_pos,
	)

	img.Resize_Image(width, height)

	// TODO theres a bug here if you full screen a window...

	// Cool boid thing that makes the boid follow the screen
	// TODO maybe remove until later.
	boid_sim.Width  = World_to_boid(Boid_Float(width))
	boid_sim.Height = World_to_boid(Boid_Float(height))

	// TODO accept dt maybe
	new_frame_time := time.Now()
	dt := new_frame_time.Sub(last_frame_time).Seconds()
	last_frame_time = new_frame_time

	// Clamp dt to something reasonable.
	const REASONABLE_DT = 0.3
	dt = min(dt, REASONABLE_DT)

	// Calculate the next frame of boids
	// Times 60 because we want this to run at 60fps and dt=1 is supposed to be one time step
	// TODO ^ this comment is dumb, just make it work. '1 time step' is a dumb unit, just use m/s
	boid_sim.Update_boids(dt, input)

	// this might end up taking the most amount of time.
	Draw_Everything(&img, &boid_sim, dt, input)

	// copy the pixels, must be in RGBA format
	copied_bytes := js.CopyBytesToJS(array, img.To_RGBA_byte_array())
	return copied_bytes
}

func main() {
	println("Hello From Boid.go")

	// println("num cpu's", runtime.NumCPU())

	// set img to screen size, and shrink
	img = New_image(1920, 1080)
	boid_sim = New_boid_simulation(BOID_BOUNDS_WIDTH, BOID_BOUNDS_HEIGHT)

	last_frame_time = time.Now()

	js.Global().Set("GetProperties", js.FuncOf(GetProperties))
	js.Global().Set("SetProperties", js.FuncOf(SetProperties))
	js.Global().Set("GetNextFrame",  js.FuncOf(GetNextFrame))

	// something like this to do faster drawing.
	// js.Global().Call("draw_triangles", tries)

	// this stalls the go program, because go has a 'run time' that needs to be aware of everything. bleh
	<-make(chan struct{})
}
