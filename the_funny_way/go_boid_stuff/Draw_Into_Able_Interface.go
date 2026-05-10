package main

import (
	"fmt"
	"math"
	"syscall/js"
)

// gonna treat this like a game engine.

//
// every type that is Draw_Into_Able should be passed by pointer.
// (not that interfaces make it easy.)
//
type Draw_Into_Able[Other_Drawable any] interface {
    // returns width and height of drawable surface.
    //
    // these might also want to be floats.
    Get_Size() (int, int);

    Draw_Background(color Color);
    // unfortunately, f32 are going to have to convert
    // into f64 when passing to typescript.
    Draw_Rectangle(x, y, width, height float32, color Color);
    Draw_Circle(x, y, radius float32, color Color);
    Draw_Triangle(p1, p2, p3 Vec2[float32], color Color);
    Draw_Line(x1, y1, x2, y2 float32, thickness float32, color Color);
    // this is here for speed reasons. would be super
    // slow to call 4 javascript functions, just call 1.
    Draw_Rectangle_Frame(x, y, width, height float32, thickness float32, color Color);
    Draw_Ring(x, y, r1, r2 float32, color Color);

    // TODO a version where you can specify a font.
    Draw_Text(text string, x, y int, font_size int);

    // draw entire drawable thing into itself at some position.
    //
    // cannot change size of output for now. (no stretching)
    Draw_Into_Self(other_drawable Other_Drawable, x, y float32);
};


// this is just a wrapper around Js_Render_Context so
// the user doesn't know the platform details.
type Screen struct {
    // struct embedding. feels weird to do in golang.
    //
    // this is here so i don't just give the Js_Render_Context to the engine user.
    // they shouldn't know what platform we are on.
    Js_Render_Context;
}


//
// golang truly sucks ass, i just want to say:
//     "if Screen.Draw_Into_Self() call Js_Render_Context.Draw_Into_Self(),
//      but allow me to do something else as well"
//
//
// func Draw_Into_Self[Other_Drawable Draw_Into_Able[U], U any](screen *Screen, other_drawable Other_Drawable, x, y float32) {
//     screen.Js_Render_Context.Draw_Into_Self(other_drawable, x, y);
// }
// func (screen *Screen) Draw_Into_Self(other_drawable Draw_Into_Able[any], x, y float32) {
//     screen.Js_Render_Context.Draw_Into_Self(other_drawable, x, y);
// }


//
// Generic Draw_Into_Able functions.
//
// what you should use most of the time.
//

func Draw_Background[Drawable Draw_Into_Able[U], U any](drawable Drawable, color Color) {
    drawable.Draw_Background(color);
}

// I hate golang so much.
//
// why can methods not be generic? are they stupid?
func Draw_Rectangle[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, x, y, width, height T, color Color) {
    x_f32      := float32(x);
    y_f32      := float32(y);
    width_f32  := float32(width);
    height_f32 := float32(height);

    drawable.Draw_Rectangle(x_f32, y_f32, width_f32, height_f32, color);
}

func Draw_Circle[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, x, y, radius T, color Color) {
    x_f32      := float32(x);
    y_f32      := float32(y);
    radius_f32 := float32(radius);

    drawable.Draw_Circle(x_f32, y_f32, radius_f32, color);
}

func Draw_Circle_v[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, position Vec2[T], radius T, color Color) {
    Draw_Circle(drawable, position.x, position.y, radius, color);
}

// TODO type signature.
func Draw_Triangle[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, p1 Vec2[T], p2 Vec2[T], p3 Vec2[T], color Color) {
    v1 := Transform_Vec[T, float32](p1);
    v2 := Transform_Vec[T, float32](p2);
    v3 := Transform_Vec[T, float32](p3);

    drawable.Draw_Triangle(v1, v2, v3, color);
}

func Draw_Line[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, x1, y1, x2, y2 T, thickness T, color Color) {
    x1_f32        := float32(x1);
    y1_f32        := float32(y1);
    x2_f32        := float32(x2);
    y2_f32        := float32(y2);
    thickness_f32 := float32(thickness);

    drawable.Draw_Line(x1_f32, y1_f32, x2_f32, y2_f32, thickness_f32, color);
}

func Draw_Line_v[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, p1, p2 Vec2[T], thickness T, color Color) {
    Draw_Line(drawable, p1.x, p1.y, p2.x, p2.y, thickness, color);
}

// TODO? not here? this file should not know about Boid_Float
func Draw_Line_l[Drawable Draw_Into_Able[U], U any](drawable Drawable, line Line, thickness Boid_Float, color Color) {
    Draw_Line(drawable, line.x1, line.y1, line.x2, line.y2, thickness, color);
}

func Draw_Rectangle_Frame[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, x, y, width, height T, thickness T, color Color) {
    x_f32         := float32(x);
    y_f32         := float32(y);
    width_f32     := float32(width);
    height_f32    := float32(height);
    thickness_f32 := float32(thickness);

    drawable.Draw_Rectangle_Frame(x_f32, y_f32, width_f32, height_f32, thickness_f32, color);
}

func Draw_Ring[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, x, y, r1, r2 T, color Color) {
    x_f32  := float32(x);
    y_f32  := float32(y);
    r1_f32 := float32(r1);
    r2_f32 := float32(r2);

    drawable.Draw_Ring(x_f32, y_f32, r1_f32, r2_f32, color);
}



func Draw_Text[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, text string, x, y T, text_size T) {
    x_int         := int(x);
    y_int         := int(y);
    text_size_int := int(text_size);

    drawable.Draw_Text(text, x_int, y_int, text_size_int);
}


func Measure_Text(text string, font_size int) (width int, height int) {
    // CanvasRenderingContext2D.measureText(text)
    //
    // returns a text measure object
    the_canvas_render_context.js_set_font_and_size(nil, float64(font_size));

    measure_result := the_canvas_render_context.js_render_context_2d.Call("measureText", text);

    result_width  := measure_result.Get("width").Int();
    // TODO account for new lines.
    result_height := font_size;

    return result_width, result_height;
}


// TODO move this somewhere else. this is a user made function, not a engine function.
//
// but dose that matter? im just providing a useful function to the user...
func Draw_Triangles_Circling[Drawable Draw_Into_Able[U], U any, T Number](drawable Drawable, pos Vec2[T], num_segments int, size, added_rotation T, color Color) {
num_points_around_the_circle := num_segments * 2;
    for i := range num_segments {
        around_1 := 2 * math.Pi / float64(num_points_around_the_circle) * (float64(i) * 2);
        around_2 := 2 * math.Pi / float64(num_points_around_the_circle) * (float64(i) * 2 + 1);

        _p1 := Unit_Vector_With_Rotation(around_1 + float64(added_rotation));
        _p2 := Unit_Vector_With_Rotation(around_2 + float64(added_rotation));

        p1 := Transform_Vec[float64, T](_p1);
        p2 := Transform_Vec[float64, T](_p2);

        p1 = Add(pos, Mult(p1, size));
        p2 = Add(pos, Mult(p2, size));
        // the middle of all the points.
        p3 := Add(pos, p1, p2);
        p3.x /= 3; p3.y /= 3;

        Draw_Triangle(drawable, p1, p2, p3, color);
    }
}




func js_color_string_from_color(color Color) string {
    r, g, b, a := color.to_rgba();
    if a == 255 {
        // special case if full alpha.
        return fmt.Sprintf("rgb(%d,%d,%d)", r, g, b);
        // return fmt.Sprintf("#%x%x%xFF)", r, g, b);
    } else {
        return fmt.Sprintf("rgb(%d,%d,%d,%f)", r, g, b, float64(a) / 255);
    }
}


type Js_Render_Context struct {
    the_canvas js.Value;

    // the_canvas.getContext("2d")
    js_render_context_2d js.Value;

    // width and height of the canvas, read only please.
    //
    // will become wrong if the canvas is resized. TODO resize_canvas() function.
    width, height float64;


    // a proper color type.
    color Color;

    // TODO todo think about this maybe?
    fill_style string;
    stroke_style string;

    stroke_thickness float64;
}

func New_Js_Render_Context(canvas_element js.Value) Js_Render_Context {
    result := Js_Render_Context{
        the_canvas: canvas_element,
    };

    result.js_render_context_2d = result.the_canvas.Call("getContext", "2d");
    if result.js_render_context_2d.IsNull() {
        // there is really no way to recover here. just crash.
        //
        // should never happen.
        panic("Failed to get 2D rendering context.");
    }
    // when putting the canvas on the browsers screen, it dose image
    // smoothing by default. i do not like this by default.
    result.js_render_context_2d.Set("imageSmoothingEnabled", false);

    result.width  = result.the_canvas.Get("width") .Float();
    result.height = result.the_canvas.Get("height").Float();

    // this is black. idk what it really means.
    result.color = rgb(0, 0, 0);

    // initialize the style fields.
    //
    // this is (slightly) expensive, don't create
    // this every frame or whatever.
    result.fill_style       = result.js_render_context_2d.Get("fillStyle")  .String();
    result.stroke_style     = result.js_render_context_2d.Get("strokeStyle").String();
    result.stroke_thickness = result.js_render_context_2d.Get("lineWidth")  .Float();

    return result;
}

func (render_context *Js_Render_Context) set_color(color Color) {
    if render_context.color != color {
        js_color_string := js_color_string_from_color(color);

        // TODO don't do both of these.
        render_context.js_render_context_2d.Set("fillStyle",   js_color_string);
        render_context.js_render_context_2d.Set("strokeStyle", js_color_string);
    }

}

func (render_context *Js_Render_Context) set_stroke_thickness(thickness float64) {
    if render_context.stroke_thickness != thickness {
        render_context.stroke_thickness = thickness;
        render_context.js_render_context_2d.Set("lineWidth", thickness);
    }
}


// accepts float64s because that's what JavaScript numbers are
//
// accepts color as a string, because thats what JavaScript colors are.
// (yes i am annoyed by this)
//
// just hoping that js.store_args() internal function will be
// inlined because we know exactly how many arguments there are,
// and what type they are.
func (render_context *Js_Render_Context) js_fill_rect(x, y, width, height float64) {
    render_context.js_render_context_2d.Call("fillRect", x, y, width, height);
}

func (render_context *Js_Render_Context) js_draw_circle(x, y, radius float64) {
    render_context.js_render_context_2d.Call("arc", x, y, radius, 0, 2 * math.Pi);
    render_context.js_render_context_2d.Call("fill");
}

func (render_context *Js_Render_Context) js_draw_triangle(x1, y1, x2, y2, x3, y3 float64) {
    render_context.js_render_context_2d.Call("beginPath");
    render_context.js_render_context_2d.Call("moveTo", x1, y1);
    render_context.js_render_context_2d.Call("lineTo", x2, y2);
    render_context.js_render_context_2d.Call("lineTo", x3, y3);
    render_context.js_render_context_2d.Call("closePath");
    render_context.js_render_context_2d.Call("fill");
}

func (render_context *Js_Render_Context) js_draw_line(x1, y1, x2, y2 float64, thickness float64) {
    render_context.set_stroke_thickness(thickness);

    render_context.js_render_context_2d.Call("beginPath");
    render_context.js_render_context_2d.Call("moveTo", x1, y1);
    render_context.js_render_context_2d.Call("lineTo", x2, y2);
    render_context.js_render_context_2d.Call("stroke");
}

func (render_context *Js_Render_Context) js_draw_rectangle_frame(x, y, width, height float64, thickness float64) {
    render_context.set_stroke_thickness(thickness);

    render_context.js_render_context_2d.Call("strokeRect", x, y, width, height);
}

func (render_context *Js_Render_Context) js_draw_ring(x, y, r1, r2 float64) {
    // help from:
    //   https://stackoverflow.com/questions/13618844/polygon-with-a-hole-in-the-middle-with-html5s-canvas
    // to make a polygon with a hole in the middle.


    ctx := &render_context.js_render_context_2d;

    ctx.Call("beginPath");

    // NOTE this solution is ass, maybe find a way to use clip()?

    const ITERATIONS = 10;
    // outer rim, must be clockwise.
    for i := range ITERATIONS + 1{
        pos_x, pos_y := math.Sincos(float64(i % ITERATIONS) / ITERATIONS * 2 * math.Pi)
        cmd := If_Then_Else(i == 0, "moveTo", "lineTo");
        ctx.Call(cmd, x + pos_x * r2, y + pos_y * r2);
    }
    ctx.Call("closePath");

    // hole, must be counter-clockwise.
    ctx.Call("moveTo", 10, 10);
    for i := range ITERATIONS + 1 {
        // in the opposite direction.
        j := ITERATIONS - (i % ITERATIONS) - 1;
        pos_x, pos_y := math.Sincos(float64(j) / ITERATIONS * 2 * math.Pi)
        cmd := If_Then_Else(i == 0, "moveTo", "lineTo");
        ctx.Call(cmd, x + pos_x * r1, y + pos_y * r1);
    }
    ctx.Call("closePath");

    ctx.Call("fill");


    // this did not work, think it could work with clip() path.
    /*
    ctx.Call("beginPath");

    ctx.Call("arc", x, y, r1, 0,  2 * math.Pi);
    ctx.Call("closePath");

    ctx.Call("arc", x, y, r2, 0, -2 * math.Pi);
    ctx.Call("closePath");

    ctx.Call("fill");
    */
}

// TODO font stuff
type Font struct {};

func (render_context *Js_Render_Context) js_set_font_and_size(font *Font, size float64) {
    if font != nil { panic("TODO set a font"); }

    // TODO @Speed don't set text every time if font and size has not changed.
    text := fmt.Sprintf("%dpx comic sans", int(size));
    // fmt.Println("text", text);

    render_context.js_render_context_2d.Set("font", text);
}

func (render_context *Js_Render_Context) js_draw_text(text string, x, y float64, font_size float64) {
    render_context.js_set_font_and_size(nil, font_size);

    // draw the text from the top right position.
    //
    // TODO @Speed don't call these every time we draw text.
    render_context.js_render_context_2d.Set("textAlign", "left");
    render_context.js_render_context_2d.Set("textBaseline", "top");

    render_context.js_render_context_2d.Call("fillText", text, x, y);
}




//
// Draw_Into_Able interface functions
//

func (js_render_context *Js_Render_Context) Get_Size() (int, int) {
    return int(js_render_context.width), int(js_render_context.height);
}

func (js_render_context *Js_Render_Context) Draw_Background(color Color) {
    js_render_context.Draw_Rectangle(
        0, 0,
        float32(js_render_context.width), float32(js_render_context.height),
        color,
    );
}

//
// TODO all the these functions should do bounds checking.
// because all things to do with wasm and javascript is slow,
//
func (js_render_context *Js_Render_Context) Draw_Rectangle(x, y, width, height float32, color Color) {
    x_f64      := float64(x);
    y_f64      := float64(y);
    width_f64  := float64(width);
    height_f64 := float64(height);

    js_render_context.set_color(color);
    js_render_context.js_fill_rect(x_f64, y_f64, width_f64, height_f64);
}

func (js_render_context *Js_Render_Context) Draw_Circle(x, y, radius float32, color Color) {
    x_f64      := float64(x);
    y_f64      := float64(y);
    radius_f64 := float64(radius);

    js_render_context.set_color(color);
    js_render_context.js_draw_circle(x_f64, y_f64, radius_f64);
}

func (js_render_context *Js_Render_Context) Draw_Triangle(p1, p2, p3 Vec2[float32], color Color) {
    v1 := Transform_Vec[float32, float64](p1);
    v2 := Transform_Vec[float32, float64](p2);
    v3 := Transform_Vec[float32, float64](p3);

    js_render_context.set_color(color);
    js_render_context.js_draw_triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);
}

func (js_render_context *Js_Render_Context) Draw_Line(x1, y1, x2, y2 float32, thickness float32, color Color) {
    x1_f64        := float64(x1);
    y1_f64        := float64(y1);
    x2_f64        := float64(x2);
    y2_f64        := float64(y2);
    thickness_f64 := float64(thickness);

    js_render_context.set_color(color);
    js_render_context.js_draw_line(x1_f64, y1_f64, x2_f64, y2_f64, thickness_f64);
}

func (js_render_context *Js_Render_Context) Draw_Rectangle_Frame(x, y, width, height float32, thickness float32, color Color) {
    x_f64         := float64(x);
    y_f64         := float64(y);
    width_f64     := float64(width);
    height_f64    := float64(height);
    thickness_f64 := float64(thickness);

    js_render_context.set_color(color);
    js_render_context.js_draw_rectangle_frame(x_f64, y_f64, width_f64, height_f64, thickness_f64);
}

func (js_render_context *Js_Render_Context) Draw_Ring(x, y, r1, r2 float32, color Color) {
    x_f64  := float64(x);
    y_f64  := float64(y);
    r1_f64 := float64(r1);
    r2_f64 := float64(r2);

    js_render_context.set_color(color);
    js_render_context.js_draw_ring(x_f64, y_f64, r1_f64, r2_f64);
}

func (js_render_context *Js_Render_Context) Draw_Text(text string, x, y int, font_size int) {
    x_f64         := float64(x);
    y_f64         := float64(y);
    font_size_f64 := float64(font_size);

    js_render_context.set_color(rgb(255, 0, 0));
    js_render_context.js_draw_text(text, x_f64, y_f64, font_size_f64);
}

func (js_render_context *Js_Render_Context) Draw_Into_Self(other_js_drawable *Js_Render_Context, x, y float32) {

    // // gonna type assert this for now, will have to figure out a better method later.
    // other_js_drawable := other_drawable.(*Screen);

    different_sizes := false;
    different_sizes = different_sizes || the_canvas_render_context.width  != the_back_buffer.width;
    different_sizes = different_sizes || the_canvas_render_context.height != the_back_buffer.height;

    if different_sizes {
        panic("the two render contex's are different sizes.");
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    //
    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    js_render_context.js_render_context_2d.Call(
        "drawImage",
        other_js_drawable.the_canvas,
        // position to draw.
        x, y,
        // 0, 0, offscreen_render_context .width, offscreen_render_context .height,
        // 0, 0, the_canvas_render_context.width, the_canvas_render_context.height,
    );


}
