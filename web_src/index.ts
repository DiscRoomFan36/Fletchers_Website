
// typescript glue code.

import { Log_Type, log, DEBUG_DISPLAY } from "./logger";
import { setup_global_properties, setup_sliders, get_property_struct_by_name } from "./setup_sliders";

// cool trick
const IN_DEV_MODE = (window.location.hostname === "localhost");


// NOTE all names correspond with stuff in go,
// cannot change any name without changing go code.
interface Get_Next_Frame_Arguments {
    width:  number;
    height: number;
    software_rendering_byte_buffer: Uint8ClampedArray;

    mouse: Mouse;

    // TODO cannot change this name without messing up other code.
    rectangles: Rect[];
};

// this is a u32 in go, but we have to use number in js,
// so we just have to be careful with it.
type Boid_Color = number;
function Boid_Color_To_Rgb(color: Boid_Color): string {
    const r = (color >> (8*0)) & 0xFF;
    const g = (color >> (8*1)) & 0xFF;
    const b = (color >> (8*2)) & 0xFF;
    const a = (color >> (8*3)) & 0xFF;

    return `rgb(${r}, ${g}, ${b}, ${a / 255})`;
}

interface Functions_To_Provide {
    log_string_function: (s: string) => void;

    clear_background:  (c: Boid_Color) => void;
    draw_rectangle:    (x: number, y: number, w: number, h: number, c: Boid_Color) => void;
    draw_circle:       (x: number, y: number, r: number, c: Boid_Color) => void;
    draw_triangle:     (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, c: Boid_Color) => void;
    draw_line:         (x1: number, y1: number, x2: number, y2: number, c: Boid_Color) => void;
    draw_single_pixel: (x: number, y: number, c: Boid_Color) => void;
}

// NOTE we *CAN* change these names, the 'get_go_functions()' handles the real names
interface Go_Functions {
    set_properties: (obj:Object) => number;
    // TODO rename this?
    Initialize_Js_And_Go_Connection: (functions_to_provide: Functions_To_Provide) => Object;

    get_next_frame: (args: Get_Next_Frame_Arguments) => number;
};

// NOTE we keep the @ts-ignore's in here
async function get_go_functions(): Promise<Go_Functions> {
    // @ts-ignore
    const go = new Go(); // NOTE this comes from the wasm_exec.js thing

    const result = await WebAssembly.instantiateStreaming(fetch("dist/boid.wasm"), go.importObject);

    go.run(result.instance);

    return {
        // @ts-ignore
        set_properties: SetProperties,
        // @ts-ignore
        Initialize_Js_And_Go_Connection: Initialize_Js_And_Go_Connection,

        // @ts-ignore
        get_next_frame: GetNextFrame,
    };
};

// Credit to rexim for the inspiration: https://github.com/tsoding/koil
interface Display {
    render_ctx             : CanvasRenderingContext2D;
    back_buffer_render_ctx : OffscreenCanvasRenderingContext2D;

    // imageData: ImageData

    // this is where the software rendered image comes from.
    software_rendering_back_buffer_array : Uint8ClampedArray;
    back_buffer_image_width  : number;
    back_buffer_image_height : number;
};


interface Vec2 {
    x : number;
    y : number;
};

interface Rect {
    x : number;
    y : number;
    w : number;
    h : number;
};

interface Mouse {
    pos         : Vec2;
    left_down   : boolean;
    middle_down : boolean;
    right_down  : boolean;
};

const mouse: Mouse = {
    pos         : {x: 0, y: 0},
    left_down   : false,
    middle_down : false,
    right_down  : false,
};


function dom_rect_to_rect(dom_rect: DOMRect): Rect {
    return {
        x : dom_rect.x,
        y : dom_rect.y,
        w : dom_rect.width,
        // to account for letters like 'j'
        h : dom_rect.height + 5,
    };
};

function get_all_collidable_rects(): Rect[] {
    const CLASS = "collide";
    const elements = document.getElementsByClassName(CLASS);

    const result: Rect[] = [];
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];
        const dom_rect = element.getBoundingClientRect();

        result.push(dom_rect_to_rect(dom_rect));
    }
    return result;
};

function render_boids(display: Display, go: Go_Functions) {

    const enum Render_Method {
        Software = 0,
        Js       = 1,
    };

    // I sure hope I don't hit a race condition.
    //
    // i think all functions are queued in javascript, so any actions
    // take place either before this function is called, or after.
    const render_method = get_property_struct_by_name("Render_Method").as_bool() ? Render_Method.Js : Render_Method.Software;


    // we get the bounding rectangles of elements in the document,
    //
    // we COULD have just rendered the text ourselves, (with .fillText())
    // but i want the user to be able to select the email text.
    //
    // maybe when that email text is moves somewhere else we could have all
    // the boid text rendered by the boid sim itself.
    //
    // although that might introduce issues when the boid wasm hasn't loaded.
    const collidable_rectangles = get_all_collidable_rects();

    // make sure the rectangles are in canvas space.
    const canvas_bounds = display.render_ctx.canvas.getBoundingClientRect();
    for (const rect of collidable_rectangles) {
        rect.x -= canvas_bounds.x;
        rect.y -= canvas_bounds.y;
    }


    const BOID_CANVAS_SQUISH_FACTOR = 1;
    // this is the canvas that the wasm is going to draw into.
    //
    // based on the render canvas for now.
    //
    // using squish factor, we can change the rendering size of the boid image we just got.

    // TODO when squished, mouse input dose not work right.
    const boid_canvas_width  = /* 16*25; */ Math.floor(display.render_ctx.canvas.width  / BOID_CANVAS_SQUISH_FACTOR);
    const boid_canvas_height = /*  9*25; */ Math.floor(display.render_ctx.canvas.height / BOID_CANVAS_SQUISH_FACTOR);

    // [r, g, b, a], not necessarily in that order
    const NUM_COLOR_COMPONENTS = 4;
    const byte_buffer_size = boid_canvas_width * boid_canvas_height * NUM_COLOR_COMPONENTS;

    // resize back buffer if canvas size changed.
    if (display.back_buffer_image_width !== boid_canvas_width || display.back_buffer_image_height !== boid_canvas_height) {
        log(Log_Type.General, "Oh god. were resizing the buffer");

        // TODO maybe don't do this is js rendering?
        if (display.software_rendering_back_buffer_array.length < byte_buffer_size) {
            log(Log_Type.General, "Back buffer array getting bigger"); // my penis
            // make the buffer bigger
            display.software_rendering_back_buffer_array = new Uint8ClampedArray(byte_buffer_size);
        }


        const back_canvas = new OffscreenCanvas(boid_canvas_width, boid_canvas_height);

        const back_ctx = back_canvas.getContext("2d");
        if (back_ctx === null)    throw new Error("2D context is not supported");

        display.back_buffer_render_ctx = back_ctx;
        display.back_buffer_render_ctx.imageSmoothingEnabled = false;

        display.back_buffer_image_width  = boid_canvas_width;
        display.back_buffer_image_height = boid_canvas_height;
    }

    const software_rendering_byte_buffer = display.software_rendering_back_buffer_array.subarray(0, byte_buffer_size);

    const args: Get_Next_Frame_Arguments = {
        width: boid_canvas_width,
        height: boid_canvas_height,
        software_rendering_byte_buffer: software_rendering_byte_buffer,

        mouse: mouse,

        rectangles: collidable_rectangles,
    };

    const num_bytes_filled = go.get_next_frame(args);

    //
    // load the back_buffer_render_ctx with the new image.
    //
    if (render_method === Render_Method.Software) {
        // TODO is this just wasted time in js rendering mode?
        if (num_bytes_filled !== byte_buffer_size)    throw new Error(`go.get_next_frame got incorrect number of bytes, wanted: ${byte_buffer_size}, got: ${num_bytes_filled}`);

        // @ts-ignore // why dose this line make an error in my editor
        const image_data = new ImageData(software_rendering_byte_buffer, boid_canvas_width, boid_canvas_height);

        // is this cool?
        //
        // the whole point of this back_buffer is to prevent flickering and
        // stuff, buf if were only going to be drawing one thing...
        // whats the point?
        display.back_buffer_render_ctx.putImageData(image_data, 0, 0);
    }

    if (render_method === Render_Method.Js) {
        // in js rendering, the back_buffer was already drawn into. maybe we don't need this switch case.
        if (num_bytes_filled !== -1) throw new Error(`go.get_next_frame should return -1 in js rendering mode, got: ${num_bytes_filled}`);
    }

    // NOTE this will stretch the image in display.back_buffer_render_ctx.
    //
    // canvas.width might change during the time this is running
    display.render_ctx.drawImage(display.back_buffer_render_ctx.canvas, 0, 0, display.render_ctx.canvas.width, display.render_ctx.canvas.height);

    // lets hope javascript is smart enough to deallocate this...
    // imageData = null;
};


// TODO make this smarter.
const render_times: number[] = [];
const delta_times: number[] = [];

// Credit: https://github.com/tsoding/koil
// 
// TODO remove new_render_time, and new_delta_time, just make a class or something.
function render_debug_info(display: Display, new_render_time: number, new_delta_time: number) {
    const FONT_SIZE = 24;
    display.render_ctx.font = `${FONT_SIZE}px bold`;

    render_times.push(new_render_time);
    if (render_times.length > 60) { render_times.shift(); }

    delta_times.push(new_delta_time);
    if (delta_times .length > 60) { delta_times .shift(); }

    const render_avg = render_times.reduce((a, b) => a + b, 0) / render_times.length;
    const delta_avg  = delta_times .reduce((a, b) => a + b, 0) / delta_times .length;

    const labels: string[] = [];
    { // construct the labels.

        // this is the only unique things between render_times and delta_times
        const frames_per_second = (1/delta_avg*1000).toFixed(2);
        const seconds_per_frame = (  delta_avg/1000).toFixed(5);
        labels.push(`F/S: ${frames_per_second}    S/F: ${seconds_per_frame}`);

        labels.push(`WASM Render Time Avg (ms): ${render_avg.toFixed(2)}`);
        labels.push(`Render/Sec (MAX): ${(1/render_avg*1000).toFixed(2)}`);
    }

    const EDGE_PADDING = 40;
    const SHADOW_OFFSET = FONT_SIZE*0.06;
    for (let i = 0; i < labels.length; i++) {
        display.render_ctx.fillStyle = "black";
        display.render_ctx.fillText(labels[i], EDGE_PADDING + SHADOW_OFFSET, EDGE_PADDING - SHADOW_OFFSET + FONT_SIZE*i);
        display.render_ctx.fillStyle = "white";
        display.render_ctx.fillText(labels[i], EDGE_PADDING, EDGE_PADDING + FONT_SIZE*i);
    }
};



//////////////////////////////////////////////////
//            The Main Function
//////////////////////////////////////////////////

async function main() {
    if (IN_DEV_MODE) console.log("In Dev Mode");

    const go = await get_go_functions();

    { // setup input handling.
        // why doesn't typescript have an enum for this?
        const enum Mouse_Buttons {
            Left      = 0,
            Middle    = 1,
            Right     = 2,
        };

        const root = document.getRootNode() as HTMLHtmlElement;

        root.addEventListener('mousemove', (ev) => {
            mouse.pos = {x: ev.x, y: ev.y};

            // adjust the position to map into canvas space. we only use this for boid input.
            mouse.pos.x -= display.render_ctx.canvas.getBoundingClientRect().x;
            mouse.pos.y -= display.render_ctx.canvas.getBoundingClientRect().y;
        });
        // this will break if the user slides there mouse outside of the screen while clicking, but this is the web, people expect it to suck.
        root.addEventListener('mousedown', (ev) => {
            if (ev.button === Mouse_Buttons.Left)      mouse.left_down   = true;
            if (ev.button === Mouse_Buttons.Middle)    mouse.middle_down = true;
            if (ev.button === Mouse_Buttons.Right)     mouse.right_down  = true;
        });
        root.addEventListener('mouseup',   (ev) => {
            if (ev.button === Mouse_Buttons.Left)      mouse.left_down   = false;
            if (ev.button === Mouse_Buttons.Middle)    mouse.middle_down = false;
            if (ev.button === Mouse_Buttons.Right)     mouse.right_down  = false;
        });
    }


    const BOID_CANVAS_ID = "boid_canvas";
    // const canvas_container = document.getElementById("canvas_div") as HTMLCanvasElement | null
    const boid_canvas = document.getElementById(BOID_CANVAS_ID) as HTMLCanvasElement | null;
    if (boid_canvas === null)    throw new Error(`No canvas with id "${BOID_CANVAS_ID}" is found`);

    // TODO naming better, use snake case everywhere!!
    const boid_canvas_render_ctx = boid_canvas.getContext("2d");
    if (boid_canvas_render_ctx === null)    throw new Error("2D context is not supported");
    boid_canvas_render_ctx.imageSmoothingEnabled = false;

    const [back_buffer_image_width, back_buffer_image_height] = [boid_canvas_render_ctx.canvas.width, boid_canvas_render_ctx.canvas.height];
    const back_buffer_canvas = new OffscreenCanvas(back_buffer_image_width, back_buffer_image_height);

    const back_buffer_render_ctx = back_buffer_canvas.getContext("2d");
    if (back_buffer_render_ctx === null)    throw new Error("2D context is not supported");
    back_buffer_render_ctx.imageSmoothingEnabled = false;

    const back_buffer_array = new Uint8ClampedArray(back_buffer_image_width * back_buffer_image_height * 4);


    const display: Display = {
        render_ctx: boid_canvas_render_ctx,
        back_buffer_render_ctx: back_buffer_render_ctx,

        software_rendering_back_buffer_array: back_buffer_array,

        back_buffer_image_width: back_buffer_image_width,
        back_buffer_image_height: back_buffer_image_height,
    };

    function map_xy_to_canvas_space(x: number, y: number): [number, number] {
        const squish_factor = display.back_buffer_render_ctx.canvas.width / display.back_buffer_image_width;
        const real_x = x * squish_factor;
        const real_y = y * squish_factor;
        return [real_x, real_y];
    }


    const functions_to_provide: Functions_To_Provide = {
        log_string_function: (s) => { console.log("log_string:", s); },

        clear_background:  (c) =>                         {
            display.back_buffer_render_ctx.fillStyle = Boid_Color_To_Rgb(c);
            display.back_buffer_render_ctx.fillRect(0, 0, display.back_buffer_render_ctx.canvas.width, display.back_buffer_render_ctx.canvas.height);
        },
        draw_rectangle:    (x, y, w, h, c) =>             {
            // move it more into canvas space, TODO the right thing is back_buffer width or something.
            // x /= 5; y /= 5; w /= 5; h /= 5;
            [x, y] = map_xy_to_canvas_space(x, y);
            [w, h] = map_xy_to_canvas_space(w, h);
            display.back_buffer_render_ctx.fillStyle = Boid_Color_To_Rgb(c);
            display.back_buffer_render_ctx.fillRect(x, y, w, h);
        },
        draw_circle:       (x, y, r, c) =>                {
            var _: number; // bleh
            [x, y] = map_xy_to_canvas_space(x, y);
            [r, _] = map_xy_to_canvas_space(r, 0);

            display.back_buffer_render_ctx.fillStyle = Boid_Color_To_Rgb(c);
            display.back_buffer_render_ctx.ellipse(x, y, r, r, 0, 0, 0.5);
        },
        draw_triangle:     (x1, y1, x2, y2, x3, y3, c) => {
            [x1, y1] = map_xy_to_canvas_space(x1, y1);
            [x2, y2] = map_xy_to_canvas_space(x2, y2);
            [x3, y3] = map_xy_to_canvas_space(x3, y3);

            display.back_buffer_render_ctx.fillStyle = Boid_Color_To_Rgb(c);

            // yuck.
            display.back_buffer_render_ctx.beginPath();
            display.back_buffer_render_ctx.moveTo(x1, y1);
            display.back_buffer_render_ctx.lineTo(x2, y2);
            display.back_buffer_render_ctx.lineTo(x3, y3);
            display.back_buffer_render_ctx.closePath();
            display.back_buffer_render_ctx.fill();
        },
        draw_line:         (x1, y1, x2, y2, c) =>         {
            [x1, y1] = map_xy_to_canvas_space(x1, y1);
            [x2, y2] = map_xy_to_canvas_space(x2, y2);

            display.back_buffer_render_ctx.strokeStyle = Boid_Color_To_Rgb(c);

            display.back_buffer_render_ctx.beginPath();
            display.back_buffer_render_ctx.moveTo(x1, y1);
            display.back_buffer_render_ctx.lineTo(x2, y2);
            display.back_buffer_render_ctx.closePath();
            display.back_buffer_render_ctx.stroke();
        },
        draw_single_pixel: (x, y, c) =>                   {
            // console.log("draw_single_pixel: Not Implemented.");
            // throw new Error("draw_single_pixel is not implemented, because it would be really slow, and i don't need it right now.");

            [x, y] = map_xy_to_canvas_space(x, y);
            display.back_buffer_render_ctx.fillStyle = Boid_Color_To_Rgb(c);
            // hmm...
            display.back_buffer_render_ctx.fillRect(x, y, 1, 1);
        }
    };
    const go_properties_as_an_object = go.Initialize_Js_And_Go_Connection(functions_to_provide)

    { // Handle property stuff

        const boid_properties = Object.entries(go_properties_as_an_object);
        if (boid_properties.length === 0) throw new Error("No properties where given to javascript!");

        function set_property(name: string, value: number|boolean) {
            // https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
            const obj: Record<string,number|boolean> = {};
            obj[name] = value;

            go.set_properties(obj);
        };

        // maybe this should accept set_property(), would allow the
        // property structs to set themselves, (getter and setter
        // style), but then again this only happens once...
        // so its not that important.
        setup_global_properties(boid_properties);
        // TODO maybe make this dev mode only...
        // it also has to remove the Settings thing...
        setup_sliders(set_property);
    }

    let prev_timestamp: number | undefined;
    const frame = (timestamp: number) => {
        if (prev_timestamp === undefined) { prev_timestamp = timestamp; }

        const boidContainer = document.getElementById("boid_container");
        if (boidContainer === null)    throw new Error("No element with id `boid_container` is found");

        boid_canvas_render_ctx.canvas.width  = boidContainer.clientWidth;
        boid_canvas_render_ctx.canvas.height = boidContainer.clientHeight;

        const delta_time = (timestamp - prev_timestamp);
        prev_timestamp = timestamp;

        // TODO Don't need delta time, boid thing dose it for us? change?

        const start_time = performance.now();
            render_boids(display, go);
        const end_time = performance.now();

        // In ms
        const render_time = end_time - start_time;

        if (DEBUG_DISPLAY && IN_DEV_MODE)    render_debug_info(display, render_time, delta_time);

        window.requestAnimationFrame(frame);
    };

    window.requestAnimationFrame(frame);
}

// start the whole thing.
main();
