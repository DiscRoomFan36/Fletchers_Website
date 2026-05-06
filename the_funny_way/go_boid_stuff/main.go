package main

import (
	"fmt"
	"log"
	"runtime"
	"syscall/js"
	"time"
)


var all_the_properties Properties;
var boid_sim Boid_simulation;

const BOID_DIMENSION_FACTOR = 80;
const BOID_DEFAULT_BOUNDS_WIDTH  = 16 * BOID_DIMENSION_FACTOR;
const BOID_DEFAULT_BOUNDS_HEIGHT =  9 * BOID_DIMENSION_FACTOR;


var the_canvas_render_context Js_Render_Context;
var the_back_buffer Screen;


func main() {
    fmt.Println("Hello, WebAssembly! 3");

    Init_Engine(BOID_DEFAULT_BOUNDS_WIDTH, BOID_DEFAULT_BOUNDS_HEIGHT, rgb(37, 37, 37));


    all_the_properties = get_default_properties();
    boid_sim = New_boid_simulation(BOID_DEFAULT_BOUNDS_WIDTH, BOID_DEFAULT_BOUNDS_HEIGHT);
    boid_sim.properties = &all_the_properties;
    // TODO drawing_properties?

    Call_function_once_per_frame_forever(do_one_frame);
}


//
// Init the "game" Engine.
//
// pass in the width and height you want to draw into,
// this cannot be changed (for now?)
//
//
// TODO dose js_background_color make any sense?
//
// if this was on a platform that is not javascript, (aka its in a window
// of some sort.) this background color would not matter at all.
//
// perhaps it would be better for the engine to just pick something.
//
// OR maybe when the user dose clear_background() on the screen, it sets
// the background of the web page as well. would have make the Screen
// object special. but maybe thats ok?
//
func Init_Engine(canvas_width, canvas_height int, js_background_color Color) {

    { // set the background color of the web page.
        js_color_string := js_color_string_from_color(js_background_color);

        // document.body.style.background = color;
        body_style := js.Global().Get("document").Get("body").Get("style");
        body_style.Set("background", js_color_string);
    }

    // create the main canvas.
    canvas := js.Global().Get("document").Call("createElement", "canvas");
    {
        canvas.Set("width" , canvas_width);
        canvas.Set("height", canvas_height);

        { // center and style main canvas

            canvas_style := canvas.Get("style");

            // make it take up the full width, will get changed in Call_function_once_per_frame_forever()
            //
            // if the screen size changes, probably don't even need this.
            // but its quick to do this now, and ask for forgiveness later.
            canvas_style.Set("width", "100%");


            // center canvas in middle of page
            //
            // the css code I'm copying: https://stackoverflow.com/a/7782251
            /*
            canvas {
                padding: 0;
                margin: auto;
                display: block;
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
            }
            */
            canvas_style.Set("padding",    "0");
            canvas_style.Set("margin",     "auto");
            canvas_style.Set("display",    "block");
            canvas_style.Set("position",   "absolute");
            canvas_style.Set("top",        "0");
            canvas_style.Set("bottom",     "0");
            canvas_style.Set("left",       "0");
            canvas_style.Set("right",      "0");
        }
    }

    // but the canvas on the screen.
    js.Global().Get("document").Get("body").Call("appendChild", canvas);

    // fmt.Println("canvas", js_value_to_string(canvas));
    the_canvas_render_context = New_Js_Render_Context(canvas);
    {
        // make a new offscreen canvas.
        width, height := the_canvas_render_context.width, the_canvas_render_context.height;
        offscreen_canvas := js.Global().Get("OffscreenCanvas").New(width, height);
        // fmt.Println("offscreen canvas", js_value_to_string(offscreen_canvas));
        offscreen_render_context := New_Js_Render_Context(offscreen_canvas);

        the_back_buffer = Screen{
            Js_Render_Context: offscreen_render_context,
        };
    }

    setup_input_handling(the_canvas_render_context.the_canvas);

    // div := js.Global().Get("document").Call("createElement", "div");
    // div.Set("innerHTML", fmt.Sprintf("<pre>%s</pre>", js_value_to_string(js.Global())));
    // js.Global().Get("document").Get("body").Call("appendChild", div);
}

func Begin_Drawing() *Screen {
    return &the_back_buffer;
}

func End_Drawing() {
    //
    // draw the screen into the canvas that is on the html page
    //


    // different_sizes := false;
    // different_sizes = different_sizes || the_canvas_render_context.width  != the_back_buffer.width;
    // different_sizes = different_sizes || the_canvas_render_context.height != the_back_buffer.height;

    // if different_sizes {
    //     panic("the canvas and the offscreen canvas are different sizes.");
    // }

    // // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    // //
    // // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    // the_canvas_render_context.js_render_context_2d.Call(
    //     "drawImage",
    //     the_back_buffer.Js_Render_Context.the_canvas,
    //     // aka draw the whole thing, stretch if needed.
    //     0, 0,
    //     // 0, 0, offscreen_render_context .width, offscreen_render_context .height,
    //     // 0, 0, the_canvas_render_context.width, the_canvas_render_context.height,
    // );

    the_canvas_render_context.Draw_Into_Self(&the_back_buffer.Js_Render_Context, 0, 0);
}




func setup_input_handling(canvas_element js.Value) {

    // every time i look at thing, reminds me how much golang's enums suck.
    type Js_Mouse_Button_Number int;
    const (
        Left   Js_Mouse_Button_Number = 0;
        Middle Js_Mouse_Button_Number = 1;
        Right  Js_Mouse_Button_Number = 2;
    );


    // because this is on the canvas, we will only get events when the mouse is on the canvas.
    canvas_element.Call("addEventListener", "mousemove", js.FuncOf(
        func(this js.Value, args []js.Value) any {
            if len(args) != 1 { panic("did not get expected number of arguments"); }

            event := args[0];

            // this is in browser space, need to map it into canvas space.
            pos_x := event.Get("x").Float();
            pos_y := event.Get("y").Float();

            // how big the canvas is on the users screen.
            browser_rect := canvas_element.Call("getBoundingClientRect");
            browser_rect_x      := browser_rect.Get("x")     .Float();
            browser_rect_y      := browser_rect.Get("y")     .Float();
            browser_rect_width  := browser_rect.Get("width") .Float();
            browser_rect_height := browser_rect.Get("height").Float();

            // how big the canvas render space only.
            canvas_size_x, canvas_size_y := the_canvas_render_context.Get_Size();

            // map into canvas space space
            canvas_space_x := ((pos_x - browser_rect_x) / browser_rect_width) * float64(canvas_size_x);
            canvas_space_y := ((pos_y - browser_rect_y) / browser_rect_height) * float64(canvas_size_y);

            // these could actually be non int numbers, which is funny.
            internal_user_input_collector.Mouse_Position.x = float32(canvas_space_x);
            internal_user_input_collector.Mouse_Position.y = float32(canvas_space_y);

            return nil;
        },
    ));

    canvas_element.Call("addEventListener", "mousedown", js.FuncOf(
        func(this js.Value, args []js.Value) any {
            if len(args) != 1 { panic("did not get expected number of arguments"); }

            event := args[0];

            // should be mapped to canvas space, hopefully.
            button := Js_Mouse_Button_Number( event.Get("button").Int() );

            handle_button_down_for_single_mouse_button := func(single_button *Single_Mouse_Button) {
                single_button.Down = true;
                // should this have a more consistent time?
                single_button.down_since = time.Now();
                single_button.Clicked = true;
            }

            switch button {
            case Left:   { handle_button_down_for_single_mouse_button(&internal_user_input_collector.Left);   }
            case Middle: { handle_button_down_for_single_mouse_button(&internal_user_input_collector.Middle); }
            case Right:  { handle_button_down_for_single_mouse_button(&internal_user_input_collector.Right);  }
            default: { log.Default().Printf("Unknown Button Number (%d)\n", button);
            }
            }

            return nil;
        },
    ));


    canvas_element.Call("addEventListener", "mouseup", js.FuncOf(
        func(this js.Value, args []js.Value) any {
            if len(args) != 1 { panic("did not get expected number of arguments"); }

            event := args[0];

            // should be mapped to canvas space, hopefully.
            button := Js_Mouse_Button_Number( event.Get("button").Int() );

            handle_button_up_for_single_mouse_button := func(single_button *Single_Mouse_Button) {
                single_button.Down     = false;
                single_button.Released = true;
            }

            switch button {
            case Left:   { handle_button_up_for_single_mouse_button(&internal_user_input_collector.Left);   }
            case Middle: { handle_button_up_for_single_mouse_button(&internal_user_input_collector.Middle); }
            case Right:  { handle_button_up_for_single_mouse_button(&internal_user_input_collector.Right);  }
            default: { log.Default().Printf("Unknown Button Number (%d)\n", button);
            }
            }

            return nil;
        },
    ));
}



// during the frame, this structure records the user input that happens.
var internal_user_input_collector User_Input;
// at the start of a new frame, this is set to internal_user_input_collector, and the collector is reset.
var internal_user_input_for_this_frame User_Input;


// this function will return a consistent user input this frame.
func Get_User_Input() *User_Input {
    return &internal_user_input_for_this_frame;
}



//
// this function never returns. uses requestAnimationFrame() to
// call provided function ~60 times per second.
//
// function gets passed delta_time (in seconds)
//
func Call_function_once_per_frame_forever(function_to_call_every_frame func(delta_time float64)) {
    js_request_animation_frame_function := js.Global().Get("requestAnimationFrame");

    js_last_frame_time := js.Global().Get("document").Get("timeline").Get("currentTime").Float();

    var frame_function js.Func;
    frame_function = js.FuncOf(func(this js.Value, args []js.Value) any {

        // technically this is the time of the end of the
        // last frame, but it doesn't really matter.
        js_current_time    := args[0].Float();
        dt_in_milliseconds := js_current_time - js_last_frame_time;
        js_last_frame_time  = js_current_time;

        { // do input stuff.
            // copy the collector down,
            internal_user_input_for_this_frame = internal_user_input_collector;

            // hmm, should we use js_current_time?
            current_time := time.Now();

            // reset the collector for this new frame.
            //
            // NOTE: we might lose some input information, maybe put in mutex?
            new_collector := User_Input{};
            // this might get updated, but this is were it currently is.
            new_collector.Mouse_Position            = internal_user_input_collector.Mouse_Position;
            new_collector.Mouse_Position_Previously = internal_user_input_collector.Mouse_Position;

            handle_resetting_single_button := func(new_single_button *Single_Mouse_Button, old_single_button Single_Mouse_Button) {
                new_single_button.Down             = old_single_button.Down;
                new_single_button.Clicked          = false;

                new_single_button.down_since       = old_single_button.down_since;

                if old_single_button.Down && current_time.Sub(old_single_button.down_since).Seconds() >= HELD_TIME {
                    new_single_button.Held = true;
                }

                new_single_button.Held_Previously  = internal_user_input_collector.Left.Held;
            }

            handle_resetting_single_button(&new_collector.Left,   internal_user_input_collector.Left);
            handle_resetting_single_button(&new_collector.Middle, internal_user_input_collector.Middle);
            handle_resetting_single_button(&new_collector.Right,  internal_user_input_collector.Right);

            // @Mutex this, some js could happen before this. actions
            internal_user_input_collector = new_collector;
        }

        { // do a css media query... in javascript... in wasm... in go...

            canvas_width  := the_canvas_render_context.width;
            canvas_height := the_canvas_render_context.height;
            canvas_aspect_ratio := canvas_width / canvas_height;

            window := js.Global().Get("window");
            // window.innerWidth
            inner_width  := window.Get("innerWidth").Float();
            // window.innerHeight
            inner_height := window.Get("innerHeight").Float();
            window_aspect_ratio := inner_width / inner_height;

            // based on the size of the screen,
            //
            // stretch to fit in the most convenient way.
            //
            canvas_element := &the_canvas_render_context.the_canvas;
            canvas_style := canvas_element.Get("style");
            if window_aspect_ratio < canvas_aspect_ratio {
                canvas_style.Set("height", "");
                canvas_style.Set("width" , "100%");
            } else {
                canvas_style.Set("width" , "");
                canvas_style.Set("height", "100%");
            }
        }

        function_to_call_every_frame(dt_in_milliseconds / 1000);

        // keep recursively calling the requestAnimationFrame function
        js_request_animation_frame_function.Invoke(frame_function);

        return nil;
    });

    js_request_animation_frame_function.Invoke(frame_function);

    // this stalls the go program, because go has a 'run time' that needs to
    // be aware of everything. bleh
    //
    // also i hope the garbage collector doesn't do anything funny.
    <- make(chan struct{});

    // I don't know if this is necessary, but just in case,
    //
    // keep 'frame_function()', 'last_frame_time', and
    // 'js_request_animation_frame_function' alive,
    // in case the garbage collector tries anything funny.
    runtime.KeepAlive(frame_function);
    runtime.KeepAlive(js_last_frame_time);
    runtime.KeepAlive(js_request_animation_frame_function);
}






func do_one_frame(dt float64) {
    // Clamp dt to something reasonable.
    const REASONABLE_MAX_DT = 0.3;
    dt = min(dt, REASONABLE_MAX_DT);

    // fmt.Println("do_one_frame() (after clamping)", dt);

    screen := Begin_Drawing();
    defer End_Drawing();

    user_input := Get_User_Input();

    // TODO how do we handle resizes?
    // resize_canvas()

    defer Draw_Text(screen, "Hello World!", 100, 100, 40);

    // TODO make boid_sim take a pointer... or do we want the ability for more customization?
    boid_sim.Update_boids(dt, *user_input);

    // NOTE it looks cool when the background is not cleared, makes cool trails. we could make this an effect.
    // Draw_Background(screen, rgba(18, 18, 18, 0.2));

    Draw_Everything(screen, &boid_sim, dt, *user_input);
}
