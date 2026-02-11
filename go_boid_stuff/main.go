//go:build wasm

package main

import (
	"log"
	"syscall/js"
	"time"
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

	map_from_prop_to_js_value, err := parse_js_value_to_type[map[string]js.Value](args[0])
	if err != nil {
		log.Panicf("SetProperties: got error when parsing arguments: %v", err)
	}

	property_structs := Get_property_structs()
	things_to_set_map := make(map[string]Union_Like)

	for prop_name, js_value := range map_from_prop_to_js_value {
		prop_struct, found := property_structs[prop_name]
		if !found {
			log.Fatalf("SetProperties: tried to set a property that didn't exist, was '%s'", prop_name)
		}

		union := Union_Like{}
		switch prop_struct.Property_type {
			case Property_Float: union.As_float = js_value.Float()
			case Property_Int  : union.As_int   = js_value.Int()
			case Property_Bool : union.As_bool  = js_value.Bool()
		}
		things_to_set_map[prop_name] = union
	}

	if len(things_to_set_map) == 0 {
		log.Panicf("SetProperties: Did not set any properties!!\n")
	}

	boid_sim.Set_Properties_with_map(things_to_set_map)
	return len(things_to_set_map)
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
		w: Boid_Float(obj.Get("w").Float()),
		h: Boid_Float(obj.Get("h").Float()),
	}
	return result
}


type Get_Next_Frame_Arguments struct {
	width, height int
	buffer js.Value
	mouse Mouse
	rects []Rectangle
}

type Mouse struct {
	pos          Vec2[Boid_Float]
	left_down    bool
	middle_down  bool
	right_down   bool
}



// Javascript function
//
// Will pass back a bunch of pixels, (though array), in [RGBA] format
func GetNextFrame(this js.Value, args []js.Value) any {

	if len(args) != 1 { log.Panicf("GetNextFrame: got incorrect number of arguments, wanted 1, got %v", len(args)) }

	next_frame_args, err := parse_js_value_to_type[Get_Next_Frame_Arguments](args[0])
	if err != nil {
		log.Panicf("GetNextFrame: error when parsing arguments: %v", err)
	}

	next_frame_args.mouse.pos = Mult(next_frame_args.mouse.pos, Boid_Float(BOID_SCALE))
	for i := range next_frame_args.rects {
		next_frame_args.rects[i] = World_to_boid_rect(next_frame_args.rects[i])
	}
	boid_sim.Rectangles = next_frame_args.rects

	// mouse := args[0].Get("mouse")

	// mouse_pos := js_to_Vector(mouse.Get("pos"))
	// mouse_pos = Mult(mouse_pos, BOID_SCALE)

	// rect_array := args[0].Get("rects")
	// rect_array_length := rect_array.Length()

	// // TODO this is kinda fragile.
	// if len(boid_sim.Rectangles) < rect_array_length {
	// 	boid_sim.Rectangles = make([]Rectangle, rect_array_length)
	// }

	// for i := range rect_array.Length() {
	// 	rect := js_to_Rectangle(rect_array.Index(i))
	// 	boid_sim.Rectangles[i] = World_to_boid_rect(rect)
	// }


	// fmt.Println("boid_sim.Rectangles:", boid_sim.Rectangles, len(boid_sim.Rectangles), cap(boid_sim.Rectangles))

	// {
	// 	keys := js_get_keys_for_object(args[0])
	// 	fmt.Println(keys)

	// 	keys = js_get_keys_for_object(args[0].Get("rects"))
	// 	fmt.Println(keys)

	// 	// type Foo struct {
	// 	// 	mouse map[string]js.Value
	// 	// }
	// 	foo, err := parse_js_value_to_type[map[string]js.Value](args[0])
	// 	fmt.Println(foo, err)

	// 	panic("check if this works")
	// }

	// next_frame_args, err := parse_js_value_to_type[Get_Next_Frame_Arguments](args[0])

	// // mouse_from_json, err := js_value_to_struct[Mouse](args[0].Get("mouse"))
	// // next_frame_args, err := js_value_to_struct[Get_Next_Frame_Arguments](args[0])
	// if err != nil {
	// 	fmt.Println("got error from js_value_to_struct:", err)
	// 	panic("crash for now")
	// 	// log.Panicln("got error from js_value_to_struct:", err)
	// } else {
	// 	fmt.Printf("next_frame_args: %+v\n", next_frame_args)

	// 	// recs := next_frame_args.rects
	// 	// fmt.Println("rects:", recs, len(recs), cap(recs))

	// 	// panic("Quit for now")
	// }

	// if len(boid_sim.Rectangles) != len(next_frame_args.rects) {
	// 	panic("didn't get the same amount of rectangles")
	// }
	// TODO run world_to_boid_rect() on rects
	// for i := range next_frame_args.rects {
	// 	rec := next_frame_args.rects[i]
	// 	not_js_rectangle := Rectangle{rec.x, rec.y, rec.width, rec.height}
	// 	boid_sim.Rectangles[i] = not_js_rectangle
	// }



	// input = Update_Input(
	// 	input,
	// 	mouse.Get("left_down")  .Bool(),
	// 	mouse.Get("middle_down").Bool(),
	// 	mouse.Get("right_down") .Bool(),
	// 	mouse_pos,
	// )

	input = Update_Input(
		input,
		next_frame_args.mouse.left_down,
		next_frame_args.mouse.middle_down,
		next_frame_args.mouse.right_down,
		next_frame_args.mouse.pos,
	)

	// img.Resize_Image(width, height)
	img.Resize_Image(next_frame_args.width, next_frame_args.height)

	// TODO theres a bug here if you full screen a window...

	// Cool boid thing that makes the boid follow the screen
	// TODO maybe remove until later.
	// boid_sim.Width  = World_to_boid(Boid_Float(width))
	// boid_sim.Height = World_to_boid(Boid_Float(height))
	boid_sim.Width  = World_to_boid(Boid_Float(next_frame_args.width))
	boid_sim.Height = World_to_boid(Boid_Float(next_frame_args.height))


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
	// copied_bytes := js.CopyBytesToJS(array, img.To_RGBA_byte_array())
	copied_bytes := js.CopyBytesToJS(next_frame_args.buffer, img.To_RGBA_byte_array())
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
