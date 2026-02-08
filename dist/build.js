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
            const [left, right] = tag_prop_to_parts(tag_split.shift());
            switch (left) {
                case "Range":
                    switch (property_struct.property_type) {
                        case Property_Type.Property_Float:
                            {
                                const [min_as_string, max_as_string] = right.split(";");
                                property_struct.float_range_min = parseFloat(min_as_string);
                                property_struct.float_range_max = parseFloat(max_as_string);
                            }
                            break;
                        case Property_Type.Property_Int:
                            {
                                const [min_as_string, max_as_string] = right.split(";");
                                property_struct.int_range_min = parseInt(min_as_string);
                                property_struct.int_range_max = parseInt(max_as_string);
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
        rects: collidable_rectangles,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLHNDQUFzQztBQUMvQztBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUIsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2JvaWRzLy4vd2ViX3NyYy9sb2dnZXIudHMiLCJ3ZWJwYWNrOi8vYm9pZHMvLi93ZWJfc3JjL3NldHVwX3NsaWRlcnMudHMiLCJ3ZWJwYWNrOi8vYm9pZHMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYm9pZHMvLi93ZWJfc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Mb2dfVHlwZSA9IGV4cG9ydHMuREVCVUdfU0xJREVSUyA9IGV4cG9ydHMuREVCVUdfRElTUExBWSA9IHZvaWQgMDtcbmV4cG9ydHMubG9nID0gbG9nO1xuLy8gaXMgaXQgY29ycmVjdCB0byBoYXZlIHRoZXNlIGhlcmU/IHRoaXMgb25lIGVmZmVjdHNcbi8vIGRyYXdpbmcgb24gdGhlIHNjcmVlbiwgbm90IGp1c3QgbG9nZ2luZz8gYWx0aG91Z2ggd2Vcbi8vIGNvdWxkIG1ha2UgYWxsIGxvZ3MgYXBwZWFyIG9uIHNjcmVlbi4uLlxuZXhwb3J0cy5ERUJVR19ESVNQTEFZID0gdHJ1ZTtcbmV4cG9ydHMuREVCVUdfU0xJREVSUyA9IGZhbHNlO1xudmFyIExvZ19UeXBlO1xuKGZ1bmN0aW9uIChMb2dfVHlwZSkge1xuICAgIExvZ19UeXBlW0xvZ19UeXBlW1wiR2VuZXJhbFwiXSA9IDBdID0gXCJHZW5lcmFsXCI7XG4gICAgTG9nX1R5cGVbTG9nX1R5cGVbXCJEZWJ1Z19EaXNwbGF5XCJdID0gMV0gPSBcIkRlYnVnX0Rpc3BsYXlcIjtcbiAgICBMb2dfVHlwZVtMb2dfVHlwZVtcIkRlYnVnX1NsaWRlcnNcIl0gPSAyXSA9IFwiRGVidWdfU2xpZGVyc1wiO1xufSkoTG9nX1R5cGUgfHwgKGV4cG9ydHMuTG9nX1R5cGUgPSBMb2dfVHlwZSA9IHt9KSk7XG47XG5mdW5jdGlvbiBsb2cobG9nX3R5cGUsIC4uLmRhdGEpIHtcbiAgICAvLyBpZiB0aGlzIGlzIHRoZSBlbXB0eSBzdHJpbmdcbiAgICB2YXIgZG9fbG9nID0gZmFsc2U7XG4gICAgdmFyIGxvZ19oZWFkZXIgPSBcIlwiO1xuICAgIHN3aXRjaCAobG9nX3R5cGUpIHtcbiAgICAgICAgY2FzZSBMb2dfVHlwZS5HZW5lcmFsOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvZ19oZWFkZXIgPSBcIlwiO1xuICAgICAgICAgICAgICAgIGRvX2xvZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBMb2dfVHlwZS5EZWJ1Z19EaXNwbGF5OlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvZ19oZWFkZXIgPSBcIkRFQlVHX0RJU1BMQVlcIjtcbiAgICAgICAgICAgICAgICBpZiAoZXhwb3J0cy5ERUJVR19ESVNQTEFZKVxuICAgICAgICAgICAgICAgICAgICBkb19sb2cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTG9nX1R5cGUuRGVidWdfU2xpZGVyczpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2dfaGVhZGVyID0gXCJERUJVR19TTElERVJTXCI7XG4gICAgICAgICAgICAgICAgaWYgKGV4cG9ydHMuREVCVUdfU0xJREVSUylcbiAgICAgICAgICAgICAgICAgICAgZG9fbG9nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoZG9fbG9nKSB7XG4gICAgICAgIGlmIChsb2dfaGVhZGVyICE9IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2xvZ19oZWFkZXJ9OiBgLCAuLi5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKC4uLmRhdGEpO1xuICAgICAgICB9XG4gICAgfVxufVxuO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLnNldHVwX3NsaWRlcnMgPSBzZXR1cF9zbGlkZXJzO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XG52YXIgUHJvcGVydHlfVHlwZTtcbihmdW5jdGlvbiAoUHJvcGVydHlfVHlwZSkge1xuICAgIFByb3BlcnR5X1R5cGVbUHJvcGVydHlfVHlwZVtcIk5vbmVcIl0gPSAwXSA9IFwiTm9uZVwiO1xuICAgIFByb3BlcnR5X1R5cGVbUHJvcGVydHlfVHlwZVtcIlByb3BlcnR5X0Zsb2F0XCJdID0gMV0gPSBcIlByb3BlcnR5X0Zsb2F0XCI7XG4gICAgUHJvcGVydHlfVHlwZVtQcm9wZXJ0eV9UeXBlW1wiUHJvcGVydHlfSW50XCJdID0gMl0gPSBcIlByb3BlcnR5X0ludFwiO1xuICAgIFByb3BlcnR5X1R5cGVbUHJvcGVydHlfVHlwZVtcIlByb3BlcnR5X0Jvb2xcIl0gPSAzXSA9IFwiUHJvcGVydHlfQm9vbFwiO1xufSkoUHJvcGVydHlfVHlwZSB8fCAoUHJvcGVydHlfVHlwZSA9IHt9KSk7XG47XG5jbGFzcyBQcm9wZXJ0eV9TdHJ1Y3Qge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnByb3BlcnR5X3R5cGUgPSBQcm9wZXJ0eV9UeXBlLk5vbmU7XG4gICAgICAgIC8vIEZsb2F0IHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5mbG9hdF9yYW5nZV9taW4gPSAwO1xuICAgICAgICB0aGlzLmZsb2F0X3JhbmdlX21heCA9IDA7XG4gICAgICAgIHRoaXMuZmxvYXRfZGVmYXVsdCA9IDA7XG4gICAgICAgIC8vIEludCBwcm9wZXJ0aWVzXG4gICAgICAgIHRoaXMuaW50X3JhbmdlX21pbiA9IDA7XG4gICAgICAgIHRoaXMuaW50X3JhbmdlX21heCA9IDA7XG4gICAgICAgIHRoaXMuaW50X2RlZmF1bHQgPSAwO1xuICAgICAgICB0aGlzLmJvb2xfZGVmYXVsdCA9IGZhbHNlO1xuICAgIH1cbn1cbjtcbmZ1bmN0aW9uIHRhZ19wcm9wX3RvX3BhcnRzKHByb3ApIHtcbiAgICBjb25zdCBbbGVmdCwgcmlnaHRfd2l0aF9qdW5rXSA9IHByb3Auc3BsaXQoXCI6XCIpO1xuICAgIGNvbnN0IHJpZ2h0ID0gcmlnaHRfd2l0aF9qdW5rLnNsaWNlKDEsIHJpZ2h0X3dpdGhfanVuay5sZW5ndGggLSAxKTtcbiAgICByZXR1cm4gW2xlZnQsIHJpZ2h0XTtcbn1cbjtcbmZ1bmN0aW9uIHBhcnNlX2Jvb2wocykge1xuICAgIC8vIDEsIHQsIFQsIFRSVUUsIHRydWUsIFRydWUsXG4gICAgLy8gMCwgZiwgRiwgRkFMU0UsIGZhbHNlLCBGYWxzZVxuICAgIHN3aXRjaCAocykge1xuICAgICAgICBjYXNlIFwiMVwiOlxuICAgICAgICBjYXNlIFwidFwiOlxuICAgICAgICBjYXNlIFwiVFwiOlxuICAgICAgICBjYXNlIFwiVFJVRVwiOlxuICAgICAgICBjYXNlIFwidHJ1ZVwiOlxuICAgICAgICBjYXNlIFwiVHJ1ZVwiOiB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFwiMFwiOlxuICAgICAgICBjYXNlIFwiZlwiOlxuICAgICAgICBjYXNlIFwiRlwiOlxuICAgICAgICBjYXNlIFwiRkFMU0VcIjpcbiAgICAgICAgY2FzZSBcImZhbHNlXCI6XG4gICAgICAgIGNhc2UgXCJGYWxzZVwiOiB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHN0cmluZyBpbiBwYXJzZUJvb2wsIHdhcyAke3N9YCk7XG4gICAgfVxufVxuO1xuLy8gcHV0cyBzb21lIHNsaWRlcnMgdXAgdG8gY29udHJvbCBzb21lIHBhcmFtZXRlcnNcbmZ1bmN0aW9uIHNldHVwX3NsaWRlcnMocHJvcGVydGllcywgc2V0X3Byb3BlcnR5KSB7XG4gICAgY29uc3QgU0xJREVSX0NPTlRBSU5FUl9JRCA9IFwic2xpZGVDb250YWluZXJcIjtcbiAgICBjb25zdCBzbGlkZXJfY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoU0xJREVSX0NPTlRBSU5FUl9JRCk7XG4gICAgaWYgKHNsaWRlcl9jb250YWluZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBHZXQgc2xpZGVyIGNvbnRhaW5lclwiKTtcbiAgICAvLyBUT0RPIGZvciB0aGUgc2xpZGVzIHRoYXQgaGF2ZSBhIHNtYWxsIHJhbmdlIChsaWtlIGNvaGVzaW9uIGZhY3RvcikgbWFrZSB0aGUgdmFsdWUgdGhlIHNxdWFyZSBvZiB0aGUgbnVtYmVyLlxuICAgIHByb3BlcnRpZXMuc29ydCgpOyAvLyBob3BlIHNvbWVvbmUgZWxzZSB3YXNuJ3QgdXNpbmcgdGhpcy5cbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB0YWddIG9mIHByb3BlcnRpZXMpIHtcbiAgICAgICAgKDAsIGxvZ2dlcl8xLmxvZykobG9nZ2VyXzEuTG9nX1R5cGUuRGVidWdfU2xpZGVycywgYHR5cGVzY3JpcHQ6ICR7bmFtZX06ICR7dGFnfWApO1xuICAgICAgICAvLyBUT0RPIHRoaXMgZnVuY3Rpb24gaXMgZ3Jvd2luZyB0byBiaWcsIHB1dCBpdCBpbiBhIHNlcGFyYXRlIGZpbGUuXG4gICAgICAgIGNvbnN0IHRhZ19zcGxpdCA9IHRhZy5zcGxpdChcIiBcIik7XG4gICAgICAgIGNvbnN0IFtwcm9wX3Byb3BlcnR5LCBwcm9wX3R5cGVdID0gdGFnX3Byb3BfdG9fcGFydHModGFnX3NwbGl0WzBdKTtcbiAgICAgICAgaWYgKHByb3BfcHJvcGVydHkgIT0gXCJQcm9wZXJ0eVwiKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGaXJzdCBwcm9wZXJ0eSBpcyBub3QgcHJvcGVydHksIHRhZyB3YXMgJHt0YWd9YCk7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5X3N0cnVjdCA9IG5ldyBQcm9wZXJ0eV9TdHJ1Y3QoKTtcbiAgICAgICAgc3dpdGNoIChwcm9wX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgXCJmbG9hdFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X3R5cGUgPSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Zsb2F0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJpbnRcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlID0gUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9JbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImJvb2xcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlID0gUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9Cb29sO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwcm9wIHR5cGUgJHtwcm9wX3R5cGV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGFnX3NwbGl0LnNoaWZ0KCk7XG4gICAgICAgIHdoaWxlICh0YWdfc3BsaXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgW2xlZnQsIHJpZ2h0XSA9IHRhZ19wcm9wX3RvX3BhcnRzKHRhZ19zcGxpdC5zaGlmdCgpKTtcbiAgICAgICAgICAgIHN3aXRjaCAobGVmdCkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSYW5nZVwiOlxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfRmxvYXQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbbWluX2FzX3N0cmluZywgbWF4X2FzX3N0cmluZ10gPSByaWdodC5zcGxpdChcIjtcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5mbG9hdF9yYW5nZV9taW4gPSBwYXJzZUZsb2F0KG1pbl9hc19zdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWF4ID0gcGFyc2VGbG9hdChtYXhfYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfSW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW21pbl9hc19zdHJpbmcsIG1heF9hc19zdHJpbmddID0gcmlnaHQuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21pbiA9IHBhcnNlSW50KG1pbl9hc19zdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21heCA9IHBhcnNlSW50KG1heF9hc19zdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9Cb29sOiB0aHJvdyBuZXcgRXJyb3IoXCJCb29sZWFuIGRvc2Ugbm90IGhhdmUgYSByYW5nZSFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdHlwZSBpbiAke25hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRlZmF1bHRcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Zsb2F0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHQgPSBwYXJzZUZsb2F0KHJpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfSW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9kZWZhdWx0ID0gcGFyc2VJbnQocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9Cb29sOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmJvb2xfZGVmYXVsdCA9IHBhcnNlX2Jvb2wocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0eXBlIGluICR7bmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHJvcGVydHkgJHtsZWZ0fWApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gc29tZSB3YXkgdG8gcHJpbnQgYW4gb2JqZWN0LlxuICAgICAgICAvLyBsb2coTG9nX1R5cGUuRGVidWdfU2xpZGVycywgYHByb3BlcnR5IHN0cnVjdCAke3Byb3BlcnR5X3N0cnVjdH1gKTtcbiAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Zsb2F0OlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9mbG9hdF9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgbmFtZSwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9JbnQ6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtYWtlX2ludF9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgbmFtZSwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9Cb29sOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9ib29sX3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb3BlcnR5IHR5cGUgJHtwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZX1gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgICAgIE1ha2UgYSBzbGlkZXIgZm9yIGEgZmxvYXRcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2Zsb2F0X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IHNsaWRlcl9pZCA9IGBzbGlkZXJfJHtuYW1lfWA7XG4gICAgY29uc3QgcGFyYWdyYXBoX2lkID0gYCR7c2xpZGVyX2lkfV9wYXJhZ3JhcGhgO1xuICAgIGNvbnN0IHBhcmFncmFwaF90ZXh0ID0gYCR7bmFtZS5yZXBsYWNlKC9fL2csIFwiIFwiKX1gO1xuICAgIGNvbnN0IGh0bWxfc3RyaW5nID0gYFxuICAgICAgICA8cCBjbGFzcz1cInNsaWRlcktleVwiIGlkPVwiJHtwYXJhZ3JhcGhfaWR9XCI+XG4gICAgICAgICAgICAke3BhcmFncmFwaF90ZXh0fTogJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWlufVwiIG1heD1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21heH1cIiB2YWx1ZT1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHR9XCIgc3RlcD1cIjAuMDA1XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7c2xpZGVyX2lkfVwiPlxuICAgICAgICBgO1xuICAgIGNvbnN0IG5ld19lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuZXdfZWxlbWVudC5jbGFzc05hbWUgPSBcInJhbmdlSG9sZGVyXCI7XG4gICAgbmV3X2VsZW1lbnQuaW5uZXJIVE1MID0gaHRtbF9zdHJpbmc7XG4gICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdfZWxlbWVudCk7XG4gICAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2xpZGVyX2lkKTtcbiAgICBpZiAoc2xpZGVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmluZCB0aGUgc2xpZGVyIHdlIGp1c3QgbWFkZS4uLlwiKTtcbiAgICBzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB0aGVfc2xpZGVyID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBpZiAodGhlX3NsaWRlciA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRhcmdldCB3YXMgbnVsbCwgZGlkIGl0cyBvd24gZWxlbWVudCBnZXQgZGVsZXRlZCB1bmRlcm5lYXRoIGl0c2VsZj9cIik7XG4gICAgICAgIGNvbnN0IHNsaWRlcl9udW1iZXIgPSBOdW1iZXIodGhlX3NsaWRlci52YWx1ZSk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl90ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFyYWdyYXBoX2lkKTtcbiAgICAgICAgaWYgKHNsaWRlcl90ZXh0ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjb3VsZCBub3QgZmluZCBzbGlkZXJfdGV4dCAke3BhcmFncmFwaF9pZH1gKTtcbiAgICAgICAgc2xpZGVyX3RleHQudGV4dENvbnRlbnQgPSBgJHtwYXJhZ3JhcGhfdGV4dH06ICR7c2xpZGVyX251bWJlcn1gO1xuICAgICAgICBzZXRfcHJvcGVydHkobmFtZSwgc2xpZGVyX251bWJlcik7XG4gICAgfSk7XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgICAgICAgTWFrZSBhIHNsaWRlciBmb3IgYW4gaW50XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gbWFrZV9pbnRfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIG5hbWUsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KSB7XG4gICAgY29uc3QgaWQgPSBgc2xpZGVyXyR7bmFtZX1gO1xuICAgIGNvbnN0IHBhcmFfaWQgPSBgJHtpZH1fcGFyYWdyYXBoYDtcbiAgICBjb25zdCBwYXJhZ3JhcGhfdGV4dCA9IGAke25hbWUucmVwbGFjZSgvXy9nLCBcIiBcIil9YDtcbiAgICBjb25zdCBodG1sX3N0cmluZyA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJzbGlkZXJLZXlcIiBpZD1cIiR7cGFyYV9pZH1cIj5cbiAgICAgICAgICAgICR7cGFyYWdyYXBoX3RleHR9OiAke3Byb3BlcnR5X3N0cnVjdC5pbnRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21pbn1cIiBtYXg9XCIke3Byb3BlcnR5X3N0cnVjdC5pbnRfcmFuZ2VfbWF4fVwiIHZhbHVlPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHR9XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7aWR9XCI+XG4gICAgICAgIGA7XG4gICAgY29uc3QgbmV3X3RoaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuZXdfdGhpbmcuY2xhc3NOYW1lID0gXCJyYW5nZUhvbGRlclwiO1xuICAgIG5ld190aGluZy5pbm5lckhUTUwgPSBodG1sX3N0cmluZztcbiAgICBzbGlkZXJfY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld190aGluZyk7XG4gICAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBmaW5kIHRoZSBzbGlkZXJcIik7XG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgdGhlX3NsaWRlciA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKHRoZV9zbGlkZXIgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUYXJnZXQgd2FzIG51bGwsIGRpZCBpdHMgb3duIGVsZW1lbnQgZ2V0IGRlbGV0ZWQgdW5kZXJuZWF0aCBpdHNlbGY/XCIpO1xuICAgICAgICBjb25zdCBzbGlkZXJfbnVtYmVyID0gTnVtYmVyKHRoZV9zbGlkZXIudmFsdWUpO1xuICAgICAgICBjb25zdCBzbGlkZXJfdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcmFfaWQpO1xuICAgICAgICBpZiAoc2xpZGVyX3RleHQgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNvdWxkIG5vdCBmaW5kIHNsaWRlcl90ZXh0ICR7cGFyYV9pZH1gKTtcbiAgICAgICAgc2xpZGVyX3RleHQudGV4dENvbnRlbnQgPSBgJHtwYXJhZ3JhcGhfdGV4dH06ICR7c2xpZGVyX251bWJlcn1gO1xuICAgICAgICBzZXRfcHJvcGVydHkobmFtZSwgc2xpZGVyX251bWJlcik7XG4gICAgfSk7XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgIE1ha2UgYSBzbGlkZXIgZm9yIGFuIGJvb2xlYW4gdG9nZ2xlXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gbWFrZV9ib29sX3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IGlkID0gYHNsaWRlcl8ke25hbWV9YDtcbiAgICBjb25zdCBwYXJhZ3JhcGhfdGV4dCA9IGAke25hbWUucmVwbGFjZSgvXy9nLCBcIiBcIil9YDtcbiAgICBjb25zdCBodG1sX3N0cmluZyA9IGBcbiAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiICR7cHJvcGVydHlfc3RydWN0LmJvb2xfZGVmYXVsdCA/IFwiY2hlY2tlZFwiIDogXCJcIn0gY2xhc3M9XCJjaGVja2JveF90b2dnbGVcIiBpZD1cIiR7aWR9XCI+XG4gICAgICAgIDxsYWJlbCBmb3I9XCIke2lkfVwiIGNsYXNzPVwiY2hlY2tib3hfdG9nZ2xlX2xhYmVsXCI+JHtwYXJhZ3JhcGhfdGV4dH08L2xhYmVsPlxuICAgICAgICBgO1xuICAgIGNvbnN0IG5ld190aGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmV3X3RoaW5nLmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICBuZXdfdGhpbmcuaW5uZXJIVE1MID0gaHRtbF9zdHJpbmc7XG4gICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdfdGhpbmcpO1xuICAgIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoc2xpZGVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmluZCB0aGUgc2xpZGVyXCIpO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFyZ2V0IHdhcyBudWxsLCBkaWQgb3duIG93biBlbGVtZW50IGdldCBkZWxldGVkP1wiKTtcbiAgICAgICAgc2V0X3Byb3BlcnR5KG5hbWUsIHRoZV9zbGlkZXIuY2hlY2tlZCk7XG4gICAgfSk7XG59XG47XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyB0eXBlc2NyaXB0IGdsdWUgY29kZS5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGxvZ2dlcl8xID0gcmVxdWlyZShcIi4vbG9nZ2VyXCIpO1xuY29uc3Qgc2V0dXBfc2xpZGVyc18xID0gcmVxdWlyZShcIi4vc2V0dXBfc2xpZGVyc1wiKTtcbi8vIGNvb2wgdHJpY2tcbmNvbnN0IElOX0RFVl9NT0RFID0gKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PSBcImxvY2FsaG9zdFwiKTtcbjtcbjtcbi8vIE5PVEUgd2Uga2VlcCB0aGUgQHRzLWlnbm9yZSdzIGluIGhlcmVcbmFzeW5jIGZ1bmN0aW9uIGdldF9nb19mdW5jdGlvbnMoKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IGdvID0gbmV3IEdvKCk7IC8vIE5PVEUgdGhpcyBjb21lcyBmcm9tIHRoZSB3YXNtX2V4ZWMuanMgdGhpbmdcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhmZXRjaChcImRpc3QvYm9pZC53YXNtXCIpLCBnby5pbXBvcnRPYmplY3QpO1xuICAgIGdvLnJ1bihyZXN1bHQuaW5zdGFuY2UpO1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgc2V0X3Byb3BlcnRpZXM6IFNldFByb3BlcnRpZXMsXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgZ2V0X3Byb3BlcnRpZXM6IEdldFByb3BlcnRpZXMsXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgZ2V0X25leHRfZnJhbWU6IEdldE5leHRGcmFtZSxcbiAgICB9O1xufVxuO1xuO1xuO1xuO1xuO1xuY29uc3QgbW91c2UgPSB7XG4gICAgcG9zOiB7IHg6IDAsIHk6IDAgfSxcbiAgICBsZWZ0X2Rvd246IGZhbHNlLFxuICAgIG1pZGRsZV9kb3duOiBmYWxzZSxcbiAgICByaWdodF9kb3duOiBmYWxzZSxcbn07XG5mdW5jdGlvbiBkb21fcmVjdF90b19yZWN0KGRvbV9yZWN0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogZG9tX3JlY3QueCxcbiAgICAgICAgeTogZG9tX3JlY3QueSxcbiAgICAgICAgd2lkdGg6IGRvbV9yZWN0LndpZHRoLFxuICAgICAgICAvLyB0byBhY2NvdW50IGZvciBsZXR0ZXJzIGxpa2UgJ2onXG4gICAgICAgIGhlaWdodDogZG9tX3JlY3QuaGVpZ2h0ICsgNSxcbiAgICB9O1xufVxuO1xuZnVuY3Rpb24gZ2V0X2FsbF9jb2xsaWRhYmxlX3JlY3RzKCkge1xuICAgIGNvbnN0IENMQVNTID0gXCJjb2xsaWRlXCI7XG4gICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKENMQVNTKTtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcbiAgICAgICAgY29uc3QgZG9tX3JlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICByZXN1bHQucHVzaChkb21fcmVjdF90b19yZWN0KGRvbV9yZWN0KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG47XG5mdW5jdGlvbiByZW5kZXJfYm9pZHMoZGlzcGxheSwgZ28pIHtcbiAgICAvLyB3ZSBnZXQgdGhlIGJvdW5kaW5nIHJlY3RhbmdsZXMgb2YgZWxlbWVudHMgaW4gdGhlIGRvY3VtZW50LFxuICAgIC8vXG4gICAgLy8gd2UgQ09VTEQgaGF2ZSBqdXN0IHJlbmRlcmVkIHRoZSB0ZXh0IG91cnNlbHZlcywgKHdpdGggLmZpbGxUZXh0KCkpXG4gICAgLy8gYnV0IGkgd2FudCB0aGUgdXNlciB0byBiZSBhYmxlIHRvIHNlbGVjdCB0aGUgZW1haWwgdGV4dC5cbiAgICAvL1xuICAgIC8vIG1heWJlIHdoZW4gdGhhdCBlbWFpbCB0ZXh0IGlzIG1vdmVzIHNvbWV3aGVyZSBlbHNlIHdlIGNvdWxkIGhhdmUgYWxsXG4gICAgLy8gdGhlIGJvaWQgdGV4dCByZW5kZXJlZCBieSB0aGUgYm9pZCBzaW0gaXRzZWxmLlxuICAgIC8vXG4gICAgLy8gYWx0aG91Z2ggdGhhdCBtaWdodCBpbnRyb2R1Y2UgaXNzdWVzIHdoZW4gdGhlIGJvaWQgd2FzbSBoYXNuJ3QgbG9hZGVkLlxuICAgIGNvbnN0IGNvbGxpZGFibGVfcmVjdGFuZ2xlcyA9IGdldF9hbGxfY29sbGlkYWJsZV9yZWN0cygpO1xuICAgIGNvbnN0IEJPSURfQ0FOVkFTX1NRVUlTSF9GQUNUT1IgPSAxO1xuICAgIC8vIHRoaXMgaXMgdGhlIGNhbnZhcyB0aGF0IHRoZSB3YXNtIGlzIGdvaW5nIHRvIGRyYXcgaW50by5cbiAgICAvL1xuICAgIC8vIGJhc2VkIG9uIHRoZSByZW5kZXIgY2FudmFzIGZvciBub3cuXG4gICAgLy9cbiAgICAvLyB1c2luZyBzcXVpc2ggZmFjdG9yLCB3ZSBjYW4gY2hhbmdlIHRoZSByZW5kZXJpbmcgc2l6ZSBvZiB0aGUgYm9pZCBpbWFnZSB3ZSBqdXN0IGdvdC5cbiAgICAvLyBUT0RPIHdoZW4gc3F1aXNoZWQsIG1vdXNlIGlucHV0IGRvc2Ugbm90IHdvcmsgcmlnaHQuXG4gICAgY29uc3QgYm9pZF9jYW52YXNfd2lkdGggPSAvKiAxNioyNTsgKi8gTWF0aC5mbG9vcihkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLndpZHRoIC8gQk9JRF9DQU5WQVNfU1FVSVNIX0ZBQ1RPUik7XG4gICAgY29uc3QgYm9pZF9jYW52YXNfaGVpZ2h0ID0gLyogIDkqMjU7ICovIE1hdGguZmxvb3IoZGlzcGxheS5yZW5kZXJfY3R4LmNhbnZhcy5oZWlnaHQgLyBCT0lEX0NBTlZBU19TUVVJU0hfRkFDVE9SKTtcbiAgICAvLyBbciwgZywgYiwgYV0sIG5vdCBuZWNlc3NhcmlseSBpbiB0aGF0IG9yZGVyXG4gICAgY29uc3QgTlVNX0NPTE9SX0NPTVBPTkVOVFMgPSA0O1xuICAgIGNvbnN0IGJ1ZmZlcl9zaXplID0gYm9pZF9jYW52YXNfd2lkdGggKiBib2lkX2NhbnZhc19oZWlnaHQgKiBOVU1fQ09MT1JfQ09NUE9ORU5UUztcbiAgICAvLyByZXNpemUgYmFjayBidWZmZXIgaWYgY2FudmFzIHNpemUgY2hhbmdlZC5cbiAgICBpZiAoZGlzcGxheS5iYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCAhPT0gYm9pZF9jYW52YXNfd2lkdGggfHwgZGlzcGxheS5iYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQgIT09IGJvaWRfY2FudmFzX2hlaWdodCkge1xuICAgICAgICAoMCwgbG9nZ2VyXzEubG9nKShsb2dnZXJfMS5Mb2dfVHlwZS5HZW5lcmFsLCBcIk9oIGdvZC4gd2VyZSByZXNpemluZyB0aGUgYnVmZmVyXCIpO1xuICAgICAgICBpZiAoZGlzcGxheS5iYWNrX2J1ZmZlcl9hcnJheS5sZW5ndGggPCBidWZmZXJfc2l6ZSkge1xuICAgICAgICAgICAgKDAsIGxvZ2dlcl8xLmxvZykobG9nZ2VyXzEuTG9nX1R5cGUuR2VuZXJhbCwgXCJCYWNrIGJ1ZmZlciBhcnJheSBnZXR0aW5nIGJpZ2dlclwiKTsgLy8gbXkgcGVuaXNcbiAgICAgICAgICAgIC8vIG1ha2UgdGhlIGJ1ZmZlciBiaWdnZXJcbiAgICAgICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfYXJyYXkgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkoYnVmZmVyX3NpemUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJhY2tfY2FudmFzID0gbmV3IE9mZnNjcmVlbkNhbnZhcyhib2lkX2NhbnZhc193aWR0aCwgYm9pZF9jYW52YXNfaGVpZ2h0KTtcbiAgICAgICAgY29uc3QgYmFja19jdHggPSBiYWNrX2NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIGlmIChiYWNrX2N0eCA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIjJEIGNvbnRleHQgaXMgbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9yZW5kZXJfY3R4ID0gYmFja19jdHg7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfcmVuZGVyX2N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCA9IGJvaWRfY2FudmFzX3dpZHRoO1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCA9IGJvaWRfY2FudmFzX2hlaWdodDtcbiAgICB9XG4gICAgY29uc3QgYnVmZmVyID0gZGlzcGxheS5iYWNrX2J1ZmZlcl9hcnJheS5zdWJhcnJheSgwLCBidWZmZXJfc2l6ZSk7XG4gICAgY29uc3QgYXJncyA9IHtcbiAgICAgICAgd2lkdGg6IGJvaWRfY2FudmFzX3dpZHRoLFxuICAgICAgICBoZWlnaHQ6IGJvaWRfY2FudmFzX2hlaWdodCxcbiAgICAgICAgYnVmZmVyOiBidWZmZXIsXG4gICAgICAgIG1vdXNlOiBtb3VzZSxcbiAgICAgICAgcmVjdHM6IGNvbGxpZGFibGVfcmVjdGFuZ2xlcyxcbiAgICB9O1xuICAgIGNvbnN0IG51bV9ieXRlc19maWxsZWQgPSBnby5nZXRfbmV4dF9mcmFtZShhcmdzKTtcbiAgICBpZiAobnVtX2J5dGVzX2ZpbGxlZCAhPT0gYnVmZmVyX3NpemUpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZ28uZ2V0X25leHRfZnJhbWUgZ290IGluY29ycmVjdCBudW1iZXIgb2YgYnl0ZXMsIHdhbnRlZDogJHtidWZmZXJfc2l6ZX0sIGdvdDogJHtudW1fYnl0ZXNfZmlsbGVkfWApO1xuICAgIC8vIEB0cy1pZ25vcmUgLy8gd2h5IGRvc2UgdGhpcyBsaW5lIG1ha2UgYW4gZXJyb3IgaW4gbXkgZWRpdG9yXG4gICAgY29uc3QgaW1hZ2VfZGF0YSA9IG5ldyBJbWFnZURhdGEoYnVmZmVyLCBib2lkX2NhbnZhc193aWR0aCwgYm9pZF9jYW52YXNfaGVpZ2h0KTtcbiAgICAvLyBpcyB0aGlzIGNvb2w/XG4gICAgLy9cbiAgICAvLyB0aGUgd2hvbGUgcG9pbnQgb2YgdGhpcyBiYWNrX2J1ZmZlciBpcyB0byBwcmV2ZW50IGZsaWNrZXJpbmcgYW5kXG4gICAgLy8gc3R1ZmYsIGJ1ZiBpZiB3ZXJlIG9ubHkgZ29pbmcgdG8gYmUgZHJhd2luZyBvbmUgdGhpbmcuLi5cbiAgICAvLyB3aGF0cyB0aGUgcG9pbnQ/XG4gICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LnB1dEltYWdlRGF0YShpbWFnZV9kYXRhLCAwLCAwKTtcbiAgICAvLyBOT1RFIHRoaXMgd2lsbCBzdHJldGNoIHRoZSB0aGluZy5cbiAgICAvLyBjYW52YXMud2lkdGggbWlnaHQgY2hhbmdlIGR1cmluZyB0aGUgdGltZSB0aGlzIGlzIHJ1bm5pbmdcbiAgICBkaXNwbGF5LnJlbmRlcl9jdHguZHJhd0ltYWdlKGRpc3BsYXkuYmFja19idWZmZXJfcmVuZGVyX2N0eC5jYW52YXMsIDAsIDAsIGRpc3BsYXkucmVuZGVyX2N0eC5jYW52YXMud2lkdGgsIGRpc3BsYXkucmVuZGVyX2N0eC5jYW52YXMuaGVpZ2h0KTtcbiAgICAvLyBsZXRzIGhvcGUgamF2YXNjcmlwdCBpcyBzbWFydCBlbm91Z2ggdG8gZGVhbGxvY2F0ZSB0aGlzLi4uXG4gICAgLy8gaW1hZ2VEYXRhID0gbnVsbFxufVxuO1xuLy8gVE9ETyBtYWtlIHRoaXMgc21hcnRlci5cbmNvbnN0IHJlbmRlcl90aW1lcyA9IFtdO1xuY29uc3QgZGVsdGFfdGltZXMgPSBbXTtcbi8vIENyZWRpdDogaHR0cHM6Ly9naXRodWIuY29tL3Rzb2Rpbmcva29pbFxuLy8gXG4vLyBUT0RPIHJlbW92ZSBuZXdfcmVuZGVyX3RpbWUsIGFuZCBuZXdfZGVsdGFfdGltZSwganVzdCBtYWtlIGEgY2xhc3Mgb3Igc29tZXRoaW5nLlxuZnVuY3Rpb24gcmVuZGVyX2RlYnVnX2luZm8oZGlzcGxheSwgbmV3X3JlbmRlcl90aW1lLCBuZXdfZGVsdGFfdGltZSkge1xuICAgIGNvbnN0IEZPTlRfU0laRSA9IDI4O1xuICAgIGRpc3BsYXkucmVuZGVyX2N0eC5mb250ID0gYCR7Rk9OVF9TSVpFfXB4IGJvbGRgO1xuICAgIHJlbmRlcl90aW1lcy5wdXNoKG5ld19yZW5kZXJfdGltZSk7XG4gICAgaWYgKHJlbmRlcl90aW1lcy5sZW5ndGggPiA2MCkge1xuICAgICAgICByZW5kZXJfdGltZXMuc2hpZnQoKTtcbiAgICB9XG4gICAgZGVsdGFfdGltZXMucHVzaChuZXdfZGVsdGFfdGltZSk7XG4gICAgaWYgKGRlbHRhX3RpbWVzLmxlbmd0aCA+IDYwKSB7XG4gICAgICAgIGRlbHRhX3RpbWVzLnNoaWZ0KCk7XG4gICAgfVxuICAgIGNvbnN0IHJlbmRlcl9hdmcgPSByZW5kZXJfdGltZXMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyByZW5kZXJfdGltZXMubGVuZ3RoO1xuICAgIGNvbnN0IGRlbHRhX2F2ZyA9IGRlbHRhX3RpbWVzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gZGVsdGFfdGltZXMubGVuZ3RoO1xuICAgIGNvbnN0IGxhYmVscyA9IFtdO1xuICAgIHsgLy8gY29uc3RydWN0IHRoZSBsYWJlbHMuXG4gICAgICAgIC8vIHRoaXMgaXMgdGhlIG9ubHkgdW5pcXVlIHRoaW5ncyBiZXR3ZWVuIHJlbmRlcl90aW1lcyBhbmQgZGVsdGFfdGltZXNcbiAgICAgICAgY29uc3QgZnJhbWVzX3Blcl9zZWNvbmQgPSAoMSAvIGRlbHRhX2F2ZyAqIDEwMDApLnRvRml4ZWQoMik7XG4gICAgICAgIGNvbnN0IHNlY29uZHNfcGVyX2ZyYW1lID0gKGRlbHRhX2F2ZyAvIDEwMDApLnRvRml4ZWQoNSk7XG4gICAgICAgIGxhYmVscy5wdXNoKGBGL1M6ICR7ZnJhbWVzX3Blcl9zZWNvbmR9ICAgIFMvRjogJHtzZWNvbmRzX3Blcl9mcmFtZX1gKTtcbiAgICAgICAgbGFiZWxzLnB1c2goYFdBU00gUmVuZGVyIFRpbWUgQXZnIChtcyk6ICR7cmVuZGVyX2F2Zy50b0ZpeGVkKDIpfWApO1xuICAgICAgICBsYWJlbHMucHVzaChgUmVuZGVyL1NlYyAoTUFYKTogJHsoMSAvIHJlbmRlcl9hdmcgKiAxMDAwKS50b0ZpeGVkKDIpfWApO1xuICAgIH1cbiAgICBjb25zdCBQQURESU5HID0gNzA7XG4gICAgY29uc3QgU0hBRE9XX09GRlNFVCA9IEZPTlRfU0laRSAqIDAuMDY7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxUZXh0KGxhYmVsc1tpXSwgUEFERElORywgUEFERElORyArIEZPTlRfU0laRSAqIGkpO1xuICAgICAgICBkaXNwbGF5LnJlbmRlcl9jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgICBkaXNwbGF5LnJlbmRlcl9jdHguZmlsbFRleHQobGFiZWxzW2ldLCBQQURESU5HICsgU0hBRE9XX09GRlNFVCwgUEFERElORyAtIFNIQURPV19PRkZTRVQgKyBGT05UX1NJWkUgKiBpKTtcbiAgICB9XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgICAgICAgICBUaGUgTWFpbiBGdW5jdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbihhc3luYyAoKSA9PiB7XG4gICAgaWYgKElOX0RFVl9NT0RFKVxuICAgICAgICBjb25zb2xlLmxvZyhcIkluIERldiBNb2RlXCIpO1xuICAgIGNvbnN0IGdvID0gYXdhaXQgZ2V0X2dvX2Z1bmN0aW9ucygpO1xuICAgIHsgLy8gSGFuZGxlIHNsaWRlciBzdHVmZlxuICAgICAgICBjb25zdCBib2lkX3Byb3BlcnRpZXMgPSBPYmplY3QuZW50cmllcyhnby5nZXRfcHJvcGVydGllcygpKTtcbiAgICAgICAgZnVuY3Rpb24gc2V0X3Byb3BlcnR5KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjcxMDkwNS9ob3ctZG8taS1keW5hbWljYWxseS1hc3NpZ24tcHJvcGVydGllcy10by1hbi1vYmplY3QtaW4tdHlwZXNjcmlwdFxuICAgICAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgICAgICBvYmpbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIGdvLnNldF9wcm9wZXJ0aWVzKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgO1xuICAgICAgICAvLyBUT0RPIG1heWJlIG1ha2UgdGhpcyBkZXYgbW9kZSBvbmx5Li4uXG4gICAgICAgIC8vIGl0IGFsc28gaGFzIHRvIHJlbW92ZSB0aGUgU2V0dGluZ3MgdGhpbmcuLi5cbiAgICAgICAgKDAsIHNldHVwX3NsaWRlcnNfMS5zZXR1cF9zbGlkZXJzKShib2lkX3Byb3BlcnRpZXMsIHNldF9wcm9wZXJ0eSk7XG4gICAgfVxuICAgIHsgLy8gc2V0dXAgaW5wdXQgaGFuZGxpbmcuXG4gICAgICAgIC8vIHdoeSBkb2Vzbid0IHR5cGVzY3JpcHQgaGF2ZSBhbiBlbnVtIGZvciB0aGlzP1xuICAgICAgICBsZXQgTW91c2VfQnV0dG9ucztcbiAgICAgICAgKGZ1bmN0aW9uIChNb3VzZV9CdXR0b25zKSB7XG4gICAgICAgICAgICBNb3VzZV9CdXR0b25zW01vdXNlX0J1dHRvbnNbXCJMZWZ0XCJdID0gMF0gPSBcIkxlZnRcIjtcbiAgICAgICAgICAgIE1vdXNlX0J1dHRvbnNbTW91c2VfQnV0dG9uc1tcIk1pZGRsZVwiXSA9IDFdID0gXCJNaWRkbGVcIjtcbiAgICAgICAgICAgIE1vdXNlX0J1dHRvbnNbTW91c2VfQnV0dG9uc1tcIlJpZ2h0XCJdID0gMl0gPSBcIlJpZ2h0XCI7XG4gICAgICAgIH0pKE1vdXNlX0J1dHRvbnMgfHwgKE1vdXNlX0J1dHRvbnMgPSB7fSkpO1xuICAgICAgICA7XG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5nZXRSb290Tm9kZSgpO1xuICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChldikgPT4ge1xuICAgICAgICAgICAgbW91c2UucG9zID0geyB4OiBldi54LCB5OiBldi55IH07XG4gICAgICAgIH0pO1xuICAgICAgICAvLyB0aGlzIHdpbGwgYnJlYWsgaWYgdGhlIHVzZXIgc2xpZGVzIHRoZXJlIG1vdXNlIG91dHNpZGUgb2YgdGhlIHNjcmVlbiB3aGlsZSBjbGlja2luZywgYnV0IHRoaXMgaXMgdGhlIHdlYiwgcGVvcGxlIGV4cGVjdCBpdCB0byBzdWNrLlxuICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldikgPT4ge1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLkxlZnQpXG4gICAgICAgICAgICAgICAgbW91c2UubGVmdF9kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5NaWRkbGUpXG4gICAgICAgICAgICAgICAgbW91c2UubWlkZGxlX2Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLlJpZ2h0KVxuICAgICAgICAgICAgICAgIG1vdXNlLnJpZ2h0X2Rvd24gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuTGVmdClcbiAgICAgICAgICAgICAgICBtb3VzZS5sZWZ0X2Rvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5NaWRkbGUpXG4gICAgICAgICAgICAgICAgbW91c2UubWlkZGxlX2Rvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5SaWdodClcbiAgICAgICAgICAgICAgICBtb3VzZS5yaWdodF9kb3duID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjb25zdCBjYW52YXNfY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNfZGl2XCIpIGFzIEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbFxuICAgIGNvbnN0IGJvaWRfY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2lkX2NhbnZhc1wiKTtcbiAgICBpZiAoYm9pZF9jYW52YXMgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGNhbnZhcyB3aXRoIGlkIGBib2lkX2NhbnZhc2AgaXMgZm91bmRcIik7XG4gICAgLy8gVE9ETyBuYW1pbmcgYmV0dGVyLCB1c2Ugc25ha2UgY2FzZSBldmVyeXdoZXJlISFcbiAgICBjb25zdCBib2lkX2NhbnZhc19yZW5kZXJfY3R4ID0gYm9pZF9jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIGlmIChib2lkX2NhbnZhc19yZW5kZXJfY3R4ID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIyRCBjb250ZXh0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICBjb25zdCBbYmFja19idWZmZXJfaW1hZ2Vfd2lkdGgsIGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodF0gPSBbYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5jYW52YXMud2lkdGgsIGJvaWRfY2FudmFzX3JlbmRlcl9jdHguY2FudmFzLmhlaWdodF07XG4gICAgY29uc3QgYmFja19idWZmZXJfY2FudmFzID0gbmV3IE9mZnNjcmVlbkNhbnZhcyhiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCwgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0KTtcbiAgICBjb25zdCBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4ID0gYmFja19idWZmZXJfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoYmFja19idWZmZXJfcmVuZGVyX2N0eCA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgIGJhY2tfYnVmZmVyX3JlbmRlcl9jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgY29uc3QgYmFja19idWZmZXJfYXJyYXkgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkoYmFja19idWZmZXJfaW1hZ2Vfd2lkdGggKiBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQgKiA0KTtcbiAgICBjb25zdCBkaXNwbGF5ID0ge1xuICAgICAgICByZW5kZXJfY3R4OiBib2lkX2NhbnZhc19yZW5kZXJfY3R4LFxuICAgICAgICBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4OiBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LFxuICAgICAgICBiYWNrX2J1ZmZlcl9hcnJheTogYmFja19idWZmZXJfYXJyYXksXG4gICAgICAgIGJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoOiBiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCxcbiAgICAgICAgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0OiBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQsXG4gICAgfTtcbiAgICBsZXQgcHJldl90aW1lc3RhbXAgPSAwO1xuICAgIGNvbnN0IGZyYW1lID0gKHRpbWVzdGFtcCkgPT4ge1xuICAgICAgICBib2lkX2NhbnZhc19yZW5kZXJfY3R4LmNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBib2lkX2NhbnZhc19yZW5kZXJfY3R4LmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGNvbnN0IGRlbHRhX3RpbWUgPSAodGltZXN0YW1wIC0gcHJldl90aW1lc3RhbXApO1xuICAgICAgICBwcmV2X3RpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICAgICAgLy8gVE9ETyBEb24ndCBuZWVkIGRlbHRhIHRpbWUsIGJvaWQgdGhpbmcgZG9zZSBpdCBmb3IgdXM/IGNoYW5nZT9cbiAgICAgICAgY29uc3Qgc3RhcnRfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICByZW5kZXJfYm9pZHMoZGlzcGxheSwgZ28pO1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAvLyBJbiBtc1xuICAgICAgICBjb25zdCByZW5kZXJfdGltZSA9IGVuZF90aW1lIC0gc3RhcnRfdGltZTtcbiAgICAgICAgaWYgKGxvZ2dlcl8xLkRFQlVHX0RJU1BMQVkgJiYgSU5fREVWX01PREUpXG4gICAgICAgICAgICByZW5kZXJfZGVidWdfaW5mbyhkaXNwbGF5LCByZW5kZXJfdGltZSwgZGVsdGFfdGltZSk7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgIH07XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgodGltZXN0YW1wKSA9PiB7XG4gICAgICAgIHByZXZfdGltZXN0YW1wID0gdGltZXN0YW1wO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgICB9KTtcbn0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=