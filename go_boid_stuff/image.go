package main

import (
	"fmt"
	"log"
	"math"
	"os"
	"syscall/js"
)


type Image struct {
    Buffer []Color; // [RGBA][RGBA][RGBA]...
    Width  int;
    Height int;
}

func New_image(width int, height int) Image {
    return Image{
        Buffer: make([]Color, width*height),
        Width:  width,
        Height: height,
    };
}

// Also clears the screen to Blank
func (img *Image) Resize_Image(new_width, new_height int) {
    if img.Width == new_width && img.Height == new_height { return; }

    // saves space by reusing memory
    new_size := new_width*new_height;
    if len(img.Buffer) < new_size {
        img.Buffer = make([]Color, new_size);
    }
    img.Width, img.Height = new_width, new_height;
}

func (img *Image) To_RGBA_byte_array() []byte {
    // sick tricks for speed. much faster than filling an array of bytes.
    return Unsafe_Slice_Transmute[Color, byte](img.Buffer[:img.Width*img.Height]);
}

func (img *Image) To_RGB_byte_array() []byte {
    // this is RGB not RGBA
    RGB_array := make([]byte, img.Width*img.Height*3);
    for i := range img.Width*img.Height {
        r, g, b, _ := img.Buffer[i].to_rgba();
        RGB_array[i*3+0] = r;
        RGB_array[i*3+1] = g;
        RGB_array[i*3+2] = b;
    }
    return RGB_array;
}

func (img *Image) To_ppm(filename string) {
    header := fmt.Sprintf("P6 %d %d 255\n", img.Width, img.Height);
    body := img.To_RGB_byte_array();

    f, err := os.Create(filename);
    if err != nil { log.Fatal(err); }
    defer f.Close();

    f.Write([]byte(header));
    f.Write(body);
}


func (img *Image) point_within_bounds(x, y int) bool {
    return 0 <= x && x < img.Width && 0 <= y && y < img.Height;
}

//go:inline
func (img *Image) get_color_at(x, y int) *Color {
    return &img.Buffer[y*img.Width + x];
}
//go:inline
func (img *Image) put_color_no_blend(x, y int, c Color) {
    img.Buffer[y*img.Width + x] = c;
}


func (img *Image) put_color(x, y int, c Color) {
    // this could be slightly faster,
    // just mask out the bits and compare,
    // but the format of RGBA might change...
    _, _, _, a := c.to_rgba();
    if (a == 255) {
        img.put_color_no_blend(x, y, c);
    } else {
        color := *img.get_color_at(x, y);
        blended := blend_color(color, c);
        img.put_color_no_blend(x, y, blended);
    }
}


// I have realized that this project only uses one image.
// so im just gonna use a global variable to store all
// the image state, will also make it easier to switch
// to a different renderer. (aka js rendering.)
type Drawing_Context struct {
    image Image;


    // js rendering stuff

    // TODO actually use this.
    js_functions_exist bool;
    js Js_Functions;


    // pointer to the boid simulation properties, further enforcing the need for one context...
    properties *Properties;
};

// these are functions passed to us by js,
// lets hope invoking these functions is fast,
type Js_Functions struct {
    // clear_background:  (c: Boid_Color) => void;
    clear_background    js.Value;
    // draw_rectangle:    (x: number, y: number, w: number, h: number, c: Boid_Color) => void;
    draw_rectangle      js.Value;
    // draw_circle:       (x: number, y: number, r: number, c: Boid_Color) => void;
    draw_circle         js.Value;
    // draw_triangle:     (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, c: Boid_Color) => void;
    draw_triangle       js.Value;
    // draw_line:         (x1: number, y1: number, x2: number, y2: number, c: Boid_Color) => void;
    draw_line           js.Value;
    // draw_single_pixel: (x: number, y: number, c: Boid_Color) => void;
    draw_single_pixel   js.Value;

}

func (drawing_context Drawing_Context) assert_js_functions_exist() {
    if !drawing_context.js_functions_exist {
        panic("JS functions do not exist");
    }
}

var drawing_context Drawing_Context;

// TODO this is getting hacky.
const RENDER_METHOD_SOFTWARE = false;
const RENDER_METHOD_JS       = true;


// this function has noinline, because its gonna be super slow anyway,
// (it has to write to 1,000,000 pixels at least), and makes the performance
// graph make more sense.
//
// I would hope that go could auto-vectorize this,
// but the wasm backend has disappointed me before.
//
//go:noinline
func Clear_background(c Color) {
    if drawing_context.properties.Render_Method == RENDER_METHOD_SOFTWARE {
        width, height := drawing_context.image.Width, drawing_context.image.Height;
        for i := range width*height {
            drawing_context.image.Buffer[i] = c;
        }
    }

    if drawing_context.properties.Render_Method == RENDER_METHOD_JS {
        drawing_context.assert_js_functions_exist();
        drawing_context.js.clear_background.Invoke(c.js());
    }
}

// kinda a stupid function. do not use this.
func Draw_Single_Pixel[T Number](x, y T, c Color) {
    if drawing_context.properties.Render_Method == RENDER_METHOD_SOFTWARE {
        x_int, y_int := int(x), int(y)
        if drawing_context.image.point_within_bounds(x_int, y_int) {
            drawing_context.image.put_color(x_int, y_int, c)
        }
    }

    if drawing_context.properties.Render_Method == RENDER_METHOD_JS {
        drawing_context.assert_js_functions_exist();
        drawing_context.js.draw_single_pixel.Invoke(x, y, c.js());
    }
}

// i wish go had macros or something so i didn't
// have to make this function twice.
func Draw_Rect_int(x, y, w, h int, c Color) {
    if drawing_context.properties.Render_Method == RENDER_METHOD_SOFTWARE {
        min_i, max_i := max(x, 0), min(x+w, drawing_context.image.Width);
        min_j, max_j := max(y, 0), min(y+h, drawing_context.image.Height);
        for j := min_j; j < max_j; j++ {
            for i := min_i; i < max_i; i++ {
                drawing_context.image.put_color(i, j, c);
            }
        }
    }

    if drawing_context.properties.Render_Method == RENDER_METHOD_JS {
        drawing_context.assert_js_functions_exist();
        drawing_context.js.draw_rectangle.Invoke(x, y, w, h, c.js());
    }
}
func Draw_Rect_int_no_blend(x, y, w, h int, c Color) {
    if drawing_context.properties.Render_Method == RENDER_METHOD_SOFTWARE {
        min_i, max_i := max(x, 0), min(x+w, drawing_context.image.Width);
        min_j, max_j := max(y, 0), min(y+h, drawing_context.image.Height);
        for j := min_j; j < max_j; j++ {
            for i := min_i; i < max_i; i++ {
                drawing_context.image.put_color_no_blend(i, j, c);
            }
        }
    }

    // dose not matter in js, GPU don't care about the blend.
    if drawing_context.properties.Render_Method == RENDER_METHOD_JS {
        drawing_context.assert_js_functions_exist();
        drawing_context.js.draw_rectangle.Invoke(x, y, w, h, c.js());
    }
}

func Draw_Rect[T Number](x, y, w, h T, c Color) {
    _x := Round(x);
    _y := Round(y);
    _w := Round(w);
    _h := Round(h);

    Draw_Rect_int(_x, _y, _w, _h, c);
}

// TODO maybe we can do this better with a
// dedicated function? with js rendering.
func Draw_Rect_Outline[T Number](_x, _y, _w, _h T, _inner_padding T, color Color) {
    x := Round(_x);
    y := Round(_y);
    w := Round(_w);
    h := Round(_h);
    inner_padding := Round(_inner_padding);

    // do bounds out here for speed.
    if (x + w <= 0) ||
       (y + h <= 0) ||
       (x >= drawing_context.image.Width) ||
       (y >= drawing_context.image.Height) { return; }

    Draw_Rect_int_no_blend(x,                 y,                 w,             inner_padding,     color); // top edge
    Draw_Rect_int_no_blend(x,                 y+h-inner_padding, w,             inner_padding,     color); // bottom edge
    Draw_Rect_int_no_blend(x,                 y+inner_padding,   inner_padding, h-inner_padding*2, color); // left edge
    Draw_Rect_int_no_blend(x+w-inner_padding, y+inner_padding,   inner_padding, h-inner_padding*2, color); // right edge
}

func Draw_Circle[T Number](x, y, r T, c Color) {
    if drawing_context.properties.Render_Method == RENDER_METHOD_SOFTWARE {
        min_x := max(Floor(x-r-1), 0);
        max_x := min(Ceil( x+r+1), drawing_context.image.Width);
        min_y := max(Floor(y-r-1), 0);
        max_y := min(Ceil( y+r+1), drawing_context.image.Height);

        for j := min_y; j < max_y; j++ {
            for i := min_x; i < max_x; i++ {
                a := T(i) - x;
                b := T(j) - y;
                if a*a+b*b < r*r {
                    drawing_context.image.put_color(i, j, c);
                }
            }
        }
    }

    // hmm, dose the T type work well here? all of
    // them should be converted to float under the hood.
    if drawing_context.properties.Render_Method == RENDER_METHOD_JS {
        drawing_context.assert_js_functions_exist();
        // need to convert, js.ValueOf() does not like distinct types.
        x_f64, y_f64, r_f64 := float64(x), float64(y), float64(r);
        drawing_context.js.draw_circle.Invoke(x_f64, y_f64, r_f64, c.js());
    }
}
func Draw_Circle_v[T Number](p Vec2[T], r T, c Color) { Draw_Circle(p.x, p.y, r, c); }



func Draw_Ring[T Number](x, y, r1, r2 T, c Color) {
    if !(r1 <= r2) { panic("r1 is less than r2"); }

    min_x := max(Floor(x-r2-1), 0);
    max_x := min(Ceil( x+r2+1), drawing_context.image.Width);
    min_y := max(Floor(y-r2-1), 0);
    max_y := min(Ceil( y+r2+1), drawing_context.image.Height);

    for j := min_y; j < max_y; j++ {
        for i := min_x; i < max_x; i++ {
            a := T(i) - x;
            b := T(j) - y;
            d := a*a + b*b;

            // i feel as though there might be a better way to do this.
            //
            // this function if looping though a lot of inner pixels...
            if (r1*r1 < d) && (d < r2*r2) {
                if drawing_context.properties.Render_Method == RENDER_METHOD_SOFTWARE {
                    drawing_context.image.put_color(i, j, c);
                }

                if drawing_context.properties.Render_Method == RENDER_METHOD_JS {
                    // TODO fuck ass function call every pixel.
                    drawing_context.assert_js_functions_exist();
                    // this is gonna suck, but it might work?
                    drawing_context.js.draw_single_pixel.Invoke(i, j, c.js());
                }
            }
        }
    }

    // if DO_JS_RENDERING && drawing_context.js_functions_exist {
    //     // probably gotta make this a js function...
    //     // no way draw_single_pixel is gonna work.
    // }
}


// DDA line generation algorithm
func Draw_Line[T Number](_p1, _p2 Vec2[T], c Color) {
    // convert to int. image library should be friendly
    p1 := Transform[T, int](_p1);
    p2 := Transform[T, int](_p2);

    if drawing_context.properties.Render_Method == RENDER_METHOD_SOFTWARE {

        // swap so p1.x is small.
        if p1.x > p2.x { p1, p2 = p2, p1; }

        dx := p2.x - p1.x;
        dy := p2.y - p1.y;

        // check if its straight up down.
        if dx == 0 {
            if !(0 <= p1.x && p1.x < drawing_context.image.Width) { return; }
            // draw up down line
            y1 := min(p1.y, p2.y);
            y2 := max(p1.y, p2.y);
            for y := max(y1, 0); y < min(y2, drawing_context.image.Height); y++ {
                drawing_context.image.put_color(p1.x, y, c);
            }
            return;
        }

        steps := max(Abs(dx), Abs(dy));

        X_inc := float32(dx) / float32(steps);
        Y_inc := float32(dy) / float32(steps);

        X := float32(p1.x);
        Y := float32(p1.y);
        for range steps {
            X_r := Round(X);
            Y_r := Round(Y);

            if drawing_context.image.point_within_bounds(X_r, Y_r) {
                drawing_context.image.put_color(X_r, Y_r, c);
            }

            X += X_inc;
            Y += Y_inc;
        }
    }

    if drawing_context.properties.Render_Method == RENDER_METHOD_JS {
        drawing_context.assert_js_functions_exist();
        drawing_context.js.draw_line.Invoke(p1.x, p1.y, p2.x, p2.y, c.js());
    }

}
func Draw_Line_l(line Line, color Color) {
    p1, p2 := line.to_vec();
    Draw_Line(p1, p2, color);
}

// https://www.sunshine2k.de/coding/java/TriangleRasterization/TriangleRasterization.html
func Draw_Triangle[T Number](p1, p2, p3 Vec2[T], color Color) {
    if drawing_context.properties.Render_Method == RENDER_METHOD_SOFTWARE {
        v1 := Transform[T, int](p1);
        v2 := Transform[T, int](p2);
        v3 := Transform[T, int](p3);

        // bubble sort, i wish go had a better way to do this,
        // like passing a function into the sort interface,
        // (v1, v2, v3 used to be an array)
        if v1.y > v2.y { v1, v2 = v2, v1; }
        if v2.y > v3.y { v2, v3 = v3, v2; }
        if v1.y > v2.y { v1, v2 = v2, v1; }

        draw_line := func(x0, x1, y int) {
            if !(0 <= y && y < drawing_context.image.Height) { return; }
            min_x := max(min(x0, x1), 0);
            max_x := min(max(x0, x1), drawing_context.image.Width);
            for x := min_x; x < max_x; x++ {
                drawing_context.image.put_color(x, y, color);
            }
        }
        fillBottomFlatTriangle := func(v1, v2, v3 Vec2[int]) {
            inv_slope_1 := float32(v2.x-v1.x) / float32(v2.y-v1.y);
            inv_slope_2 := float32(v3.x-v1.x) / float32(v3.y-v1.y);

            cur_x_1 := float32(v1.x);
            cur_x_2 := float32(v1.x);

            for scan_line_Y := v1.y; scan_line_Y <= v2.y; scan_line_Y++ {
                draw_line(int(cur_x_1), int(cur_x_2), scan_line_Y);
                cur_x_1 += inv_slope_1;
                cur_x_2 += inv_slope_2;
            }
        }
        fillTopFlatTriangle := func(v1, v2, v3 Vec2[int]) {
            inv_slope_1 := float32(v3.x-v1.x) / float32(v3.y-v1.y);
            inv_slope_2 := float32(v3.x-v2.x) / float32(v3.y-v2.y);

            cur_x_1 := float32(v3.x);
            cur_x_2 := float32(v3.x);

            for scan_line_Y := v3.y; scan_line_Y > v1.y; scan_line_Y-- {
                draw_line(int(cur_x_1), int(cur_x_2), scan_line_Y);
                cur_x_1 -= inv_slope_1;
                cur_x_2 -= inv_slope_2;
            }
        }

        if v2.y == v3.y {
            fillBottomFlatTriangle(v1, v2, v3);
        } else if v1.y == v2.y {
            fillTopFlatTriangle(v1, v2, v3);
        } else {

            // I did some rearranging here, so i don't have to convert back to floats.
            v4 := Vec2[int]{
                // x: int(float32(v1.X) + float32(v2.Y-v1.Y)/float32(v3.Y-v1.Y)*float32(v3.X-v1.X)),
                x: (((v2.y - v1.y) * (v3.x - v1.x)) + (v1.x * (v3.y - v1.y))) / (v3.y - v1.y),
                y: v2.y,
            };

            fillBottomFlatTriangle(v1, v2, v4);
            fillTopFlatTriangle(v2, v4, v3);
        }
    }

    if drawing_context.properties.Render_Method == RENDER_METHOD_JS {
        drawing_context.assert_js_functions_exist();
        // another case of the "distinct type"
        p1_f64 := Transform[T, float64](p1);
        p2_f64 := Transform[T, float64](p2);
        p3_f64 := Transform[T, float64](p3);
        // drawing_context.js.draw_triangle.Invoke(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, color.js());
        drawing_context.js.draw_triangle.Invoke(p1_f64.x, p1_f64.y, p2_f64.x, p2_f64.y, p3_f64.x, p3_f64.y, color.js());
    }
}

// i want to make more functions like this who just reuse other
// functions. wouldn't be much faster to make my own function in
// javascript, and certainly not worth my time.
func Draw_Triangles_Circling[T Number](pos Vec2[T], num_segments int, size, added_rotation T, color Color) {
    num_points_around_the_circle := num_segments * 2;
    for i := range num_segments {
        around_1 := 2 * math.Pi / float64(num_points_around_the_circle) * (float64(i) * 2);
        around_2 := 2 * math.Pi / float64(num_points_around_the_circle) * (float64(i) * 2 + 1);

        _p1 := Unit_Vector_With_Rotation(around_1 + float64(added_rotation));
        _p2 := Unit_Vector_With_Rotation(around_2 + float64(added_rotation));

        p1 := Transform[float64, T](_p1);
        p2 := Transform[float64, T](_p2);

        p1 = Add(pos, Mult(p1, size));
        p2 = Add(pos, Mult(p2, size));
        // the middle of all the points.
        p3 := Add(pos, p1, p2);
        p3.x /= 3; p3.y /= 3;

        Draw_Triangle(p1, p2, p3, color);
    }
}
