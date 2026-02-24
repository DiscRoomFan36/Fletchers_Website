/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./web_src/logger.ts"
/*!***************************!*\
  !*** ./web_src/logger.ts ***!
  \***************************/
(__unused_webpack_module, exports) {


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


/***/ },

/***/ "./web_src/setup_sliders.ts"
/*!**********************************!*\
  !*** ./web_src/setup_sliders.ts ***!
  \**********************************/
(__unused_webpack_module, exports, __webpack_require__) {


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


/***/ }

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
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
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
        const boidContainer = document.getElementById("boid_container");
        if (boidContainer === null)
            throw new Error("No element with id `boid_container` is found");
        boid_canvas_render_ctx.canvas.width = boidContainer.clientWidth;
        boid_canvas_render_ctx.canvas.height = boidContainer.clientHeight;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYm9pZHMvLi93ZWJfc3JjL2xvZ2dlci50cyIsIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvc2V0dXBfc2xpZGVycy50cyIsIndlYnBhY2s6Ly9ib2lkcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkxvZ19UeXBlID0gZXhwb3J0cy5ERUJVR19TTElERVJTID0gZXhwb3J0cy5ERUJVR19ESVNQTEFZID0gdm9pZCAwO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG4vLyBpcyBpdCBjb3JyZWN0IHRvIGhhdmUgdGhlc2UgaGVyZT8gdGhpcyBvbmUgZWZmZWN0c1xuLy8gZHJhd2luZyBvbiB0aGUgc2NyZWVuLCBub3QganVzdCBsb2dnaW5nPyBhbHRob3VnaCB3ZVxuLy8gY291bGQgbWFrZSBhbGwgbG9ncyBhcHBlYXIgb24gc2NyZWVuLi4uXG5leHBvcnRzLkRFQlVHX0RJU1BMQVkgPSB0cnVlO1xuZXhwb3J0cy5ERUJVR19TTElERVJTID0gZmFsc2U7XG52YXIgTG9nX1R5cGU7XG4oZnVuY3Rpb24gKExvZ19UeXBlKSB7XG4gICAgTG9nX1R5cGVbTG9nX1R5cGVbXCJHZW5lcmFsXCJdID0gMF0gPSBcIkdlbmVyYWxcIjtcbiAgICBMb2dfVHlwZVtMb2dfVHlwZVtcIkRlYnVnX0Rpc3BsYXlcIl0gPSAxXSA9IFwiRGVidWdfRGlzcGxheVwiO1xuICAgIExvZ19UeXBlW0xvZ19UeXBlW1wiRGVidWdfU2xpZGVyc1wiXSA9IDJdID0gXCJEZWJ1Z19TbGlkZXJzXCI7XG59KShMb2dfVHlwZSB8fCAoZXhwb3J0cy5Mb2dfVHlwZSA9IExvZ19UeXBlID0ge30pKTtcbjtcbmZ1bmN0aW9uIGxvZyhsb2dfdHlwZSwgLi4uZGF0YSkge1xuICAgIC8vIGlmIHRoaXMgaXMgdGhlIGVtcHR5IHN0cmluZ1xuICAgIHZhciBkb19sb2cgPSBmYWxzZTtcbiAgICB2YXIgbG9nX2hlYWRlciA9IFwiXCI7XG4gICAgc3dpdGNoIChsb2dfdHlwZSkge1xuICAgICAgICBjYXNlIExvZ19UeXBlLkdlbmVyYWw6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgZG9fbG9nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIExvZ19UeXBlLkRlYnVnX0Rpc3BsYXk6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiREVCVUdfRElTUExBWVwiO1xuICAgICAgICAgICAgICAgIGlmIChleHBvcnRzLkRFQlVHX0RJU1BMQVkpXG4gICAgICAgICAgICAgICAgICAgIGRvX2xvZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBMb2dfVHlwZS5EZWJ1Z19TbGlkZXJzOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvZ19oZWFkZXIgPSBcIkRFQlVHX1NMSURFUlNcIjtcbiAgICAgICAgICAgICAgICBpZiAoZXhwb3J0cy5ERUJVR19TTElERVJTKVxuICAgICAgICAgICAgICAgICAgICBkb19sb2cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChkb19sb2cpIHtcbiAgICAgICAgaWYgKGxvZ19oZWFkZXIgIT0gXCJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7bG9nX2hlYWRlcn06IGAsIC4uLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coLi4uZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG59XG47XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2V0dXBfc2xpZGVycyA9IHNldHVwX3NsaWRlcnM7XG5jb25zdCBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcbmNvbnN0IERFRkFVTFRfQ0FURUdPUlkgPSBcIk1pc2NcIjtcbmNsYXNzIFByb3BlcnR5X1N0cnVjdCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucHJvcGVydHlfbmFtZSA9IFwiXCI7XG4gICAgICAgIHRoaXMucHJvcGVydHlfZGF0YV90eXBlID0gUHJvcGVydHlfRGF0YV9UeXBlLk5vbmU7XG4gICAgICAgIC8vIEZsb2F0IHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5mbG9hdF9yYW5nZV9taW4gPSAwO1xuICAgICAgICB0aGlzLmZsb2F0X3JhbmdlX21heCA9IDA7XG4gICAgICAgIHRoaXMuZmxvYXRfZGVmYXVsdCA9IDA7XG4gICAgICAgIC8vIEludCBwcm9wZXJ0aWVzXG4gICAgICAgIHRoaXMuaW50X3JhbmdlX21pbiA9IDA7XG4gICAgICAgIHRoaXMuaW50X3JhbmdlX21heCA9IDA7XG4gICAgICAgIHRoaXMuaW50X2RlZmF1bHQgPSAwO1xuICAgICAgICAvLyBCb29sIHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5ib29sX2RlZmF1bHQgPSBmYWxzZTtcbiAgICAgICAgLy8gZm9yIG5pY2UgcHJvcGVydHkgdmlzdWFsaXphdGlvbi5cbiAgICAgICAgdGhpcy5jYXRlZ29yeSA9IERFRkFVTFRfQ0FURUdPUlk7XG4gICAgfVxufVxuO1xudmFyIFByb3BlcnR5X0RhdGFfVHlwZTtcbihmdW5jdGlvbiAoUHJvcGVydHlfRGF0YV9UeXBlKSB7XG4gICAgUHJvcGVydHlfRGF0YV9UeXBlW1Byb3BlcnR5X0RhdGFfVHlwZVtcIk5vbmVcIl0gPSAwXSA9IFwiTm9uZVwiO1xuICAgIFByb3BlcnR5X0RhdGFfVHlwZVtQcm9wZXJ0eV9EYXRhX1R5cGVbXCJQcm9wZXJ0eV9EYXRhX0Zsb2F0XCJdID0gMV0gPSBcIlByb3BlcnR5X0RhdGFfRmxvYXRcIjtcbiAgICBQcm9wZXJ0eV9EYXRhX1R5cGVbUHJvcGVydHlfRGF0YV9UeXBlW1wiUHJvcGVydHlfRGF0YV9JbnRcIl0gPSAyXSA9IFwiUHJvcGVydHlfRGF0YV9JbnRcIjtcbiAgICBQcm9wZXJ0eV9EYXRhX1R5cGVbUHJvcGVydHlfRGF0YV9UeXBlW1wiUHJvcGVydHlfRGF0YV9Cb29sXCJdID0gM10gPSBcIlByb3BlcnR5X0RhdGFfQm9vbFwiO1xufSkoUHJvcGVydHlfRGF0YV9UeXBlIHx8IChQcm9wZXJ0eV9EYXRhX1R5cGUgPSB7fSkpO1xuO1xuLy8gcHV0cyBzb21lIHNsaWRlcnMgdXAgdG8gY29udHJvbCBzb21lIHBhcmFtZXRlcnNcbmZ1bmN0aW9uIHNldHVwX3NsaWRlcnMocHJvcGVydGllcywgc2V0X3Byb3BlcnR5KSB7XG4gICAgY29uc3QgU0xJREVSX0NPTlRBSU5FUl9JRCA9IFwic2xpZGVDb250YWluZXJcIjtcbiAgICBjb25zdCBzbGlkZXJfY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoU0xJREVSX0NPTlRBSU5FUl9JRCk7XG4gICAgaWYgKHNsaWRlcl9jb250YWluZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBHZXQgc2xpZGVyIGNvbnRhaW5lclwiKTtcbiAgICAvLyBUT0RPIGZvciB0aGUgc2xpZGVzIHRoYXQgaGF2ZSBhIHNtYWxsIHJhbmdlIChsaWtlIGNvaGVzaW9uIGZhY3RvcikgbWFrZSB0aGUgdmFsdWUgdGhlIHNxdWFyZSBvZiB0aGUgbnVtYmVyLlxuICAgIHByb3BlcnRpZXMuc29ydCgpOyAvLyBob3BlIHNvbWVvbmUgZWxzZSB3YXNuJ3QgdXNpbmcgdGhpcy5cbiAgICBjb25zdCBwcm9wZXJ0eV9zdHJ1Y3RzID0gW107XG4gICAgZm9yIChjb25zdCBbbmFtZSwgdGFnXSBvZiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkRlYnVnX1NsaWRlcnMsIGB0eXBlc2NyaXB0OiAke25hbWV9OiAke3RhZ31gKTtcbiAgICAgICAgLy8gVE9ETyB0aGlzIGZ1bmN0aW9uIGlzIGdyb3dpbmcgdG8gYmlnLCBwdXQgaXQgaW4gYSBzZXBhcmF0ZSBmaWxlLlxuICAgICAgICBjb25zdCB0YWdfc3BsaXQgPSB0YWcuc3BsaXQoXCIgXCIpO1xuICAgICAgICBjb25zdCBbcHJvcF9wcm9wZXJ0eSwgcHJvcGVydHlfZGF0YV90eXBlXSA9IHRhZ19wcm9wX3RvX3BhcnRzKHRhZ19zcGxpdFswXSk7XG4gICAgICAgIGlmIChwcm9wX3Byb3BlcnR5ICE9IFwiUHJvcGVydHlcIilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmlyc3QgcHJvcGVydHkgaXMgbm90IHByb3BlcnR5LCB0YWcgd2FzICR7dGFnfWApO1xuICAgICAgICBjb25zdCBwcm9wZXJ0eV9zdHJ1Y3QgPSBuZXcgUHJvcGVydHlfU3RydWN0KCk7XG4gICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lID0gbmFtZTtcbiAgICAgICAgaWYgKHByb3BlcnR5X3N0cnVjdC5jYXRlZ29yeSAhPSBERUZBVUxUX0NBVEVHT1JZKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbiAke25hbWV9LCBwcm9wZXJ0eV9zdHJ1Y3QuY2F0ZWdvcnkgd2FzIHNldCB0byAke3Byb3BlcnR5X3N0cnVjdC5jYXRlZ29yeX0gYnV0IGl0IHNob3VsZCBiZSAke0RFRkFVTFRfQ0FURUdPUll9IGF0IHRoaXMgcG9pbnRgKTtcbiAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9kYXRhX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZSA9IFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Zsb2F0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJpbnRcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGUgPSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9JbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImJvb2xcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGUgPSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9Cb29sO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGluICR7bmFtZX0sIFVua25vd24gcHJvcGVydHkgZGF0YSB0eXBlICR7cHJvcGVydHlfZGF0YV90eXBlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRhZ19zcGxpdC5zaGlmdCgpO1xuICAgICAgICB3aGlsZSAodGFnX3NwbGl0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IFtsZWZ0LCByaWdodF0gPSB0YWdfcHJvcF90b19wYXJ0cyh0YWdfc3BsaXQuc2hpZnQoKSk7XG4gICAgICAgICAgICBzd2l0Y2ggKGxlZnQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmFuZ2VcIjpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfZGF0YV90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9GbG9hdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW21pbl9hc19zdHJpbmcsIG1heF9hc19zdHJpbmddID0gcmlnaHQuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21pbiA9IHBhcnNlRmxvYXQobWluX2FzX3N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWF4ID0gcGFyc2VGbG9hdChtYXhfYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0ludDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW21pbl9hc19zdHJpbmcsIG1heF9hc19zdHJpbmddID0gcmlnaHQuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9taW4gPSBwYXJzZUludChtaW5fYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5pbnRfcmFuZ2VfbWF4ID0gcGFyc2VJbnQobWF4X2FzX3N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9Cb29sOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJvb2xlYW4gZG9zZSBub3QgaGF2ZSBhIHJhbmdlIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gZGF0YSB0eXBlIGluICR7bmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRlZmF1bHRcIjpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfZGF0YV90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9GbG9hdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHQgPSBwYXJzZUZsb2F0KHJpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0ludDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9kZWZhdWx0ID0gcGFyc2VJbnQocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfQm9vbDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmJvb2xfZGVmYXVsdCA9IHBhcnNlX2Jvb2wocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGRhdGEgdHlwZSBpbiAke25hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJDYXRlZ29yeVwiOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuY2F0ZWdvcnkgPSByaWdodDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaW4gJHtuYW1lfSwgZm91bmQgdW5rbm93biBwcm9wZXJ0eSAnJHtsZWZ0fSdgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHJvcGVydHlfc3RydWN0cy5wdXNoKHByb3BlcnR5X3N0cnVjdCk7XG4gICAgfVxuICAgIC8vIEdyb3VwIHByb3BlcnR5X3N0cnVjdHMgYnkgY2F0ZWdvcnkgZm9yIGNvbGxhcHNpYmxlIHJlbmRlcmluZ1xuICAgIGNvbnN0IGNhdGVnb3J5X21hcCA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHBzIG9mIHByb3BlcnR5X3N0cnVjdHMpIHtcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBwcy5jYXRlZ29yeSB8fCBERUZBVUxUX0NBVEVHT1JZO1xuICAgICAgICBpZiAoIWNhdGVnb3J5X21hcC5oYXMoY2F0ZWdvcnkpKVxuICAgICAgICAgICAgY2F0ZWdvcnlfbWFwLnNldChjYXRlZ29yeSwgW10pO1xuICAgICAgICBjYXRlZ29yeV9tYXAuZ2V0KGNhdGVnb3J5KS5wdXNoKHBzKTtcbiAgICB9XG4gICAgLy8gU29ydCBjYXRlZ29yaWVzIGFscGhhYmV0aWNhbGx5LCBidXQgcGxhY2UgdGhlIERFRkFVTFRfQ0FURUdPUlkgbGFzdFxuICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBBcnJheS5mcm9tKGNhdGVnb3J5X21hcC5rZXlzKCkpLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgaWYgKGEgPT09IERFRkFVTFRfQ0FURUdPUlkpXG4gICAgICAgICAgICByZXR1cm4gKzE7XG4gICAgICAgIGlmIChiID09PSBERUZBVUxUX0NBVEVHT1JZKVxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICByZXR1cm4gYS5sb2NhbGVDb21wYXJlKGIpO1xuICAgIH0pO1xuICAgIGZvciAoY29uc3QgY2F0ZWdvcnkgb2YgY2F0ZWdvcmllcykge1xuICAgICAgICBjb25zdCBpdGVtcyA9IGNhdGVnb3J5X21hcC5nZXQoY2F0ZWdvcnkpO1xuICAgICAgICBjb25zdCBkZXRhaWxzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRldGFpbHNcIik7XG4gICAgICAgIGRldGFpbHMuY2xhc3NOYW1lID0gXCJjYXRlZ29yeUdyb3VwXCI7XG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3VtbWFyeVwiKTtcbiAgICAgICAgc3VtbWFyeS5jbGFzc05hbWUgPSBcImNhdGVnb3J5SGVhZGVyXCI7XG4gICAgICAgIHN1bW1hcnkudGV4dENvbnRlbnQgPSBjYXRlZ29yeS5yZXBsYWNlKC9fL2csIFwiIFwiKTtcbiAgICAgICAgZGV0YWlscy5hcHBlbmRDaGlsZChzdW1tYXJ5KTtcbiAgICAgICAgY29uc3QgYm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGJvZHkuY2xhc3NOYW1lID0gXCJjYXRlZ29yeUJvZHlcIjtcbiAgICAgICAgZm9yIChjb25zdCBwcm9wZXJ0eV9zdHJ1Y3Qgb2YgaXRlbXMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAocHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfRmxvYXQ6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ha2VfZmxvYXRfc2xpZGVyKGJvZHksIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0ludDpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFrZV9pbnRfc2xpZGVyKGJvZHksIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Jvb2w6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ha2VfYm9vbF9zbGlkZXIoYm9keSwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbiAke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lfSwgZm91bmQgdW5rbm93biBwcm9wZXJ0eSB0eXBlICR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZGV0YWlscy5hcHBlbmRDaGlsZChib2R5KTtcbiAgICAgICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChkZXRhaWxzKTtcbiAgICB9XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgICAgICBNYWtlIGEgc2xpZGVyIGZvciBhIGZsb2F0XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gbWFrZV9mbG9hdF9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBzbGlkZXJfaWQgPSBgc2xpZGVyXyR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWV9YDtcbiAgICBjb25zdCBwYXJhZ3JhcGhfaWQgPSBgJHtzbGlkZXJfaWR9X3BhcmFncmFwaGA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfbmFtZS5yZXBsYWNlKC9fL2csIFwiIFwiKX1gO1xuICAgIGNvbnN0IGh0bWxfc3RyaW5nID0gYFxuICAgICAgICA8cCBjbGFzcz1cInNsaWRlcktleVwiIGlkPVwiJHtwYXJhZ3JhcGhfaWR9XCI+XG4gICAgICAgICAgICAke3BhcmFncmFwaF90ZXh0fTogJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWlufVwiIG1heD1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21heH1cIiB2YWx1ZT1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHR9XCIgc3RlcD1cIjAuMDA1XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7c2xpZGVyX2lkfVwiPlxuICAgIGA7XG4gICAgY29uc3QgbmV3X2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG5ld19lbGVtZW50LmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICBuZXdfZWxlbWVudC5pbm5lckhUTUwgPSBodG1sX3N0cmluZztcbiAgICBzbGlkZXJfY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld19lbGVtZW50KTtcbiAgICBjb25zdCBzbGlkZXIgPSBuZXdfZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgaW5wdXQgZm9yIHNsaWRlciBpZD0nJHtzbGlkZXJfaWR9JyBpbnNpZGUgaXRzIGNvbnRhaW5lcmApO1xuICAgIGlmIChzbGlkZXIuaWQgIT0gc2xpZGVyX2lkKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kIHNsaWRlciB3aXRoIGlkPScke3NsaWRlci5pZH0nIGJ1dCBleHBlY3RlZCBpZD0nJHtzbGlkZXJfaWR9J2ApO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTbGlkZXIgaW5wdXQgZm9yICcke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lfScgZGlzYXBwZWFyZWQgdW5leHBlY3RlZGx5YCk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl9udW1iZXIgPSBOdW1iZXIodGhlX3NsaWRlci52YWx1ZSk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl90ZXh0ID0gbmV3X2VsZW1lbnQucXVlcnlTZWxlY3RvcihgIyR7cGFyYWdyYXBoX2lkfWApO1xuICAgICAgICBpZiAoc2xpZGVyX3RleHQgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGxhYmVsIHBhcmFncmFwaCAnJHtwYXJhZ3JhcGhfaWR9JyBmb3Igc2xpZGVyICcke3NsaWRlcl9pZH0nYCk7XG4gICAgICAgIHNsaWRlcl90ZXh0LnRleHRDb250ZW50ID0gYCR7cGFyYWdyYXBoX3RleHR9OiAke3NsaWRlcl9udW1iZXJ9YDtcbiAgICAgICAgc2V0X3Byb3BlcnR5KHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lLCBzbGlkZXJfbnVtYmVyKTtcbiAgICB9KTtcbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgICAgICBNYWtlIGEgc2xpZGVyIGZvciBhbiBpbnRcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2ludF9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBzbGlkZXJfaWQgPSBgc2xpZGVyXyR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWV9YDtcbiAgICBjb25zdCBwYXJhX2lkID0gYCR7c2xpZGVyX2lkfV9wYXJhZ3JhcGhgO1xuICAgIGNvbnN0IHBhcmFncmFwaF90ZXh0ID0gYCR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWUucmVwbGFjZSgvXy9nLCBcIiBcIil9YDtcbiAgICBjb25zdCBodG1sX3N0cmluZyA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJzbGlkZXJLZXlcIiBpZD1cIiR7cGFyYV9pZH1cIj5cbiAgICAgICAgICAgICR7cGFyYWdyYXBoX3RleHR9OiAke3Byb3BlcnR5X3N0cnVjdC5pbnRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21pbn1cIiBtYXg9XCIke3Byb3BlcnR5X3N0cnVjdC5pbnRfcmFuZ2VfbWF4fVwiIHZhbHVlPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHR9XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7c2xpZGVyX2lkfVwiPlxuICAgICAgICBgO1xuICAgIGNvbnN0IG5ld190aGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmV3X3RoaW5nLmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICBuZXdfdGhpbmcuaW5uZXJIVE1MID0gaHRtbF9zdHJpbmc7XG4gICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdfdGhpbmcpO1xuICAgIGNvbnN0IHNsaWRlciA9IG5ld190aGluZy5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgaW5wdXQgZm9yIHNsaWRlciBpZD0nJHtzbGlkZXJfaWR9JyBpbnNpZGUgaXRzIGNvbnRhaW5lcmApO1xuICAgIGlmIChzbGlkZXIuaWQgIT0gc2xpZGVyX2lkKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kIHNsaWRlciB3aXRoIGlkPScke3NsaWRlci5pZH0nIGJ1dCBleHBlY3RlZCBpZD0nJHtzbGlkZXJfaWR9J2ApO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTbGlkZXIgaW5wdXQgZm9yICcke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lfScgZGlzYXBwZWFyZWQgdW5leHBlY3RlZGx5YCk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl9udW1iZXIgPSBOdW1iZXIodGhlX3NsaWRlci52YWx1ZSk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl90ZXh0ID0gbmV3X3RoaW5nLnF1ZXJ5U2VsZWN0b3IoYCMke3BhcmFfaWR9YCk7XG4gICAgICAgIGlmIChzbGlkZXJfdGV4dCA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgbGFiZWwgcGFyYWdyYXBoICcke3BhcmFfaWR9JyBmb3Igc2xpZGVyICcke3NsaWRlcl9pZH0nYCk7XG4gICAgICAgIHNsaWRlcl90ZXh0LnRleHRDb250ZW50ID0gYCR7cGFyYWdyYXBoX3RleHR9OiAke3NsaWRlcl9udW1iZXJ9YDtcbiAgICAgICAgc2V0X3Byb3BlcnR5KHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lLCBzbGlkZXJfbnVtYmVyKTtcbiAgICB9KTtcbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgTWFrZSBhIHNsaWRlciBmb3IgYW4gYm9vbGVhbiB0b2dnbGVcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2Jvb2xfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KSB7XG4gICAgY29uc3Qgc2xpZGVyX2lkID0gYHNsaWRlcl8ke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lfWA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfbmFtZS5yZXBsYWNlKC9fL2csIFwiIFwiKX1gO1xuICAgIGNvbnN0IGh0bWxfc3RyaW5nID0gYFxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgJHtwcm9wZXJ0eV9zdHJ1Y3QuYm9vbF9kZWZhdWx0ID8gXCJjaGVja2VkXCIgOiBcIlwifSBjbGFzcz1cImNoZWNrYm94X3RvZ2dsZVwiIGlkPVwiJHtzbGlkZXJfaWR9XCI+XG4gICAgICAgIDxsYWJlbCBmb3I9XCIke3NsaWRlcl9pZH1cIiBjbGFzcz1cImNoZWNrYm94X3RvZ2dsZV9sYWJlbFwiPiR7cGFyYWdyYXBoX3RleHR9PC9sYWJlbD5cbiAgICAgICAgYDtcbiAgICBjb25zdCBuZXdfdGhpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG5ld190aGluZy5jbGFzc05hbWUgPSBcInJhbmdlSG9sZGVyXCI7XG4gICAgbmV3X3RoaW5nLmlubmVySFRNTCA9IGh0bWxfc3RyaW5nO1xuICAgIHNsaWRlcl9jb250YWluZXIuYXBwZW5kQ2hpbGQobmV3X3RoaW5nKTtcbiAgICBjb25zdCBzbGlkZXIgPSBuZXdfdGhpbmcucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbiAgICBpZiAoc2xpZGVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGNoZWNrYm94IGlucHV0IGZvciBpZD0nJHtzbGlkZXJfaWR9JyBpbnNpZGUgaXRzIGNvbnRhaW5lcmApO1xuICAgIGlmIChzbGlkZXIuaWQgIT0gc2xpZGVyX2lkKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kIHNsaWRlciB3aXRoIGlkPScke3NsaWRlci5pZH0nIGJ1dCBleHBlY3RlZCBpZD0nJHtzbGlkZXJfaWR9J2ApO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGVja2JveCBpbnB1dCBmb3IgJyR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWV9JyBkaXNhcHBlYXJlZCB1bmV4cGVjdGVkbHlgKTtcbiAgICAgICAgc2V0X3Byb3BlcnR5KHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lLCB0aGVfc2xpZGVyLmNoZWNrZWQpO1xuICAgIH0pO1xufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgICAgIEhlbHBlciBmdW5jdGlvbnNcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gdGFnX3Byb3BfdG9fcGFydHMocHJvcCkge1xuICAgIGNvbnN0IFtsZWZ0LCByaWdodF93aXRoX2p1bmtdID0gcHJvcC5zcGxpdChcIjpcIik7XG4gICAgY29uc3QgcmlnaHQgPSByaWdodF93aXRoX2p1bmsuc2xpY2UoMSwgcmlnaHRfd2l0aF9qdW5rLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBbbGVmdCwgcmlnaHRdO1xufVxuO1xuZnVuY3Rpb24gcGFyc2VfYm9vbChzKSB7XG4gICAgLy8gMSwgdCwgVCwgVFJVRSwgdHJ1ZSwgVHJ1ZSxcbiAgICAvLyAwLCBmLCBGLCBGQUxTRSwgZmFsc2UsIEZhbHNlXG4gICAgc3dpdGNoIChzKSB7XG4gICAgICAgIGNhc2UgXCIxXCI6XG4gICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgIGNhc2UgXCJUUlVFXCI6XG4gICAgICAgIGNhc2UgXCJ0cnVlXCI6XG4gICAgICAgIGNhc2UgXCJUcnVlXCI6IHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCIwXCI6XG4gICAgICAgIGNhc2UgXCJmXCI6XG4gICAgICAgIGNhc2UgXCJGXCI6XG4gICAgICAgIGNhc2UgXCJGQUxTRVwiOlxuICAgICAgICBjYXNlIFwiZmFsc2VcIjpcbiAgICAgICAgY2FzZSBcIkZhbHNlXCI6IHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc3RyaW5nIGluIHBhcnNlQm9vbCwgd2FzICR7c31gKTtcbiAgICB9XG59XG47XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBleGlzdHMgKGRldmVsb3BtZW50IG9ubHkpXG5cdGlmIChfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHR5cGVzY3JpcHQgZ2x1ZSBjb2RlLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XG5jb25zdCBzZXR1cF9zbGlkZXJzXzEgPSByZXF1aXJlKFwiLi9zZXR1cF9zbGlkZXJzXCIpO1xuLy8gY29vbCB0cmlja1xuY29uc3QgSU5fREVWX01PREUgPSAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09IFwibG9jYWxob3N0XCIpO1xuO1xuO1xuLy8gTk9URSB3ZSBrZWVwIHRoZSBAdHMtaWdub3JlJ3MgaW4gaGVyZVxuYXN5bmMgZnVuY3Rpb24gZ2V0X2dvX2Z1bmN0aW9ucygpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgZ28gPSBuZXcgR28oKTsgLy8gTk9URSB0aGlzIGNvbWVzIGZyb20gdGhlIHdhc21fZXhlYy5qcyB0aGluZ1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGZldGNoKFwiZGlzdC9ib2lkLndhc21cIiksIGdvLmltcG9ydE9iamVjdCk7XG4gICAgZ28ucnVuKHJlc3VsdC5pbnN0YW5jZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBzZXRfcHJvcGVydGllczogU2V0UHJvcGVydGllcyxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnZXRfcHJvcGVydGllczogR2V0UHJvcGVydGllcyxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnZXRfbmV4dF9mcmFtZTogR2V0TmV4dEZyYW1lLFxuICAgIH07XG59XG47XG47XG47XG47XG47XG5jb25zdCBtb3VzZSA9IHtcbiAgICBwb3M6IHsgeDogMCwgeTogMCB9LFxuICAgIGxlZnRfZG93bjogZmFsc2UsXG4gICAgbWlkZGxlX2Rvd246IGZhbHNlLFxuICAgIHJpZ2h0X2Rvd246IGZhbHNlLFxufTtcbmZ1bmN0aW9uIGRvbV9yZWN0X3RvX3JlY3QoZG9tX3JlY3QpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBkb21fcmVjdC54LFxuICAgICAgICB5OiBkb21fcmVjdC55LFxuICAgICAgICB3OiBkb21fcmVjdC53aWR0aCxcbiAgICAgICAgLy8gdG8gYWNjb3VudCBmb3IgbGV0dGVycyBsaWtlICdqJ1xuICAgICAgICBoOiBkb21fcmVjdC5oZWlnaHQgKyA1LFxuICAgIH07XG59XG47XG5mdW5jdGlvbiBnZXRfYWxsX2NvbGxpZGFibGVfcmVjdHMoKSB7XG4gICAgY29uc3QgQ0xBU1MgPSBcImNvbGxpZGVcIjtcbiAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoQ0xBU1MpO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRzW2ldO1xuICAgICAgICBjb25zdCBkb21fcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGRvbV9yZWN0X3RvX3JlY3QoZG9tX3JlY3QpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbjtcbmZ1bmN0aW9uIHJlbmRlcl9ib2lkcyhkaXNwbGF5LCBnbykge1xuICAgIC8vIHdlIGdldCB0aGUgYm91bmRpbmcgcmVjdGFuZ2xlcyBvZiBlbGVtZW50cyBpbiB0aGUgZG9jdW1lbnQsXG4gICAgLy9cbiAgICAvLyB3ZSBDT1VMRCBoYXZlIGp1c3QgcmVuZGVyZWQgdGhlIHRleHQgb3Vyc2VsdmVzLCAod2l0aCAuZmlsbFRleHQoKSlcbiAgICAvLyBidXQgaSB3YW50IHRoZSB1c2VyIHRvIGJlIGFibGUgdG8gc2VsZWN0IHRoZSBlbWFpbCB0ZXh0LlxuICAgIC8vXG4gICAgLy8gbWF5YmUgd2hlbiB0aGF0IGVtYWlsIHRleHQgaXMgbW92ZXMgc29tZXdoZXJlIGVsc2Ugd2UgY291bGQgaGF2ZSBhbGxcbiAgICAvLyB0aGUgYm9pZCB0ZXh0IHJlbmRlcmVkIGJ5IHRoZSBib2lkIHNpbSBpdHNlbGYuXG4gICAgLy9cbiAgICAvLyBhbHRob3VnaCB0aGF0IG1pZ2h0IGludHJvZHVjZSBpc3N1ZXMgd2hlbiB0aGUgYm9pZCB3YXNtIGhhc24ndCBsb2FkZWQuXG4gICAgY29uc3QgY29sbGlkYWJsZV9yZWN0YW5nbGVzID0gZ2V0X2FsbF9jb2xsaWRhYmxlX3JlY3RzKCk7XG4gICAgY29uc3QgQk9JRF9DQU5WQVNfU1FVSVNIX0ZBQ1RPUiA9IDE7XG4gICAgLy8gdGhpcyBpcyB0aGUgY2FudmFzIHRoYXQgdGhlIHdhc20gaXMgZ29pbmcgdG8gZHJhdyBpbnRvLlxuICAgIC8vXG4gICAgLy8gYmFzZWQgb24gdGhlIHJlbmRlciBjYW52YXMgZm9yIG5vdy5cbiAgICAvL1xuICAgIC8vIHVzaW5nIHNxdWlzaCBmYWN0b3IsIHdlIGNhbiBjaGFuZ2UgdGhlIHJlbmRlcmluZyBzaXplIG9mIHRoZSBib2lkIGltYWdlIHdlIGp1c3QgZ290LlxuICAgIC8vIFRPRE8gd2hlbiBzcXVpc2hlZCwgbW91c2UgaW5wdXQgZG9zZSBub3Qgd29yayByaWdodC5cbiAgICBjb25zdCBib2lkX2NhbnZhc193aWR0aCA9IC8qIDE2KjI1OyAqLyBNYXRoLmZsb29yKGRpc3BsYXkucmVuZGVyX2N0eC5jYW52YXMud2lkdGggLyBCT0lEX0NBTlZBU19TUVVJU0hfRkFDVE9SKTtcbiAgICBjb25zdCBib2lkX2NhbnZhc19oZWlnaHQgPSAvKiAgOSoyNTsgKi8gTWF0aC5mbG9vcihkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLmhlaWdodCAvIEJPSURfQ0FOVkFTX1NRVUlTSF9GQUNUT1IpO1xuICAgIC8vIFtyLCBnLCBiLCBhXSwgbm90IG5lY2Vzc2FyaWx5IGluIHRoYXQgb3JkZXJcbiAgICBjb25zdCBOVU1fQ09MT1JfQ09NUE9ORU5UUyA9IDQ7XG4gICAgY29uc3QgYnVmZmVyX3NpemUgPSBib2lkX2NhbnZhc193aWR0aCAqIGJvaWRfY2FudmFzX2hlaWdodCAqIE5VTV9DT0xPUl9DT01QT05FTlRTO1xuICAgIC8vIHJlc2l6ZSBiYWNrIGJ1ZmZlciBpZiBjYW52YXMgc2l6ZSBjaGFuZ2VkLlxuICAgIGlmIChkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoICE9PSBib2lkX2NhbnZhc193aWR0aCB8fCBkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCAhPT0gYm9pZF9jYW52YXNfaGVpZ2h0KSB7XG4gICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkdlbmVyYWwsIFwiT2ggZ29kLiB3ZXJlIHJlc2l6aW5nIHRoZSBidWZmZXJcIik7XG4gICAgICAgIGlmIChkaXNwbGF5LmJhY2tfYnVmZmVyX2FycmF5Lmxlbmd0aCA8IGJ1ZmZlcl9zaXplKSB7XG4gICAgICAgICAgICAoMCwgbG9nZ2VyXzEubG9nKShsb2dnZXJfMS5Mb2dfVHlwZS5HZW5lcmFsLCBcIkJhY2sgYnVmZmVyIGFycmF5IGdldHRpbmcgYmlnZ2VyXCIpOyAvLyBteSBwZW5pc1xuICAgICAgICAgICAgLy8gbWFrZSB0aGUgYnVmZmVyIGJpZ2dlclxuICAgICAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9hcnJheSA9IG5ldyBVaW50OENsYW1wZWRBcnJheShidWZmZXJfc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmFja19jYW52YXMgPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKGJvaWRfY2FudmFzX3dpZHRoLCBib2lkX2NhbnZhc19oZWlnaHQpO1xuICAgICAgICBjb25zdCBiYWNrX2N0eCA9IGJhY2tfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgaWYgKGJhY2tfY3R4ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHggPSBiYWNrX2N0eDtcbiAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoID0gYm9pZF9jYW52YXNfd2lkdGg7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0ID0gYm9pZF9jYW52YXNfaGVpZ2h0O1xuICAgIH1cbiAgICBjb25zdCBidWZmZXIgPSBkaXNwbGF5LmJhY2tfYnVmZmVyX2FycmF5LnN1YmFycmF5KDAsIGJ1ZmZlcl9zaXplKTtcbiAgICBjb25zdCBhcmdzID0ge1xuICAgICAgICB3aWR0aDogYm9pZF9jYW52YXNfd2lkdGgsXG4gICAgICAgIGhlaWdodDogYm9pZF9jYW52YXNfaGVpZ2h0LFxuICAgICAgICBidWZmZXI6IGJ1ZmZlcixcbiAgICAgICAgbW91c2U6IG1vdXNlLFxuICAgICAgICByZWN0YW5nbGVzOiBjb2xsaWRhYmxlX3JlY3RhbmdsZXMsXG4gICAgfTtcbiAgICBjb25zdCBudW1fYnl0ZXNfZmlsbGVkID0gZ28uZ2V0X25leHRfZnJhbWUoYXJncyk7XG4gICAgaWYgKG51bV9ieXRlc19maWxsZWQgIT09IGJ1ZmZlcl9zaXplKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGdvLmdldF9uZXh0X2ZyYW1lIGdvdCBpbmNvcnJlY3QgbnVtYmVyIG9mIGJ5dGVzLCB3YW50ZWQ6ICR7YnVmZmVyX3NpemV9LCBnb3Q6ICR7bnVtX2J5dGVzX2ZpbGxlZH1gKTtcbiAgICAvLyBAdHMtaWdub3JlIC8vIHdoeSBkb3NlIHRoaXMgbGluZSBtYWtlIGFuIGVycm9yIGluIG15IGVkaXRvclxuICAgIGNvbnN0IGltYWdlX2RhdGEgPSBuZXcgSW1hZ2VEYXRhKGJ1ZmZlciwgYm9pZF9jYW52YXNfd2lkdGgsIGJvaWRfY2FudmFzX2hlaWdodCk7XG4gICAgLy8gaXMgdGhpcyBjb29sP1xuICAgIC8vXG4gICAgLy8gdGhlIHdob2xlIHBvaW50IG9mIHRoaXMgYmFja19idWZmZXIgaXMgdG8gcHJldmVudCBmbGlja2VyaW5nIGFuZFxuICAgIC8vIHN0dWZmLCBidWYgaWYgd2VyZSBvbmx5IGdvaW5nIHRvIGJlIGRyYXdpbmcgb25lIHRoaW5nLi4uXG4gICAgLy8gd2hhdHMgdGhlIHBvaW50P1xuICAgIGRpc3BsYXkuYmFja19idWZmZXJfcmVuZGVyX2N0eC5wdXRJbWFnZURhdGEoaW1hZ2VfZGF0YSwgMCwgMCk7XG4gICAgLy8gTk9URSB0aGlzIHdpbGwgc3RyZXRjaCB0aGUgdGhpbmcuXG4gICAgLy8gY2FudmFzLndpZHRoIG1pZ2h0IGNoYW5nZSBkdXJpbmcgdGhlIHRpbWUgdGhpcyBpcyBydW5uaW5nXG4gICAgZGlzcGxheS5yZW5kZXJfY3R4LmRyYXdJbWFnZShkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHguY2FudmFzLCAwLCAwLCBkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLndpZHRoLCBkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLmhlaWdodCk7XG4gICAgLy8gbGV0cyBob3BlIGphdmFzY3JpcHQgaXMgc21hcnQgZW5vdWdoIHRvIGRlYWxsb2NhdGUgdGhpcy4uLlxuICAgIC8vIGltYWdlRGF0YSA9IG51bGxcbn1cbjtcbi8vIFRPRE8gbWFrZSB0aGlzIHNtYXJ0ZXIuXG5jb25zdCByZW5kZXJfdGltZXMgPSBbXTtcbmNvbnN0IGRlbHRhX3RpbWVzID0gW107XG4vLyBDcmVkaXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS90c29kaW5nL2tvaWxcbi8vIFxuLy8gVE9ETyByZW1vdmUgbmV3X3JlbmRlcl90aW1lLCBhbmQgbmV3X2RlbHRhX3RpbWUsIGp1c3QgbWFrZSBhIGNsYXNzIG9yIHNvbWV0aGluZy5cbmZ1bmN0aW9uIHJlbmRlcl9kZWJ1Z19pbmZvKGRpc3BsYXksIG5ld19yZW5kZXJfdGltZSwgbmV3X2RlbHRhX3RpbWUpIHtcbiAgICBjb25zdCBGT05UX1NJWkUgPSAyODtcbiAgICBkaXNwbGF5LnJlbmRlcl9jdHguZm9udCA9IGAke0ZPTlRfU0laRX1weCBib2xkYDtcbiAgICByZW5kZXJfdGltZXMucHVzaChuZXdfcmVuZGVyX3RpbWUpO1xuICAgIGlmIChyZW5kZXJfdGltZXMubGVuZ3RoID4gNjApIHtcbiAgICAgICAgcmVuZGVyX3RpbWVzLnNoaWZ0KCk7XG4gICAgfVxuICAgIGRlbHRhX3RpbWVzLnB1c2gobmV3X2RlbHRhX3RpbWUpO1xuICAgIGlmIChkZWx0YV90aW1lcy5sZW5ndGggPiA2MCkge1xuICAgICAgICBkZWx0YV90aW1lcy5zaGlmdCgpO1xuICAgIH1cbiAgICBjb25zdCByZW5kZXJfYXZnID0gcmVuZGVyX3RpbWVzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gcmVuZGVyX3RpbWVzLmxlbmd0aDtcbiAgICBjb25zdCBkZWx0YV9hdmcgPSBkZWx0YV90aW1lcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIGRlbHRhX3RpbWVzLmxlbmd0aDtcbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcbiAgICB7IC8vIGNvbnN0cnVjdCB0aGUgbGFiZWxzLlxuICAgICAgICAvLyB0aGlzIGlzIHRoZSBvbmx5IHVuaXF1ZSB0aGluZ3MgYmV0d2VlbiByZW5kZXJfdGltZXMgYW5kIGRlbHRhX3RpbWVzXG4gICAgICAgIGNvbnN0IGZyYW1lc19wZXJfc2Vjb25kID0gKDEgLyBkZWx0YV9hdmcgKiAxMDAwKS50b0ZpeGVkKDIpO1xuICAgICAgICBjb25zdCBzZWNvbmRzX3Blcl9mcmFtZSA9IChkZWx0YV9hdmcgLyAxMDAwKS50b0ZpeGVkKDUpO1xuICAgICAgICBsYWJlbHMucHVzaChgRi9TOiAke2ZyYW1lc19wZXJfc2Vjb25kfSAgICBTL0Y6ICR7c2Vjb25kc19wZXJfZnJhbWV9YCk7XG4gICAgICAgIGxhYmVscy5wdXNoKGBXQVNNIFJlbmRlciBUaW1lIEF2ZyAobXMpOiAke3JlbmRlcl9hdmcudG9GaXhlZCgyKX1gKTtcbiAgICAgICAgbGFiZWxzLnB1c2goYFJlbmRlci9TZWMgKE1BWCk6ICR7KDEgLyByZW5kZXJfYXZnICogMTAwMCkudG9GaXhlZCgyKX1gKTtcbiAgICB9XG4gICAgY29uc3QgUEFERElORyA9IDcwO1xuICAgIGNvbnN0IFNIQURPV19PRkZTRVQgPSBGT05UX1NJWkUgKiAwLjA2O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsVGV4dChsYWJlbHNbaV0sIFBBRERJTkcsIFBBRERJTkcgKyBGT05UX1NJWkUgKiBpKTtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxUZXh0KGxhYmVsc1tpXSwgUEFERElORyArIFNIQURPV19PRkZTRVQsIFBBRERJTkcgLSBTSEFET1dfT0ZGU0VUICsgRk9OVF9TSVpFICogaSk7XG4gICAgfVxufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgICAgVGhlIE1haW4gRnVuY3Rpb25cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4oYXN5bmMgKCkgPT4ge1xuICAgIGlmIChJTl9ERVZfTU9ERSlcbiAgICAgICAgY29uc29sZS5sb2coXCJJbiBEZXYgTW9kZVwiKTtcbiAgICBjb25zdCBnbyA9IGF3YWl0IGdldF9nb19mdW5jdGlvbnMoKTtcbiAgICB7IC8vIEhhbmRsZSBzbGlkZXIgc3R1ZmZcbiAgICAgICAgY29uc3QgYm9pZF9wcm9wZXJ0aWVzID0gT2JqZWN0LmVudHJpZXMoZ28uZ2V0X3Byb3BlcnRpZXMoKSk7XG4gICAgICAgIGlmIChib2lkX3Byb3BlcnRpZXMubGVuZ3RoID09IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBwcm9wZXJ0aWVzIHdoZXJlIGdpdmVuIHRvIGphdmFzY3JpcHQhXCIpO1xuICAgICAgICBmdW5jdGlvbiBzZXRfcHJvcGVydHkobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyNzEwOTA1L2hvdy1kby1pLWR5bmFtaWNhbGx5LWFzc2lnbi1wcm9wZXJ0aWVzLXRvLWFuLW9iamVjdC1pbi10eXBlc2NyaXB0XG4gICAgICAgICAgICBjb25zdCBvYmogPSB7fTtcbiAgICAgICAgICAgIG9ialtuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgZ28uc2V0X3Byb3BlcnRpZXMob2JqKTtcbiAgICAgICAgfVxuICAgICAgICA7XG4gICAgICAgIC8vIFRPRE8gbWF5YmUgbWFrZSB0aGlzIGRldiBtb2RlIG9ubHkuLi5cbiAgICAgICAgLy8gaXQgYWxzbyBoYXMgdG8gcmVtb3ZlIHRoZSBTZXR0aW5ncyB0aGluZy4uLlxuICAgICAgICAoMCwgc2V0dXBfc2xpZGVyc18xLnNldHVwX3NsaWRlcnMpKGJvaWRfcHJvcGVydGllcywgc2V0X3Byb3BlcnR5KTtcbiAgICB9XG4gICAgeyAvLyBzZXR1cCBpbnB1dCBoYW5kbGluZy5cbiAgICAgICAgLy8gd2h5IGRvZXNuJ3QgdHlwZXNjcmlwdCBoYXZlIGFuIGVudW0gZm9yIHRoaXM/XG4gICAgICAgIGxldCBNb3VzZV9CdXR0b25zO1xuICAgICAgICAoZnVuY3Rpb24gKE1vdXNlX0J1dHRvbnMpIHtcbiAgICAgICAgICAgIE1vdXNlX0J1dHRvbnNbTW91c2VfQnV0dG9uc1tcIkxlZnRcIl0gPSAwXSA9IFwiTGVmdFwiO1xuICAgICAgICAgICAgTW91c2VfQnV0dG9uc1tNb3VzZV9CdXR0b25zW1wiTWlkZGxlXCJdID0gMV0gPSBcIk1pZGRsZVwiO1xuICAgICAgICAgICAgTW91c2VfQnV0dG9uc1tNb3VzZV9CdXR0b25zW1wiUmlnaHRcIl0gPSAyXSA9IFwiUmlnaHRcIjtcbiAgICAgICAgfSkoTW91c2VfQnV0dG9ucyB8fCAoTW91c2VfQnV0dG9ucyA9IHt9KSk7XG4gICAgICAgIDtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmdldFJvb3ROb2RlKCk7XG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBtb3VzZS5wb3MgPSB7IHg6IGV2LngsIHk6IGV2LnkgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHRoaXMgd2lsbCBicmVhayBpZiB0aGUgdXNlciBzbGlkZXMgdGhlcmUgbW91c2Ugb3V0c2lkZSBvZiB0aGUgc2NyZWVuIHdoaWxlIGNsaWNraW5nLCBidXQgdGhpcyBpcyB0aGUgd2ViLCBwZW9wbGUgZXhwZWN0IGl0IHRvIHN1Y2suXG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuTGVmdClcbiAgICAgICAgICAgICAgICBtb3VzZS5sZWZ0X2Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLk1pZGRsZSlcbiAgICAgICAgICAgICAgICBtb3VzZS5taWRkbGVfZG93biA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuUmlnaHQpXG4gICAgICAgICAgICAgICAgbW91c2UucmlnaHRfZG93biA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZXYpID0+IHtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5MZWZ0KVxuICAgICAgICAgICAgICAgIG1vdXNlLmxlZnRfZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLk1pZGRsZSlcbiAgICAgICAgICAgICAgICBtb3VzZS5taWRkbGVfZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLlJpZ2h0KVxuICAgICAgICAgICAgICAgIG1vdXNlLnJpZ2h0X2Rvd24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNvbnN0IGNhbnZhc19jb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc19kaXZcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsXG4gICAgY29uc3QgYm9pZF9jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvaWRfY2FudmFzXCIpO1xuICAgIGlmIChib2lkX2NhbnZhcyA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gY2FudmFzIHdpdGggaWQgYGJvaWRfY2FudmFzYCBpcyBmb3VuZFwiKTtcbiAgICAvLyBUT0RPIG5hbWluZyBiZXR0ZXIsIHVzZSBzbmFrZSBjYXNlIGV2ZXJ5d2hlcmUhIVxuICAgIGNvbnN0IGJvaWRfY2FudmFzX3JlbmRlcl9jdHggPSBib2lkX2NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgaWYgKGJvaWRfY2FudmFzX3JlbmRlcl9jdHggPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIjJEIGNvbnRleHQgaXMgbm90IHN1cHBvcnRlZFwiKTtcbiAgICBib2lkX2NhbnZhc19yZW5kZXJfY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIGNvbnN0IFtiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCwgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0XSA9IFtib2lkX2NhbnZhc19yZW5kZXJfY3R4LmNhbnZhcy53aWR0aCwgYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5jYW52YXMuaGVpZ2h0XTtcbiAgICBjb25zdCBiYWNrX2J1ZmZlcl9jYW52YXMgPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKGJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoLCBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQpO1xuICAgIGNvbnN0IGJhY2tfYnVmZmVyX3JlbmRlcl9jdHggPSBiYWNrX2J1ZmZlcl9jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIGlmIChiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4ID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIyRCBjb250ZXh0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgYmFja19idWZmZXJfcmVuZGVyX2N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICBjb25zdCBiYWNrX2J1ZmZlcl9hcnJheSA9IG5ldyBVaW50OENsYW1wZWRBcnJheShiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCAqIGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCAqIDQpO1xuICAgIGNvbnN0IGRpc3BsYXkgPSB7XG4gICAgICAgIHJlbmRlcl9jdHg6IGJvaWRfY2FudmFzX3JlbmRlcl9jdHgsXG4gICAgICAgIGJhY2tfYnVmZmVyX3JlbmRlcl9jdHg6IGJhY2tfYnVmZmVyX3JlbmRlcl9jdHgsXG4gICAgICAgIGJhY2tfYnVmZmVyX2FycmF5OiBiYWNrX2J1ZmZlcl9hcnJheSxcbiAgICAgICAgYmFja19idWZmZXJfaW1hZ2Vfd2lkdGg6IGJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoLFxuICAgICAgICBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQ6IGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCxcbiAgICB9O1xuICAgIGxldCBwcmV2X3RpbWVzdGFtcCA9IDA7XG4gICAgY29uc3QgZnJhbWUgPSAodGltZXN0YW1wKSA9PiB7XG4gICAgICAgIGNvbnN0IGJvaWRDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvaWRfY29udGFpbmVyXCIpO1xuICAgICAgICBpZiAoYm9pZENvbnRhaW5lciA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGVsZW1lbnQgd2l0aCBpZCBgYm9pZF9jb250YWluZXJgIGlzIGZvdW5kXCIpO1xuICAgICAgICBib2lkX2NhbnZhc19yZW5kZXJfY3R4LmNhbnZhcy53aWR0aCA9IGJvaWRDb250YWluZXIuY2xpZW50V2lkdGg7XG4gICAgICAgIGJvaWRfY2FudmFzX3JlbmRlcl9jdHguY2FudmFzLmhlaWdodCA9IGJvaWRDb250YWluZXIuY2xpZW50SGVpZ2h0O1xuICAgICAgICBjb25zdCBkZWx0YV90aW1lID0gKHRpbWVzdGFtcCAtIHByZXZfdGltZXN0YW1wKTtcbiAgICAgICAgcHJldl90aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgICAgIC8vIFRPRE8gRG9uJ3QgbmVlZCBkZWx0YSB0aW1lLCBib2lkIHRoaW5nIGRvc2UgaXQgZm9yIHVzPyBjaGFuZ2U/XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgcmVuZGVyX2JvaWRzKGRpc3BsYXksIGdvKTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgLy8gSW4gbXNcbiAgICAgICAgY29uc3QgcmVuZGVyX3RpbWUgPSBlbmRfdGltZSAtIHN0YXJ0X3RpbWU7XG4gICAgICAgIGlmIChsb2dnZXJfMS5ERUJVR19ESVNQTEFZICYmIElOX0RFVl9NT0RFKVxuICAgICAgICAgICAgcmVuZGVyX2RlYnVnX2luZm8oZGlzcGxheSwgcmVuZGVyX3RpbWUsIGRlbHRhX3RpbWUpO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgICB9O1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKHRpbWVzdGFtcCkgPT4ge1xuICAgICAgICBwcmV2X3RpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gICAgfSk7XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9