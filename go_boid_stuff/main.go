//go:build wasm

package main

import (
	"log"
	"syscall/js"
	"time"
)

var img Image;

var boid_sim Boid_simulation;
var user_input_this_frame Input_Status;

var last_frame_time time.Time;

const BOID_FACTOR = 50;
const BOID_BOUNDS_WIDTH  = 16 * BOID_FACTOR;
const BOID_BOUNDS_HEIGHT =  9 * BOID_FACTOR;


// Javascript function
//
// Uses reflection to dynamically get the properties of the simulation
func GetProperties(this js.Value, args []js.Value) any {
    if len(args) != 0 {
        log.Panicf("GetProperties: don't pass anything to this function");
    }

    property_structs := Get_property_structs();
    if len(property_structs) == 0 { panic("GetProperties: Get_property_structs did not return any structs?") }

    // We have to do this because js.FuncOf() expects this function to return a map to any. (aka a javascript object.)
    properties_to_any := make(map[string]any);
    for k, v := range property_structs { properties_to_any[k] = v.Tag_as_string; }
    return properties_to_any;
}

// Javascript function
//
// Uses reflection to dynamically set the properties of the simulation
func SetProperties(this js.Value, args []js.Value) any {
    if len(args) != 1 {
        log.Panicf("SetProperties: please pass in a object with properties to set");
    }

    map_from_prop_to_js_value, err := parse_js_value_to_type[map[string]js.Value](args[0]);
    if err != nil {
        log.Panicf("SetProperties: got error when parsing arguments: %v", err);
    }

    property_structs := Get_property_structs();
    things_to_set_map := make(map[string]Union_Like);

    for prop_name, js_value := range map_from_prop_to_js_value {
        prop_struct, found := property_structs[prop_name];
        if !found {
            log.Fatalf("SetProperties: tried to set a property that didn't exist, was '%s'", prop_name);
        }

        union := Union_Like{};
        switch prop_struct.Property_type {
            case Property_Float: union.As_float = js_value.Float();
            case Property_Int  : union.As_int   = js_value.Int();
            case Property_Bool : union.As_bool  = js_value.Bool();
        }
        things_to_set_map[prop_name] = union;
    }

    if len(things_to_set_map) == 0 {
        log.Panicf("SetProperties: Did not set any properties!!\n");
    }

    boid_sim.Set_Properties_with_map(things_to_set_map);
    return len(things_to_set_map);
}



// Javascript function
//
// Will pass back a bunch of pixels, (though array), in [RGBA] format
func GetNextFrame(this js.Value, args []js.Value) any {
    if len(args) != 1 {
        log.Panicf("GetNextFrame: got incorrect number of arguments, wanted 1, got %v", len(args));
    }

    type Get_Next_Frame_Arguments struct {
        // width and height that javascript wants us to draw into
        width, height int;
        // the buffer we will be drawing pixels onto,
        buffer js.Value;

        // mouse status, we construct more useful things from this small amount of info.
        mouse struct {
            pos          Vec2[Boid_Float];
            left_down    bool;
            middle_down  bool;
            right_down   bool;
        };

        // rectangles, aka the text on screen, probably need a better method for this stuff
        // but for now these are things that the boids will collide against.
        rectangles []Rectangle;
    }

    next_frame_args, err := parse_js_value_to_type[Get_Next_Frame_Arguments](args[0]);
    if err != nil {
        log.Panicf("GetNextFrame: error when parsing arguments: %v", err);
    }

    next_frame_args.mouse.pos = Mult(next_frame_args.mouse.pos, Boid_Float(BOID_SCALE));
    for i := range next_frame_args.rectangles {
        next_frame_args.rectangles[i] = World_to_boid_rect(next_frame_args.rectangles[i]);
    }
    // just changing this directly is probably bad
    boid_sim.Rectangles = next_frame_args.rectangles;

    // gotta love go not having named arguments,
    user_input_this_frame = Update_Input(
        user_input_this_frame,
        next_frame_args.mouse.left_down,
        next_frame_args.mouse.middle_down,
        next_frame_args.mouse.right_down,
        next_frame_args.mouse.pos,
    );

    img.Resize_Image(next_frame_args.width, next_frame_args.height);

    // TODO theres a bug here if you full screen a window...

    // Cool boid thing that makes the boid follow the screen
    // TODO maybe remove until later.
    boid_sim.Width  = World_to_boid(Boid_Float(next_frame_args.width));
    boid_sim.Height = World_to_boid(Boid_Float(next_frame_args.height));


    // TODO accept dt maybe
    new_frame_time := time.Now();
    dt := new_frame_time.Sub(last_frame_time).Seconds();
    last_frame_time = new_frame_time;

    // Clamp dt to something reasonable.
    const REASONABLE_MAX_DT = 0.3;
    dt = min(dt, REASONABLE_MAX_DT);

    // Calculate the next frame of boids
    // Times 60 because we want this to run at 60fps and dt=1 is supposed to be one time step
    // TODO ^ this comment is dumb, just make it work. '1 time step' is a dumb unit, just use m/s
    boid_sim.Update_boids(dt, user_input_this_frame);

    // this might end up taking the most amount of time.
    Draw_Everything(&img, &boid_sim, dt, user_input_this_frame);

    // copy the pixels, must be in RGBA format
    copied_bytes := js.CopyBytesToJS(next_frame_args.buffer, img.To_RGBA_byte_array());
    return copied_bytes;
}

func main() {
    println("Hello From Boid.go");

    // always prints 1. :(
    // println("num cpu's", runtime.NumCPU())

    // set img to screen size, and shrink
    img = New_image(1920, 1080);
    boid_sim = New_boid_simulation(BOID_BOUNDS_WIDTH, BOID_BOUNDS_HEIGHT);

    last_frame_time = time.Now();

    js.Global().Set("GetProperties", js.FuncOf(GetProperties));
    js.Global().Set("SetProperties", js.FuncOf(SetProperties));
    js.Global().Set("GetNextFrame",  js.FuncOf(GetNextFrame));

    // TODO get some javascript functions for faster drawing...
    // functions := parse_js_value_to_type[map[string]js.Func]()

    // something like this to do faster drawing.
    // js.Global().Call("draw_triangles", tries)

    // this stalls the go program, because go has a 'run time' that needs to
    // be aware of everything. bleh
    <-make(chan struct{});
}
