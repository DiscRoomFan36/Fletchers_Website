/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./web_src/logger.ts":
/*!***************************!*\
  !*** ./web_src/logger.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Log_Type = exports.DEBUG_SLIDERS = exports.DEBUG_DISPLAY = void 0;
exports.log = log;
// is it correct to have these here? this one effects
// drawing on the screen, not just logging? although we
// could make all logs appear on screen...
exports.DEBUG_DISPLAY = true;
exports.DEBUG_SLIDERS = false;
var Log_Type;
(function (Log_Type) {
    Log_Type[Log_Type["General"] = 0] = "General";
    Log_Type[Log_Type["Debug_Display"] = 1] = "Debug_Display";
    Log_Type[Log_Type["Debug_Sliders"] = 2] = "Debug_Sliders";
})(Log_Type || (exports.Log_Type = Log_Type = {}));
;
function log(log_type, ...data) {
    // if this is the empty string
    var do_log = false;
    var log_header = "";
    switch (log_type) {
        case Log_Type.General:
            {
                log_header = "";
                do_log = true;
            }
            break;
        case Log_Type.Debug_Display:
            {
                log_header = "DEBUG_DISPLAY";
                if (exports.DEBUG_DISPLAY)
                    do_log = true;
            }
            break;
        case Log_Type.Debug_Sliders:
            {
                log_header = "DEBUG_SLIDERS";
                if (exports.DEBUG_SLIDERS)
                    do_log = true;
            }
            break;
    }
    if (do_log) {
        if (log_header != "") {
            console.log(`${log_header}: `, ...data);
        }
        else {
            console.log(...data);
        }
    }
}
;


/***/ }),

/***/ "./web_src/setup_sliders.ts":
/*!**********************************!*\
  !*** ./web_src/setup_sliders.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setup_sliders = setup_sliders;
const logger_1 = __webpack_require__(/*! ./logger */ "./web_src/logger.ts");
const DEFAULT_CATEGORY = "Misc";
class Property_Struct {
    constructor() {
        this.property_name = "";
        this.property_data_type = Property_Data_Type.None;
        // Float properties
        this.float_range_min = 0;
        this.float_range_max = 0;
        this.float_default = 0;
        // Int properties
        this.int_range_min = 0;
        this.int_range_max = 0;
        this.int_default = 0;
        // Bool properties
        this.bool_default = false;
        // for nice property visualization.
        this.category = DEFAULT_CATEGORY;
    }
}
;
var Property_Data_Type;
(function (Property_Data_Type) {
    Property_Data_Type[Property_Data_Type["None"] = 0] = "None";
    Property_Data_Type[Property_Data_Type["Property_Data_Float"] = 1] = "Property_Data_Float";
    Property_Data_Type[Property_Data_Type["Property_Data_Int"] = 2] = "Property_Data_Int";
    Property_Data_Type[Property_Data_Type["Property_Data_Bool"] = 3] = "Property_Data_Bool";
})(Property_Data_Type || (Property_Data_Type = {}));
;
// puts some sliders up to control some parameters
function setup_sliders(properties, set_property) {
    const SLIDER_CONTAINER_ID = "slideContainer";
    const slider_container = document.getElementById(SLIDER_CONTAINER_ID);
    if (slider_container === null)
        throw new Error("Cannot Get slider container");
    // TODO for the slides that have a small range (like cohesion factor) make the value the square of the number.
    properties.sort(); // hope someone else wasn't using this.
    const property_structs = [];
    for (const [name, tag] of properties) {
        (0, logger_1.log)(logger_1.Log_Type.Debug_Sliders, `typescript: ${name}: ${tag}`);
        // TODO this function is growing to big, put it in a separate file.
        const tag_split = tag.split(" ");
        const [prop_property, property_data_type] = tag_prop_to_parts(tag_split[0]);
        if (prop_property != "Property")
            throw new Error(`First property is not property, tag was ${tag}`);
        const property_struct = new Property_Struct();
        property_struct.property_name = name;
        if (property_struct.category != DEFAULT_CATEGORY)
            throw new Error(`in ${name}, property_struct.category was set to ${property_struct.category} but it should be ${DEFAULT_CATEGORY} at this point`);
        switch (property_data_type) {
            case "float":
                {
                    property_struct.property_data_type = Property_Data_Type.Property_Data_Float;
                }
                break;
            case "int":
                {
                    property_struct.property_data_type = Property_Data_Type.Property_Data_Int;
                }
                break;
            case "bool":
                {
                    property_struct.property_data_type = Property_Data_Type.Property_Data_Bool;
                }
                break;
            default: {
                throw new Error(`in ${name}, Unknown property data type ${property_data_type}`);
            }
        }
        tag_split.shift();
        while (tag_split.length > 0) {
            const [left, right] = tag_prop_to_parts(tag_split.shift());
            switch (left) {
                case "Range":
                    {
                        switch (property_struct.property_data_type) {
                            case Property_Data_Type.Property_Data_Float:
                                {
                                    const [min_as_string, max_as_string] = right.split(";");
                                    property_struct.float_range_min = parseFloat(min_as_string);
                                    property_struct.float_range_max = parseFloat(max_as_string);
                                }
                                break;
                            case Property_Data_Type.Property_Data_Int:
                                {
                                    const [min_as_string, max_as_string] = right.split(";");
                                    property_struct.int_range_min = parseInt(min_as_string);
                                    property_struct.int_range_max = parseInt(max_as_string);
                                }
                                break;
                            case Property_Data_Type.Property_Data_Bool: {
                                throw new Error("Boolean dose not have a range!");
                            }
                            default: {
                                throw new Error(`Unknown data type in ${name}`);
                            }
                        }
                    }
                    break;
                case "Default":
                    {
                        switch (property_struct.property_data_type) {
                            case Property_Data_Type.Property_Data_Float:
                                {
                                    property_struct.float_default = parseFloat(right);
                                }
                                break;
                            case Property_Data_Type.Property_Data_Int:
                                {
                                    property_struct.int_default = parseInt(right);
                                }
                                break;
                            case Property_Data_Type.Property_Data_Bool:
                                {
                                    property_struct.bool_default = parse_bool(right);
                                }
                                break;
                            default: {
                                throw new Error(`Unknown data type in ${name}`);
                            }
                        }
                    }
                    break;
                case "Category":
                    {
                        property_struct.category = right;
                    }
                    break;
                default: {
                    throw new Error(`in ${name}, found unknown property '${left}'`);
                }
            }
        }
        property_structs.push(property_struct);
    }
    // Group property_structs by category for collapsible rendering
    const category_map = new Map();
    for (const ps of property_structs) {
        const category = ps.category || DEFAULT_CATEGORY;
        if (!category_map.has(category))
            category_map.set(category, []);
        category_map.get(category).push(ps);
    }
    // Sort categories alphabetically, but place the DEFAULT_CATEGORY last
    const categories = Array.from(category_map.keys()).sort((a, b) => {
        if (a === DEFAULT_CATEGORY)
            return +1;
        if (b === DEFAULT_CATEGORY)
            return -1;
        return a.localeCompare(b);
    });
    for (const category of categories) {
        const items = category_map.get(category);
        const details = document.createElement("details");
        details.className = "categoryGroup";
        const summary = document.createElement("summary");
        summary.className = "categoryHeader";
        summary.textContent = category.replace(/_/g, " ");
        details.appendChild(summary);
        const body = document.createElement("div");
        body.className = "categoryBody";
        for (const property_struct of items) {
            switch (property_struct.property_data_type) {
                case Property_Data_Type.Property_Data_Float:
                    {
                        make_float_slider(body, property_struct, set_property);
                    }
                    break;
                case Property_Data_Type.Property_Data_Int:
                    {
                        make_int_slider(body, property_struct, set_property);
                    }
                    break;
                case Property_Data_Type.Property_Data_Bool:
                    {
                        make_bool_slider(body, property_struct, set_property);
                    }
                    break;
                default: {
                    throw new Error(`in ${property_struct.property_name}, found unknown property type ${property_struct.property_data_type}`);
                }
            }
        }
        details.appendChild(body);
        slider_container.appendChild(details);
    }
}
;
///////////////////////////////////////////////
//         Make a slider for a float
///////////////////////////////////////////////
function make_float_slider(slider_container, property_struct, set_property) {
    const slider_id = `slider_${property_struct.property_name}`;
    const paragraph_id = `${slider_id}_paragraph`;
    const paragraph_text = `${property_struct.property_name.replace(/_/g, " ")}`;
    const html_string = `
        <p class="sliderKey" id="${paragraph_id}">
            ${paragraph_text}: ${property_struct.float_default}
        </p>
        <input type="range" min="${property_struct.float_range_min}" max="${property_struct.float_range_max}" value="${property_struct.float_default}" step="0.005" class="slider" id="${slider_id}">
    `;
    const new_element = document.createElement("div");
    new_element.className = "rangeHolder";
    new_element.innerHTML = html_string;
    slider_container.appendChild(new_element);
    const slider = new_element.querySelector('input');
    if (slider === null)
        throw new Error(`Could not find input for slider id='${slider_id}' inside its container`);
    if (slider.id != slider_id)
        throw new Error(`Found slider with id='${slider.id}' but expected id='${slider_id}'`);
    slider.addEventListener("input", (event) => {
        const the_slider = event.target;
        if (the_slider === null)
            throw new Error(`Slider input for '${property_struct.property_name}' disappeared unexpectedly`);
        const slider_number = Number(the_slider.value);
        const slider_text = new_element.querySelector(`#${paragraph_id}`);
        if (slider_text === null)
            throw new Error(`Could not find label paragraph '${paragraph_id}' for slider '${slider_id}'`);
        slider_text.textContent = `${paragraph_text}: ${slider_number}`;
        set_property(property_struct.property_name, slider_number);
    });
}
;
///////////////////////////////////////////////
//          Make a slider for an int
///////////////////////////////////////////////
function make_int_slider(slider_container, property_struct, set_property) {
    const slider_id = `slider_${property_struct.property_name}`;
    const para_id = `${slider_id}_paragraph`;
    const paragraph_text = `${property_struct.property_name.replace(/_/g, " ")}`;
    const html_string = `
        <p class="sliderKey" id="${para_id}">
            ${paragraph_text}: ${property_struct.int_default}
        </p>
        <input type="range" min="${property_struct.int_range_min}" max="${property_struct.int_range_max}" value="${property_struct.int_default}" class="slider" id="${slider_id}">
        `;
    const new_thing = document.createElement("div");
    new_thing.className = "rangeHolder";
    new_thing.innerHTML = html_string;
    slider_container.appendChild(new_thing);
    const slider = new_thing.querySelector('input');
    if (slider === null)
        throw new Error(`Could not find input for slider id='${slider_id}' inside its container`);
    if (slider.id != slider_id)
        throw new Error(`Found slider with id='${slider.id}' but expected id='${slider_id}'`);
    slider.addEventListener("input", (event) => {
        const the_slider = event.target;
        if (the_slider === null)
            throw new Error(`Slider input for '${property_struct.property_name}' disappeared unexpectedly`);
        const slider_number = Number(the_slider.value);
        const slider_text = new_thing.querySelector(`#${para_id}`);
        if (slider_text === null)
            throw new Error(`Could not find label paragraph '${para_id}' for slider '${slider_id}'`);
        slider_text.textContent = `${paragraph_text}: ${slider_number}`;
        set_property(property_struct.property_name, slider_number);
    });
}
;
///////////////////////////////////////////////
//     Make a slider for an boolean toggle
///////////////////////////////////////////////
function make_bool_slider(slider_container, property_struct, set_property) {
    const slider_id = `slider_${property_struct.property_name}`;
    const paragraph_text = `${property_struct.property_name.replace(/_/g, " ")}`;
    const html_string = `
        <input type="checkbox" ${property_struct.bool_default ? "checked" : ""} class="checkbox_toggle" id="${slider_id}">
        <label for="${slider_id}" class="checkbox_toggle_label">${paragraph_text}</label>
        `;
    const new_thing = document.createElement("div");
    new_thing.className = "rangeHolder";
    new_thing.innerHTML = html_string;
    slider_container.appendChild(new_thing);
    const slider = new_thing.querySelector('input');
    if (slider === null)
        throw new Error(`Could not find checkbox input for id='${slider_id}' inside its container`);
    if (slider.id != slider_id)
        throw new Error(`Found slider with id='${slider.id}' but expected id='${slider_id}'`);
    slider.addEventListener("input", (event) => {
        const the_slider = event.target;
        if (the_slider === null)
            throw new Error(`Checkbox input for '${property_struct.property_name}' disappeared unexpectedly`);
        set_property(property_struct.property_name, the_slider.checked);
    });
}
;
////////////////////////////////////
//         Helper functions
////////////////////////////////////
function tag_prop_to_parts(prop) {
    const [left, right_with_junk] = prop.split(":");
    const right = right_with_junk.slice(1, right_with_junk.length - 1);
    return [left, right];
}
;
function parse_bool(s) {
    // 1, t, T, TRUE, true, True,
    // 0, f, F, FALSE, false, False
    switch (s) {
        case "1":
        case "t":
        case "T":
        case "TRUE":
        case "true":
        case "True": {
            return true;
        }
        case "0":
        case "f":
        case "F":
        case "FALSE":
        case "false":
        case "False": {
            return false;
        }
        default: throw new Error(`Unknown string in parseBool, was ${s}`);
    }
}
;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**************************!*\
  !*** ./web_src/index.ts ***!
  \**************************/

// typescript glue code.
Object.defineProperty(exports, "__esModule", ({ value: true }));
const logger_1 = __webpack_require__(/*! ./logger */ "./web_src/logger.ts");
const setup_sliders_1 = __webpack_require__(/*! ./setup_sliders */ "./web_src/setup_sliders.ts");
// cool trick
const IN_DEV_MODE = (window.location.hostname == "localhost");
;
;
// NOTE we keep the @ts-ignore's in here
async function get_go_functions() {
    // @ts-ignore
    const go = new Go(); // NOTE this comes from the wasm_exec.js thing
    const result = await WebAssembly.instantiateStreaming(fetch("dist/boid.wasm"), go.importObject);
    go.run(result.instance);
    return {
        // @ts-ignore
        set_properties: SetProperties,
        // @ts-ignore
        get_properties: GetProperties,
        // @ts-ignore
        get_next_frame: GetNextFrame,
    };
}
;
;
;
;
;
const mouse = {
    pos: { x: 0, y: 0 },
    left_down: false,
    middle_down: false,
    right_down: false,
};
function dom_rect_to_rect(dom_rect) {
    return {
        x: dom_rect.x,
        y: dom_rect.y,
        w: dom_rect.width,
        // to account for letters like 'j'
        h: dom_rect.height + 5,
    };
}
;
function get_all_collidable_rects() {
    const CLASS = "collide";
    const elements = document.getElementsByClassName(CLASS);
    const result = [];
    for (let i = 0; i < elements.length; ++i) {
        const element = elements[i];
        const dom_rect = element.getBoundingClientRect();
        result.push(dom_rect_to_rect(dom_rect));
    }
    return result;
}
;
function render_boids(display, go) {
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
    const BOID_CANVAS_SQUISH_FACTOR = 1;
    // this is the canvas that the wasm is going to draw into.
    //
    // based on the render canvas for now.
    //
    // using squish factor, we can change the rendering size of the boid image we just got.
    // TODO when squished, mouse input dose not work right.
    const boid_canvas_width = /* 16*25; */ Math.floor(display.render_ctx.canvas.width / BOID_CANVAS_SQUISH_FACTOR);
    const boid_canvas_height = /*  9*25; */ Math.floor(display.render_ctx.canvas.height / BOID_CANVAS_SQUISH_FACTOR);
    // [r, g, b, a], not necessarily in that order
    const NUM_COLOR_COMPONENTS = 4;
    const buffer_size = boid_canvas_width * boid_canvas_height * NUM_COLOR_COMPONENTS;
    // resize back buffer if canvas size changed.
    if (display.back_buffer_image_width !== boid_canvas_width || display.back_buffer_image_height !== boid_canvas_height) {
        (0, logger_1.log)(logger_1.Log_Type.General, "Oh god. were resizing the buffer");
        if (display.back_buffer_array.length < buffer_size) {
            (0, logger_1.log)(logger_1.Log_Type.General, "Back buffer array getting bigger"); // my penis
            // make the buffer bigger
            display.back_buffer_array = new Uint8ClampedArray(buffer_size);
        }
        const back_canvas = new OffscreenCanvas(boid_canvas_width, boid_canvas_height);
        const back_ctx = back_canvas.getContext("2d");
        if (back_ctx === null)
            throw new Error("2D context is not supported");
        display.back_buffer_render_ctx = back_ctx;
        display.back_buffer_render_ctx.imageSmoothingEnabled = false;
        display.back_buffer_image_width = boid_canvas_width;
        display.back_buffer_image_height = boid_canvas_height;
    }
    const buffer = display.back_buffer_array.subarray(0, buffer_size);
    const args = {
        width: boid_canvas_width,
        height: boid_canvas_height,
        buffer: buffer,
        mouse: mouse,
        rectangles: collidable_rectangles,
    };
    const num_bytes_filled = go.get_next_frame(args);
    if (num_bytes_filled !== buffer_size)
        throw new Error(`go.get_next_frame got incorrect number of bytes, wanted: ${buffer_size}, got: ${num_bytes_filled}`);
    // @ts-ignore // why dose this line make an error in my editor
    const image_data = new ImageData(buffer, boid_canvas_width, boid_canvas_height);
    // is this cool?
    //
    // the whole point of this back_buffer is to prevent flickering and
    // stuff, buf if were only going to be drawing one thing...
    // whats the point?
    display.back_buffer_render_ctx.putImageData(image_data, 0, 0);
    // NOTE this will stretch the thing.
    // canvas.width might change during the time this is running
    display.render_ctx.drawImage(display.back_buffer_render_ctx.canvas, 0, 0, display.render_ctx.canvas.width, display.render_ctx.canvas.height);
    // lets hope javascript is smart enough to deallocate this...
    // imageData = null
}
;
// TODO make this smarter.
const render_times = [];
const delta_times = [];
// Credit: https://github.com/tsoding/koil
// 
// TODO remove new_render_time, and new_delta_time, just make a class or something.
function render_debug_info(display, new_render_time, new_delta_time) {
    const FONT_SIZE = 28;
    display.render_ctx.font = `${FONT_SIZE}px bold`;
    render_times.push(new_render_time);
    if (render_times.length > 60) {
        render_times.shift();
    }
    delta_times.push(new_delta_time);
    if (delta_times.length > 60) {
        delta_times.shift();
    }
    const render_avg = render_times.reduce((a, b) => a + b, 0) / render_times.length;
    const delta_avg = delta_times.reduce((a, b) => a + b, 0) / delta_times.length;
    const labels = [];
    { // construct the labels.
        // this is the only unique things between render_times and delta_times
        const frames_per_second = (1 / delta_avg * 1000).toFixed(2);
        const seconds_per_frame = (delta_avg / 1000).toFixed(5);
        labels.push(`F/S: ${frames_per_second}    S/F: ${seconds_per_frame}`);
        labels.push(`WASM Render Time Avg (ms): ${render_avg.toFixed(2)}`);
        labels.push(`Render/Sec (MAX): ${(1 / render_avg * 1000).toFixed(2)}`);
    }
    const PADDING = 70;
    const SHADOW_OFFSET = FONT_SIZE * 0.06;
    for (let i = 0; i < labels.length; i++) {
        display.render_ctx.fillStyle = "black";
        display.render_ctx.fillText(labels[i], PADDING, PADDING + FONT_SIZE * i);
        display.render_ctx.fillStyle = "white";
        display.render_ctx.fillText(labels[i], PADDING + SHADOW_OFFSET, PADDING - SHADOW_OFFSET + FONT_SIZE * i);
    }
}
;
//////////////////////////////////////////////////
//            The Main Function
//////////////////////////////////////////////////
(async () => {
    if (IN_DEV_MODE)
        console.log("In Dev Mode");
    const go = await get_go_functions();
    { // Handle slider stuff
        const boid_properties = Object.entries(go.get_properties());
        if (boid_properties.length == 0)
            throw new Error("No properties where given to javascript!");
        function set_property(name, value) {
            // https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
            const obj = {};
            obj[name] = value;
            go.set_properties(obj);
        }
        ;
        // TODO maybe make this dev mode only...
        // it also has to remove the Settings thing...
        (0, setup_sliders_1.setup_sliders)(boid_properties, set_property);
    }
    { // setup input handling.
        // why doesn't typescript have an enum for this?
        let Mouse_Buttons;
        (function (Mouse_Buttons) {
            Mouse_Buttons[Mouse_Buttons["Left"] = 0] = "Left";
            Mouse_Buttons[Mouse_Buttons["Middle"] = 1] = "Middle";
            Mouse_Buttons[Mouse_Buttons["Right"] = 2] = "Right";
        })(Mouse_Buttons || (Mouse_Buttons = {}));
        ;
        const root = document.getRootNode();
        root.addEventListener('mousemove', (ev) => {
            mouse.pos = { x: ev.x, y: ev.y };
        });
        // this will break if the user slides there mouse outside of the screen while clicking, but this is the web, people expect it to suck.
        root.addEventListener('mousedown', (ev) => {
            if (ev.button == Mouse_Buttons.Left)
                mouse.left_down = true;
            if (ev.button == Mouse_Buttons.Middle)
                mouse.middle_down = true;
            if (ev.button == Mouse_Buttons.Right)
                mouse.right_down = true;
        });
        root.addEventListener('mouseup', (ev) => {
            if (ev.button == Mouse_Buttons.Left)
                mouse.left_down = false;
            if (ev.button == Mouse_Buttons.Middle)
                mouse.middle_down = false;
            if (ev.button == Mouse_Buttons.Right)
                mouse.right_down = false;
        });
    }
    // const canvas_container = document.getElementById("canvas_div") as HTMLCanvasElement | null
    const boid_canvas = document.getElementById("boid_canvas");
    if (boid_canvas === null)
        throw new Error("No canvas with id `boid_canvas` is found");
    // TODO naming better, use snake case everywhere!!
    const boid_canvas_render_ctx = boid_canvas.getContext("2d");
    if (boid_canvas_render_ctx === null)
        throw new Error("2D context is not supported");
    boid_canvas_render_ctx.imageSmoothingEnabled = false;
    const [back_buffer_image_width, back_buffer_image_height] = [boid_canvas_render_ctx.canvas.width, boid_canvas_render_ctx.canvas.height];
    const back_buffer_canvas = new OffscreenCanvas(back_buffer_image_width, back_buffer_image_height);
    const back_buffer_render_ctx = back_buffer_canvas.getContext("2d");
    if (back_buffer_render_ctx === null)
        throw new Error("2D context is not supported");
    back_buffer_render_ctx.imageSmoothingEnabled = false;
    const back_buffer_array = new Uint8ClampedArray(back_buffer_image_width * back_buffer_image_height * 4);
    const display = {
        render_ctx: boid_canvas_render_ctx,
        back_buffer_render_ctx: back_buffer_render_ctx,
        back_buffer_array: back_buffer_array,
        back_buffer_image_width: back_buffer_image_width,
        back_buffer_image_height: back_buffer_image_height,
    };
    let prev_timestamp = 0;
    const frame = (timestamp) => {
        boid_canvas_render_ctx.canvas.width = window.innerWidth;
        boid_canvas_render_ctx.canvas.height = window.innerHeight;
        const delta_time = (timestamp - prev_timestamp);
        prev_timestamp = timestamp;
        // TODO Don't need delta time, boid thing dose it for us? change?
        const start_time = performance.now();
        render_boids(display, go);
        const end_time = performance.now();
        // In ms
        const render_time = end_time - start_time;
        if (logger_1.DEBUG_DISPLAY && IN_DEV_MODE)
            render_debug_info(display, render_time, delta_time);
        window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame((timestamp) => {
        prev_timestamp = timestamp;
        window.requestAnimationFrame(frame);
    });
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYm9pZHMvLi93ZWJfc3JjL2xvZ2dlci50cyIsIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvc2V0dXBfc2xpZGVycy50cyIsIndlYnBhY2s6Ly9ib2lkcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkxvZ19UeXBlID0gZXhwb3J0cy5ERUJVR19TTElERVJTID0gZXhwb3J0cy5ERUJVR19ESVNQTEFZID0gdm9pZCAwO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG4vLyBpcyBpdCBjb3JyZWN0IHRvIGhhdmUgdGhlc2UgaGVyZT8gdGhpcyBvbmUgZWZmZWN0c1xuLy8gZHJhd2luZyBvbiB0aGUgc2NyZWVuLCBub3QganVzdCBsb2dnaW5nPyBhbHRob3VnaCB3ZVxuLy8gY291bGQgbWFrZSBhbGwgbG9ncyBhcHBlYXIgb24gc2NyZWVuLi4uXG5leHBvcnRzLkRFQlVHX0RJU1BMQVkgPSB0cnVlO1xuZXhwb3J0cy5ERUJVR19TTElERVJTID0gZmFsc2U7XG52YXIgTG9nX1R5cGU7XG4oZnVuY3Rpb24gKExvZ19UeXBlKSB7XG4gICAgTG9nX1R5cGVbTG9nX1R5cGVbXCJHZW5lcmFsXCJdID0gMF0gPSBcIkdlbmVyYWxcIjtcbiAgICBMb2dfVHlwZVtMb2dfVHlwZVtcIkRlYnVnX0Rpc3BsYXlcIl0gPSAxXSA9IFwiRGVidWdfRGlzcGxheVwiO1xuICAgIExvZ19UeXBlW0xvZ19UeXBlW1wiRGVidWdfU2xpZGVyc1wiXSA9IDJdID0gXCJEZWJ1Z19TbGlkZXJzXCI7XG59KShMb2dfVHlwZSB8fCAoZXhwb3J0cy5Mb2dfVHlwZSA9IExvZ19UeXBlID0ge30pKTtcbjtcbmZ1bmN0aW9uIGxvZyhsb2dfdHlwZSwgLi4uZGF0YSkge1xuICAgIC8vIGlmIHRoaXMgaXMgdGhlIGVtcHR5IHN0cmluZ1xuICAgIHZhciBkb19sb2cgPSBmYWxzZTtcbiAgICB2YXIgbG9nX2hlYWRlciA9IFwiXCI7XG4gICAgc3dpdGNoIChsb2dfdHlwZSkge1xuICAgICAgICBjYXNlIExvZ19UeXBlLkdlbmVyYWw6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgZG9fbG9nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIExvZ19UeXBlLkRlYnVnX0Rpc3BsYXk6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiREVCVUdfRElTUExBWVwiO1xuICAgICAgICAgICAgICAgIGlmIChleHBvcnRzLkRFQlVHX0RJU1BMQVkpXG4gICAgICAgICAgICAgICAgICAgIGRvX2xvZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBMb2dfVHlwZS5EZWJ1Z19TbGlkZXJzOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvZ19oZWFkZXIgPSBcIkRFQlVHX1NMSURFUlNcIjtcbiAgICAgICAgICAgICAgICBpZiAoZXhwb3J0cy5ERUJVR19TTElERVJTKVxuICAgICAgICAgICAgICAgICAgICBkb19sb2cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChkb19sb2cpIHtcbiAgICAgICAgaWYgKGxvZ19oZWFkZXIgIT0gXCJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7bG9nX2hlYWRlcn06IGAsIC4uLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coLi4uZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG59XG47XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2V0dXBfc2xpZGVycyA9IHNldHVwX3NsaWRlcnM7XG5jb25zdCBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcbmNvbnN0IERFRkFVTFRfQ0FURUdPUlkgPSBcIk1pc2NcIjtcbmNsYXNzIFByb3BlcnR5X1N0cnVjdCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucHJvcGVydHlfbmFtZSA9IFwiXCI7XG4gICAgICAgIHRoaXMucHJvcGVydHlfZGF0YV90eXBlID0gUHJvcGVydHlfRGF0YV9UeXBlLk5vbmU7XG4gICAgICAgIC8vIEZsb2F0IHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5mbG9hdF9yYW5nZV9taW4gPSAwO1xuICAgICAgICB0aGlzLmZsb2F0X3JhbmdlX21heCA9IDA7XG4gICAgICAgIHRoaXMuZmxvYXRfZGVmYXVsdCA9IDA7XG4gICAgICAgIC8vIEludCBwcm9wZXJ0aWVzXG4gICAgICAgIHRoaXMuaW50X3JhbmdlX21pbiA9IDA7XG4gICAgICAgIHRoaXMuaW50X3JhbmdlX21heCA9IDA7XG4gICAgICAgIHRoaXMuaW50X2RlZmF1bHQgPSAwO1xuICAgICAgICAvLyBCb29sIHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5ib29sX2RlZmF1bHQgPSBmYWxzZTtcbiAgICAgICAgLy8gZm9yIG5pY2UgcHJvcGVydHkgdmlzdWFsaXphdGlvbi5cbiAgICAgICAgdGhpcy5jYXRlZ29yeSA9IERFRkFVTFRfQ0FURUdPUlk7XG4gICAgfVxufVxuO1xudmFyIFByb3BlcnR5X0RhdGFfVHlwZTtcbihmdW5jdGlvbiAoUHJvcGVydHlfRGF0YV9UeXBlKSB7XG4gICAgUHJvcGVydHlfRGF0YV9UeXBlW1Byb3BlcnR5X0RhdGFfVHlwZVtcIk5vbmVcIl0gPSAwXSA9IFwiTm9uZVwiO1xuICAgIFByb3BlcnR5X0RhdGFfVHlwZVtQcm9wZXJ0eV9EYXRhX1R5cGVbXCJQcm9wZXJ0eV9EYXRhX0Zsb2F0XCJdID0gMV0gPSBcIlByb3BlcnR5X0RhdGFfRmxvYXRcIjtcbiAgICBQcm9wZXJ0eV9EYXRhX1R5cGVbUHJvcGVydHlfRGF0YV9UeXBlW1wiUHJvcGVydHlfRGF0YV9JbnRcIl0gPSAyXSA9IFwiUHJvcGVydHlfRGF0YV9JbnRcIjtcbiAgICBQcm9wZXJ0eV9EYXRhX1R5cGVbUHJvcGVydHlfRGF0YV9UeXBlW1wiUHJvcGVydHlfRGF0YV9Cb29sXCJdID0gM10gPSBcIlByb3BlcnR5X0RhdGFfQm9vbFwiO1xufSkoUHJvcGVydHlfRGF0YV9UeXBlIHx8IChQcm9wZXJ0eV9EYXRhX1R5cGUgPSB7fSkpO1xuO1xuLy8gcHV0cyBzb21lIHNsaWRlcnMgdXAgdG8gY29udHJvbCBzb21lIHBhcmFtZXRlcnNcbmZ1bmN0aW9uIHNldHVwX3NsaWRlcnMocHJvcGVydGllcywgc2V0X3Byb3BlcnR5KSB7XG4gICAgY29uc3QgU0xJREVSX0NPTlRBSU5FUl9JRCA9IFwic2xpZGVDb250YWluZXJcIjtcbiAgICBjb25zdCBzbGlkZXJfY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoU0xJREVSX0NPTlRBSU5FUl9JRCk7XG4gICAgaWYgKHNsaWRlcl9jb250YWluZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBHZXQgc2xpZGVyIGNvbnRhaW5lclwiKTtcbiAgICAvLyBUT0RPIGZvciB0aGUgc2xpZGVzIHRoYXQgaGF2ZSBhIHNtYWxsIHJhbmdlIChsaWtlIGNvaGVzaW9uIGZhY3RvcikgbWFrZSB0aGUgdmFsdWUgdGhlIHNxdWFyZSBvZiB0aGUgbnVtYmVyLlxuICAgIHByb3BlcnRpZXMuc29ydCgpOyAvLyBob3BlIHNvbWVvbmUgZWxzZSB3YXNuJ3QgdXNpbmcgdGhpcy5cbiAgICBjb25zdCBwcm9wZXJ0eV9zdHJ1Y3RzID0gW107XG4gICAgZm9yIChjb25zdCBbbmFtZSwgdGFnXSBvZiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkRlYnVnX1NsaWRlcnMsIGB0eXBlc2NyaXB0OiAke25hbWV9OiAke3RhZ31gKTtcbiAgICAgICAgLy8gVE9ETyB0aGlzIGZ1bmN0aW9uIGlzIGdyb3dpbmcgdG8gYmlnLCBwdXQgaXQgaW4gYSBzZXBhcmF0ZSBmaWxlLlxuICAgICAgICBjb25zdCB0YWdfc3BsaXQgPSB0YWcuc3BsaXQoXCIgXCIpO1xuICAgICAgICBjb25zdCBbcHJvcF9wcm9wZXJ0eSwgcHJvcGVydHlfZGF0YV90eXBlXSA9IHRhZ19wcm9wX3RvX3BhcnRzKHRhZ19zcGxpdFswXSk7XG4gICAgICAgIGlmIChwcm9wX3Byb3BlcnR5ICE9IFwiUHJvcGVydHlcIilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmlyc3QgcHJvcGVydHkgaXMgbm90IHByb3BlcnR5LCB0YWcgd2FzICR7dGFnfWApO1xuICAgICAgICBjb25zdCBwcm9wZXJ0eV9zdHJ1Y3QgPSBuZXcgUHJvcGVydHlfU3RydWN0KCk7XG4gICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lID0gbmFtZTtcbiAgICAgICAgaWYgKHByb3BlcnR5X3N0cnVjdC5jYXRlZ29yeSAhPSBERUZBVUxUX0NBVEVHT1JZKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbiAke25hbWV9LCBwcm9wZXJ0eV9zdHJ1Y3QuY2F0ZWdvcnkgd2FzIHNldCB0byAke3Byb3BlcnR5X3N0cnVjdC5jYXRlZ29yeX0gYnV0IGl0IHNob3VsZCBiZSAke0RFRkFVTFRfQ0FURUdPUll9IGF0IHRoaXMgcG9pbnRgKTtcbiAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9kYXRhX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZSA9IFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Zsb2F0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJpbnRcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGUgPSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9JbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImJvb2xcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGUgPSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9Cb29sO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGluICR7bmFtZX0sIFVua25vd24gcHJvcGVydHkgZGF0YSB0eXBlICR7cHJvcGVydHlfZGF0YV90eXBlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRhZ19zcGxpdC5zaGlmdCgpO1xuICAgICAgICB3aGlsZSAodGFnX3NwbGl0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IFtsZWZ0LCByaWdodF0gPSB0YWdfcHJvcF90b19wYXJ0cyh0YWdfc3BsaXQuc2hpZnQoKSk7XG4gICAgICAgICAgICBzd2l0Y2ggKGxlZnQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmFuZ2VcIjpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfZGF0YV90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9GbG9hdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW21pbl9hc19zdHJpbmcsIG1heF9hc19zdHJpbmddID0gcmlnaHQuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21pbiA9IHBhcnNlRmxvYXQobWluX2FzX3N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWF4ID0gcGFyc2VGbG9hdChtYXhfYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0ludDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW21pbl9hc19zdHJpbmcsIG1heF9hc19zdHJpbmddID0gcmlnaHQuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9taW4gPSBwYXJzZUludChtaW5fYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5pbnRfcmFuZ2VfbWF4ID0gcGFyc2VJbnQobWF4X2FzX3N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9Cb29sOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJvb2xlYW4gZG9zZSBub3QgaGF2ZSBhIHJhbmdlIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gZGF0YSB0eXBlIGluICR7bmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRlZmF1bHRcIjpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfZGF0YV90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9GbG9hdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHQgPSBwYXJzZUZsb2F0KHJpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0ludDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9kZWZhdWx0ID0gcGFyc2VJbnQocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfQm9vbDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmJvb2xfZGVmYXVsdCA9IHBhcnNlX2Jvb2wocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGRhdGEgdHlwZSBpbiAke25hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDYXRlZ29yeVwiOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuY2F0ZWdvcnkgPSByaWdodDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaW4gJHtuYW1lfSwgZm91bmQgdW5rbm93biBwcm9wZXJ0eSAnJHtsZWZ0fSdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvcGVydHlfc3RydWN0cy5wdXNoKHByb3BlcnR5X3N0cnVjdCk7XG4gICAgfVxuICAgIC8vIEdyb3VwIHByb3BlcnR5X3N0cnVjdHMgYnkgY2F0ZWdvcnkgZm9yIGNvbGxhcHNpYmxlIHJlbmRlcmluZ1xuICAgIGNvbnN0IGNhdGVnb3J5X21hcCA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHBzIG9mIHByb3BlcnR5X3N0cnVjdHMpIHtcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBwcy5jYXRlZ29yeSB8fCBERUZBVUxUX0NBVEVHT1JZO1xuICAgICAgICBpZiAoIWNhdGVnb3J5X21hcC5oYXMoY2F0ZWdvcnkpKVxuICAgICAgICAgICAgY2F0ZWdvcnlfbWFwLnNldChjYXRlZ29yeSwgW10pO1xuICAgICAgICBjYXRlZ29yeV9tYXAuZ2V0KGNhdGVnb3J5KS5wdXNoKHBzKTtcbiAgICB9XG4gICAgLy8gU29ydCBjYXRlZ29yaWVzIGFscGhhYmV0aWNhbGx5LCBidXQgcGxhY2UgdGhlIERFRkFVTFRfQ0FURUdPUlkgbGFzdFxuICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBBcnJheS5mcm9tKGNhdGVnb3J5X21hcC5rZXlzKCkpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgaWYgKGEgPT09IERFRkFVTFRfQ0FURUdPUlkpXG4gICAgICAgICAgICByZXR1cm4gKzE7XG4gICAgICAgIGlmIChiID09PSBERUZBVUxUX0NBVEVHT1JZKVxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICByZXR1cm4gYS5sb2NhbGVDb21wYXJlKGIpO1xuICAgIH0pO1xuICAgIGZvciAoY29uc3QgY2F0ZWdvcnkgb2YgY2F0ZWdvcmllcykge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGNhdGVnb3J5X21hcC5nZXQoY2F0ZWdvcnkpO1xuICAgICAgICBjb25zdCBkZXRhaWxzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRldGFpbHNcIik7XG4gICAgICAgIGRldGFpbHMuY2xhc3NOYW1lID0gXCJjYXRlZ29yeUdyb3VwXCI7XG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3VtbWFyeVwiKTtcbiAgICAgICAgc3VtbWFyeS5jbGFzc05hbWUgPSBcImNhdGVnb3J5SGVhZGVyXCI7XG4gICAgICAgIHN1bW1hcnkudGV4dENvbnRlbnQgPSBjYXRlZ29yeS5yZXBsYWNlKC9fL2csIFwiIFwiKTtcbiAgICAgICAgZGV0YWlscy5hcHBlbmRDaGlsZChzdW1tYXJ5KTtcbiAgICAgICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGJvZHkuY2xhc3NOYW1lID0gXCJjYXRlZ29yeUJvZHlcIjtcbiAgICAgICAgZm9yIChjb25zdCBwcm9wZXJ0eV9zdHJ1Y3Qgb2YgaXRlbXMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAocHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfRmxvYXQ6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ha2VfZmxvYXRfc2xpZGVyKGJvZHksIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0ludDpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFrZV9pbnRfc2xpZGVyKGJvZHksIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Jvb2w6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ha2VfYm9vbF9zbGlkZXIoYm9keSwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbiAke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lfSwgZm91bmQgdW5rbm93biBwcm9wZXJ0eSB0eXBlICR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZGV0YWlscy5hcHBlbmRDaGlsZChib2R5KTtcbiAgICAgICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChkZXRhaWxzKTtcbiAgICB9XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgICAgICBNYWtlIGEgc2xpZGVyIGZvciBhIGZsb2F0XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gbWFrZV9mbG9hdF9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBzbGlkZXJfaWQgPSBgc2xpZGVyXyR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWV9YDtcbiAgICBjb25zdCBwYXJhZ3JhcGhfaWQgPSBgJHtzbGlkZXJfaWR9X3BhcmFncmFwaGA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfbmFtZS5yZXBsYWNlKC9fL2csIFwiIFwiKX1gO1xuICAgIGNvbnN0IGh0bWxfc3RyaW5nID0gYFxuICAgICAgICA8cCBjbGFzcz1cInNsaWRlcktleVwiIGlkPVwiJHtwYXJhZ3JhcGhfaWR9XCI+XG4gICAgICAgICAgICAke3BhcmFncmFwaF90ZXh0fTogJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWlufVwiIG1heD1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21heH1cIiB2YWx1ZT1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHR9XCIgc3RlcD1cIjAuMDA1XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7c2xpZGVyX2lkfVwiPlxuICAgIGA7XG4gICAgY29uc3QgbmV3X2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG5ld19lbGVtZW50LmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICBuZXdfZWxlbWVudC5pbm5lckhUTUwgPSBodG1sX3N0cmluZztcbiAgICBzbGlkZXJfY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld19lbGVtZW50KTtcbiAgICBjb25zdCBzbGlkZXIgPSBuZXdfZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgaW5wdXQgZm9yIHNsaWRlciBpZD0nJHtzbGlkZXJfaWR9JyBpbnNpZGUgaXRzIGNvbnRhaW5lcmApO1xuICAgIGlmIChzbGlkZXIuaWQgIT0gc2xpZGVyX2lkKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kIHNsaWRlciB3aXRoIGlkPScke3NsaWRlci5pZH0nIGJ1dCBleHBlY3RlZCBpZD0nJHtzbGlkZXJfaWR9J2ApO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTbGlkZXIgaW5wdXQgZm9yICcke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lfScgZGlzYXBwZWFyZWQgdW5leHBlY3RlZGx5YCk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl9udW1iZXIgPSBOdW1iZXIodGhlX3NsaWRlci52YWx1ZSk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl90ZXh0ID0gbmV3X2VsZW1lbnQucXVlcnlTZWxlY3RvcihgIyR7cGFyYWdyYXBoX2lkfWApO1xuICAgICAgICBpZiAoc2xpZGVyX3RleHQgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGxhYmVsIHBhcmFncmFwaCAnJHtwYXJhZ3JhcGhfaWR9JyBmb3Igc2xpZGVyICcke3NsaWRlcl9pZH0nYCk7XG4gICAgICAgIHNsaWRlcl90ZXh0LnRleHRDb250ZW50ID0gYCR7cGFyYWdyYXBoX3RleHR9OiAke3NsaWRlcl9udW1iZXJ9YDtcbiAgICAgICAgc2V0X3Byb3BlcnR5KHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lLCBzbGlkZXJfbnVtYmVyKTtcbiAgICB9KTtcbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgICAgICBNYWtlIGEgc2xpZGVyIGZvciBhbiBpbnRcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2ludF9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBzbGlkZXJfaWQgPSBgc2xpZGVyXyR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWV9YDtcbiAgICBjb25zdCBwYXJhX2lkID0gYCR7c2xpZGVyX2lkfV9wYXJhZ3JhcGhgO1xuICAgIGNvbnN0IHBhcmFncmFwaF90ZXh0ID0gYCR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWUucmVwbGFjZSgvXy9nLCBcIiBcIil9YDtcbiAgICBjb25zdCBodG1sX3N0cmluZyA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJzbGlkZXJLZXlcIiBpZD1cIiR7cGFyYV9pZH1cIj5cbiAgICAgICAgICAgICR7cGFyYWdyYXBoX3RleHR9OiAke3Byb3BlcnR5X3N0cnVjdC5pbnRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21pbn1cIiBtYXg9XCIke3Byb3BlcnR5X3N0cnVjdC5pbnRfcmFuZ2VfbWF4fVwiIHZhbHVlPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHR9XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7c2xpZGVyX2lkfVwiPlxuICAgICAgICBgO1xuICAgIGNvbnN0IG5ld190aGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmV3X3RoaW5nLmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICBuZXdfdGhpbmcuaW5uZXJIVE1MID0gaHRtbF9zdHJpbmc7XG4gICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdfdGhpbmcpO1xuICAgIGNvbnN0IHNsaWRlciA9IG5ld190aGluZy5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgaW5wdXQgZm9yIHNsaWRlciBpZD0nJHtzbGlkZXJfaWR9JyBpbnNpZGUgaXRzIGNvbnRhaW5lcmApO1xuICAgIGlmIChzbGlkZXIuaWQgIT0gc2xpZGVyX2lkKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kIHNsaWRlciB3aXRoIGlkPScke3NsaWRlci5pZH0nIGJ1dCBleHBlY3RlZCBpZD0nJHtzbGlkZXJfaWR9J2ApO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTbGlkZXIgaW5wdXQgZm9yICcke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lfScgZGlzYXBwZWFyZWQgdW5leHBlY3RlZGx5YCk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl9udW1iZXIgPSBOdW1iZXIodGhlX3NsaWRlci52YWx1ZSk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl90ZXh0ID0gbmV3X3RoaW5nLnF1ZXJ5U2VsZWN0b3IoYCMke3BhcmFfaWR9YCk7XG4gICAgICAgIGlmIChzbGlkZXJfdGV4dCA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgbGFiZWwgcGFyYWdyYXBoICcke3BhcmFfaWR9JyBmb3Igc2xpZGVyICcke3NsaWRlcl9pZH0nYCk7XG4gICAgICAgIHNsaWRlcl90ZXh0LnRleHRDb250ZW50ID0gYCR7cGFyYWdyYXBoX3RleHR9OiAke3NsaWRlcl9udW1iZXJ9YDtcbiAgICAgICAgc2V0X3Byb3BlcnR5KHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lLCBzbGlkZXJfbnVtYmVyKTtcbiAgICB9KTtcbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgTWFrZSBhIHNsaWRlciBmb3IgYW4gYm9vbGVhbiB0b2dnbGVcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2Jvb2xfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KSB7XG4gICAgY29uc3Qgc2xpZGVyX2lkID0gYHNsaWRlcl8ke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lfWA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfbmFtZS5yZXBsYWNlKC9fL2csIFwiIFwiKX1gO1xuICAgIGNvbnN0IGh0bWxfc3RyaW5nID0gYFxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgJHtwcm9wZXJ0eV9zdHJ1Y3QuYm9vbF9kZWZhdWx0ID8gXCJjaGVja2VkXCIgOiBcIlwifSBjbGFzcz1cImNoZWNrYm94X3RvZ2dsZVwiIGlkPVwiJHtzbGlkZXJfaWR9XCI+XG4gICAgICAgIDxsYWJlbCBmb3I9XCIke3NsaWRlcl9pZH1cIiBjbGFzcz1cImNoZWNrYm94X3RvZ2dsZV9sYWJlbFwiPiR7cGFyYWdyYXBoX3RleHR9PC9sYWJlbD5cbiAgICAgICAgYDtcbiAgICBjb25zdCBuZXdfdGhpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG5ld190aGluZy5jbGFzc05hbWUgPSBcInJhbmdlSG9sZGVyXCI7XG4gICAgbmV3X3RoaW5nLmlubmVySFRNTCA9IGh0bWxfc3RyaW5nO1xuICAgIHNsaWRlcl9jb250YWluZXIuYXBwZW5kQ2hpbGQobmV3X3RoaW5nKTtcbiAgICBjb25zdCBzbGlkZXIgPSBuZXdfdGhpbmcucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbiAgICBpZiAoc2xpZGVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGNoZWNrYm94IGlucHV0IGZvciBpZD0nJHtzbGlkZXJfaWR9JyBpbnNpZGUgaXRzIGNvbnRhaW5lcmApO1xuICAgIGlmIChzbGlkZXIuaWQgIT0gc2xpZGVyX2lkKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kIHNsaWRlciB3aXRoIGlkPScke3NsaWRlci5pZH0nIGJ1dCBleHBlY3RlZCBpZD0nJHtzbGlkZXJfaWR9J2ApO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGVja2JveCBpbnB1dCBmb3IgJyR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWV9JyBkaXNhcHBlYXJlZCB1bmV4cGVjdGVkbHlgKTtcbiAgICAgICAgc2V0X3Byb3BlcnR5KHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lLCB0aGVfc2xpZGVyLmNoZWNrZWQpO1xuICAgIH0pO1xufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgICAgIEhlbHBlciBmdW5jdGlvbnNcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gdGFnX3Byb3BfdG9fcGFydHMocHJvcCkge1xuICAgIGNvbnN0IFtsZWZ0LCByaWdodF93aXRoX2p1bmtdID0gcHJvcC5zcGxpdChcIjpcIik7XG4gICAgY29uc3QgcmlnaHQgPSByaWdodF93aXRoX2p1bmsuc2xpY2UoMSwgcmlnaHRfd2l0aF9qdW5rLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBbbGVmdCwgcmlnaHRdO1xufVxuO1xuZnVuY3Rpb24gcGFyc2VfYm9vbChzKSB7XG4gICAgLy8gMSwgdCwgVCwgVFJVRSwgdHJ1ZSwgVHJ1ZSxcbiAgICAvLyAwLCBmLCBGLCBGQUxTRSwgZmFsc2UsIEZhbHNlXG4gICAgc3dpdGNoIChzKSB7XG4gICAgICAgIGNhc2UgXCIxXCI6XG4gICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgIGNhc2UgXCJUUlVFXCI6XG4gICAgICAgIGNhc2UgXCJ0cnVlXCI6XG4gICAgICAgIGNhc2UgXCJUcnVlXCI6IHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCIwXCI6XG4gICAgICAgIGNhc2UgXCJmXCI6XG4gICAgICAgIGNhc2UgXCJGXCI6XG4gICAgICAgIGNhc2UgXCJGQUxTRVwiOlxuICAgICAgICBjYXNlIFwiZmFsc2VcIjpcbiAgICAgICAgY2FzZSBcIkZhbHNlXCI6IHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc3RyaW5nIGluIHBhcnNlQm9vbCwgd2FzICR7c31gKTtcbiAgICB9XG59XG47XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyB0eXBlc2NyaXB0IGdsdWUgY29kZS5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGxvZ2dlcl8xID0gcmVxdWlyZShcIi4vbG9nZ2VyXCIpO1xuY29uc3Qgc2V0dXBfc2xpZGVyc18xID0gcmVxdWlyZShcIi4vc2V0dXBfc2xpZGVyc1wiKTtcbi8vIGNvb2wgdHJpY2tcbmNvbnN0IElOX0RFVl9NT0RFID0gKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PSBcImxvY2FsaG9zdFwiKTtcbjtcbjtcbi8vIE5PVEUgd2Uga2VlcCB0aGUgQHRzLWlnbm9yZSdzIGluIGhlcmVcbmFzeW5jIGZ1bmN0aW9uIGdldF9nb19mdW5jdGlvbnMoKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IGdvID0gbmV3IEdvKCk7IC8vIE5PVEUgdGhpcyBjb21lcyBmcm9tIHRoZSB3YXNtX2V4ZWMuanMgdGhpbmdcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhmZXRjaChcImRpc3QvYm9pZC53YXNtXCIpLCBnby5pbXBvcnRPYmplY3QpO1xuICAgIGdvLnJ1bihyZXN1bHQuaW5zdGFuY2UpO1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgc2V0X3Byb3BlcnRpZXM6IFNldFByb3BlcnRpZXMsXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgZ2V0X3Byb3BlcnRpZXM6IEdldFByb3BlcnRpZXMsXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgZ2V0X25leHRfZnJhbWU6IEdldE5leHRGcmFtZSxcbiAgICB9O1xufVxuO1xuO1xuO1xuO1xuO1xuY29uc3QgbW91c2UgPSB7XG4gICAgcG9zOiB7IHg6IDAsIHk6IDAgfSxcbiAgICBsZWZ0X2Rvd246IGZhbHNlLFxuICAgIG1pZGRsZV9kb3duOiBmYWxzZSxcbiAgICByaWdodF9kb3duOiBmYWxzZSxcbn07XG5mdW5jdGlvbiBkb21fcmVjdF90b19yZWN0KGRvbV9yZWN0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogZG9tX3JlY3QueCxcbiAgICAgICAgeTogZG9tX3JlY3QueSxcbiAgICAgICAgdzogZG9tX3JlY3Qud2lkdGgsXG4gICAgICAgIC8vIHRvIGFjY291bnQgZm9yIGxldHRlcnMgbGlrZSAnaidcbiAgICAgICAgaDogZG9tX3JlY3QuaGVpZ2h0ICsgNSxcbiAgICB9O1xufVxuO1xuZnVuY3Rpb24gZ2V0X2FsbF9jb2xsaWRhYmxlX3JlY3RzKCkge1xuICAgIGNvbnN0IENMQVNTID0gXCJjb2xsaWRlXCI7XG4gICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKENMQVNTKTtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcbiAgICAgICAgY29uc3QgZG9tX3JlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICByZXN1bHQucHVzaChkb21fcmVjdF90b19yZWN0KGRvbV9yZWN0KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG47XG5mdW5jdGlvbiByZW5kZXJfYm9pZHMoZGlzcGxheSwgZ28pIHtcbiAgICAvLyB3ZSBnZXQgdGhlIGJvdW5kaW5nIHJlY3RhbmdsZXMgb2YgZWxlbWVudHMgaW4gdGhlIGRvY3VtZW50LFxuICAgIC8vXG4gICAgLy8gd2UgQ09VTEQgaGF2ZSBqdXN0IHJlbmRlcmVkIHRoZSB0ZXh0IG91cnNlbHZlcywgKHdpdGggLmZpbGxUZXh0KCkpXG4gICAgLy8gYnV0IGkgd2FudCB0aGUgdXNlciB0byBiZSBhYmxlIHRvIHNlbGVjdCB0aGUgZW1haWwgdGV4dC5cbiAgICAvL1xuICAgIC8vIG1heWJlIHdoZW4gdGhhdCBlbWFpbCB0ZXh0IGlzIG1vdmVzIHNvbWV3aGVyZSBlbHNlIHdlIGNvdWxkIGhhdmUgYWxsXG4gICAgLy8gdGhlIGJvaWQgdGV4dCByZW5kZXJlZCBieSB0aGUgYm9pZCBzaW0gaXRzZWxmLlxuICAgIC8vXG4gICAgLy8gYWx0aG91Z2ggdGhhdCBtaWdodCBpbnRyb2R1Y2UgaXNzdWVzIHdoZW4gdGhlIGJvaWQgd2FzbSBoYXNuJ3QgbG9hZGVkLlxuICAgIGNvbnN0IGNvbGxpZGFibGVfcmVjdGFuZ2xlcyA9IGdldF9hbGxfY29sbGlkYWJsZV9yZWN0cygpO1xuICAgIGNvbnN0IEJPSURfQ0FOVkFTX1NRVUlTSF9GQUNUT1IgPSAxO1xuICAgIC8vIHRoaXMgaXMgdGhlIGNhbnZhcyB0aGF0IHRoZSB3YXNtIGlzIGdvaW5nIHRvIGRyYXcgaW50by5cbiAgICAvL1xuICAgIC8vIGJhc2VkIG9uIHRoZSByZW5kZXIgY2FudmFzIGZvciBub3cuXG4gICAgLy9cbiAgICAvLyB1c2luZyBzcXVpc2ggZmFjdG9yLCB3ZSBjYW4gY2hhbmdlIHRoZSByZW5kZXJpbmcgc2l6ZSBvZiB0aGUgYm9pZCBpbWFnZSB3ZSBqdXN0IGdvdC5cbiAgICAvLyBUT0RPIHdoZW4gc3F1aXNoZWQsIG1vdXNlIGlucHV0IGRvc2Ugbm90IHdvcmsgcmlnaHQuXG4gICAgY29uc3QgYm9pZF9jYW52YXNfd2lkdGggPSAvKiAxNioyNTsgKi8gTWF0aC5mbG9vcihkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLndpZHRoIC8gQk9JRF9DQU5WQVNfU1FVSVNIX0ZBQ1RPUik7XG4gICAgY29uc3QgYm9pZF9jYW52YXNfaGVpZ2h0ID0gLyogIDkqMjU7ICovIE1hdGguZmxvb3IoZGlzcGxheS5yZW5kZXJfY3R4LmNhbnZhcy5oZWlnaHQgLyBCT0lEX0NBTlZBU19TUVVJU0hfRkFDVE9SKTtcbiAgICAvLyBbciwgZywgYiwgYV0sIG5vdCBuZWNlc3NhcmlseSBpbiB0aGF0IG9yZGVyXG4gICAgY29uc3QgTlVNX0NPTE9SX0NPTVBPTkVOVFMgPSA0O1xuICAgIGNvbnN0IGJ1ZmZlcl9zaXplID0gYm9pZF9jYW52YXNfd2lkdGggKiBib2lkX2NhbnZhc19oZWlnaHQgKiBOVU1fQ09MT1JfQ09NUE9ORU5UUztcbiAgICAvLyByZXNpemUgYmFjayBidWZmZXIgaWYgY2FudmFzIHNpemUgY2hhbmdlZC5cbiAgICBpZiAoZGlzcGxheS5iYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCAhPT0gYm9pZF9jYW52YXNfd2lkdGggfHwgZGlzcGxheS5iYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQgIT09IGJvaWRfY2FudmFzX2hlaWdodCkge1xuICAgICAgICAoMCwgbG9nZ2VyXzEubG9nKShsb2dnZXJfMS5Mb2dfVHlwZS5HZW5lcmFsLCBcIk9oIGdvZC4gd2VyZSByZXNpemluZyB0aGUgYnVmZmVyXCIpO1xuICAgICAgICBpZiAoZGlzcGxheS5iYWNrX2J1ZmZlcl9hcnJheS5sZW5ndGggPCBidWZmZXJfc2l6ZSkge1xuICAgICAgICAgICAgKDAsIGxvZ2dlcl8xLmxvZykobG9nZ2VyXzEuTG9nX1R5cGUuR2VuZXJhbCwgXCJCYWNrIGJ1ZmZlciBhcnJheSBnZXR0aW5nIGJpZ2dlclwiKTsgLy8gbXkgcGVuaXNcbiAgICAgICAgICAgIC8vIG1ha2UgdGhlIGJ1ZmZlciBiaWdnZXJcbiAgICAgICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfYXJyYXkgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkoYnVmZmVyX3NpemUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJhY2tfY2FudmFzID0gbmV3IE9mZnNjcmVlbkNhbnZhcyhib2lkX2NhbnZhc193aWR0aCwgYm9pZF9jYW52YXNfaGVpZ2h0KTtcbiAgICAgICAgY29uc3QgYmFja19jdHggPSBiYWNrX2NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIGlmIChiYWNrX2N0eCA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIjJEIGNvbnRleHQgaXMgbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9yZW5kZXJfY3R4ID0gYmFja19jdHg7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfcmVuZGVyX2N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCA9IGJvaWRfY2FudmFzX3dpZHRoO1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCA9IGJvaWRfY2FudmFzX2hlaWdodDtcbiAgICB9XG4gICAgY29uc3QgYnVmZmVyID0gZGlzcGxheS5iYWNrX2J1ZmZlcl9hcnJheS5zdWJhcnJheSgwLCBidWZmZXJfc2l6ZSk7XG4gICAgY29uc3QgYXJncyA9IHtcbiAgICAgICAgd2lkdGg6IGJvaWRfY2FudmFzX3dpZHRoLFxuICAgICAgICBoZWlnaHQ6IGJvaWRfY2FudmFzX2hlaWdodCxcbiAgICAgICAgYnVmZmVyOiBidWZmZXIsXG4gICAgICAgIG1vdXNlOiBtb3VzZSxcbiAgICAgICAgcmVjdGFuZ2xlczogY29sbGlkYWJsZV9yZWN0YW5nbGVzLFxuICAgIH07XG4gICAgY29uc3QgbnVtX2J5dGVzX2ZpbGxlZCA9IGdvLmdldF9uZXh0X2ZyYW1lKGFyZ3MpO1xuICAgIGlmIChudW1fYnl0ZXNfZmlsbGVkICE9PSBidWZmZXJfc2l6ZSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBnby5nZXRfbmV4dF9mcmFtZSBnb3QgaW5jb3JyZWN0IG51bWJlciBvZiBieXRlcywgd2FudGVkOiAke2J1ZmZlcl9zaXplfSwgZ290OiAke251bV9ieXRlc19maWxsZWR9YCk7XG4gICAgLy8gQHRzLWlnbm9yZSAvLyB3aHkgZG9zZSB0aGlzIGxpbmUgbWFrZSBhbiBlcnJvciBpbiBteSBlZGl0b3JcbiAgICBjb25zdCBpbWFnZV9kYXRhID0gbmV3IEltYWdlRGF0YShidWZmZXIsIGJvaWRfY2FudmFzX3dpZHRoLCBib2lkX2NhbnZhc19oZWlnaHQpO1xuICAgIC8vIGlzIHRoaXMgY29vbD9cbiAgICAvL1xuICAgIC8vIHRoZSB3aG9sZSBwb2ludCBvZiB0aGlzIGJhY2tfYnVmZmVyIGlzIHRvIHByZXZlbnQgZmxpY2tlcmluZyBhbmRcbiAgICAvLyBzdHVmZiwgYnVmIGlmIHdlcmUgb25seSBnb2luZyB0byBiZSBkcmF3aW5nIG9uZSB0aGluZy4uLlxuICAgIC8vIHdoYXRzIHRoZSBwb2ludD9cbiAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHgucHV0SW1hZ2VEYXRhKGltYWdlX2RhdGEsIDAsIDApO1xuICAgIC8vIE5PVEUgdGhpcyB3aWxsIHN0cmV0Y2ggdGhlIHRoaW5nLlxuICAgIC8vIGNhbnZhcy53aWR0aCBtaWdodCBjaGFuZ2UgZHVyaW5nIHRoZSB0aW1lIHRoaXMgaXMgcnVubmluZ1xuICAgIGRpc3BsYXkucmVuZGVyX2N0eC5kcmF3SW1hZ2UoZGlzcGxheS5iYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LmNhbnZhcywgMCwgMCwgZGlzcGxheS5yZW5kZXJfY3R4LmNhbnZhcy53aWR0aCwgZGlzcGxheS5yZW5kZXJfY3R4LmNhbnZhcy5oZWlnaHQpO1xuICAgIC8vIGxldHMgaG9wZSBqYXZhc2NyaXB0IGlzIHNtYXJ0IGVub3VnaCB0byBkZWFsbG9jYXRlIHRoaXMuLi5cbiAgICAvLyBpbWFnZURhdGEgPSBudWxsXG59XG47XG4vLyBUT0RPIG1ha2UgdGhpcyBzbWFydGVyLlxuY29uc3QgcmVuZGVyX3RpbWVzID0gW107XG5jb25zdCBkZWx0YV90aW1lcyA9IFtdO1xuLy8gQ3JlZGl0OiBodHRwczovL2dpdGh1Yi5jb20vdHNvZGluZy9rb2lsXG4vLyBcbi8vIFRPRE8gcmVtb3ZlIG5ld19yZW5kZXJfdGltZSwgYW5kIG5ld19kZWx0YV90aW1lLCBqdXN0IG1ha2UgYSBjbGFzcyBvciBzb21ldGhpbmcuXG5mdW5jdGlvbiByZW5kZXJfZGVidWdfaW5mbyhkaXNwbGF5LCBuZXdfcmVuZGVyX3RpbWUsIG5ld19kZWx0YV90aW1lKSB7XG4gICAgY29uc3QgRk9OVF9TSVpFID0gMjg7XG4gICAgZGlzcGxheS5yZW5kZXJfY3R4LmZvbnQgPSBgJHtGT05UX1NJWkV9cHggYm9sZGA7XG4gICAgcmVuZGVyX3RpbWVzLnB1c2gobmV3X3JlbmRlcl90aW1lKTtcbiAgICBpZiAocmVuZGVyX3RpbWVzLmxlbmd0aCA+IDYwKSB7XG4gICAgICAgIHJlbmRlcl90aW1lcy5zaGlmdCgpO1xuICAgIH1cbiAgICBkZWx0YV90aW1lcy5wdXNoKG5ld19kZWx0YV90aW1lKTtcbiAgICBpZiAoZGVsdGFfdGltZXMubGVuZ3RoID4gNjApIHtcbiAgICAgICAgZGVsdGFfdGltZXMuc2hpZnQoKTtcbiAgICB9XG4gICAgY29uc3QgcmVuZGVyX2F2ZyA9IHJlbmRlcl90aW1lcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIHJlbmRlcl90aW1lcy5sZW5ndGg7XG4gICAgY29uc3QgZGVsdGFfYXZnID0gZGVsdGFfdGltZXMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyBkZWx0YV90aW1lcy5sZW5ndGg7XG4gICAgY29uc3QgbGFiZWxzID0gW107XG4gICAgeyAvLyBjb25zdHJ1Y3QgdGhlIGxhYmVscy5cbiAgICAgICAgLy8gdGhpcyBpcyB0aGUgb25seSB1bmlxdWUgdGhpbmdzIGJldHdlZW4gcmVuZGVyX3RpbWVzIGFuZCBkZWx0YV90aW1lc1xuICAgICAgICBjb25zdCBmcmFtZXNfcGVyX3NlY29uZCA9ICgxIC8gZGVsdGFfYXZnICogMTAwMCkudG9GaXhlZCgyKTtcbiAgICAgICAgY29uc3Qgc2Vjb25kc19wZXJfZnJhbWUgPSAoZGVsdGFfYXZnIC8gMTAwMCkudG9GaXhlZCg1KTtcbiAgICAgICAgbGFiZWxzLnB1c2goYEYvUzogJHtmcmFtZXNfcGVyX3NlY29uZH0gICAgUy9GOiAke3NlY29uZHNfcGVyX2ZyYW1lfWApO1xuICAgICAgICBsYWJlbHMucHVzaChgV0FTTSBSZW5kZXIgVGltZSBBdmcgKG1zKTogJHtyZW5kZXJfYXZnLnRvRml4ZWQoMil9YCk7XG4gICAgICAgIGxhYmVscy5wdXNoKGBSZW5kZXIvU2VjIChNQVgpOiAkeygxIC8gcmVuZGVyX2F2ZyAqIDEwMDApLnRvRml4ZWQoMil9YCk7XG4gICAgfVxuICAgIGNvbnN0IFBBRERJTkcgPSA3MDtcbiAgICBjb25zdCBTSEFET1dfT0ZGU0VUID0gRk9OVF9TSVpFICogMC4wNjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkaXNwbGF5LnJlbmRlcl9jdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBkaXNwbGF5LnJlbmRlcl9jdHguZmlsbFRleHQobGFiZWxzW2ldLCBQQURESU5HLCBQQURESU5HICsgRk9OVF9TSVpFICogaSk7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsVGV4dChsYWJlbHNbaV0sIFBBRERJTkcgKyBTSEFET1dfT0ZGU0VULCBQQURESU5HIC0gU0hBRE9XX09GRlNFVCArIEZPTlRfU0laRSAqIGkpO1xuICAgIH1cbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgICAgICAgIFRoZSBNYWluIEZ1bmN0aW9uXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuKGFzeW5jICgpID0+IHtcbiAgICBpZiAoSU5fREVWX01PREUpXG4gICAgICAgIGNvbnNvbGUubG9nKFwiSW4gRGV2IE1vZGVcIik7XG4gICAgY29uc3QgZ28gPSBhd2FpdCBnZXRfZ29fZnVuY3Rpb25zKCk7XG4gICAgeyAvLyBIYW5kbGUgc2xpZGVyIHN0dWZmXG4gICAgICAgIGNvbnN0IGJvaWRfcHJvcGVydGllcyA9IE9iamVjdC5lbnRyaWVzKGdvLmdldF9wcm9wZXJ0aWVzKCkpO1xuICAgICAgICBpZiAoYm9pZF9wcm9wZXJ0aWVzLmxlbmd0aCA9PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gcHJvcGVydGllcyB3aGVyZSBnaXZlbiB0byBqYXZhc2NyaXB0IVwiKTtcbiAgICAgICAgZnVuY3Rpb24gc2V0X3Byb3BlcnR5KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjcxMDkwNS9ob3ctZG8taS1keW5hbWljYWxseS1hc3NpZ24tcHJvcGVydGllcy10by1hbi1vYmplY3QtaW4tdHlwZXNjcmlwdFxuICAgICAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgICAgICBvYmpbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIGdvLnNldF9wcm9wZXJ0aWVzKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgO1xuICAgICAgICAvLyBUT0RPIG1heWJlIG1ha2UgdGhpcyBkZXYgbW9kZSBvbmx5Li4uXG4gICAgICAgIC8vIGl0IGFsc28gaGFzIHRvIHJlbW92ZSB0aGUgU2V0dGluZ3MgdGhpbmcuLi5cbiAgICAgICAgKDAsIHNldHVwX3NsaWRlcnNfMS5zZXR1cF9zbGlkZXJzKShib2lkX3Byb3BlcnRpZXMsIHNldF9wcm9wZXJ0eSk7XG4gICAgfVxuICAgIHsgLy8gc2V0dXAgaW5wdXQgaGFuZGxpbmcuXG4gICAgICAgIC8vIHdoeSBkb2Vzbid0IHR5cGVzY3JpcHQgaGF2ZSBhbiBlbnVtIGZvciB0aGlzP1xuICAgICAgICBsZXQgTW91c2VfQnV0dG9ucztcbiAgICAgICAgKGZ1bmN0aW9uIChNb3VzZV9CdXR0b25zKSB7XG4gICAgICAgICAgICBNb3VzZV9CdXR0b25zW01vdXNlX0J1dHRvbnNbXCJMZWZ0XCJdID0gMF0gPSBcIkxlZnRcIjtcbiAgICAgICAgICAgIE1vdXNlX0J1dHRvbnNbTW91c2VfQnV0dG9uc1tcIk1pZGRsZVwiXSA9IDFdID0gXCJNaWRkbGVcIjtcbiAgICAgICAgICAgIE1vdXNlX0J1dHRvbnNbTW91c2VfQnV0dG9uc1tcIlJpZ2h0XCJdID0gMl0gPSBcIlJpZ2h0XCI7XG4gICAgICAgIH0pKE1vdXNlX0J1dHRvbnMgfHwgKE1vdXNlX0J1dHRvbnMgPSB7fSkpO1xuICAgICAgICA7XG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5nZXRSb290Tm9kZSgpO1xuICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChldikgPT4ge1xuICAgICAgICAgICAgbW91c2UucG9zID0geyB4OiBldi54LCB5OiBldi55IH07XG4gICAgICAgIH0pO1xuICAgICAgICAvLyB0aGlzIHdpbGwgYnJlYWsgaWYgdGhlIHVzZXIgc2xpZGVzIHRoZXJlIG1vdXNlIG91dHNpZGUgb2YgdGhlIHNjcmVlbiB3aGlsZSBjbGlja2luZywgYnV0IHRoaXMgaXMgdGhlIHdlYiwgcGVvcGxlIGV4cGVjdCBpdCB0byBzdWNrLlxuICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldikgPT4ge1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLkxlZnQpXG4gICAgICAgICAgICAgICAgbW91c2UubGVmdF9kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5NaWRkbGUpXG4gICAgICAgICAgICAgICAgbW91c2UubWlkZGxlX2Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLlJpZ2h0KVxuICAgICAgICAgICAgICAgIG1vdXNlLnJpZ2h0X2Rvd24gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuTGVmdClcbiAgICAgICAgICAgICAgICBtb3VzZS5sZWZ0X2Rvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5NaWRkbGUpXG4gICAgICAgICAgICAgICAgbW91c2UubWlkZGxlX2Rvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5SaWdodClcbiAgICAgICAgICAgICAgICBtb3VzZS5yaWdodF9kb3duID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjb25zdCBjYW52YXNfY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNfZGl2XCIpIGFzIEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbFxuICAgIGNvbnN0IGJvaWRfY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2lkX2NhbnZhc1wiKTtcbiAgICBpZiAoYm9pZF9jYW52YXMgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGNhbnZhcyB3aXRoIGlkIGBib2lkX2NhbnZhc2AgaXMgZm91bmRcIik7XG4gICAgLy8gVE9ETyBuYW1pbmcgYmV0dGVyLCB1c2Ugc25ha2UgY2FzZSBldmVyeXdoZXJlISFcbiAgICBjb25zdCBib2lkX2NhbnZhc19yZW5kZXJfY3R4ID0gYm9pZF9jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIGlmIChib2lkX2NhbnZhc19yZW5kZXJfY3R4ID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIyRCBjb250ZXh0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICBjb25zdCBbYmFja19idWZmZXJfaW1hZ2Vfd2lkdGgsIGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodF0gPSBbYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5jYW52YXMud2lkdGgsIGJvaWRfY2FudmFzX3JlbmRlcl9jdHguY2FudmFzLmhlaWdodF07XG4gICAgY29uc3QgYmFja19idWZmZXJfY2FudmFzID0gbmV3IE9mZnNjcmVlbkNhbnZhcyhiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCwgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0KTtcbiAgICBjb25zdCBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4ID0gYmFja19idWZmZXJfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoYmFja19idWZmZXJfcmVuZGVyX2N0eCA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgIGJhY2tfYnVmZmVyX3JlbmRlcl9jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgY29uc3QgYmFja19idWZmZXJfYXJyYXkgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkoYmFja19idWZmZXJfaW1hZ2Vfd2lkdGggKiBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQgKiA0KTtcbiAgICBjb25zdCBkaXNwbGF5ID0ge1xuICAgICAgICByZW5kZXJfY3R4OiBib2lkX2NhbnZhc19yZW5kZXJfY3R4LFxuICAgICAgICBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4OiBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LFxuICAgICAgICBiYWNrX2J1ZmZlcl9hcnJheTogYmFja19idWZmZXJfYXJyYXksXG4gICAgICAgIGJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoOiBiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCxcbiAgICAgICAgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0OiBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQsXG4gICAgfTtcbiAgICBsZXQgcHJldl90aW1lc3RhbXAgPSAwO1xuICAgIGNvbnN0IGZyYW1lID0gKHRpbWVzdGFtcCkgPT4ge1xuICAgICAgICBib2lkX2NhbnZhc19yZW5kZXJfY3R4LmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBib2lkX2NhbnZhc19yZW5kZXJfY3R4LmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGNvbnN0IGRlbHRhX3RpbWUgPSAodGltZXN0YW1wIC0gcHJldl90aW1lc3RhbXApO1xuICAgICAgICBwcmV2X3RpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICAgICAgLy8gVE9ETyBEb24ndCBuZWVkIGRlbHRhIHRpbWUsIGJvaWQgdGhpbmcgZG9zZSBpdCBmb3IgdXM/IGNoYW5nZT9cbiAgICAgICAgY29uc3Qgc3RhcnRfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICByZW5kZXJfYm9pZHMoZGlzcGxheSwgZ28pO1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAvLyBJbiBtc1xuICAgICAgICBjb25zdCByZW5kZXJfdGltZSA9IGVuZF90aW1lIC0gc3RhcnRfdGltZTtcbiAgICAgICAgaWYgKGxvZ2dlcl8xLkRFQlVHX0RJU1BMQVkgJiYgSU5fREVWX01PREUpXG4gICAgICAgICAgICByZW5kZXJfZGVidWdfaW5mbyhkaXNwbGF5LCByZW5kZXJfdGltZSwgZGVsdGFfdGltZSk7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgIH07XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgodGltZXN0YW1wKSA9PiB7XG4gICAgICAgIHByZXZfdGltZXN0YW1wID0gdGltZXN0YW1wO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgICB9KTtcbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=