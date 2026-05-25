package main

import (
	"fmt"
)


var all_the_properties Properties;
var boid_sim Boid_simulation;

const BOID_DIMENSION_FACTOR = 80;
const BOID_DEFAULT_BOUNDS_WIDTH  = 16 * BOID_DIMENSION_FACTOR;
const BOID_DEFAULT_BOUNDS_HEIGHT =  9 * BOID_DIMENSION_FACTOR;

// want to differentiate these 2 at some point.
const SCREEN_WIDTH  = BOID_DEFAULT_BOUNDS_WIDTH;
const SCREEN_HEIGHT = BOID_DEFAULT_BOUNDS_HEIGHT;

func main() {
    fmt.Println("Hello, Console!");

    Init_Engine(SCREEN_WIDTH, SCREEN_HEIGHT, rgb(37, 37, 37));


    all_the_properties = get_default_properties();
    boid_sim = New_boid_simulation(BOID_DEFAULT_BOUNDS_WIDTH, BOID_DEFAULT_BOUNDS_HEIGHT);
    boid_sim.properties = &all_the_properties;
    // TODO drawing_properties?

    Call_function_once_per_frame_forever(do_one_frame);
}


// should make some kind of context...
//
// // stuff that my entire application whats to know about, or stuff that lives at global scope, so i know where everything is.
// type Game_Context struct {
//     collidable_texts []Collidable_Text;
// }
//
var collidable_texts []Collidable_Text;

func init_collidable_texts() {
    new_collidable_text := func(text string, center_pos Vec2[int], font_size int, text_color Color) {
        width, height := Measure_Text(text, font_size);

        top_left_pos := Vec2[int]{
            center_pos.x - width/2,
            center_pos.y - height/2,
        };

        bounding_rect := make_rectangle(top_left_pos.x, top_left_pos.y, width, height);
        bounding_rect_float := Transform_Rect[int, Boid_Float](bounding_rect);

        const PADDING = 10;
        bounding_rect_float.x -= PADDING;
        bounding_rect_float.y -= PADDING;
        bounding_rect_float.w += PADDING*2;
        bounding_rect_float.h += PADDING*2;

        new_collidable_text := Collidable_Text{
            text: text,
            pos: top_left_pos,
            font_size: font_size,
            text_color: text_color,

            bounding_rec: bounding_rect_float,
        };

        // @Context puts stuff straight into the boid sim...
        Append(&boid_sim.Rectangles, bounding_rect_float);

        Append(&collidable_texts, new_collidable_text);
    }

    new_collidable_text(
        "Hello world",
        Vec2[int]{BOID_DEFAULT_BOUNDS_WIDTH/2, BOID_DEFAULT_BOUNDS_HEIGHT/2},
        40,
        rgb(255, 141, 64),
    );
    // new_collidable_text("mellow Herald", Vec2[int]{100, 200}, 40);
}

func do_one_frame(dt float64) {
    // Clamp dt to something reasonable.
    const REASONABLE_MAX_DT = 0.3;
    dt = min(dt, REASONABLE_MAX_DT);

    // init'ing this stuff here. probably should do this in main()
    if len(collidable_texts) == 0 {
        // init collidable text.
        init_collidable_texts();
    }

    screen := Begin_Drawing();
    defer End_Drawing();

    // // finally a good language
    // _, file, line, ok := runtime.Caller(0); // 0 is here, 1 is caller of this function.
    // if !ok { panic("could not get the file and line number, is wasm being stupid again?"); }

    user_input := Get_User_Input();

    // TODO how do we handle resizes?
    // resize_canvas()

    // TODO make boid_sim take a pointer... or do we want the ability for more customization?
    boid_sim.Update_boids(dt, *user_input);

    // NOTE it looks cool when the background is not cleared, makes cool trails. we could make this an effect.
    // Draw_Background(screen, rgba(18, 18, 18, 0.2));

    Draw_Everything(screen, &boid_sim, dt, *user_input);

    // TODO put this in Draw_Everything()
    for _, collidable_text := range collidable_texts {
        Draw_Text(screen, collidable_text.text, collidable_text.pos.x, collidable_text.pos.y, collidable_text.font_size, collidable_text.text_color);

        if boid_sim.properties.Draw_Rectangles {
            Draw_Rectangle_Frame_r(screen, collidable_text.bounding_rec, 1, rgb(255, 255, 0));
        }
    }
}



type Collidable_Text struct {
    text string;
    // the position of the text.
    pos Vec2[int];
    // aka font_size
    font_size int;
    text_color Color;

    // what the boids interact with.
    //
    // for now its not really possible to move this...
    // maybe use the Pointer_Stable_Array to be able to change this.
    bounding_rec Rectangle[Boid_Float];
}

