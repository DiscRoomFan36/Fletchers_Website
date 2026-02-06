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
var Property_Type;
(function (Property_Type) {
    Property_Type[Property_Type["None"] = 0] = "None";
    Property_Type[Property_Type["Property_Float"] = 1] = "Property_Float";
    Property_Type[Property_Type["Property_Int"] = 2] = "Property_Int";
    Property_Type[Property_Type["Property_Bool"] = 3] = "Property_Bool";
})(Property_Type || (Property_Type = {}));
;
class Property_Struct {
    constructor() {
        this.property_type = Property_Type.None;
        // Float properties
        this.float_range_min = 0;
        this.float_range_max = 0;
        this.float_default = 0;
        // Int properties
        this.int_range_min = 0;
        this.int_range_max = 0;
        this.int_default = 0;
        this.bool_default = false;
    }
}
;
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
        const [prop_property, prop_type] = tag_prop_to_parts(tag_split[0]);
        if (prop_property != "Property")
            throw new Error(`First property is not property, tag was ${tag}`);
        const property_struct = new Property_Struct();
        switch (prop_type) {
            case "float":
                {
                    property_struct.property_type = Property_Type.Property_Float;
                }
                break;
            case "int":
                {
                    property_struct.property_type = Property_Type.Property_Int;
                }
                break;
            case "bool":
                {
                    property_struct.property_type = Property_Type.Property_Bool;
                }
                break;
            default: throw new Error(`Unknown prop type ${prop_type}`);
        }
        tag_split.shift();
        while (tag_split.length > 0) {
            const next_tag = tag_split.shift();
            if (next_tag === undefined)
                throw new Error("Not Possible");
            const [left, right] = tag_prop_to_parts(next_tag);
            switch (left) {
                case "Range":
                    switch (property_struct.property_type) {
                        case Property_Type.Property_Float:
                            {
                                const [min_s, max_s] = right.split(";");
                                property_struct.float_range_min = parseFloat(min_s);
                                property_struct.float_range_max = parseFloat(max_s);
                            }
                            break;
                        case Property_Type.Property_Int:
                            {
                                const [min_s, max_s] = right.split(";");
                                property_struct.int_range_min = parseInt(min_s);
                                property_struct.int_range_max = parseInt(max_s);
                            }
                            break;
                        case Property_Type.Property_Bool: throw new Error("Boolean dose not have a range!");
                        default: throw new Error(`Unknown type in ${name}`);
                    }
                    break;
                case "Default":
                    switch (property_struct.property_type) {
                        case Property_Type.Property_Float:
                            {
                                property_struct.float_default = parseFloat(right);
                            }
                            break;
                        case Property_Type.Property_Int:
                            {
                                property_struct.int_default = parseInt(right);
                            }
                            break;
                        case Property_Type.Property_Bool:
                            {
                                property_struct.bool_default = parse_bool(right);
                            }
                            break;
                        default: throw new Error(`Unknown type in ${name}`);
                    }
                    break;
                default: throw new Error(`Unknown property ${left}`);
            }
        }
        // TODO some way to print an object.
        // log(Log_Type.Debug_Sliders, `property struct ${property_struct}`);
        switch (property_struct.property_type) {
            case Property_Type.Property_Float:
                {
                    make_float_slider(slider_container, name, property_struct, set_property);
                }
                break;
            case Property_Type.Property_Int:
                {
                    make_int_slider(slider_container, name, property_struct, set_property);
                }
                break;
            case Property_Type.Property_Bool:
                {
                    make_bool_slider(slider_container, name, property_struct, set_property);
                }
                break;
            default: throw new Error(`Unknown property type ${property_struct.property_type}`);
        }
    }
}
;
///////////////////////////////////////////////
//         Make a slider for an float
///////////////////////////////////////////////
function make_float_slider(slider_container, name, property_struct, set_property) {
    const id = `slider_${name}`;
    const para_id = `${id}_paragraph`;
    const paragraph_text = `${name.replace(/_/g, " ")}`;
    const html_string = `
        <p class="sliderKey" id="${para_id}">
            ${paragraph_text}: ${property_struct.float_default}
        </p>
        <input type="range" min="${property_struct.float_range_min}" max="${property_struct.float_range_max}" value="${property_struct.float_default}" step="0.005" class="slider" id="${id}">
        `;
    const new_thing = document.createElement("div");
    new_thing.className = "rangeHolder";
    new_thing.innerHTML = html_string;
    slider_container.appendChild(new_thing);
    const slider = document.getElementById(id);
    if (slider === null)
        throw new Error("Could not find the slider");
    slider.addEventListener("input", (event) => {
        const slider_value_string = event.target.value;
        const slider_number = Number(slider_value_string);
        const slider_text = document.getElementById(para_id);
        if (slider_text === null)
            throw new Error(`could not find slider_text ${para_id}`);
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
        const slider_value_string = event.target.value;
        const slider_number = Number(slider_value_string);
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
        const target = event.target;
        if (target === null)
            throw new Error("Target was null, did own own element get deleted?");
        set_property(name, target.checked);
    });
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
// [r, g, b, a], not necessarily in that order
const NUM_COLOR_COMPONENTS = 4;
const SQUISH_FACTOR = 1;
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
        width: dom_rect.width,
        // to account for letters like 'j'
        height: dom_rect.height + 5,
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
    const collidable_rectangles = get_all_collidable_rects();
    // using squish factor, we can change the rendering size of the boid image we just got.
    const canvas_width = Math.floor(display.render_ctx.canvas.width / SQUISH_FACTOR);
    const canvas_height = Math.floor(display.render_ctx.canvas.height / SQUISH_FACTOR);
    const buffer_size = canvas_width * canvas_height * NUM_COLOR_COMPONENTS;
    // resize back buffer if canvas size changed.
    if (display.back_buffer_image_width !== canvas_width || display.back_buffer_image_height !== canvas_height) {
        (0, logger_1.log)(logger_1.Log_Type.General, "Oh god. were resizing the buffer");
        if (display.back_buffer_array.length < buffer_size) {
            (0, logger_1.log)(logger_1.Log_Type.General, "Back buffer array getting bigger"); // my penis
            // make the buffer bigger
            display.back_buffer_array = new Uint8ClampedArray(buffer_size);
        }
        const back_canvas = new OffscreenCanvas(canvas_width, canvas_height);
        const back_ctx = back_canvas.getContext("2d");
        if (back_ctx === null)
            throw new Error("2D context is not supported");
        display.back_buffer_render_ctx = back_ctx;
        display.back_buffer_render_ctx.imageSmoothingEnabled = false;
        display.back_buffer_image_width = canvas_width;
        display.back_buffer_image_height = canvas_height;
    }
    const buffer = display.back_buffer_array.subarray(0, buffer_size);
    const args = {
        width: canvas_width,
        height: canvas_height,
        buffer: buffer,
        mouse: mouse,
        rects: collidable_rectangles,
    };
    const num_bytes_filled = go.get_next_frame(args);
    if (num_bytes_filled !== buffer_size)
        throw new Error(`go.get_next_frame got incorrect number of bytes, wanted: ${buffer_size}, got: ${num_bytes_filled}`);
    // @ts-ignore // why dose this line make an error in my editor
    const image_data = new ImageData(buffer, canvas_width, canvas_height);
    // is this cool?
    // 
    // ghe whole point of this back_buffer is to prevent flickering and
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
    const boid_canvas_ctx = boid_canvas.getContext("2d");
    if (boid_canvas_ctx === null)
        throw new Error("2D context is not supported");
    boid_canvas_ctx.imageSmoothingEnabled = false;
    const [back_buffer_image_width, back_buffer_image_height] = [boid_canvas_ctx.canvas.width, boid_canvas_ctx.canvas.height];
    const back_buffer_canvas = new OffscreenCanvas(back_buffer_image_width, back_buffer_image_height);
    const back_buffer_render_ctx = back_buffer_canvas.getContext("2d");
    if (back_buffer_render_ctx === null)
        throw new Error("2D context is not supported");
    back_buffer_render_ctx.imageSmoothingEnabled = false;
    const back_buffer_array = new Uint8ClampedArray(back_buffer_image_width * back_buffer_image_height * 4);
    const display = {
        render_ctx: boid_canvas_ctx,
        back_buffer_render_ctx: back_buffer_render_ctx,
        back_buffer_array: back_buffer_array,
        back_buffer_image_width: back_buffer_image_width,
        back_buffer_image_height: back_buffer_image_height,
    };
    let prev_timestamp = 0;
    const frame = (timestamp) => {
        boid_canvas_ctx.canvas.width = window.innerWidth;
        boid_canvas_ctx.canvas.height = window.innerHeight;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QjtBQUMxQixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYm9pZHMvLi93ZWJfc3JjL2xvZ2dlci50cyIsIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvc2V0dXBfc2xpZGVycy50cyIsIndlYnBhY2s6Ly9ib2lkcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkxvZ19UeXBlID0gZXhwb3J0cy5ERUJVR19TTElERVJTID0gZXhwb3J0cy5ERUJVR19ESVNQTEFZID0gdm9pZCAwO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG4vLyBpcyBpdCBjb3JyZWN0IHRvIGhhdmUgdGhlc2UgaGVyZT8gdGhpcyBvbmUgZWZmZWN0c1xuLy8gZHJhd2luZyBvbiB0aGUgc2NyZWVuLCBub3QganVzdCBsb2dnaW5nPyBhbHRob3VnaCB3ZVxuLy8gY291bGQgbWFrZSBhbGwgbG9ncyBhcHBlYXIgb24gc2NyZWVuLi4uXG5leHBvcnRzLkRFQlVHX0RJU1BMQVkgPSB0cnVlO1xuZXhwb3J0cy5ERUJVR19TTElERVJTID0gZmFsc2U7XG52YXIgTG9nX1R5cGU7XG4oZnVuY3Rpb24gKExvZ19UeXBlKSB7XG4gICAgTG9nX1R5cGVbTG9nX1R5cGVbXCJHZW5lcmFsXCJdID0gMF0gPSBcIkdlbmVyYWxcIjtcbiAgICBMb2dfVHlwZVtMb2dfVHlwZVtcIkRlYnVnX0Rpc3BsYXlcIl0gPSAxXSA9IFwiRGVidWdfRGlzcGxheVwiO1xuICAgIExvZ19UeXBlW0xvZ19UeXBlW1wiRGVidWdfU2xpZGVyc1wiXSA9IDJdID0gXCJEZWJ1Z19TbGlkZXJzXCI7XG59KShMb2dfVHlwZSB8fCAoZXhwb3J0cy5Mb2dfVHlwZSA9IExvZ19UeXBlID0ge30pKTtcbjtcbmZ1bmN0aW9uIGxvZyhsb2dfdHlwZSwgLi4uZGF0YSkge1xuICAgIC8vIGlmIHRoaXMgaXMgdGhlIGVtcHR5IHN0cmluZ1xuICAgIHZhciBkb19sb2cgPSBmYWxzZTtcbiAgICB2YXIgbG9nX2hlYWRlciA9IFwiXCI7XG4gICAgc3dpdGNoIChsb2dfdHlwZSkge1xuICAgICAgICBjYXNlIExvZ19UeXBlLkdlbmVyYWw6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgZG9fbG9nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIExvZ19UeXBlLkRlYnVnX0Rpc3BsYXk6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiREVCVUdfRElTUExBWVwiO1xuICAgICAgICAgICAgICAgIGlmIChleHBvcnRzLkRFQlVHX0RJU1BMQVkpXG4gICAgICAgICAgICAgICAgICAgIGRvX2xvZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBMb2dfVHlwZS5EZWJ1Z19TbGlkZXJzOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvZ19oZWFkZXIgPSBcIkRFQlVHX1NMSURFUlNcIjtcbiAgICAgICAgICAgICAgICBpZiAoZXhwb3J0cy5ERUJVR19TTElERVJTKVxuICAgICAgICAgICAgICAgICAgICBkb19sb2cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChkb19sb2cpIHtcbiAgICAgICAgaWYgKGxvZ19oZWFkZXIgIT0gXCJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7bG9nX2hlYWRlcn06IGAsIC4uLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coLi4uZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG59XG47XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2V0dXBfc2xpZGVycyA9IHNldHVwX3NsaWRlcnM7XG5jb25zdCBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcbnZhciBQcm9wZXJ0eV9UeXBlO1xuKGZ1bmN0aW9uIChQcm9wZXJ0eV9UeXBlKSB7XG4gICAgUHJvcGVydHlfVHlwZVtQcm9wZXJ0eV9UeXBlW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XG4gICAgUHJvcGVydHlfVHlwZVtQcm9wZXJ0eV9UeXBlW1wiUHJvcGVydHlfRmxvYXRcIl0gPSAxXSA9IFwiUHJvcGVydHlfRmxvYXRcIjtcbiAgICBQcm9wZXJ0eV9UeXBlW1Byb3BlcnR5X1R5cGVbXCJQcm9wZXJ0eV9JbnRcIl0gPSAyXSA9IFwiUHJvcGVydHlfSW50XCI7XG4gICAgUHJvcGVydHlfVHlwZVtQcm9wZXJ0eV9UeXBlW1wiUHJvcGVydHlfQm9vbFwiXSA9IDNdID0gXCJQcm9wZXJ0eV9Cb29sXCI7XG59KShQcm9wZXJ0eV9UeXBlIHx8IChQcm9wZXJ0eV9UeXBlID0ge30pKTtcbjtcbmNsYXNzIFByb3BlcnR5X1N0cnVjdCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucHJvcGVydHlfdHlwZSA9IFByb3BlcnR5X1R5cGUuTm9uZTtcbiAgICAgICAgLy8gRmxvYXQgcHJvcGVydGllc1xuICAgICAgICB0aGlzLmZsb2F0X3JhbmdlX21pbiA9IDA7XG4gICAgICAgIHRoaXMuZmxvYXRfcmFuZ2VfbWF4ID0gMDtcbiAgICAgICAgdGhpcy5mbG9hdF9kZWZhdWx0ID0gMDtcbiAgICAgICAgLy8gSW50IHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5pbnRfcmFuZ2VfbWluID0gMDtcbiAgICAgICAgdGhpcy5pbnRfcmFuZ2VfbWF4ID0gMDtcbiAgICAgICAgdGhpcy5pbnRfZGVmYXVsdCA9IDA7XG4gICAgICAgIHRoaXMuYm9vbF9kZWZhdWx0ID0gZmFsc2U7XG4gICAgfVxufVxuO1xuZnVuY3Rpb24gdGFnX3Byb3BfdG9fcGFydHMocHJvcCkge1xuICAgIGNvbnN0IFtsZWZ0LCByaWdodF93aXRoX2p1bmtdID0gcHJvcC5zcGxpdChcIjpcIik7XG4gICAgY29uc3QgcmlnaHQgPSByaWdodF93aXRoX2p1bmsuc2xpY2UoMSwgcmlnaHRfd2l0aF9qdW5rLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBbbGVmdCwgcmlnaHRdO1xufVxuO1xuZnVuY3Rpb24gcGFyc2VfYm9vbChzKSB7XG4gICAgLy8gMSwgdCwgVCwgVFJVRSwgdHJ1ZSwgVHJ1ZSxcbiAgICAvLyAwLCBmLCBGLCBGQUxTRSwgZmFsc2UsIEZhbHNlXG4gICAgc3dpdGNoIChzKSB7XG4gICAgICAgIGNhc2UgXCIxXCI6XG4gICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgIGNhc2UgXCJUUlVFXCI6XG4gICAgICAgIGNhc2UgXCJ0cnVlXCI6XG4gICAgICAgIGNhc2UgXCJUcnVlXCI6IHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCIwXCI6XG4gICAgICAgIGNhc2UgXCJmXCI6XG4gICAgICAgIGNhc2UgXCJGXCI6XG4gICAgICAgIGNhc2UgXCJGQUxTRVwiOlxuICAgICAgICBjYXNlIFwiZmFsc2VcIjpcbiAgICAgICAgY2FzZSBcIkZhbHNlXCI6IHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gc3RyaW5nIGluIHBhcnNlQm9vbCwgd2FzICR7c31gKTtcbiAgICB9XG59XG47XG4vLyBwdXRzIHNvbWUgc2xpZGVycyB1cCB0byBjb250cm9sIHNvbWUgcGFyYW1ldGVyc1xuZnVuY3Rpb24gc2V0dXBfc2xpZGVycyhwcm9wZXJ0aWVzLCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBTTElERVJfQ09OVEFJTkVSX0lEID0gXCJzbGlkZUNvbnRhaW5lclwiO1xuICAgIGNvbnN0IHNsaWRlcl9jb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChTTElERVJfQ09OVEFJTkVSX0lEKTtcbiAgICBpZiAoc2xpZGVyX2NvbnRhaW5lciA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IEdldCBzbGlkZXIgY29udGFpbmVyXCIpO1xuICAgIC8vIFRPRE8gZm9yIHRoZSBzbGlkZXMgdGhhdCBoYXZlIGEgc21hbGwgcmFuZ2UgKGxpa2UgY29oZXNpb24gZmFjdG9yKSBtYWtlIHRoZSB2YWx1ZSB0aGUgc3F1YXJlIG9mIHRoZSBudW1iZXIuXG4gICAgcHJvcGVydGllcy5zb3J0KCk7IC8vIGhvcGUgc29tZW9uZSBlbHNlIHdhc24ndCB1c2luZyB0aGlzLlxuICAgIGZvciAoY29uc3QgW25hbWUsIHRhZ10gb2YgcHJvcGVydGllcykge1xuICAgICAgICAoMCwgbG9nZ2VyXzEubG9nKShsb2dnZXJfMS5Mb2dfVHlwZS5EZWJ1Z19TbGlkZXJzLCBgdHlwZXNjcmlwdDogJHtuYW1lfTogJHt0YWd9YCk7XG4gICAgICAgIC8vIFRPRE8gdGhpcyBmdW5jdGlvbiBpcyBncm93aW5nIHRvIGJpZywgcHV0IGl0IGluIGEgc2VwYXJhdGUgZmlsZS5cbiAgICAgICAgY29uc3QgdGFnX3NwbGl0ID0gdGFnLnNwbGl0KFwiIFwiKTtcbiAgICAgICAgY29uc3QgW3Byb3BfcHJvcGVydHksIHByb3BfdHlwZV0gPSB0YWdfcHJvcF90b19wYXJ0cyh0YWdfc3BsaXRbMF0pO1xuICAgICAgICBpZiAocHJvcF9wcm9wZXJ0eSAhPSBcIlByb3BlcnR5XCIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZpcnN0IHByb3BlcnR5IGlzIG5vdCBwcm9wZXJ0eSwgdGFnIHdhcyAke3RhZ31gKTtcbiAgICAgICAgY29uc3QgcHJvcGVydHlfc3RydWN0ID0gbmV3IFByb3BlcnR5X1N0cnVjdCgpO1xuICAgICAgICBzd2l0Y2ggKHByb3BfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImZsb2F0XCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSA9IFByb3BlcnR5X1R5cGUuUHJvcGVydHlfRmxvYXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImludFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X3R5cGUgPSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0ludDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiYm9vbFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X3R5cGUgPSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Jvb2w7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb3AgdHlwZSAke3Byb3BfdHlwZX1gKTtcbiAgICAgICAgfVxuICAgICAgICB0YWdfc3BsaXQuc2hpZnQoKTtcbiAgICAgICAgd2hpbGUgKHRhZ19zcGxpdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBuZXh0X3RhZyA9IHRhZ19zcGxpdC5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKG5leHRfdGFnID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm90IFBvc3NpYmxlXCIpO1xuICAgICAgICAgICAgY29uc3QgW2xlZnQsIHJpZ2h0XSA9IHRhZ19wcm9wX3RvX3BhcnRzKG5leHRfdGFnKTtcbiAgICAgICAgICAgIHN3aXRjaCAobGVmdCkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSYW5nZVwiOlxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfRmxvYXQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbbWluX3MsIG1heF9zXSA9IHJpZ2h0LnNwbGl0KFwiO1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21pbiA9IHBhcnNlRmxvYXQobWluX3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWF4ID0gcGFyc2VGbG9hdChtYXhfcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0ludDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFttaW5fcywgbWF4X3NdID0gcmlnaHQuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21pbiA9IHBhcnNlSW50KG1pbl9zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9tYXggPSBwYXJzZUludChtYXhfcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Jvb2w6IHRocm93IG5ldyBFcnJvcihcIkJvb2xlYW4gZG9zZSBub3QgaGF2ZSBhIHJhbmdlIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0eXBlIGluICR7bmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRGVmYXVsdFwiOlxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfRmxvYXQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfZGVmYXVsdCA9IHBhcnNlRmxvYXQocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9JbnQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHQgPSBwYXJzZUludChyaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Jvb2w6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuYm9vbF9kZWZhdWx0ID0gcGFyc2VfYm9vbChyaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHR5cGUgaW4gJHtuYW1lfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwcm9wZXJ0eSAke2xlZnR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyBzb21lIHdheSB0byBwcmludCBhbiBvYmplY3QuXG4gICAgICAgIC8vIGxvZyhMb2dfVHlwZS5EZWJ1Z19TbGlkZXJzLCBgcHJvcGVydHkgc3RydWN0ICR7cHJvcGVydHlfc3RydWN0fWApO1xuICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfRmxvYXQ6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtYWtlX2Zsb2F0X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0ludDpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ha2VfaW50X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Jvb2w6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtYWtlX2Jvb2xfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIG5hbWUsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHJvcGVydHkgdHlwZSAke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgTWFrZSBhIHNsaWRlciBmb3IgYW4gZmxvYXRcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2Zsb2F0X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IGlkID0gYHNsaWRlcl8ke25hbWV9YDtcbiAgICBjb25zdCBwYXJhX2lkID0gYCR7aWR9X3BhcmFncmFwaGA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtuYW1lLnJlcGxhY2UoL18vZywgXCIgXCIpfWA7XG4gICAgY29uc3QgaHRtbF9zdHJpbmcgPSBgXG4gICAgICAgIDxwIGNsYXNzPVwic2xpZGVyS2V5XCIgaWQ9XCIke3BhcmFfaWR9XCI+XG4gICAgICAgICAgICAke3BhcmFncmFwaF90ZXh0fTogJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWlufVwiIG1heD1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21heH1cIiB2YWx1ZT1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHR9XCIgc3RlcD1cIjAuMDA1XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7aWR9XCI+XG4gICAgICAgIGA7XG4gICAgY29uc3QgbmV3X3RoaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuZXdfdGhpbmcuY2xhc3NOYW1lID0gXCJyYW5nZUhvbGRlclwiO1xuICAgIG5ld190aGluZy5pbm5lckhUTUwgPSBodG1sX3N0cmluZztcbiAgICBzbGlkZXJfY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld190aGluZyk7XG4gICAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBmaW5kIHRoZSBzbGlkZXJcIik7XG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qgc2xpZGVyX3ZhbHVlX3N0cmluZyA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgY29uc3Qgc2xpZGVyX251bWJlciA9IE51bWJlcihzbGlkZXJfdmFsdWVfc3RyaW5nKTtcbiAgICAgICAgY29uc3Qgc2xpZGVyX3RleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJhX2lkKTtcbiAgICAgICAgaWYgKHNsaWRlcl90ZXh0ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjb3VsZCBub3QgZmluZCBzbGlkZXJfdGV4dCAke3BhcmFfaWR9YCk7XG4gICAgICAgIHNsaWRlcl90ZXh0LnRleHRDb250ZW50ID0gYCR7cGFyYWdyYXBoX3RleHR9OiAke3NsaWRlcl9udW1iZXJ9YDtcbiAgICAgICAgc2V0X3Byb3BlcnR5KG5hbWUsIHNsaWRlcl9udW1iZXIpO1xuICAgIH0pO1xufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgIE1ha2UgYSBzbGlkZXIgZm9yIGFuIGludFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmZ1bmN0aW9uIG1ha2VfaW50X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IGlkID0gYHNsaWRlcl8ke25hbWV9YDtcbiAgICBjb25zdCBwYXJhX2lkID0gYCR7aWR9X3BhcmFncmFwaGA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtuYW1lLnJlcGxhY2UoL18vZywgXCIgXCIpfWA7XG4gICAgY29uc3QgaHRtbF9zdHJpbmcgPSBgXG4gICAgICAgIDxwIGNsYXNzPVwic2xpZGVyS2V5XCIgaWQ9XCIke3BhcmFfaWR9XCI+XG4gICAgICAgICAgICAke3BhcmFncmFwaF90ZXh0fTogJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHR9XG4gICAgICAgIDwvcD5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIG1pbj1cIiR7cHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9taW59XCIgbWF4PVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21heH1cIiB2YWx1ZT1cIiR7cHJvcGVydHlfc3RydWN0LmludF9kZWZhdWx0fVwiIGNsYXNzPVwic2xpZGVyXCIgaWQ9XCIke2lkfVwiPlxuICAgICAgICBgO1xuICAgIGNvbnN0IG5ld190aGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmV3X3RoaW5nLmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICBuZXdfdGhpbmcuaW5uZXJIVE1MID0gaHRtbF9zdHJpbmc7XG4gICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdfdGhpbmcpO1xuICAgIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoc2xpZGVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmluZCB0aGUgc2xpZGVyXCIpO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHNsaWRlcl92YWx1ZV9zdHJpbmcgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIGNvbnN0IHNsaWRlcl9udW1iZXIgPSBOdW1iZXIoc2xpZGVyX3ZhbHVlX3N0cmluZyk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl90ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFyYV9pZCk7XG4gICAgICAgIGlmIChzbGlkZXJfdGV4dCA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgY291bGQgbm90IGZpbmQgc2xpZGVyX3RleHQgJHtwYXJhX2lkfWApO1xuICAgICAgICBzbGlkZXJfdGV4dC50ZXh0Q29udGVudCA9IGAke3BhcmFncmFwaF90ZXh0fTogJHtzbGlkZXJfbnVtYmVyfWA7XG4gICAgICAgIHNldF9wcm9wZXJ0eShuYW1lLCBzbGlkZXJfbnVtYmVyKTtcbiAgICB9KTtcbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgTWFrZSBhIHNsaWRlciBmb3IgYW4gYm9vbGVhbiB0b2dnbGVcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2Jvb2xfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIG5hbWUsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KSB7XG4gICAgY29uc3QgaWQgPSBgc2xpZGVyXyR7bmFtZX1gO1xuICAgIGNvbnN0IHBhcmFncmFwaF90ZXh0ID0gYCR7bmFtZS5yZXBsYWNlKC9fL2csIFwiIFwiKX1gO1xuICAgIGNvbnN0IGh0bWxfc3RyaW5nID0gYFxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgJHtwcm9wZXJ0eV9zdHJ1Y3QuYm9vbF9kZWZhdWx0ID8gXCJjaGVja2VkXCIgOiBcIlwifSBjbGFzcz1cImNoZWNrYm94X3RvZ2dsZVwiIGlkPVwiJHtpZH1cIj5cbiAgICAgICAgPGxhYmVsIGZvcj1cIiR7aWR9XCIgY2xhc3M9XCJjaGVja2JveF90b2dnbGVfbGFiZWxcIj4ke3BhcmFncmFwaF90ZXh0fTwvbGFiZWw+XG4gICAgICAgIGA7XG4gICAgY29uc3QgbmV3X3RoaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuZXdfdGhpbmcuY2xhc3NOYW1lID0gXCJyYW5nZUhvbGRlclwiO1xuICAgIG5ld190aGluZy5pbm5lckhUTUwgPSBodG1sX3N0cmluZztcbiAgICBzbGlkZXJfY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld190aGluZyk7XG4gICAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBmaW5kIHRoZSBzbGlkZXJcIik7XG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBpZiAodGFyZ2V0ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFyZ2V0IHdhcyBudWxsLCBkaWQgb3duIG93biBlbGVtZW50IGdldCBkZWxldGVkP1wiKTtcbiAgICAgICAgc2V0X3Byb3BlcnR5KG5hbWUsIHRhcmdldC5jaGVja2VkKTtcbiAgICB9KTtcbn1cbjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHR5cGVzY3JpcHQgZ2x1ZSBjb2RlLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XG5jb25zdCBzZXR1cF9zbGlkZXJzXzEgPSByZXF1aXJlKFwiLi9zZXR1cF9zbGlkZXJzXCIpO1xuLy8gY29vbCB0cmlja1xuY29uc3QgSU5fREVWX01PREUgPSAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09IFwibG9jYWxob3N0XCIpO1xuO1xuO1xuLy8gTk9URSB3ZSBrZWVwIHRoZSBAdHMtaWdub3JlJ3MgaW4gaGVyZVxuYXN5bmMgZnVuY3Rpb24gZ2V0X2dvX2Z1bmN0aW9ucygpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgZ28gPSBuZXcgR28oKTsgLy8gTk9URSB0aGlzIGNvbWVzIGZyb20gdGhlIHdhc21fZXhlYy5qcyB0aGluZ1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGZldGNoKFwiZGlzdC9ib2lkLndhc21cIiksIGdvLmltcG9ydE9iamVjdCk7XG4gICAgZ28ucnVuKHJlc3VsdC5pbnN0YW5jZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBzZXRfcHJvcGVydGllczogU2V0UHJvcGVydGllcyxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnZXRfcHJvcGVydGllczogR2V0UHJvcGVydGllcyxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnZXRfbmV4dF9mcmFtZTogR2V0TmV4dEZyYW1lLFxuICAgIH07XG59XG47XG47XG4vLyBbciwgZywgYiwgYV0sIG5vdCBuZWNlc3NhcmlseSBpbiB0aGF0IG9yZGVyXG5jb25zdCBOVU1fQ09MT1JfQ09NUE9ORU5UUyA9IDQ7XG5jb25zdCBTUVVJU0hfRkFDVE9SID0gMTtcbjtcbjtcbjtcbmNvbnN0IG1vdXNlID0ge1xuICAgIHBvczogeyB4OiAwLCB5OiAwIH0sXG4gICAgbGVmdF9kb3duOiBmYWxzZSxcbiAgICBtaWRkbGVfZG93bjogZmFsc2UsXG4gICAgcmlnaHRfZG93bjogZmFsc2UsXG59O1xuZnVuY3Rpb24gZG9tX3JlY3RfdG9fcmVjdChkb21fcmVjdCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IGRvbV9yZWN0LngsXG4gICAgICAgIHk6IGRvbV9yZWN0LnksXG4gICAgICAgIHdpZHRoOiBkb21fcmVjdC53aWR0aCxcbiAgICAgICAgLy8gdG8gYWNjb3VudCBmb3IgbGV0dGVycyBsaWtlICdqJ1xuICAgICAgICBoZWlnaHQ6IGRvbV9yZWN0LmhlaWdodCArIDUsXG4gICAgfTtcbn1cbjtcbmZ1bmN0aW9uIGdldF9hbGxfY29sbGlkYWJsZV9yZWN0cygpIHtcbiAgICBjb25zdCBDTEFTUyA9IFwiY29sbGlkZVwiO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShDTEFTUyk7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICAgIGNvbnN0IGRvbV9yZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgcmVzdWx0LnB1c2goZG9tX3JlY3RfdG9fcmVjdChkb21fcmVjdCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuO1xuZnVuY3Rpb24gcmVuZGVyX2JvaWRzKGRpc3BsYXksIGdvKSB7XG4gICAgY29uc3QgY29sbGlkYWJsZV9yZWN0YW5nbGVzID0gZ2V0X2FsbF9jb2xsaWRhYmxlX3JlY3RzKCk7XG4gICAgLy8gdXNpbmcgc3F1aXNoIGZhY3Rvciwgd2UgY2FuIGNoYW5nZSB0aGUgcmVuZGVyaW5nIHNpemUgb2YgdGhlIGJvaWQgaW1hZ2Ugd2UganVzdCBnb3QuXG4gICAgY29uc3QgY2FudmFzX3dpZHRoID0gTWF0aC5mbG9vcihkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLndpZHRoIC8gU1FVSVNIX0ZBQ1RPUik7XG4gICAgY29uc3QgY2FudmFzX2hlaWdodCA9IE1hdGguZmxvb3IoZGlzcGxheS5yZW5kZXJfY3R4LmNhbnZhcy5oZWlnaHQgLyBTUVVJU0hfRkFDVE9SKTtcbiAgICBjb25zdCBidWZmZXJfc2l6ZSA9IGNhbnZhc193aWR0aCAqIGNhbnZhc19oZWlnaHQgKiBOVU1fQ09MT1JfQ09NUE9ORU5UUztcbiAgICAvLyByZXNpemUgYmFjayBidWZmZXIgaWYgY2FudmFzIHNpemUgY2hhbmdlZC5cbiAgICBpZiAoZGlzcGxheS5iYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCAhPT0gY2FudmFzX3dpZHRoIHx8IGRpc3BsYXkuYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0ICE9PSBjYW52YXNfaGVpZ2h0KSB7XG4gICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkdlbmVyYWwsIFwiT2ggZ29kLiB3ZXJlIHJlc2l6aW5nIHRoZSBidWZmZXJcIik7XG4gICAgICAgIGlmIChkaXNwbGF5LmJhY2tfYnVmZmVyX2FycmF5Lmxlbmd0aCA8IGJ1ZmZlcl9zaXplKSB7XG4gICAgICAgICAgICAoMCwgbG9nZ2VyXzEubG9nKShsb2dnZXJfMS5Mb2dfVHlwZS5HZW5lcmFsLCBcIkJhY2sgYnVmZmVyIGFycmF5IGdldHRpbmcgYmlnZ2VyXCIpOyAvLyBteSBwZW5pc1xuICAgICAgICAgICAgLy8gbWFrZSB0aGUgYnVmZmVyIGJpZ2dlclxuICAgICAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9hcnJheSA9IG5ldyBVaW50OENsYW1wZWRBcnJheShidWZmZXJfc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmFja19jYW52YXMgPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKGNhbnZhc193aWR0aCwgY2FudmFzX2hlaWdodCk7XG4gICAgICAgIGNvbnN0IGJhY2tfY3R4ID0gYmFja19jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICBpZiAoYmFja19jdHggPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIyRCBjb250ZXh0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfcmVuZGVyX2N0eCA9IGJhY2tfY3R4O1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfaW1hZ2Vfd2lkdGggPSBjYW52YXNfd2lkdGg7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0ID0gY2FudmFzX2hlaWdodDtcbiAgICB9XG4gICAgY29uc3QgYnVmZmVyID0gZGlzcGxheS5iYWNrX2J1ZmZlcl9hcnJheS5zdWJhcnJheSgwLCBidWZmZXJfc2l6ZSk7XG4gICAgY29uc3QgYXJncyA9IHtcbiAgICAgICAgd2lkdGg6IGNhbnZhc193aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBjYW52YXNfaGVpZ2h0LFxuICAgICAgICBidWZmZXI6IGJ1ZmZlcixcbiAgICAgICAgbW91c2U6IG1vdXNlLFxuICAgICAgICByZWN0czogY29sbGlkYWJsZV9yZWN0YW5nbGVzLFxuICAgIH07XG4gICAgY29uc3QgbnVtX2J5dGVzX2ZpbGxlZCA9IGdvLmdldF9uZXh0X2ZyYW1lKGFyZ3MpO1xuICAgIGlmIChudW1fYnl0ZXNfZmlsbGVkICE9PSBidWZmZXJfc2l6ZSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBnby5nZXRfbmV4dF9mcmFtZSBnb3QgaW5jb3JyZWN0IG51bWJlciBvZiBieXRlcywgd2FudGVkOiAke2J1ZmZlcl9zaXplfSwgZ290OiAke251bV9ieXRlc19maWxsZWR9YCk7XG4gICAgLy8gQHRzLWlnbm9yZSAvLyB3aHkgZG9zZSB0aGlzIGxpbmUgbWFrZSBhbiBlcnJvciBpbiBteSBlZGl0b3JcbiAgICBjb25zdCBpbWFnZV9kYXRhID0gbmV3IEltYWdlRGF0YShidWZmZXIsIGNhbnZhc193aWR0aCwgY2FudmFzX2hlaWdodCk7XG4gICAgLy8gaXMgdGhpcyBjb29sP1xuICAgIC8vIFxuICAgIC8vIGdoZSB3aG9sZSBwb2ludCBvZiB0aGlzIGJhY2tfYnVmZmVyIGlzIHRvIHByZXZlbnQgZmxpY2tlcmluZyBhbmRcbiAgICAvLyBzdHVmZiwgYnVmIGlmIHdlcmUgb25seSBnb2luZyB0byBiZSBkcmF3aW5nIG9uZSB0aGluZy4uLlxuICAgIC8vIHdoYXRzIHRoZSBwb2ludD9cbiAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHgucHV0SW1hZ2VEYXRhKGltYWdlX2RhdGEsIDAsIDApO1xuICAgIC8vIE5PVEUgdGhpcyB3aWxsIHN0cmV0Y2ggdGhlIHRoaW5nLlxuICAgIC8vIGNhbnZhcy53aWR0aCBtaWdodCBjaGFuZ2UgZHVyaW5nIHRoZSB0aW1lIHRoaXMgaXMgcnVubmluZ1xuICAgIGRpc3BsYXkucmVuZGVyX2N0eC5kcmF3SW1hZ2UoZGlzcGxheS5iYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LmNhbnZhcywgMCwgMCwgZGlzcGxheS5yZW5kZXJfY3R4LmNhbnZhcy53aWR0aCwgZGlzcGxheS5yZW5kZXJfY3R4LmNhbnZhcy5oZWlnaHQpO1xuICAgIC8vIGxldHMgaG9wZSBqYXZhc2NyaXB0IGlzIHNtYXJ0IGVub3VnaCB0byBkZWFsbG9jYXRlIHRoaXMuLi5cbiAgICAvLyBpbWFnZURhdGEgPSBudWxsXG59XG47XG4vLyBUT0RPIG1ha2UgdGhpcyBzbWFydGVyLlxuY29uc3QgcmVuZGVyX3RpbWVzID0gW107XG5jb25zdCBkZWx0YV90aW1lcyA9IFtdO1xuLy8gQ3JlZGl0OiBodHRwczovL2dpdGh1Yi5jb20vdHNvZGluZy9rb2lsXG4vLyBcbi8vIFRPRE8gcmVtb3ZlIG5ld19yZW5kZXJfdGltZSwgYW5kIG5ld19kZWx0YV90aW1lLCBqdXN0IG1ha2UgYSBjbGFzcyBvciBzb21ldGhpbmcuXG5mdW5jdGlvbiByZW5kZXJfZGVidWdfaW5mbyhkaXNwbGF5LCBuZXdfcmVuZGVyX3RpbWUsIG5ld19kZWx0YV90aW1lKSB7XG4gICAgY29uc3QgRk9OVF9TSVpFID0gMjg7XG4gICAgZGlzcGxheS5yZW5kZXJfY3R4LmZvbnQgPSBgJHtGT05UX1NJWkV9cHggYm9sZGA7XG4gICAgcmVuZGVyX3RpbWVzLnB1c2gobmV3X3JlbmRlcl90aW1lKTtcbiAgICBpZiAocmVuZGVyX3RpbWVzLmxlbmd0aCA+IDYwKSB7XG4gICAgICAgIHJlbmRlcl90aW1lcy5zaGlmdCgpO1xuICAgIH1cbiAgICBkZWx0YV90aW1lcy5wdXNoKG5ld19kZWx0YV90aW1lKTtcbiAgICBpZiAoZGVsdGFfdGltZXMubGVuZ3RoID4gNjApIHtcbiAgICAgICAgZGVsdGFfdGltZXMuc2hpZnQoKTtcbiAgICB9XG4gICAgY29uc3QgcmVuZGVyX2F2ZyA9IHJlbmRlcl90aW1lcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIHJlbmRlcl90aW1lcy5sZW5ndGg7XG4gICAgY29uc3QgZGVsdGFfYXZnID0gZGVsdGFfdGltZXMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyBkZWx0YV90aW1lcy5sZW5ndGg7XG4gICAgY29uc3QgbGFiZWxzID0gW107XG4gICAgeyAvLyBjb25zdHJ1Y3QgdGhlIGxhYmVscy5cbiAgICAgICAgLy8gdGhpcyBpcyB0aGUgb25seSB1bmlxdWUgdGhpbmdzIGJldHdlZW4gcmVuZGVyX3RpbWVzIGFuZCBkZWx0YV90aW1lc1xuICAgICAgICBjb25zdCBmcmFtZXNfcGVyX3NlY29uZCA9ICgxIC8gZGVsdGFfYXZnICogMTAwMCkudG9GaXhlZCgyKTtcbiAgICAgICAgY29uc3Qgc2Vjb25kc19wZXJfZnJhbWUgPSAoZGVsdGFfYXZnIC8gMTAwMCkudG9GaXhlZCg1KTtcbiAgICAgICAgbGFiZWxzLnB1c2goYEYvUzogJHtmcmFtZXNfcGVyX3NlY29uZH0gICAgUy9GOiAke3NlY29uZHNfcGVyX2ZyYW1lfWApO1xuICAgICAgICBsYWJlbHMucHVzaChgV0FTTSBSZW5kZXIgVGltZSBBdmcgKG1zKTogJHtyZW5kZXJfYXZnLnRvRml4ZWQoMil9YCk7XG4gICAgICAgIGxhYmVscy5wdXNoKGBSZW5kZXIvU2VjIChNQVgpOiAkeygxIC8gcmVuZGVyX2F2ZyAqIDEwMDApLnRvRml4ZWQoMil9YCk7XG4gICAgfVxuICAgIGNvbnN0IFBBRERJTkcgPSA3MDtcbiAgICBjb25zdCBTSEFET1dfT0ZGU0VUID0gRk9OVF9TSVpFICogMC4wNjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxhYmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkaXNwbGF5LnJlbmRlcl9jdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBkaXNwbGF5LnJlbmRlcl9jdHguZmlsbFRleHQobGFiZWxzW2ldLCBQQURESU5HLCBQQURESU5HICsgRk9OVF9TSVpFICogaSk7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsU3R5bGUgPSBcIndoaXRlXCI7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsVGV4dChsYWJlbHNbaV0sIFBBRERJTkcgKyBTSEFET1dfT0ZGU0VULCBQQURESU5HIC0gU0hBRE9XX09GRlNFVCArIEZPTlRfU0laRSAqIGkpO1xuICAgIH1cbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgICAgICAgIFRoZSBNYWluIEZ1bmN0aW9uXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuKGFzeW5jICgpID0+IHtcbiAgICBpZiAoSU5fREVWX01PREUpXG4gICAgICAgIGNvbnNvbGUubG9nKFwiSW4gRGV2IE1vZGVcIik7XG4gICAgY29uc3QgZ28gPSBhd2FpdCBnZXRfZ29fZnVuY3Rpb25zKCk7XG4gICAgeyAvLyBIYW5kbGUgc2xpZGVyIHN0dWZmXG4gICAgICAgIGNvbnN0IGJvaWRfcHJvcGVydGllcyA9IE9iamVjdC5lbnRyaWVzKGdvLmdldF9wcm9wZXJ0aWVzKCkpO1xuICAgICAgICBmdW5jdGlvbiBzZXRfcHJvcGVydHkobmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyNzEwOTA1L2hvdy1kby1pLWR5bmFtaWNhbGx5LWFzc2lnbi1wcm9wZXJ0aWVzLXRvLWFuLW9iamVjdC1pbi10eXBlc2NyaXB0XG4gICAgICAgICAgICBjb25zdCBvYmogPSB7fTtcbiAgICAgICAgICAgIG9ialtuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgZ28uc2V0X3Byb3BlcnRpZXMob2JqKTtcbiAgICAgICAgfVxuICAgICAgICA7XG4gICAgICAgIC8vIFRPRE8gbWF5YmUgbWFrZSB0aGlzIGRldiBtb2RlIG9ubHkuLi5cbiAgICAgICAgLy8gaXQgYWxzbyBoYXMgdG8gcmVtb3ZlIHRoZSBTZXR0aW5ncyB0aGluZy4uLlxuICAgICAgICAoMCwgc2V0dXBfc2xpZGVyc18xLnNldHVwX3NsaWRlcnMpKGJvaWRfcHJvcGVydGllcywgc2V0X3Byb3BlcnR5KTtcbiAgICB9XG4gICAgeyAvLyBzZXR1cCBpbnB1dCBoYW5kbGluZy5cbiAgICAgICAgLy8gd2h5IGRvZXNuJ3QgdHlwZXNjcmlwdCBoYXZlIGFuIGVudW0gZm9yIHRoaXM/XG4gICAgICAgIGxldCBNb3VzZV9CdXR0b25zO1xuICAgICAgICAoZnVuY3Rpb24gKE1vdXNlX0J1dHRvbnMpIHtcbiAgICAgICAgICAgIE1vdXNlX0J1dHRvbnNbTW91c2VfQnV0dG9uc1tcIkxlZnRcIl0gPSAwXSA9IFwiTGVmdFwiO1xuICAgICAgICAgICAgTW91c2VfQnV0dG9uc1tNb3VzZV9CdXR0b25zW1wiTWlkZGxlXCJdID0gMV0gPSBcIk1pZGRsZVwiO1xuICAgICAgICAgICAgTW91c2VfQnV0dG9uc1tNb3VzZV9CdXR0b25zW1wiUmlnaHRcIl0gPSAyXSA9IFwiUmlnaHRcIjtcbiAgICAgICAgfSkoTW91c2VfQnV0dG9ucyB8fCAoTW91c2VfQnV0dG9ucyA9IHt9KSk7XG4gICAgICAgIDtcbiAgICAgICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmdldFJvb3ROb2RlKCk7XG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBtb3VzZS5wb3MgPSB7IHg6IGV2LngsIHk6IGV2LnkgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHRoaXMgd2lsbCBicmVhayBpZiB0aGUgdXNlciBzbGlkZXMgdGhlcmUgbW91c2Ugb3V0c2lkZSBvZiB0aGUgc2NyZWVuIHdoaWxlIGNsaWNraW5nLCBidXQgdGhpcyBpcyB0aGUgd2ViLCBwZW9wbGUgZXhwZWN0IGl0IHRvIHN1Y2suXG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuTGVmdClcbiAgICAgICAgICAgICAgICBtb3VzZS5sZWZ0X2Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLk1pZGRsZSlcbiAgICAgICAgICAgICAgICBtb3VzZS5taWRkbGVfZG93biA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuUmlnaHQpXG4gICAgICAgICAgICAgICAgbW91c2UucmlnaHRfZG93biA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZXYpID0+IHtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5MZWZ0KVxuICAgICAgICAgICAgICAgIG1vdXNlLmxlZnRfZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLk1pZGRsZSlcbiAgICAgICAgICAgICAgICBtb3VzZS5taWRkbGVfZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLlJpZ2h0KVxuICAgICAgICAgICAgICAgIG1vdXNlLnJpZ2h0X2Rvd24gPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGNvbnN0IGNhbnZhc19jb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc19kaXZcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsXG4gICAgY29uc3QgYm9pZF9jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJvaWRfY2FudmFzXCIpO1xuICAgIGlmIChib2lkX2NhbnZhcyA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gY2FudmFzIHdpdGggaWQgYGJvaWRfY2FudmFzYCBpcyBmb3VuZFwiKTtcbiAgICAvLyBUT0RPIG5hbWluZyBiZXR0ZXIsIHVzZSBzbmFrZSBjYXNlIGV2ZXJ5d2hlcmUhIVxuICAgIGNvbnN0IGJvaWRfY2FudmFzX2N0eCA9IGJvaWRfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoYm9pZF9jYW52YXNfY3R4ID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIyRCBjb250ZXh0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgYm9pZF9jYW52YXNfY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIGNvbnN0IFtiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCwgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0XSA9IFtib2lkX2NhbnZhc19jdHguY2FudmFzLndpZHRoLCBib2lkX2NhbnZhc19jdHguY2FudmFzLmhlaWdodF07XG4gICAgY29uc3QgYmFja19idWZmZXJfY2FudmFzID0gbmV3IE9mZnNjcmVlbkNhbnZhcyhiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCwgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0KTtcbiAgICBjb25zdCBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4ID0gYmFja19idWZmZXJfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoYmFja19idWZmZXJfcmVuZGVyX2N0eCA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgIGJhY2tfYnVmZmVyX3JlbmRlcl9jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgY29uc3QgYmFja19idWZmZXJfYXJyYXkgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkoYmFja19idWZmZXJfaW1hZ2Vfd2lkdGggKiBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQgKiA0KTtcbiAgICBjb25zdCBkaXNwbGF5ID0ge1xuICAgICAgICByZW5kZXJfY3R4OiBib2lkX2NhbnZhc19jdHgsXG4gICAgICAgIGJhY2tfYnVmZmVyX3JlbmRlcl9jdHg6IGJhY2tfYnVmZmVyX3JlbmRlcl9jdHgsXG4gICAgICAgIGJhY2tfYnVmZmVyX2FycmF5OiBiYWNrX2J1ZmZlcl9hcnJheSxcbiAgICAgICAgYmFja19idWZmZXJfaW1hZ2Vfd2lkdGg6IGJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoLFxuICAgICAgICBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQ6IGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCxcbiAgICB9O1xuICAgIGxldCBwcmV2X3RpbWVzdGFtcCA9IDA7XG4gICAgY29uc3QgZnJhbWUgPSAodGltZXN0YW1wKSA9PiB7XG4gICAgICAgIGJvaWRfY2FudmFzX2N0eC5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgYm9pZF9jYW52YXNfY3R4LmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGNvbnN0IGRlbHRhX3RpbWUgPSAodGltZXN0YW1wIC0gcHJldl90aW1lc3RhbXApO1xuICAgICAgICBwcmV2X3RpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICAgICAgLy8gVE9ETyBEb24ndCBuZWVkIGRlbHRhIHRpbWUsIGJvaWQgdGhpbmcgZG9zZSBpdCBmb3IgdXM/IGNoYW5nZT9cbiAgICAgICAgY29uc3Qgc3RhcnRfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICByZW5kZXJfYm9pZHMoZGlzcGxheSwgZ28pO1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAvLyBJbiBtc1xuICAgICAgICBjb25zdCByZW5kZXJfdGltZSA9IGVuZF90aW1lIC0gc3RhcnRfdGltZTtcbiAgICAgICAgaWYgKGxvZ2dlcl8xLkRFQlVHX0RJU1BMQVkgJiYgSU5fREVWX01PREUpXG4gICAgICAgICAgICByZW5kZXJfZGVidWdfaW5mbyhkaXNwbGF5LCByZW5kZXJfdGltZSwgZGVsdGFfdGltZSk7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgIH07XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgodGltZXN0YW1wKSA9PiB7XG4gICAgICAgIHByZXZfdGltZXN0YW1wID0gdGltZXN0YW1wO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgICB9KTtcbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=