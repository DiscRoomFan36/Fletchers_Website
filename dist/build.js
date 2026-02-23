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
var Property_Data_Type;
(function (Property_Data_Type) {
    Property_Data_Type[Property_Data_Type["None"] = 0] = "None";
    Property_Data_Type[Property_Data_Type["Property_Data_Float"] = 1] = "Property_Data_Float";
    Property_Data_Type[Property_Data_Type["Property_Data_Int"] = 2] = "Property_Data_Int";
    Property_Data_Type[Property_Data_Type["Property_Data_Bool"] = 3] = "Property_Data_Bool";
})(Property_Data_Type || (Property_Data_Type = {}));
;
class Property_Struct {
    constructor() {
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
        this.category = "None";
    }
}
;
// puts some sliders up to control some parameters
function setup_sliders(properties, set_property) {
    const SLIDER_CONTAINER_ID = "slideContainer";
    const slider_container = document.getElementById(SLIDER_CONTAINER_ID);
    if (slider_container === null)
        throw new Error("Cannot Get slider container");
    // TODO for the slides that have a small range (like cohesion factor) make the value the square of the number.
    properties.sort(); // hope someone else wasn't using this.
    for (const [name, tag] of properties) {
        (0, logger_1.log)(logger_1.Log_Type.Debug_Sliders, `typescript: ${name}: ${tag}`);
        // TODO this function is growing to big, put it in a separate file.
        const tag_split = tag.split(" ");
        const [prop_property, property_data_type] = tag_prop_to_parts(tag_split[0]);
        if (prop_property != "Property")
            throw new Error(`First property is not property, tag was ${tag}`);
        const property_struct = new Property_Struct();
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
                throw new Error(`Unknown property data type ${property_data_type}`);
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
        // TODO some way to print an object.
        // log(Log_Type.Debug_Sliders, `property struct ${property_struct}`);
        switch (property_struct.property_data_type) {
            case Property_Data_Type.Property_Data_Float:
                {
                    make_float_slider(slider_container, name, property_struct, set_property);
                }
                break;
            case Property_Data_Type.Property_Data_Int:
                {
                    make_int_slider(slider_container, name, property_struct, set_property);
                }
                break;
            case Property_Data_Type.Property_Data_Bool:
                {
                    make_bool_slider(slider_container, name, property_struct, set_property);
                }
                break;
            default: {
                throw new Error(`in ${name}, found unknown property type ${property_struct.property_data_type}`);
            }
        }
    }
}
;
///////////////////////////////////////////////
//         Make a slider for a float
///////////////////////////////////////////////
function make_float_slider(slider_container, name, property_struct, set_property) {
    const slider_id = `slider_${name}`;
    const paragraph_id = `${slider_id}_paragraph`;
    const paragraph_text = `${name.replace(/_/g, " ")}`;
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
    const slider = document.getElementById(slider_id);
    if (slider === null)
        throw new Error("Could not find the slider we just made...");
    slider.addEventListener("input", (event) => {
        const the_slider = event.target;
        if (the_slider === null)
            throw new Error("Target was null, did its own element get deleted underneath itself?");
        const slider_number = Number(the_slider.value);
        const slider_text = document.getElementById(paragraph_id);
        if (slider_text === null)
            throw new Error(`could not find slider_text ${paragraph_id}`);
        slider_text.textContent = `${paragraph_text}: ${slider_number}`;
        set_property(name, slider_number);
    });
}
;
///////////////////////////////////////////////
//          Make a slider for an int
///////////////////////////////////////////////
function make_int_slider(slider_container, name, property_struct, set_property) {
    const id = `slider_${name}`;
    const para_id = `${id}_paragraph`;
    const paragraph_text = `${name.replace(/_/g, " ")}`;
    const html_string = `
        <p class="sliderKey" id="${para_id}">
            ${paragraph_text}: ${property_struct.int_default}
        </p>
        <input type="range" min="${property_struct.int_range_min}" max="${property_struct.int_range_max}" value="${property_struct.int_default}" class="slider" id="${id}">
        `;
    const new_thing = document.createElement("div");
    new_thing.className = "rangeHolder";
    new_thing.innerHTML = html_string;
    slider_container.appendChild(new_thing);
    const slider = document.getElementById(id);
    if (slider === null)
        throw new Error("Could not find the slider");
    slider.addEventListener("input", (event) => {
        const the_slider = event.target;
        if (the_slider === null)
            throw new Error("Target was null, did its own element get deleted underneath itself?");
        const slider_number = Number(the_slider.value);
        const slider_text = document.getElementById(para_id);
        if (slider_text === null)
            throw new Error(`could not find slider_text ${para_id}`);
        slider_text.textContent = `${paragraph_text}: ${slider_number}`;
        set_property(name, slider_number);
    });
}
;
///////////////////////////////////////////////
//     Make a slider for an boolean toggle
///////////////////////////////////////////////
function make_bool_slider(slider_container, name, property_struct, set_property) {
    const id = `slider_${name}`;
    const paragraph_text = `${name.replace(/_/g, " ")}`;
    const html_string = `
        <input type="checkbox" ${property_struct.bool_default ? "checked" : ""} class="checkbox_toggle" id="${id}">
        <label for="${id}" class="checkbox_toggle_label">${paragraph_text}</label>
        `;
    const new_thing = document.createElement("div");
    new_thing.className = "rangeHolder";
    new_thing.innerHTML = html_string;
    slider_container.appendChild(new_thing);
    const slider = document.getElementById(id);
    if (slider === null)
        throw new Error("Could not find the slider");
    slider.addEventListener("input", (event) => {
        const the_slider = event.target;
        if (the_slider === null)
            throw new Error("Target was null, did own own element get deleted?");
        set_property(name, the_slider.checked);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQSxvQkFBb0IsbUJBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLHNDQUFzQztBQUMvQztBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUIsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JvaWRzLy4vd2ViX3NyYy9sb2dnZXIudHMiLCJ3ZWJwYWNrOi8vYm9pZHMvLi93ZWJfc3JjL3NldHVwX3NsaWRlcnMudHMiLCJ3ZWJwYWNrOi8vYm9pZHMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYm9pZHMvLi93ZWJfc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Mb2dfVHlwZSA9IGV4cG9ydHMuREVCVUdfU0xJREVSUyA9IGV4cG9ydHMuREVCVUdfRElTUExBWSA9IHZvaWQgMDtcbmV4cG9ydHMubG9nID0gbG9nO1xuLy8gaXMgaXQgY29ycmVjdCB0byBoYXZlIHRoZXNlIGhlcmU/IHRoaXMgb25lIGVmZmVjdHNcbi8vIGRyYXdpbmcgb24gdGhlIHNjcmVlbiwgbm90IGp1c3QgbG9nZ2luZz8gYWx0aG91Z2ggd2Vcbi8vIGNvdWxkIG1ha2UgYWxsIGxvZ3MgYXBwZWFyIG9uIHNjcmVlbi4uLlxuZXhwb3J0cy5ERUJVR19ESVNQTEFZID0gdHJ1ZTtcbmV4cG9ydHMuREVCVUdfU0xJREVSUyA9IGZhbHNlO1xudmFyIExvZ19UeXBlO1xuKGZ1bmN0aW9uIChMb2dfVHlwZSkge1xuICAgIExvZ19UeXBlW0xvZ19UeXBlW1wiR2VuZXJhbFwiXSA9IDBdID0gXCJHZW5lcmFsXCI7XG4gICAgTG9nX1R5cGVbTG9nX1R5cGVbXCJEZWJ1Z19EaXNwbGF5XCJdID0gMV0gPSBcIkRlYnVnX0Rpc3BsYXlcIjtcbiAgICBMb2dfVHlwZVtMb2dfVHlwZVtcIkRlYnVnX1NsaWRlcnNcIl0gPSAyXSA9IFwiRGVidWdfU2xpZGVyc1wiO1xufSkoTG9nX1R5cGUgfHwgKGV4cG9ydHMuTG9nX1R5cGUgPSBMb2dfVHlwZSA9IHt9KSk7XG47XG5mdW5jdGlvbiBsb2cobG9nX3R5cGUsIC4uLmRhdGEpIHtcbiAgICAvLyBpZiB0aGlzIGlzIHRoZSBlbXB0eSBzdHJpbmdcbiAgICB2YXIgZG9fbG9nID0gZmFsc2U7XG4gICAgdmFyIGxvZ19oZWFkZXIgPSBcIlwiO1xuICAgIHN3aXRjaCAobG9nX3R5cGUpIHtcbiAgICAgICAgY2FzZSBMb2dfVHlwZS5HZW5lcmFsOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvZ19oZWFkZXIgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGRvX2xvZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBMb2dfVHlwZS5EZWJ1Z19EaXNwbGF5OlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvZ19oZWFkZXIgPSBcIkRFQlVHX0RJU1BMQVlcIjtcbiAgICAgICAgICAgICAgICBpZiAoZXhwb3J0cy5ERUJVR19ESVNQTEFZKVxuICAgICAgICAgICAgICAgICAgICBkb19sb2cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTG9nX1R5cGUuRGVidWdfU2xpZGVyczpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2dfaGVhZGVyID0gXCJERUJVR19TTElERVJTXCI7XG4gICAgICAgICAgICAgICAgaWYgKGV4cG9ydHMuREVCVUdfU0xJREVSUylcbiAgICAgICAgICAgICAgICAgICAgZG9fbG9nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoZG9fbG9nKSB7XG4gICAgICAgIGlmIChsb2dfaGVhZGVyICE9IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2xvZ19oZWFkZXJ9OiBgLCAuLi5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKC4uLmRhdGEpO1xuICAgICAgICB9XG4gICAgfVxufVxuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnNldHVwX3NsaWRlcnMgPSBzZXR1cF9zbGlkZXJzO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XG52YXIgUHJvcGVydHlfRGF0YV9UeXBlO1xuKGZ1bmN0aW9uIChQcm9wZXJ0eV9EYXRhX1R5cGUpIHtcbiAgICBQcm9wZXJ0eV9EYXRhX1R5cGVbUHJvcGVydHlfRGF0YV9UeXBlW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XG4gICAgUHJvcGVydHlfRGF0YV9UeXBlW1Byb3BlcnR5X0RhdGFfVHlwZVtcIlByb3BlcnR5X0RhdGFfRmxvYXRcIl0gPSAxXSA9IFwiUHJvcGVydHlfRGF0YV9GbG9hdFwiO1xuICAgIFByb3BlcnR5X0RhdGFfVHlwZVtQcm9wZXJ0eV9EYXRhX1R5cGVbXCJQcm9wZXJ0eV9EYXRhX0ludFwiXSA9IDJdID0gXCJQcm9wZXJ0eV9EYXRhX0ludFwiO1xuICAgIFByb3BlcnR5X0RhdGFfVHlwZVtQcm9wZXJ0eV9EYXRhX1R5cGVbXCJQcm9wZXJ0eV9EYXRhX0Jvb2xcIl0gPSAzXSA9IFwiUHJvcGVydHlfRGF0YV9Cb29sXCI7XG59KShQcm9wZXJ0eV9EYXRhX1R5cGUgfHwgKFByb3BlcnR5X0RhdGFfVHlwZSA9IHt9KSk7XG47XG5jbGFzcyBQcm9wZXJ0eV9TdHJ1Y3Qge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnByb3BlcnR5X2RhdGFfdHlwZSA9IFByb3BlcnR5X0RhdGFfVHlwZS5Ob25lO1xuICAgICAgICAvLyBGbG9hdCBwcm9wZXJ0aWVzXG4gICAgICAgIHRoaXMuZmxvYXRfcmFuZ2VfbWluID0gMDtcbiAgICAgICAgdGhpcy5mbG9hdF9yYW5nZV9tYXggPSAwO1xuICAgICAgICB0aGlzLmZsb2F0X2RlZmF1bHQgPSAwO1xuICAgICAgICAvLyBJbnQgcHJvcGVydGllc1xuICAgICAgICB0aGlzLmludF9yYW5nZV9taW4gPSAwO1xuICAgICAgICB0aGlzLmludF9yYW5nZV9tYXggPSAwO1xuICAgICAgICB0aGlzLmludF9kZWZhdWx0ID0gMDtcbiAgICAgICAgLy8gQm9vbCBwcm9wZXJ0aWVzXG4gICAgICAgIHRoaXMuYm9vbF9kZWZhdWx0ID0gZmFsc2U7XG4gICAgICAgIC8vIGZvciBuaWNlIHByb3BlcnR5IHZpc3VhbGl6YXRpb24uXG4gICAgICAgIHRoaXMuY2F0ZWdvcnkgPSBcIk5vbmVcIjtcbiAgICB9XG59XG47XG4vLyBwdXRzIHNvbWUgc2xpZGVycyB1cCB0byBjb250cm9sIHNvbWUgcGFyYW1ldGVyc1xuZnVuY3Rpb24gc2V0dXBfc2xpZGVycyhwcm9wZXJ0aWVzLCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBTTElERVJfQ09OVEFJTkVSX0lEID0gXCJzbGlkZUNvbnRhaW5lclwiO1xuICAgIGNvbnN0IHNsaWRlcl9jb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChTTElERVJfQ09OVEFJTkVSX0lEKTtcbiAgICBpZiAoc2xpZGVyX2NvbnRhaW5lciA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IEdldCBzbGlkZXIgY29udGFpbmVyXCIpO1xuICAgIC8vIFRPRE8gZm9yIHRoZSBzbGlkZXMgdGhhdCBoYXZlIGEgc21hbGwgcmFuZ2UgKGxpa2UgY29oZXNpb24gZmFjdG9yKSBtYWtlIHRoZSB2YWx1ZSB0aGUgc3F1YXJlIG9mIHRoZSBudW1iZXIuXG4gICAgcHJvcGVydGllcy5zb3J0KCk7IC8vIGhvcGUgc29tZW9uZSBlbHNlIHdhc24ndCB1c2luZyB0aGlzLlxuICAgIGZvciAoY29uc3QgW25hbWUsIHRhZ10gb2YgcHJvcGVydGllcykge1xuICAgICAgICAoMCwgbG9nZ2VyXzEubG9nKShsb2dnZXJfMS5Mb2dfVHlwZS5EZWJ1Z19TbGlkZXJzLCBgdHlwZXNjcmlwdDogJHtuYW1lfTogJHt0YWd9YCk7XG4gICAgICAgIC8vIFRPRE8gdGhpcyBmdW5jdGlvbiBpcyBncm93aW5nIHRvIGJpZywgcHV0IGl0IGluIGEgc2VwYXJhdGUgZmlsZS5cbiAgICAgICAgY29uc3QgdGFnX3NwbGl0ID0gdGFnLnNwbGl0KFwiIFwiKTtcbiAgICAgICAgY29uc3QgW3Byb3BfcHJvcGVydHksIHByb3BlcnR5X2RhdGFfdHlwZV0gPSB0YWdfcHJvcF90b19wYXJ0cyh0YWdfc3BsaXRbMF0pO1xuICAgICAgICBpZiAocHJvcF9wcm9wZXJ0eSAhPSBcIlByb3BlcnR5XCIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZpcnN0IHByb3BlcnR5IGlzIG5vdCBwcm9wZXJ0eSwgdGFnIHdhcyAke3RhZ31gKTtcbiAgICAgICAgY29uc3QgcHJvcGVydHlfc3RydWN0ID0gbmV3IFByb3BlcnR5X1N0cnVjdCgpO1xuICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X2RhdGFfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImZsb2F0XCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfZGF0YV90eXBlID0gUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfRmxvYXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImludFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZSA9IFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0ludDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiYm9vbFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZSA9IFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Jvb2w7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwcm9wZXJ0eSBkYXRhIHR5cGUgJHtwcm9wZXJ0eV9kYXRhX3R5cGV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGFnX3NwbGl0LnNoaWZ0KCk7XG4gICAgICAgIHdoaWxlICh0YWdfc3BsaXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgW2xlZnQsIHJpZ2h0XSA9IHRhZ19wcm9wX3RvX3BhcnRzKHRhZ19zcGxpdC5zaGlmdCgpKTtcbiAgICAgICAgICAgIHN3aXRjaCAobGVmdCkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSYW5nZVwiOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Zsb2F0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbbWluX2FzX3N0cmluZywgbWF4X2FzX3N0cmluZ10gPSByaWdodC5zcGxpdChcIjtcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWluID0gcGFyc2VGbG9hdChtaW5fYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5mbG9hdF9yYW5nZV9tYXggPSBwYXJzZUZsb2F0KG1heF9hc19zdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfSW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbbWluX2FzX3N0cmluZywgbWF4X2FzX3N0cmluZ10gPSByaWdodC5zcGxpdChcIjtcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21pbiA9IHBhcnNlSW50KG1pbl9hc19zdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9tYXggPSBwYXJzZUludChtYXhfYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Jvb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQm9vbGVhbiBkb3NlIG5vdCBoYXZlIGEgcmFuZ2UhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBkYXRhIHR5cGUgaW4gJHtuYW1lfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRGVmYXVsdFwiOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Zsb2F0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfZGVmYXVsdCA9IHBhcnNlRmxvYXQocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfSW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHQgPSBwYXJzZUludChyaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9Cb29sOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuYm9vbF9kZWZhdWx0ID0gcGFyc2VfYm9vbChyaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gZGF0YSB0eXBlIGluICR7bmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNhdGVnb3J5XCI6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5jYXRlZ29yeSA9IHJpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbiAke25hbWV9LCBmb3VuZCB1bmtub3duIHByb3BlcnR5ICcke2xlZnR9J2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIHNvbWUgd2F5IHRvIHByaW50IGFuIG9iamVjdC5cbiAgICAgICAgLy8gbG9nKExvZ19UeXBlLkRlYnVnX1NsaWRlcnMsIGBwcm9wZXJ0eSBzdHJ1Y3QgJHtwcm9wZXJ0eV9zdHJ1Y3R9YCk7XG4gICAgICAgIHN3aXRjaCAocHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9GbG9hdDpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ha2VfZmxvYXRfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIG5hbWUsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0ludDpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ha2VfaW50X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9Cb29sOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9ib29sX3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaW4gJHtuYW1lfSwgZm91bmQgdW5rbm93biBwcm9wZXJ0eSB0eXBlICR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgICAgIE1ha2UgYSBzbGlkZXIgZm9yIGEgZmxvYXRcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2Zsb2F0X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IHNsaWRlcl9pZCA9IGBzbGlkZXJfJHtuYW1lfWA7XG4gICAgY29uc3QgcGFyYWdyYXBoX2lkID0gYCR7c2xpZGVyX2lkfV9wYXJhZ3JhcGhgO1xuICAgIGNvbnN0IHBhcmFncmFwaF90ZXh0ID0gYCR7bmFtZS5yZXBsYWNlKC9fL2csIFwiIFwiKX1gO1xuICAgIGNvbnN0IGh0bWxfc3RyaW5nID0gYFxuICAgICAgICA8cCBjbGFzcz1cInNsaWRlcktleVwiIGlkPVwiJHtwYXJhZ3JhcGhfaWR9XCI+XG4gICAgICAgICAgICAke3BhcmFncmFwaF90ZXh0fTogJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWlufVwiIG1heD1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21heH1cIiB2YWx1ZT1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHR9XCIgc3RlcD1cIjAuMDA1XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7c2xpZGVyX2lkfVwiPlxuICAgICAgICBgO1xuICAgIGNvbnN0IG5ld19lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuZXdfZWxlbWVudC5jbGFzc05hbWUgPSBcInJhbmdlSG9sZGVyXCI7XG4gICAgbmV3X2VsZW1lbnQuaW5uZXJIVE1MID0gaHRtbF9zdHJpbmc7XG4gICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdfZWxlbWVudCk7XG4gICAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2xpZGVyX2lkKTtcbiAgICBpZiAoc2xpZGVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmluZCB0aGUgc2xpZGVyIHdlIGp1c3QgbWFkZS4uLlwiKTtcbiAgICBzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB0aGVfc2xpZGVyID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBpZiAodGhlX3NsaWRlciA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRhcmdldCB3YXMgbnVsbCwgZGlkIGl0cyBvd24gZWxlbWVudCBnZXQgZGVsZXRlZCB1bmRlcm5lYXRoIGl0c2VsZj9cIik7XG4gICAgICAgIGNvbnN0IHNsaWRlcl9udW1iZXIgPSBOdW1iZXIodGhlX3NsaWRlci52YWx1ZSk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl90ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFyYWdyYXBoX2lkKTtcbiAgICAgICAgaWYgKHNsaWRlcl90ZXh0ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjb3VsZCBub3QgZmluZCBzbGlkZXJfdGV4dCAke3BhcmFncmFwaF9pZH1gKTtcbiAgICAgICAgc2xpZGVyX3RleHQudGV4dENvbnRlbnQgPSBgJHtwYXJhZ3JhcGhfdGV4dH06ICR7c2xpZGVyX251bWJlcn1gO1xuICAgICAgICBzZXRfcHJvcGVydHkobmFtZSwgc2xpZGVyX251bWJlcik7XG4gICAgfSk7XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgICAgICAgTWFrZSBhIHNsaWRlciBmb3IgYW4gaW50XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gbWFrZV9pbnRfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIG5hbWUsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KSB7XG4gICAgY29uc3QgaWQgPSBgc2xpZGVyXyR7bmFtZX1gO1xuICAgIGNvbnN0IHBhcmFfaWQgPSBgJHtpZH1fcGFyYWdyYXBoYDtcbiAgICBjb25zdCBwYXJhZ3JhcGhfdGV4dCA9IGAke25hbWUucmVwbGFjZSgvXy9nLCBcIiBcIil9YDtcbiAgICBjb25zdCBodG1sX3N0cmluZyA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJzbGlkZXJLZXlcIiBpZD1cIiR7cGFyYV9pZH1cIj5cbiAgICAgICAgICAgICR7cGFyYWdyYXBoX3RleHR9OiAke3Byb3BlcnR5X3N0cnVjdC5pbnRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21pbn1cIiBtYXg9XCIke3Byb3BlcnR5X3N0cnVjdC5pbnRfcmFuZ2VfbWF4fVwiIHZhbHVlPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHR9XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7aWR9XCI+XG4gICAgICAgIGA7XG4gICAgY29uc3QgbmV3X3RoaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuZXdfdGhpbmcuY2xhc3NOYW1lID0gXCJyYW5nZUhvbGRlclwiO1xuICAgIG5ld190aGluZy5pbm5lckhUTUwgPSBodG1sX3N0cmluZztcbiAgICBzbGlkZXJfY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld190aGluZyk7XG4gICAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBmaW5kIHRoZSBzbGlkZXJcIik7XG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgdGhlX3NsaWRlciA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKHRoZV9zbGlkZXIgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUYXJnZXQgd2FzIG51bGwsIGRpZCBpdHMgb3duIGVsZW1lbnQgZ2V0IGRlbGV0ZWQgdW5kZXJuZWF0aCBpdHNlbGY/XCIpO1xuICAgICAgICBjb25zdCBzbGlkZXJfbnVtYmVyID0gTnVtYmVyKHRoZV9zbGlkZXIudmFsdWUpO1xuICAgICAgICBjb25zdCBzbGlkZXJfdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcmFfaWQpO1xuICAgICAgICBpZiAoc2xpZGVyX3RleHQgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNvdWxkIG5vdCBmaW5kIHNsaWRlcl90ZXh0ICR7cGFyYV9pZH1gKTtcbiAgICAgICAgc2xpZGVyX3RleHQudGV4dENvbnRlbnQgPSBgJHtwYXJhZ3JhcGhfdGV4dH06ICR7c2xpZGVyX251bWJlcn1gO1xuICAgICAgICBzZXRfcHJvcGVydHkobmFtZSwgc2xpZGVyX251bWJlcik7XG4gICAgfSk7XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgIE1ha2UgYSBzbGlkZXIgZm9yIGFuIGJvb2xlYW4gdG9nZ2xlXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gbWFrZV9ib29sX3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IGlkID0gYHNsaWRlcl8ke25hbWV9YDtcbiAgICBjb25zdCBwYXJhZ3JhcGhfdGV4dCA9IGAke25hbWUucmVwbGFjZSgvXy9nLCBcIiBcIil9YDtcbiAgICBjb25zdCBodG1sX3N0cmluZyA9IGBcbiAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICR7cHJvcGVydHlfc3RydWN0LmJvb2xfZGVmYXVsdCA/IFwiY2hlY2tlZFwiIDogXCJcIn0gY2xhc3M9XCJjaGVja2JveF90b2dnbGVcIiBpZD1cIiR7aWR9XCI+XG4gICAgICAgIDxsYWJlbCBmb3I9XCIke2lkfVwiIGNsYXNzPVwiY2hlY2tib3hfdG9nZ2xlX2xhYmVsXCI+JHtwYXJhZ3JhcGhfdGV4dH08L2xhYmVsPlxuICAgICAgICBgO1xuICAgIGNvbnN0IG5ld190aGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmV3X3RoaW5nLmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICBuZXdfdGhpbmcuaW5uZXJIVE1MID0gaHRtbF9zdHJpbmc7XG4gICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdfdGhpbmcpO1xuICAgIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoc2xpZGVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmluZCB0aGUgc2xpZGVyXCIpO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFyZ2V0IHdhcyBudWxsLCBkaWQgb3duIG93biBlbGVtZW50IGdldCBkZWxldGVkP1wiKTtcbiAgICAgICAgc2V0X3Byb3BlcnR5KG5hbWUsIHRoZV9zbGlkZXIuY2hlY2tlZCk7XG4gICAgfSk7XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgSGVscGVyIGZ1bmN0aW9uc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiB0YWdfcHJvcF90b19wYXJ0cyhwcm9wKSB7XG4gICAgY29uc3QgW2xlZnQsIHJpZ2h0X3dpdGhfanVua10gPSBwcm9wLnNwbGl0KFwiOlwiKTtcbiAgICBjb25zdCByaWdodCA9IHJpZ2h0X3dpdGhfanVuay5zbGljZSgxLCByaWdodF93aXRoX2p1bmsubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIFtsZWZ0LCByaWdodF07XG59XG47XG5mdW5jdGlvbiBwYXJzZV9ib29sKHMpIHtcbiAgICAvLyAxLCB0LCBULCBUUlVFLCB0cnVlLCBUcnVlLFxuICAgIC8vIDAsIGYsIEYsIEZBTFNFLCBmYWxzZSwgRmFsc2VcbiAgICBzd2l0Y2ggKHMpIHtcbiAgICAgICAgY2FzZSBcIjFcIjpcbiAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgY2FzZSBcIlRSVUVcIjpcbiAgICAgICAgY2FzZSBcInRydWVcIjpcbiAgICAgICAgY2FzZSBcIlRydWVcIjoge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIjBcIjpcbiAgICAgICAgY2FzZSBcImZcIjpcbiAgICAgICAgY2FzZSBcIkZcIjpcbiAgICAgICAgY2FzZSBcIkZBTFNFXCI6XG4gICAgICAgIGNhc2UgXCJmYWxzZVwiOlxuICAgICAgICBjYXNlIFwiRmFsc2VcIjoge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzdHJpbmcgaW4gcGFyc2VCb29sLCB3YXMgJHtzfWApO1xuICAgIH1cbn1cbjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHR5cGVzY3JpcHQgZ2x1ZSBjb2RlLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XG5jb25zdCBzZXR1cF9zbGlkZXJzXzEgPSByZXF1aXJlKFwiLi9zZXR1cF9zbGlkZXJzXCIpO1xuLy8gY29vbCB0cmlja1xuY29uc3QgSU5fREVWX01PREUgPSAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09IFwibG9jYWxob3N0XCIpO1xuO1xuO1xuLy8gTk9URSB3ZSBrZWVwIHRoZSBAdHMtaWdub3JlJ3MgaW4gaGVyZVxuYXN5bmMgZnVuY3Rpb24gZ2V0X2dvX2Z1bmN0aW9ucygpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgZ28gPSBuZXcgR28oKTsgLy8gTk9URSB0aGlzIGNvbWVzIGZyb20gdGhlIHdhc21fZXhlYy5qcyB0aGluZ1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGZldGNoKFwiZGlzdC9ib2lkLndhc21cIiksIGdvLmltcG9ydE9iamVjdCk7XG4gICAgZ28ucnVuKHJlc3VsdC5pbnN0YW5jZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBzZXRfcHJvcGVydGllczogU2V0UHJvcGVydGllcyxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnZXRfcHJvcGVydGllczogR2V0UHJvcGVydGllcyxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnZXRfbmV4dF9mcmFtZTogR2V0TmV4dEZyYW1lLFxuICAgIH07XG59XG47XG47XG47XG47XG47XG5jb25zdCBtb3VzZSA9IHtcbiAgICBwb3M6IHsgeDogMCwgeTogMCB9LFxuICAgIGxlZnRfZG93bjogZmFsc2UsXG4gICAgbWlkZGxlX2Rvd246IGZhbHNlLFxuICAgIHJpZ2h0X2Rvd246IGZhbHNlLFxufTtcbmZ1bmN0aW9uIGRvbV9yZWN0X3RvX3JlY3QoZG9tX3JlY3QpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBkb21fcmVjdC54LFxuICAgICAgICB5OiBkb21fcmVjdC55LFxuICAgICAgICB3OiBkb21fcmVjdC53aWR0aCxcbiAgICAgICAgLy8gdG8gYWNjb3VudCBmb3IgbGV0dGVycyBsaWtlICdqJ1xuICAgICAgICBoOiBkb21fcmVjdC5oZWlnaHQgKyA1LFxuICAgIH07XG59XG47XG5mdW5jdGlvbiBnZXRfYWxsX2NvbGxpZGFibGVfcmVjdHMoKSB7XG4gICAgY29uc3QgQ0xBU1MgPSBcImNvbGxpZGVcIjtcbiAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoQ0xBU1MpO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRzW2ldO1xuICAgICAgICBjb25zdCBkb21fcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGRvbV9yZWN0X3RvX3JlY3QoZG9tX3JlY3QpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbjtcbmZ1bmN0aW9uIHJlbmRlcl9ib2lkcyhkaXNwbGF5LCBnbykge1xuICAgIC8vIHdlIGdldCB0aGUgYm91bmRpbmcgcmVjdGFuZ2xlcyBvZiBlbGVtZW50cyBpbiB0aGUgZG9jdW1lbnQsXG4gICAgLy9cbiAgICAvLyB3ZSBDT1VMRCBoYXZlIGp1c3QgcmVuZGVyZWQgdGhlIHRleHQgb3Vyc2VsdmVzLCAod2l0aCAuZmlsbFRleHQoKSlcbiAgICAvLyBidXQgaSB3YW50IHRoZSB1c2VyIHRvIGJlIGFibGUgdG8gc2VsZWN0IHRoZSBlbWFpbCB0ZXh0LlxuICAgIC8vXG4gICAgLy8gbWF5YmUgd2hlbiB0aGF0IGVtYWlsIHRleHQgaXMgbW92ZXMgc29tZXdoZXJlIGVsc2Ugd2UgY291bGQgaGF2ZSBhbGxcbiAgICAvLyB0aGUgYm9pZCB0ZXh0IHJlbmRlcmVkIGJ5IHRoZSBib2lkIHNpbSBpdHNlbGYuXG4gICAgLy9cbiAgICAvLyBhbHRob3VnaCB0aGF0IG1pZ2h0IGludHJvZHVjZSBpc3N1ZXMgd2hlbiB0aGUgYm9pZCB3YXNtIGhhc24ndCBsb2FkZWQuXG4gICAgY29uc3QgY29sbGlkYWJsZV9yZWN0YW5nbGVzID0gZ2V0X2FsbF9jb2xsaWRhYmxlX3JlY3RzKCk7XG4gICAgY29uc3QgQk9JRF9DQU5WQVNfU1FVSVNIX0ZBQ1RPUiA9IDE7XG4gICAgLy8gdGhpcyBpcyB0aGUgY2FudmFzIHRoYXQgdGhlIHdhc20gaXMgZ29pbmcgdG8gZHJhdyBpbnRvLlxuICAgIC8vXG4gICAgLy8gYmFzZWQgb24gdGhlIHJlbmRlciBjYW52YXMgZm9yIG5vdy5cbiAgICAvL1xuICAgIC8vIHVzaW5nIHNxdWlzaCBmYWN0b3IsIHdlIGNhbiBjaGFuZ2UgdGhlIHJlbmRlcmluZyBzaXplIG9mIHRoZSBib2lkIGltYWdlIHdlIGp1c3QgZ290LlxuICAgIC8vIFRPRE8gd2hlbiBzcXVpc2hlZCwgbW91c2UgaW5wdXQgZG9zZSBub3Qgd29yayByaWdodC5cbiAgICBjb25zdCBib2lkX2NhbnZhc193aWR0aCA9IC8qIDE2KjI1OyAqLyBNYXRoLmZsb29yKGRpc3BsYXkucmVuZGVyX2N0eC5jYW52YXMud2lkdGggLyBCT0lEX0NBTlZBU19TUVVJU0hfRkFDVE9SKTtcbiAgICBjb25zdCBib2lkX2NhbnZhc19oZWlnaHQgPSAvKiAgOSoyNTsgKi8gTWF0aC5mbG9vcihkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLmhlaWdodCAvIEJPSURfQ0FOVkFTX1NRVUlTSF9GQUNUT1IpO1xuICAgIC8vIFtyLCBnLCBiLCBhXSwgbm90IG5lY2Vzc2FyaWx5IGluIHRoYXQgb3JkZXJcbiAgICBjb25zdCBOVU1fQ09MT1JfQ09NUE9ORU5UUyA9IDQ7XG4gICAgY29uc3QgYnVmZmVyX3NpemUgPSBib2lkX2NhbnZhc193aWR0aCAqIGJvaWRfY2FudmFzX2hlaWdodCAqIE5VTV9DT0xPUl9DT01QT05FTlRTO1xuICAgIC8vIHJlc2l6ZSBiYWNrIGJ1ZmZlciBpZiBjYW52YXMgc2l6ZSBjaGFuZ2VkLlxuICAgIGlmIChkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoICE9PSBib2lkX2NhbnZhc193aWR0aCB8fCBkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCAhPT0gYm9pZF9jYW52YXNfaGVpZ2h0KSB7XG4gICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkdlbmVyYWwsIFwiT2ggZ29kLiB3ZXJlIHJlc2l6aW5nIHRoZSBidWZmZXJcIik7XG4gICAgICAgIGlmIChkaXNwbGF5LmJhY2tfYnVmZmVyX2FycmF5Lmxlbmd0aCA8IGJ1ZmZlcl9zaXplKSB7XG4gICAgICAgICAgICAoMCwgbG9nZ2VyXzEubG9nKShsb2dnZXJfMS5Mb2dfVHlwZS5HZW5lcmFsLCBcIkJhY2sgYnVmZmVyIGFycmF5IGdldHRpbmcgYmlnZ2VyXCIpOyAvLyBteSBwZW5pc1xuICAgICAgICAgICAgLy8gbWFrZSB0aGUgYnVmZmVyIGJpZ2dlclxuICAgICAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9hcnJheSA9IG5ldyBVaW50OENsYW1wZWRBcnJheShidWZmZXJfc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmFja19jYW52YXMgPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKGJvaWRfY2FudmFzX3dpZHRoLCBib2lkX2NhbnZhc19oZWlnaHQpO1xuICAgICAgICBjb25zdCBiYWNrX2N0eCA9IGJhY2tfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgaWYgKGJhY2tfY3R4ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHggPSBiYWNrX2N0eDtcbiAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoID0gYm9pZF9jYW52YXNfd2lkdGg7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0ID0gYm9pZF9jYW52YXNfaGVpZ2h0O1xuICAgIH1cbiAgICBjb25zdCBidWZmZXIgPSBkaXNwbGF5LmJhY2tfYnVmZmVyX2FycmF5LnN1YmFycmF5KDAsIGJ1ZmZlcl9zaXplKTtcbiAgICBjb25zdCBhcmdzID0ge1xuICAgICAgICB3aWR0aDogYm9pZF9jYW52YXNfd2lkdGgsXG4gICAgICAgIGhlaWdodDogYm9pZF9jYW52YXNfaGVpZ2h0LFxuICAgICAgICBidWZmZXI6IGJ1ZmZlcixcbiAgICAgICAgbW91c2U6IG1vdXNlLFxuICAgICAgICByZWN0YW5nbGVzOiBjb2xsaWRhYmxlX3JlY3RhbmdsZXMsXG4gICAgfTtcbiAgICBjb25zdCBudW1fYnl0ZXNfZmlsbGVkID0gZ28uZ2V0X25leHRfZnJhbWUoYXJncyk7XG4gICAgaWYgKG51bV9ieXRlc19maWxsZWQgIT09IGJ1ZmZlcl9zaXplKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGdvLmdldF9uZXh0X2ZyYW1lIGdvdCBpbmNvcnJlY3QgbnVtYmVyIG9mIGJ5dGVzLCB3YW50ZWQ6ICR7YnVmZmVyX3NpemV9LCBnb3Q6ICR7bnVtX2J5dGVzX2ZpbGxlZH1gKTtcbiAgICAvLyBAdHMtaWdub3JlIC8vIHdoeSBkb3NlIHRoaXMgbGluZSBtYWtlIGFuIGVycm9yIGluIG15IGVkaXRvclxuICAgIGNvbnN0IGltYWdlX2RhdGEgPSBuZXcgSW1hZ2VEYXRhKGJ1ZmZlciwgYm9pZF9jYW52YXNfd2lkdGgsIGJvaWRfY2FudmFzX2hlaWdodCk7XG4gICAgLy8gaXMgdGhpcyBjb29sP1xuICAgIC8vXG4gICAgLy8gdGhlIHdob2xlIHBvaW50IG9mIHRoaXMgYmFja19idWZmZXIgaXMgdG8gcHJldmVudCBmbGlja2VyaW5nIGFuZFxuICAgIC8vIHN0dWZmLCBidWYgaWYgd2VyZSBvbmx5IGdvaW5nIHRvIGJlIGRyYXdpbmcgb25lIHRoaW5nLi4uXG4gICAgLy8gd2hhdHMgdGhlIHBvaW50P1xuICAgIGRpc3BsYXkuYmFja19idWZmZXJfcmVuZGVyX2N0eC5wdXRJbWFnZURhdGEoaW1hZ2VfZGF0YSwgMCwgMCk7XG4gICAgLy8gTk9URSB0aGlzIHdpbGwgc3RyZXRjaCB0aGUgdGhpbmcuXG4gICAgLy8gY2FudmFzLndpZHRoIG1pZ2h0IGNoYW5nZSBkdXJpbmcgdGhlIHRpbWUgdGhpcyBpcyBydW5uaW5nXG4gICAgZGlzcGxheS5yZW5kZXJfY3R4LmRyYXdJbWFnZShkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHguY2FudmFzLCAwLCAwLCBkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLndpZHRoLCBkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLmhlaWdodCk7XG4gICAgLy8gbGV0cyBob3BlIGphdmFzY3JpcHQgaXMgc21hcnQgZW5vdWdoIHRvIGRlYWxsb2NhdGUgdGhpcy4uLlxuICAgIC8vIGltYWdlRGF0YSA9IG51bGxcbn1cbjtcbi8vIFRPRE8gbWFrZSB0aGlzIHNtYXJ0ZXIuXG5jb25zdCByZW5kZXJfdGltZXMgPSBbXTtcbmNvbnN0IGRlbHRhX3RpbWVzID0gW107XG4vLyBDcmVkaXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS90c29kaW5nL2tvaWxcbi8vIFxuLy8gVE9ETyByZW1vdmUgbmV3X3JlbmRlcl90aW1lLCBhbmQgbmV3X2RlbHRhX3RpbWUsIGp1c3QgbWFrZSBhIGNsYXNzIG9yIHNvbWV0aGluZy5cbmZ1bmN0aW9uIHJlbmRlcl9kZWJ1Z19pbmZvKGRpc3BsYXksIG5ld19yZW5kZXJfdGltZSwgbmV3X2RlbHRhX3RpbWUpIHtcbiAgICBjb25zdCBGT05UX1NJWkUgPSAyODtcbiAgICBkaXNwbGF5LnJlbmRlcl9jdHguZm9udCA9IGAke0ZPTlRfU0laRX1weCBib2xkYDtcbiAgICByZW5kZXJfdGltZXMucHVzaChuZXdfcmVuZGVyX3RpbWUpO1xuICAgIGlmIChyZW5kZXJfdGltZXMubGVuZ3RoID4gNjApIHtcbiAgICAgICAgcmVuZGVyX3RpbWVzLnNoaWZ0KCk7XG4gICAgfVxuICAgIGRlbHRhX3RpbWVzLnB1c2gobmV3X2RlbHRhX3RpbWUpO1xuICAgIGlmIChkZWx0YV90aW1lcy5sZW5ndGggPiA2MCkge1xuICAgICAgICBkZWx0YV90aW1lcy5zaGlmdCgpO1xuICAgIH1cbiAgICBjb25zdCByZW5kZXJfYXZnID0gcmVuZGVyX3RpbWVzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gcmVuZGVyX3RpbWVzLmxlbmd0aDtcbiAgICBjb25zdCBkZWx0YV9hdmcgPSBkZWx0YV90aW1lcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIGRlbHRhX3RpbWVzLmxlbmd0aDtcbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcbiAgICB7IC8vIGNvbnN0cnVjdCB0aGUgbGFiZWxzLlxuICAgICAgICAvLyB0aGlzIGlzIHRoZSBvbmx5IHVuaXF1ZSB0aGluZ3MgYmV0d2VlbiByZW5kZXJfdGltZXMgYW5kIGRlbHRhX3RpbWVzXG4gICAgICAgIGNvbnN0IGZyYW1lc19wZXJfc2Vjb25kID0gKDEgLyBkZWx0YV9hdmcgKiAxMDAwKS50b0ZpeGVkKDIpO1xuICAgICAgICBjb25zdCBzZWNvbmRzX3Blcl9mcmFtZSA9IChkZWx0YV9hdmcgLyAxMDAwKS50b0ZpeGVkKDUpO1xuICAgICAgICBsYWJlbHMucHVzaChgRi9TOiAke2ZyYW1lc19wZXJfc2Vjb25kfSAgICBTL0Y6ICR7c2Vjb25kc19wZXJfZnJhbWV9YCk7XG4gICAgICAgIGxhYmVscy5wdXNoKGBXQVNNIFJlbmRlciBUaW1lIEF2ZyAobXMpOiAke3JlbmRlcl9hdmcudG9GaXhlZCgyKX1gKTtcbiAgICAgICAgbGFiZWxzLnB1c2goYFJlbmRlci9TZWMgKE1BWCk6ICR7KDEgLyByZW5kZXJfYXZnICogMTAwMCkudG9GaXhlZCgyKX1gKTtcbiAgICB9XG4gICAgY29uc3QgUEFERElORyA9IDcwO1xuICAgIGNvbnN0IFNIQURPV19PRkZTRVQgPSBGT05UX1NJWkUgKiAwLjA2O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsVGV4dChsYWJlbHNbaV0sIFBBRERJTkcsIFBBRERJTkcgKyBGT05UX1NJWkUgKiBpKTtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxUZXh0KGxhYmVsc1tpXSwgUEFERElORyArIFNIQURPV19PRkZTRVQsIFBBRERJTkcgLSBTSEFET1dfT0ZGU0VUICsgRk9OVF9TSVpFICogaSk7XG4gICAgfVxufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgICAgVGhlIE1haW4gRnVuY3Rpb25cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4oYXN5bmMgKCkgPT4ge1xuICAgIGlmIChJTl9ERVZfTU9ERSlcbiAgICAgICAgY29uc29sZS5sb2coXCJJbiBEZXYgTW9kZVwiKTtcbiAgICBjb25zdCBnbyA9IGF3YWl0IGdldF9nb19mdW5jdGlvbnMoKTtcbiAgICB7IC8vIEhhbmRsZSBzbGlkZXIgc3R1ZmZcbiAgICAgICAgY29uc3QgYm9pZF9wcm9wZXJ0aWVzID0gT2JqZWN0LmVudHJpZXMoZ28uZ2V0X3Byb3BlcnRpZXMoKSk7XG4gICAgICAgIGlmIChib2lkX3Byb3BlcnRpZXMubGVuZ3RoID09IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBwcm9wZXJ0aWVzIHdoZXJlIGdpdmVuIHRvIGphdmFzY3JpcHQhXCIpO1xuICAgICAgICBmdW5jdGlvbiBzZXRfcHJvcGVydHkobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyNzEwOTA1L2hvdy1kby1pLWR5bmFtaWNhbGx5LWFzc2lnbi1wcm9wZXJ0aWVzLXRvLWFuLW9iamVjdC1pbi10eXBlc2NyaXB0XG4gICAgICAgICAgICBjb25zdCBvYmogPSB7fTtcbiAgICAgICAgICAgIG9ialtuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgZ28uc2V0X3Byb3BlcnRpZXMob2JqKTtcbiAgICAgICAgfVxuICAgICAgICA7XG4gICAgICAgIC8vIFRPRE8gbWF5YmUgbWFrZSB0aGlzIGRldiBtb2RlIG9ubHkuLi5cbiAgICAgICAgLy8gaXQgYWxzbyBoYXMgdG8gcmVtb3ZlIHRoZSBTZXR0aW5ncyB0aGluZy4uLlxuICAgICAgICAoMCwgc2V0dXBfc2xpZGVyc18xLnNldHVwX3NsaWRlcnMpKGJvaWRfcHJvcGVydGllcywgc2V0X3Byb3BlcnR5KTtcbiAgICB9XG4gICAgeyAvLyBzZXR1cCBpbnB1dCBoYW5kbGluZy5cbiAgICAgICAgLy8gd2h5IGRvZXNuJ3QgdHlwZXNjcmlwdCBoYXZlIGFuIGVudW0gZm9yIHRoaXM/XG4gICAgICAgIGxldCBNb3VzZV9CdXR0b25zO1xuICAgICAgICAoZnVuY3Rpb24gKE1vdXNlX0J1dHRvbnMpIHtcbiAgICAgICAgICAgIE1vdXNlX0J1dHRvbnNbTW91c2VfQnV0dG9uc1tcIkxlZnRcIl0gPSAwXSA9IFwiTGVmdFwiO1xuICAgICAgICAgICAgTW91c2VfQnV0dG9uc1tNb3VzZV9CdXR0b25zW1wiTWlkZGxlXCJdID0gMV0gPSBcIk1pZGRsZVwiO1xuICAgICAgICAgICAgTW91c2VfQnV0dG9uc1tNb3VzZV9CdXR0b25zW1wiUmlnaHRcIl0gPSAyXSA9IFwiUmlnaHRcIjtcbiAgICAgICAgfSkoTW91c2VfQnV0dG9ucyB8fCAoTW91c2VfQnV0dG9ucyA9IHt9KSk7XG4gICAgICAgIDtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmdldFJvb3ROb2RlKCk7XG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBtb3VzZS5wb3MgPSB7IHg6IGV2LngsIHk6IGV2LnkgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHRoaXMgd2lsbCBicmVhayBpZiB0aGUgdXNlciBzbGlkZXMgdGhlcmUgbW91c2Ugb3V0c2lkZSBvZiB0aGUgc2NyZWVuIHdoaWxlIGNsaWNraW5nLCBidXQgdGhpcyBpcyB0aGUgd2ViLCBwZW9wbGUgZXhwZWN0IGl0IHRvIHN1Y2suXG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuTGVmdClcbiAgICAgICAgICAgICAgICBtb3VzZS5sZWZ0X2Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLk1pZGRsZSlcbiAgICAgICAgICAgICAgICBtb3VzZS5taWRkbGVfZG93biA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuUmlnaHQpXG4gICAgICAgICAgICAgICAgbW91c2UucmlnaHRfZG93biA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZXYpID0+IHtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5MZWZ0KVxuICAgICAgICAgICAgICAgIG1vdXNlLmxlZnRfZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLk1pZGRsZSlcbiAgICAgICAgICAgICAgICBtb3VzZS5taWRkbGVfZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLlJpZ2h0KVxuICAgICAgICAgICAgICAgIG1vdXNlLnJpZ2h0X2Rvd24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNvbnN0IGNhbnZhc19jb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc19kaXZcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsXG4gICAgY29uc3QgYm9pZF9jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvaWRfY2FudmFzXCIpO1xuICAgIGlmIChib2lkX2NhbnZhcyA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gY2FudmFzIHdpdGggaWQgYGJvaWRfY2FudmFzYCBpcyBmb3VuZFwiKTtcbiAgICAvLyBUT0RPIG5hbWluZyBiZXR0ZXIsIHVzZSBzbmFrZSBjYXNlIGV2ZXJ5d2hlcmUhIVxuICAgIGNvbnN0IGJvaWRfY2FudmFzX3JlbmRlcl9jdHggPSBib2lkX2NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgaWYgKGJvaWRfY2FudmFzX3JlbmRlcl9jdHggPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIjJEIGNvbnRleHQgaXMgbm90IHN1cHBvcnRlZFwiKTtcbiAgICBib2lkX2NhbnZhc19yZW5kZXJfY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIGNvbnN0IFtiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCwgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0XSA9IFtib2lkX2NhbnZhc19yZW5kZXJfY3R4LmNhbnZhcy53aWR0aCwgYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5jYW52YXMuaGVpZ2h0XTtcbiAgICBjb25zdCBiYWNrX2J1ZmZlcl9jYW52YXMgPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKGJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoLCBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQpO1xuICAgIGNvbnN0IGJhY2tfYnVmZmVyX3JlbmRlcl9jdHggPSBiYWNrX2J1ZmZlcl9jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIGlmIChiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4ID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIyRCBjb250ZXh0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgYmFja19idWZmZXJfcmVuZGVyX2N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICBjb25zdCBiYWNrX2J1ZmZlcl9hcnJheSA9IG5ldyBVaW50OENsYW1wZWRBcnJheShiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCAqIGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCAqIDQpO1xuICAgIGNvbnN0IGRpc3BsYXkgPSB7XG4gICAgICAgIHJlbmRlcl9jdHg6IGJvaWRfY2FudmFzX3JlbmRlcl9jdHgsXG4gICAgICAgIGJhY2tfYnVmZmVyX3JlbmRlcl9jdHg6IGJhY2tfYnVmZmVyX3JlbmRlcl9jdHgsXG4gICAgICAgIGJhY2tfYnVmZmVyX2FycmF5OiBiYWNrX2J1ZmZlcl9hcnJheSxcbiAgICAgICAgYmFja19idWZmZXJfaW1hZ2Vfd2lkdGg6IGJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoLFxuICAgICAgICBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQ6IGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCxcbiAgICB9O1xuICAgIGxldCBwcmV2X3RpbWVzdGFtcCA9IDA7XG4gICAgY29uc3QgZnJhbWUgPSAodGltZXN0YW1wKSA9PiB7XG4gICAgICAgIGJvaWRfY2FudmFzX3JlbmRlcl9jdHguY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGJvaWRfY2FudmFzX3JlbmRlcl9jdHguY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgY29uc3QgZGVsdGFfdGltZSA9ICh0aW1lc3RhbXAgLSBwcmV2X3RpbWVzdGFtcCk7XG4gICAgICAgIHByZXZfdGltZXN0YW1wID0gdGltZXN0YW1wO1xuICAgICAgICAvLyBUT0RPIERvbid0IG5lZWQgZGVsdGEgdGltZSwgYm9pZCB0aGluZyBkb3NlIGl0IGZvciB1cz8gY2hhbmdlP1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHJlbmRlcl9ib2lkcyhkaXNwbGF5LCBnbyk7XG4gICAgICAgIGNvbnN0IGVuZF90aW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIC8vIEluIG1zXG4gICAgICAgIGNvbnN0IHJlbmRlcl90aW1lID0gZW5kX3RpbWUgLSBzdGFydF90aW1lO1xuICAgICAgICBpZiAobG9nZ2VyXzEuREVCVUdfRElTUExBWSAmJiBJTl9ERVZfTU9ERSlcbiAgICAgICAgICAgIHJlbmRlcl9kZWJ1Z19pbmZvKGRpc3BsYXksIHJlbmRlcl90aW1lLCBkZWx0YV90aW1lKTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gICAgfTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCh0aW1lc3RhbXApID0+IHtcbiAgICAgICAgcHJldl90aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgIH0pO1xufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==