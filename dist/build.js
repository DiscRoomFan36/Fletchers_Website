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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxzQ0FBc0M7QUFDL0M7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvbG9nZ2VyLnRzIiwid2VicGFjazovL2JvaWRzLy4vd2ViX3NyYy9zZXR1cF9zbGlkZXJzLnRzIiwid2VicGFjazovL2JvaWRzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JvaWRzLy4vd2ViX3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTG9nX1R5cGUgPSBleHBvcnRzLkRFQlVHX1NMSURFUlMgPSBleHBvcnRzLkRFQlVHX0RJU1BMQVkgPSB2b2lkIDA7XG5leHBvcnRzLmxvZyA9IGxvZztcbi8vIGlzIGl0IGNvcnJlY3QgdG8gaGF2ZSB0aGVzZSBoZXJlPyB0aGlzIG9uZSBlZmZlY3RzXG4vLyBkcmF3aW5nIG9uIHRoZSBzY3JlZW4sIG5vdCBqdXN0IGxvZ2dpbmc/IGFsdGhvdWdoIHdlXG4vLyBjb3VsZCBtYWtlIGFsbCBsb2dzIGFwcGVhciBvbiBzY3JlZW4uLi5cbmV4cG9ydHMuREVCVUdfRElTUExBWSA9IHRydWU7XG5leHBvcnRzLkRFQlVHX1NMSURFUlMgPSBmYWxzZTtcbnZhciBMb2dfVHlwZTtcbihmdW5jdGlvbiAoTG9nX1R5cGUpIHtcbiAgICBMb2dfVHlwZVtMb2dfVHlwZVtcIkdlbmVyYWxcIl0gPSAwXSA9IFwiR2VuZXJhbFwiO1xuICAgIExvZ19UeXBlW0xvZ19UeXBlW1wiRGVidWdfRGlzcGxheVwiXSA9IDFdID0gXCJEZWJ1Z19EaXNwbGF5XCI7XG4gICAgTG9nX1R5cGVbTG9nX1R5cGVbXCJEZWJ1Z19TbGlkZXJzXCJdID0gMl0gPSBcIkRlYnVnX1NsaWRlcnNcIjtcbn0pKExvZ19UeXBlIHx8IChleHBvcnRzLkxvZ19UeXBlID0gTG9nX1R5cGUgPSB7fSkpO1xuO1xuZnVuY3Rpb24gbG9nKGxvZ190eXBlLCAuLi5kYXRhKSB7XG4gICAgLy8gaWYgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXG4gICAgdmFyIGRvX2xvZyA9IGZhbHNlO1xuICAgIHZhciBsb2dfaGVhZGVyID0gXCJcIjtcbiAgICBzd2l0Y2ggKGxvZ190eXBlKSB7XG4gICAgICAgIGNhc2UgTG9nX1R5cGUuR2VuZXJhbDpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2dfaGVhZGVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICBkb19sb2cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTG9nX1R5cGUuRGVidWdfRGlzcGxheTpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2dfaGVhZGVyID0gXCJERUJVR19ESVNQTEFZXCI7XG4gICAgICAgICAgICAgICAgaWYgKGV4cG9ydHMuREVCVUdfRElTUExBWSlcbiAgICAgICAgICAgICAgICAgICAgZG9fbG9nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIExvZ19UeXBlLkRlYnVnX1NsaWRlcnM6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiREVCVUdfU0xJREVSU1wiO1xuICAgICAgICAgICAgICAgIGlmIChleHBvcnRzLkRFQlVHX1NMSURFUlMpXG4gICAgICAgICAgICAgICAgICAgIGRvX2xvZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGRvX2xvZykge1xuICAgICAgICBpZiAobG9nX2hlYWRlciAhPSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dfaGVhZGVyfTogYCwgLi4uZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyguLi5kYXRhKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zZXR1cF9zbGlkZXJzID0gc2V0dXBfc2xpZGVycztcbmNvbnN0IGxvZ2dlcl8xID0gcmVxdWlyZShcIi4vbG9nZ2VyXCIpO1xudmFyIFByb3BlcnR5X1R5cGU7XG4oZnVuY3Rpb24gKFByb3BlcnR5X1R5cGUpIHtcbiAgICBQcm9wZXJ0eV9UeXBlW1Byb3BlcnR5X1R5cGVbXCJOb25lXCJdID0gMF0gPSBcIk5vbmVcIjtcbiAgICBQcm9wZXJ0eV9UeXBlW1Byb3BlcnR5X1R5cGVbXCJQcm9wZXJ0eV9GbG9hdFwiXSA9IDFdID0gXCJQcm9wZXJ0eV9GbG9hdFwiO1xuICAgIFByb3BlcnR5X1R5cGVbUHJvcGVydHlfVHlwZVtcIlByb3BlcnR5X0ludFwiXSA9IDJdID0gXCJQcm9wZXJ0eV9JbnRcIjtcbiAgICBQcm9wZXJ0eV9UeXBlW1Byb3BlcnR5X1R5cGVbXCJQcm9wZXJ0eV9Cb29sXCJdID0gM10gPSBcIlByb3BlcnR5X0Jvb2xcIjtcbn0pKFByb3BlcnR5X1R5cGUgfHwgKFByb3BlcnR5X1R5cGUgPSB7fSkpO1xuO1xuY2xhc3MgUHJvcGVydHlfU3RydWN0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0eV90eXBlID0gUHJvcGVydHlfVHlwZS5Ob25lO1xuICAgICAgICAvLyBGbG9hdCBwcm9wZXJ0aWVzXG4gICAgICAgIHRoaXMuZmxvYXRfcmFuZ2VfbWluID0gMDtcbiAgICAgICAgdGhpcy5mbG9hdF9yYW5nZV9tYXggPSAwO1xuICAgICAgICB0aGlzLmZsb2F0X2RlZmF1bHQgPSAwO1xuICAgICAgICAvLyBJbnQgcHJvcGVydGllc1xuICAgICAgICB0aGlzLmludF9yYW5nZV9taW4gPSAwO1xuICAgICAgICB0aGlzLmludF9yYW5nZV9tYXggPSAwO1xuICAgICAgICB0aGlzLmludF9kZWZhdWx0ID0gMDtcbiAgICAgICAgdGhpcy5ib29sX2RlZmF1bHQgPSBmYWxzZTtcbiAgICB9XG59XG47XG5mdW5jdGlvbiB0YWdfcHJvcF90b19wYXJ0cyhwcm9wKSB7XG4gICAgY29uc3QgW2xlZnQsIHJpZ2h0X3dpdGhfanVua10gPSBwcm9wLnNwbGl0KFwiOlwiKTtcbiAgICBjb25zdCByaWdodCA9IHJpZ2h0X3dpdGhfanVuay5zbGljZSgxLCByaWdodF93aXRoX2p1bmsubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIFtsZWZ0LCByaWdodF07XG59XG47XG5mdW5jdGlvbiBwYXJzZV9ib29sKHMpIHtcbiAgICAvLyAxLCB0LCBULCBUUlVFLCB0cnVlLCBUcnVlLFxuICAgIC8vIDAsIGYsIEYsIEZBTFNFLCBmYWxzZSwgRmFsc2VcbiAgICBzd2l0Y2ggKHMpIHtcbiAgICAgICAgY2FzZSBcIjFcIjpcbiAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgY2FzZSBcIlRSVUVcIjpcbiAgICAgICAgY2FzZSBcInRydWVcIjpcbiAgICAgICAgY2FzZSBcIlRydWVcIjoge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIjBcIjpcbiAgICAgICAgY2FzZSBcImZcIjpcbiAgICAgICAgY2FzZSBcIkZcIjpcbiAgICAgICAgY2FzZSBcIkZBTFNFXCI6XG4gICAgICAgIGNhc2UgXCJmYWxzZVwiOlxuICAgICAgICBjYXNlIFwiRmFsc2VcIjoge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzdHJpbmcgaW4gcGFyc2VCb29sLCB3YXMgJHtzfWApO1xuICAgIH1cbn1cbjtcbi8vIHB1dHMgc29tZSBzbGlkZXJzIHVwIHRvIGNvbnRyb2wgc29tZSBwYXJhbWV0ZXJzXG5mdW5jdGlvbiBzZXR1cF9zbGlkZXJzKHByb3BlcnRpZXMsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IFNMSURFUl9DT05UQUlORVJfSUQgPSBcInNsaWRlQ29udGFpbmVyXCI7XG4gICAgY29uc3Qgc2xpZGVyX2NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFNMSURFUl9DT05UQUlORVJfSUQpO1xuICAgIGlmIChzbGlkZXJfY29udGFpbmVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgR2V0IHNsaWRlciBjb250YWluZXJcIik7XG4gICAgLy8gVE9ETyBmb3IgdGhlIHNsaWRlcyB0aGF0IGhhdmUgYSBzbWFsbCByYW5nZSAobGlrZSBjb2hlc2lvbiBmYWN0b3IpIG1ha2UgdGhlIHZhbHVlIHRoZSBzcXVhcmUgb2YgdGhlIG51bWJlci5cbiAgICBwcm9wZXJ0aWVzLnNvcnQoKTsgLy8gaG9wZSBzb21lb25lIGVsc2Ugd2Fzbid0IHVzaW5nIHRoaXMuXG4gICAgZm9yIChjb25zdCBbbmFtZSwgdGFnXSBvZiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkRlYnVnX1NsaWRlcnMsIGB0eXBlc2NyaXB0OiAke25hbWV9OiAke3RhZ31gKTtcbiAgICAgICAgLy8gVE9ETyB0aGlzIGZ1bmN0aW9uIGlzIGdyb3dpbmcgdG8gYmlnLCBwdXQgaXQgaW4gYSBzZXBhcmF0ZSBmaWxlLlxuICAgICAgICBjb25zdCB0YWdfc3BsaXQgPSB0YWcuc3BsaXQoXCIgXCIpO1xuICAgICAgICBjb25zdCBbcHJvcF9wcm9wZXJ0eSwgcHJvcF90eXBlXSA9IHRhZ19wcm9wX3RvX3BhcnRzKHRhZ19zcGxpdFswXSk7XG4gICAgICAgIGlmIChwcm9wX3Byb3BlcnR5ICE9IFwiUHJvcGVydHlcIilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmlyc3QgcHJvcGVydHkgaXMgbm90IHByb3BlcnR5LCB0YWcgd2FzICR7dGFnfWApO1xuICAgICAgICBjb25zdCBwcm9wZXJ0eV9zdHJ1Y3QgPSBuZXcgUHJvcGVydHlfU3RydWN0KCk7XG4gICAgICAgIHN3aXRjaCAocHJvcF90eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwiZmxvYXRcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlID0gUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9GbG9hdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaW50XCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSA9IFByb3BlcnR5X1R5cGUuUHJvcGVydHlfSW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJib29sXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSA9IFByb3BlcnR5X1R5cGUuUHJvcGVydHlfQm9vbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHJvcCB0eXBlICR7cHJvcF90eXBlfWApO1xuICAgICAgICB9XG4gICAgICAgIHRhZ19zcGxpdC5zaGlmdCgpO1xuICAgICAgICB3aGlsZSAodGFnX3NwbGl0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IFtsZWZ0LCByaWdodF0gPSB0YWdfcHJvcF90b19wYXJ0cyh0YWdfc3BsaXQuc2hpZnQoKSk7XG4gICAgICAgICAgICBzd2l0Y2ggKGxlZnQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmFuZ2VcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Zsb2F0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW21pbl9hc19zdHJpbmcsIG1heF9hc19zdHJpbmddID0gcmlnaHQuc3BsaXQoXCI7XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWluID0gcGFyc2VGbG9hdChtaW5fYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21heCA9IHBhcnNlRmxvYXQobWF4X2FzX3N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0ludDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFttaW5fYXNfc3RyaW5nLCBtYXhfYXNfc3RyaW5nXSA9IHJpZ2h0LnNwbGl0KFwiO1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9taW4gPSBwYXJzZUludChtaW5fYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9tYXggPSBwYXJzZUludChtYXhfYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfQm9vbDogdGhyb3cgbmV3IEVycm9yKFwiQm9vbGVhbiBkb3NlIG5vdCBoYXZlIGEgcmFuZ2UhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHR5cGUgaW4gJHtuYW1lfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJEZWZhdWx0XCI6XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocHJvcGVydHlfc3RydWN0LnByb3BlcnR5X3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9GbG9hdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5mbG9hdF9kZWZhdWx0ID0gcGFyc2VGbG9hdChyaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0ludDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5pbnRfZGVmYXVsdCA9IHBhcnNlSW50KHJpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfQm9vbDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5ib29sX2RlZmF1bHQgPSBwYXJzZV9ib29sKHJpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdHlwZSBpbiAke25hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHByb3BlcnR5ICR7bGVmdH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIHNvbWUgd2F5IHRvIHByaW50IGFuIG9iamVjdC5cbiAgICAgICAgLy8gbG9nKExvZ19UeXBlLkRlYnVnX1NsaWRlcnMsIGBwcm9wZXJ0eSBzdHJ1Y3QgJHtwcm9wZXJ0eV9zdHJ1Y3R9YCk7XG4gICAgICAgIHN3aXRjaCAocHJvcGVydHlfc3RydWN0LnByb3BlcnR5X3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9GbG9hdDpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ha2VfZmxvYXRfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIG5hbWUsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfSW50OlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9pbnRfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIG5hbWUsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfQm9vbDpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ha2VfYm9vbF9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgbmFtZSwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwcm9wZXJ0eSB0eXBlICR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X3R5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgICAgICBNYWtlIGEgc2xpZGVyIGZvciBhIGZsb2F0XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gbWFrZV9mbG9hdF9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgbmFtZSwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBzbGlkZXJfaWQgPSBgc2xpZGVyXyR7bmFtZX1gO1xuICAgIGNvbnN0IHBhcmFncmFwaF9pZCA9IGAke3NsaWRlcl9pZH1fcGFyYWdyYXBoYDtcbiAgICBjb25zdCBwYXJhZ3JhcGhfdGV4dCA9IGAke25hbWUucmVwbGFjZSgvXy9nLCBcIiBcIil9YDtcbiAgICBjb25zdCBodG1sX3N0cmluZyA9IGBcbiAgICAgICAgPHAgY2xhc3M9XCJzbGlkZXJLZXlcIiBpZD1cIiR7cGFyYWdyYXBoX2lkfVwiPlxuICAgICAgICAgICAgJHtwYXJhZ3JhcGhfdGV4dH06ICR7cHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHR9XG4gICAgICAgIDwvcD5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIG1pbj1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21pbn1cIiBtYXg9XCIke3Byb3BlcnR5X3N0cnVjdC5mbG9hdF9yYW5nZV9tYXh9XCIgdmFsdWU9XCIke3Byb3BlcnR5X3N0cnVjdC5mbG9hdF9kZWZhdWx0fVwiIHN0ZXA9XCIwLjAwNVwiIGNsYXNzPVwic2xpZGVyXCIgaWQ9XCIke3NsaWRlcl9pZH1cIj5cbiAgICAgICAgYDtcbiAgICBjb25zdCBuZXdfZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmV3X2VsZW1lbnQuY2xhc3NOYW1lID0gXCJyYW5nZUhvbGRlclwiO1xuICAgIG5ld19lbGVtZW50LmlubmVySFRNTCA9IGh0bWxfc3RyaW5nO1xuICAgIHNsaWRlcl9jb250YWluZXIuYXBwZW5kQ2hpbGQobmV3X2VsZW1lbnQpO1xuICAgIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNsaWRlcl9pZCk7XG4gICAgaWYgKHNsaWRlciA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGZpbmQgdGhlIHNsaWRlciB3ZSBqdXN0IG1hZGUuLi5cIik7XG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgdGhlX3NsaWRlciA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKHRoZV9zbGlkZXIgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUYXJnZXQgd2FzIG51bGwsIGRpZCBpdHMgb3duIGVsZW1lbnQgZ2V0IGRlbGV0ZWQgdW5kZXJuZWF0aCBpdHNlbGY/XCIpO1xuICAgICAgICBjb25zdCBzbGlkZXJfbnVtYmVyID0gTnVtYmVyKHRoZV9zbGlkZXIudmFsdWUpO1xuICAgICAgICBjb25zdCBzbGlkZXJfdGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhcmFncmFwaF9pZCk7XG4gICAgICAgIGlmIChzbGlkZXJfdGV4dCA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgY291bGQgbm90IGZpbmQgc2xpZGVyX3RleHQgJHtwYXJhZ3JhcGhfaWR9YCk7XG4gICAgICAgIHNsaWRlcl90ZXh0LnRleHRDb250ZW50ID0gYCR7cGFyYWdyYXBoX3RleHR9OiAke3NsaWRlcl9udW1iZXJ9YDtcbiAgICAgICAgc2V0X3Byb3BlcnR5KG5hbWUsIHNsaWRlcl9udW1iZXIpO1xuICAgIH0pO1xufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgIE1ha2UgYSBzbGlkZXIgZm9yIGFuIGludFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmZ1bmN0aW9uIG1ha2VfaW50X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IGlkID0gYHNsaWRlcl8ke25hbWV9YDtcbiAgICBjb25zdCBwYXJhX2lkID0gYCR7aWR9X3BhcmFncmFwaGA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtuYW1lLnJlcGxhY2UoL18vZywgXCIgXCIpfWA7XG4gICAgY29uc3QgaHRtbF9zdHJpbmcgPSBgXG4gICAgICAgIDxwIGNsYXNzPVwic2xpZGVyS2V5XCIgaWQ9XCIke3BhcmFfaWR9XCI+XG4gICAgICAgICAgICAke3BhcmFncmFwaF90ZXh0fTogJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHR9XG4gICAgICAgIDwvcD5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIG1pbj1cIiR7cHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9taW59XCIgbWF4PVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21heH1cIiB2YWx1ZT1cIiR7cHJvcGVydHlfc3RydWN0LmludF9kZWZhdWx0fVwiIGNsYXNzPVwic2xpZGVyXCIgaWQ9XCIke2lkfVwiPlxuICAgICAgICBgO1xuICAgIGNvbnN0IG5ld190aGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmV3X3RoaW5nLmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICBuZXdfdGhpbmcuaW5uZXJIVE1MID0gaHRtbF9zdHJpbmc7XG4gICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdfdGhpbmcpO1xuICAgIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoc2xpZGVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmluZCB0aGUgc2xpZGVyXCIpO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFyZ2V0IHdhcyBudWxsLCBkaWQgaXRzIG93biBlbGVtZW50IGdldCBkZWxldGVkIHVuZGVybmVhdGggaXRzZWxmP1wiKTtcbiAgICAgICAgY29uc3Qgc2xpZGVyX251bWJlciA9IE51bWJlcih0aGVfc2xpZGVyLnZhbHVlKTtcbiAgICAgICAgY29uc3Qgc2xpZGVyX3RleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJhX2lkKTtcbiAgICAgICAgaWYgKHNsaWRlcl90ZXh0ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjb3VsZCBub3QgZmluZCBzbGlkZXJfdGV4dCAke3BhcmFfaWR9YCk7XG4gICAgICAgIHNsaWRlcl90ZXh0LnRleHRDb250ZW50ID0gYCR7cGFyYWdyYXBoX3RleHR9OiAke3NsaWRlcl9udW1iZXJ9YDtcbiAgICAgICAgc2V0X3Byb3BlcnR5KG5hbWUsIHNsaWRlcl9udW1iZXIpO1xuICAgIH0pO1xufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICBNYWtlIGEgc2xpZGVyIGZvciBhbiBib29sZWFuIHRvZ2dsZVxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmZ1bmN0aW9uIG1ha2VfYm9vbF9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgbmFtZSwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBpZCA9IGBzbGlkZXJfJHtuYW1lfWA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtuYW1lLnJlcGxhY2UoL18vZywgXCIgXCIpfWA7XG4gICAgY29uc3QgaHRtbF9zdHJpbmcgPSBgXG4gICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAke3Byb3BlcnR5X3N0cnVjdC5ib29sX2RlZmF1bHQgPyBcImNoZWNrZWRcIiA6IFwiXCJ9IGNsYXNzPVwiY2hlY2tib3hfdG9nZ2xlXCIgaWQ9XCIke2lkfVwiPlxuICAgICAgICA8bGFiZWwgZm9yPVwiJHtpZH1cIiBjbGFzcz1cImNoZWNrYm94X3RvZ2dsZV9sYWJlbFwiPiR7cGFyYWdyYXBoX3RleHR9PC9sYWJlbD5cbiAgICAgICAgYDtcbiAgICBjb25zdCBuZXdfdGhpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG5ld190aGluZy5jbGFzc05hbWUgPSBcInJhbmdlSG9sZGVyXCI7XG4gICAgbmV3X3RoaW5nLmlubmVySFRNTCA9IGh0bWxfc3RyaW5nO1xuICAgIHNsaWRlcl9jb250YWluZXIuYXBwZW5kQ2hpbGQobmV3X3RoaW5nKTtcbiAgICBjb25zdCBzbGlkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgaWYgKHNsaWRlciA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGZpbmQgdGhlIHNsaWRlclwiKTtcbiAgICBzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB0aGVfc2xpZGVyID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBpZiAodGhlX3NsaWRlciA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRhcmdldCB3YXMgbnVsbCwgZGlkIG93biBvd24gZWxlbWVudCBnZXQgZGVsZXRlZD9cIik7XG4gICAgICAgIHNldF9wcm9wZXJ0eShuYW1lLCB0aGVfc2xpZGVyLmNoZWNrZWQpO1xuICAgIH0pO1xufVxuO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gdHlwZXNjcmlwdCBnbHVlIGNvZGUuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcbmNvbnN0IHNldHVwX3NsaWRlcnNfMSA9IHJlcXVpcmUoXCIuL3NldHVwX3NsaWRlcnNcIik7XG4vLyBjb29sIHRyaWNrXG5jb25zdCBJTl9ERVZfTU9ERSA9ICh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT0gXCJsb2NhbGhvc3RcIik7XG47XG47XG4vLyBOT1RFIHdlIGtlZXAgdGhlIEB0cy1pZ25vcmUncyBpbiBoZXJlXG5hc3luYyBmdW5jdGlvbiBnZXRfZ29fZnVuY3Rpb25zKCkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBnbyA9IG5ldyBHbygpOyAvLyBOT1RFIHRoaXMgY29tZXMgZnJvbSB0aGUgd2FzbV9leGVjLmpzIHRoaW5nXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcoZmV0Y2goXCJkaXN0L2JvaWQud2FzbVwiKSwgZ28uaW1wb3J0T2JqZWN0KTtcbiAgICBnby5ydW4ocmVzdWx0Lmluc3RhbmNlKTtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHNldF9wcm9wZXJ0aWVzOiBTZXRQcm9wZXJ0aWVzLFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGdldF9wcm9wZXJ0aWVzOiBHZXRQcm9wZXJ0aWVzLFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGdldF9uZXh0X2ZyYW1lOiBHZXROZXh0RnJhbWUsXG4gICAgfTtcbn1cbjtcbjtcbjtcbjtcbjtcbmNvbnN0IG1vdXNlID0ge1xuICAgIHBvczogeyB4OiAwLCB5OiAwIH0sXG4gICAgbGVmdF9kb3duOiBmYWxzZSxcbiAgICBtaWRkbGVfZG93bjogZmFsc2UsXG4gICAgcmlnaHRfZG93bjogZmFsc2UsXG59O1xuZnVuY3Rpb24gZG9tX3JlY3RfdG9fcmVjdChkb21fcmVjdCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IGRvbV9yZWN0LngsXG4gICAgICAgIHk6IGRvbV9yZWN0LnksXG4gICAgICAgIHc6IGRvbV9yZWN0LndpZHRoLFxuICAgICAgICAvLyB0byBhY2NvdW50IGZvciBsZXR0ZXJzIGxpa2UgJ2onXG4gICAgICAgIGg6IGRvbV9yZWN0LmhlaWdodCArIDUsXG4gICAgfTtcbn1cbjtcbmZ1bmN0aW9uIGdldF9hbGxfY29sbGlkYWJsZV9yZWN0cygpIHtcbiAgICBjb25zdCBDTEFTUyA9IFwiY29sbGlkZVwiO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShDTEFTUyk7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICAgIGNvbnN0IGRvbV9yZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgcmVzdWx0LnB1c2goZG9tX3JlY3RfdG9fcmVjdChkb21fcmVjdCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuO1xuZnVuY3Rpb24gcmVuZGVyX2JvaWRzKGRpc3BsYXksIGdvKSB7XG4gICAgLy8gd2UgZ2V0IHRoZSBib3VuZGluZyByZWN0YW5nbGVzIG9mIGVsZW1lbnRzIGluIHRoZSBkb2N1bWVudCxcbiAgICAvL1xuICAgIC8vIHdlIENPVUxEIGhhdmUganVzdCByZW5kZXJlZCB0aGUgdGV4dCBvdXJzZWx2ZXMsICh3aXRoIC5maWxsVGV4dCgpKVxuICAgIC8vIGJ1dCBpIHdhbnQgdGhlIHVzZXIgdG8gYmUgYWJsZSB0byBzZWxlY3QgdGhlIGVtYWlsIHRleHQuXG4gICAgLy9cbiAgICAvLyBtYXliZSB3aGVuIHRoYXQgZW1haWwgdGV4dCBpcyBtb3ZlcyBzb21ld2hlcmUgZWxzZSB3ZSBjb3VsZCBoYXZlIGFsbFxuICAgIC8vIHRoZSBib2lkIHRleHQgcmVuZGVyZWQgYnkgdGhlIGJvaWQgc2ltIGl0c2VsZi5cbiAgICAvL1xuICAgIC8vIGFsdGhvdWdoIHRoYXQgbWlnaHQgaW50cm9kdWNlIGlzc3VlcyB3aGVuIHRoZSBib2lkIHdhc20gaGFzbid0IGxvYWRlZC5cbiAgICBjb25zdCBjb2xsaWRhYmxlX3JlY3RhbmdsZXMgPSBnZXRfYWxsX2NvbGxpZGFibGVfcmVjdHMoKTtcbiAgICBjb25zdCBCT0lEX0NBTlZBU19TUVVJU0hfRkFDVE9SID0gMTtcbiAgICAvLyB0aGlzIGlzIHRoZSBjYW52YXMgdGhhdCB0aGUgd2FzbSBpcyBnb2luZyB0byBkcmF3IGludG8uXG4gICAgLy9cbiAgICAvLyBiYXNlZCBvbiB0aGUgcmVuZGVyIGNhbnZhcyBmb3Igbm93LlxuICAgIC8vXG4gICAgLy8gdXNpbmcgc3F1aXNoIGZhY3Rvciwgd2UgY2FuIGNoYW5nZSB0aGUgcmVuZGVyaW5nIHNpemUgb2YgdGhlIGJvaWQgaW1hZ2Ugd2UganVzdCBnb3QuXG4gICAgLy8gVE9ETyB3aGVuIHNxdWlzaGVkLCBtb3VzZSBpbnB1dCBkb3NlIG5vdCB3b3JrIHJpZ2h0LlxuICAgIGNvbnN0IGJvaWRfY2FudmFzX3dpZHRoID0gLyogMTYqMjU7ICovIE1hdGguZmxvb3IoZGlzcGxheS5yZW5kZXJfY3R4LmNhbnZhcy53aWR0aCAvIEJPSURfQ0FOVkFTX1NRVUlTSF9GQUNUT1IpO1xuICAgIGNvbnN0IGJvaWRfY2FudmFzX2hlaWdodCA9IC8qICA5KjI1OyAqLyBNYXRoLmZsb29yKGRpc3BsYXkucmVuZGVyX2N0eC5jYW52YXMuaGVpZ2h0IC8gQk9JRF9DQU5WQVNfU1FVSVNIX0ZBQ1RPUik7XG4gICAgLy8gW3IsIGcsIGIsIGFdLCBub3QgbmVjZXNzYXJpbHkgaW4gdGhhdCBvcmRlclxuICAgIGNvbnN0IE5VTV9DT0xPUl9DT01QT05FTlRTID0gNDtcbiAgICBjb25zdCBidWZmZXJfc2l6ZSA9IGJvaWRfY2FudmFzX3dpZHRoICogYm9pZF9jYW52YXNfaGVpZ2h0ICogTlVNX0NPTE9SX0NPTVBPTkVOVFM7XG4gICAgLy8gcmVzaXplIGJhY2sgYnVmZmVyIGlmIGNhbnZhcyBzaXplIGNoYW5nZWQuXG4gICAgaWYgKGRpc3BsYXkuYmFja19idWZmZXJfaW1hZ2Vfd2lkdGggIT09IGJvaWRfY2FudmFzX3dpZHRoIHx8IGRpc3BsYXkuYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0ICE9PSBib2lkX2NhbnZhc19oZWlnaHQpIHtcbiAgICAgICAgKDAsIGxvZ2dlcl8xLmxvZykobG9nZ2VyXzEuTG9nX1R5cGUuR2VuZXJhbCwgXCJPaCBnb2QuIHdlcmUgcmVzaXppbmcgdGhlIGJ1ZmZlclwiKTtcbiAgICAgICAgaWYgKGRpc3BsYXkuYmFja19idWZmZXJfYXJyYXkubGVuZ3RoIDwgYnVmZmVyX3NpemUpIHtcbiAgICAgICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkdlbmVyYWwsIFwiQmFjayBidWZmZXIgYXJyYXkgZ2V0dGluZyBiaWdnZXJcIik7IC8vIG15IHBlbmlzXG4gICAgICAgICAgICAvLyBtYWtlIHRoZSBidWZmZXIgYmlnZ2VyXG4gICAgICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX2FycmF5ID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGJ1ZmZlcl9zaXplKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBiYWNrX2NhbnZhcyA9IG5ldyBPZmZzY3JlZW5DYW52YXMoYm9pZF9jYW52YXNfd2lkdGgsIGJvaWRfY2FudmFzX2hlaWdodCk7XG4gICAgICAgIGNvbnN0IGJhY2tfY3R4ID0gYmFja19jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgICAgICBpZiAoYmFja19jdHggPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIyRCBjb250ZXh0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfcmVuZGVyX2N0eCA9IGJhY2tfY3R4O1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfaW1hZ2Vfd2lkdGggPSBib2lkX2NhbnZhc193aWR0aDtcbiAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQgPSBib2lkX2NhbnZhc19oZWlnaHQ7XG4gICAgfVxuICAgIGNvbnN0IGJ1ZmZlciA9IGRpc3BsYXkuYmFja19idWZmZXJfYXJyYXkuc3ViYXJyYXkoMCwgYnVmZmVyX3NpemUpO1xuICAgIGNvbnN0IGFyZ3MgPSB7XG4gICAgICAgIHdpZHRoOiBib2lkX2NhbnZhc193aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBib2lkX2NhbnZhc19oZWlnaHQsXG4gICAgICAgIGJ1ZmZlcjogYnVmZmVyLFxuICAgICAgICBtb3VzZTogbW91c2UsXG4gICAgICAgIHJlY3RhbmdsZXM6IGNvbGxpZGFibGVfcmVjdGFuZ2xlcyxcbiAgICB9O1xuICAgIGNvbnN0IG51bV9ieXRlc19maWxsZWQgPSBnby5nZXRfbmV4dF9mcmFtZShhcmdzKTtcbiAgICBpZiAobnVtX2J5dGVzX2ZpbGxlZCAhPT0gYnVmZmVyX3NpemUpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZ28uZ2V0X25leHRfZnJhbWUgZ290IGluY29ycmVjdCBudW1iZXIgb2YgYnl0ZXMsIHdhbnRlZDogJHtidWZmZXJfc2l6ZX0sIGdvdDogJHtudW1fYnl0ZXNfZmlsbGVkfWApO1xuICAgIC8vIEB0cy1pZ25vcmUgLy8gd2h5IGRvc2UgdGhpcyBsaW5lIG1ha2UgYW4gZXJyb3IgaW4gbXkgZWRpdG9yXG4gICAgY29uc3QgaW1hZ2VfZGF0YSA9IG5ldyBJbWFnZURhdGEoYnVmZmVyLCBib2lkX2NhbnZhc193aWR0aCwgYm9pZF9jYW52YXNfaGVpZ2h0KTtcbiAgICAvLyBpcyB0aGlzIGNvb2w/XG4gICAgLy9cbiAgICAvLyB0aGUgd2hvbGUgcG9pbnQgb2YgdGhpcyBiYWNrX2J1ZmZlciBpcyB0byBwcmV2ZW50IGZsaWNrZXJpbmcgYW5kXG4gICAgLy8gc3R1ZmYsIGJ1ZiBpZiB3ZXJlIG9ubHkgZ29pbmcgdG8gYmUgZHJhd2luZyBvbmUgdGhpbmcuLi5cbiAgICAvLyB3aGF0cyB0aGUgcG9pbnQ/XG4gICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LnB1dEltYWdlRGF0YShpbWFnZV9kYXRhLCAwLCAwKTtcbiAgICAvLyBOT1RFIHRoaXMgd2lsbCBzdHJldGNoIHRoZSB0aGluZy5cbiAgICAvLyBjYW52YXMud2lkdGggbWlnaHQgY2hhbmdlIGR1cmluZyB0aGUgdGltZSB0aGlzIGlzIHJ1bm5pbmdcbiAgICBkaXNwbGF5LnJlbmRlcl9jdHguZHJhd0ltYWdlKGRpc3BsYXkuYmFja19idWZmZXJfcmVuZGVyX2N0eC5jYW52YXMsIDAsIDAsIGRpc3BsYXkucmVuZGVyX2N0eC5jYW52YXMud2lkdGgsIGRpc3BsYXkucmVuZGVyX2N0eC5jYW52YXMuaGVpZ2h0KTtcbiAgICAvLyBsZXRzIGhvcGUgamF2YXNjcmlwdCBpcyBzbWFydCBlbm91Z2ggdG8gZGVhbGxvY2F0ZSB0aGlzLi4uXG4gICAgLy8gaW1hZ2VEYXRhID0gbnVsbFxufVxuO1xuLy8gVE9ETyBtYWtlIHRoaXMgc21hcnRlci5cbmNvbnN0IHJlbmRlcl90aW1lcyA9IFtdO1xuY29uc3QgZGVsdGFfdGltZXMgPSBbXTtcbi8vIENyZWRpdDogaHR0cHM6Ly9naXRodWIuY29tL3Rzb2Rpbmcva29pbFxuLy8gXG4vLyBUT0RPIHJlbW92ZSBuZXdfcmVuZGVyX3RpbWUsIGFuZCBuZXdfZGVsdGFfdGltZSwganVzdCBtYWtlIGEgY2xhc3Mgb3Igc29tZXRoaW5nLlxuZnVuY3Rpb24gcmVuZGVyX2RlYnVnX2luZm8oZGlzcGxheSwgbmV3X3JlbmRlcl90aW1lLCBuZXdfZGVsdGFfdGltZSkge1xuICAgIGNvbnN0IEZPTlRfU0laRSA9IDI4O1xuICAgIGRpc3BsYXkucmVuZGVyX2N0eC5mb250ID0gYCR7Rk9OVF9TSVpFfXB4IGJvbGRgO1xuICAgIHJlbmRlcl90aW1lcy5wdXNoKG5ld19yZW5kZXJfdGltZSk7XG4gICAgaWYgKHJlbmRlcl90aW1lcy5sZW5ndGggPiA2MCkge1xuICAgICAgICByZW5kZXJfdGltZXMuc2hpZnQoKTtcbiAgICB9XG4gICAgZGVsdGFfdGltZXMucHVzaChuZXdfZGVsdGFfdGltZSk7XG4gICAgaWYgKGRlbHRhX3RpbWVzLmxlbmd0aCA+IDYwKSB7XG4gICAgICAgIGRlbHRhX3RpbWVzLnNoaWZ0KCk7XG4gICAgfVxuICAgIGNvbnN0IHJlbmRlcl9hdmcgPSByZW5kZXJfdGltZXMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyByZW5kZXJfdGltZXMubGVuZ3RoO1xuICAgIGNvbnN0IGRlbHRhX2F2ZyA9IGRlbHRhX3RpbWVzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gZGVsdGFfdGltZXMubGVuZ3RoO1xuICAgIGNvbnN0IGxhYmVscyA9IFtdO1xuICAgIHsgLy8gY29uc3RydWN0IHRoZSBsYWJlbHMuXG4gICAgICAgIC8vIHRoaXMgaXMgdGhlIG9ubHkgdW5pcXVlIHRoaW5ncyBiZXR3ZWVuIHJlbmRlcl90aW1lcyBhbmQgZGVsdGFfdGltZXNcbiAgICAgICAgY29uc3QgZnJhbWVzX3Blcl9zZWNvbmQgPSAoMSAvIGRlbHRhX2F2ZyAqIDEwMDApLnRvRml4ZWQoMik7XG4gICAgICAgIGNvbnN0IHNlY29uZHNfcGVyX2ZyYW1lID0gKGRlbHRhX2F2ZyAvIDEwMDApLnRvRml4ZWQoNSk7XG4gICAgICAgIGxhYmVscy5wdXNoKGBGL1M6ICR7ZnJhbWVzX3Blcl9zZWNvbmR9ICAgIFMvRjogJHtzZWNvbmRzX3Blcl9mcmFtZX1gKTtcbiAgICAgICAgbGFiZWxzLnB1c2goYFdBU00gUmVuZGVyIFRpbWUgQXZnIChtcyk6ICR7cmVuZGVyX2F2Zy50b0ZpeGVkKDIpfWApO1xuICAgICAgICBsYWJlbHMucHVzaChgUmVuZGVyL1NlYyAoTUFYKTogJHsoMSAvIHJlbmRlcl9hdmcgKiAxMDAwKS50b0ZpeGVkKDIpfWApO1xuICAgIH1cbiAgICBjb25zdCBQQURESU5HID0gNzA7XG4gICAgY29uc3QgU0hBRE9XX09GRlNFVCA9IEZPTlRfU0laRSAqIDAuMDY7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxUZXh0KGxhYmVsc1tpXSwgUEFERElORywgUEFERElORyArIEZPTlRfU0laRSAqIGkpO1xuICAgICAgICBkaXNwbGF5LnJlbmRlcl9jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgICBkaXNwbGF5LnJlbmRlcl9jdHguZmlsbFRleHQobGFiZWxzW2ldLCBQQURESU5HICsgU0hBRE9XX09GRlNFVCwgUEFERElORyAtIFNIQURPV19PRkZTRVQgKyBGT05UX1NJWkUgKiBpKTtcbiAgICB9XG59XG47XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gICAgICAgICAgICBUaGUgTWFpbiBGdW5jdGlvblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbihhc3luYyAoKSA9PiB7XG4gICAgaWYgKElOX0RFVl9NT0RFKVxuICAgICAgICBjb25zb2xlLmxvZyhcIkluIERldiBNb2RlXCIpO1xuICAgIGNvbnN0IGdvID0gYXdhaXQgZ2V0X2dvX2Z1bmN0aW9ucygpO1xuICAgIHsgLy8gSGFuZGxlIHNsaWRlciBzdHVmZlxuICAgICAgICBjb25zdCBib2lkX3Byb3BlcnRpZXMgPSBPYmplY3QuZW50cmllcyhnby5nZXRfcHJvcGVydGllcygpKTtcbiAgICAgICAgaWYgKGJvaWRfcHJvcGVydGllcy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHByb3BlcnRpZXMgd2hlcmUgZ2l2ZW4gdG8gamF2YXNjcmlwdCFcIik7XG4gICAgICAgIGZ1bmN0aW9uIHNldF9wcm9wZXJ0eShuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTI3MTA5MDUvaG93LWRvLWktZHluYW1pY2FsbHktYXNzaWduLXByb3BlcnRpZXMtdG8tYW4tb2JqZWN0LWluLXR5cGVzY3JpcHRcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IHt9O1xuICAgICAgICAgICAgb2JqW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICBnby5zZXRfcHJvcGVydGllcyhvYmopO1xuICAgICAgICB9XG4gICAgICAgIDtcbiAgICAgICAgLy8gVE9ETyBtYXliZSBtYWtlIHRoaXMgZGV2IG1vZGUgb25seS4uLlxuICAgICAgICAvLyBpdCBhbHNvIGhhcyB0byByZW1vdmUgdGhlIFNldHRpbmdzIHRoaW5nLi4uXG4gICAgICAgICgwLCBzZXR1cF9zbGlkZXJzXzEuc2V0dXBfc2xpZGVycykoYm9pZF9wcm9wZXJ0aWVzLCBzZXRfcHJvcGVydHkpO1xuICAgIH1cbiAgICB7IC8vIHNldHVwIGlucHV0IGhhbmRsaW5nLlxuICAgICAgICAvLyB3aHkgZG9lc24ndCB0eXBlc2NyaXB0IGhhdmUgYW4gZW51bSBmb3IgdGhpcz9cbiAgICAgICAgbGV0IE1vdXNlX0J1dHRvbnM7XG4gICAgICAgIChmdW5jdGlvbiAoTW91c2VfQnV0dG9ucykge1xuICAgICAgICAgICAgTW91c2VfQnV0dG9uc1tNb3VzZV9CdXR0b25zW1wiTGVmdFwiXSA9IDBdID0gXCJMZWZ0XCI7XG4gICAgICAgICAgICBNb3VzZV9CdXR0b25zW01vdXNlX0J1dHRvbnNbXCJNaWRkbGVcIl0gPSAxXSA9IFwiTWlkZGxlXCI7XG4gICAgICAgICAgICBNb3VzZV9CdXR0b25zW01vdXNlX0J1dHRvbnNbXCJSaWdodFwiXSA9IDJdID0gXCJSaWdodFwiO1xuICAgICAgICB9KShNb3VzZV9CdXR0b25zIHx8IChNb3VzZV9CdXR0b25zID0ge30pKTtcbiAgICAgICAgO1xuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQuZ2V0Um9vdE5vZGUoKTtcbiAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXYpID0+IHtcbiAgICAgICAgICAgIG1vdXNlLnBvcyA9IHsgeDogZXYueCwgeTogZXYueSB9O1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gdGhpcyB3aWxsIGJyZWFrIGlmIHRoZSB1c2VyIHNsaWRlcyB0aGVyZSBtb3VzZSBvdXRzaWRlIG9mIHRoZSBzY3JlZW4gd2hpbGUgY2xpY2tpbmcsIGJ1dCB0aGlzIGlzIHRoZSB3ZWIsIHBlb3BsZSBleHBlY3QgaXQgdG8gc3Vjay5cbiAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZXYpID0+IHtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5MZWZ0KVxuICAgICAgICAgICAgICAgIG1vdXNlLmxlZnRfZG93biA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuTWlkZGxlKVxuICAgICAgICAgICAgICAgIG1vdXNlLm1pZGRsZV9kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gTW91c2VfQnV0dG9ucy5SaWdodClcbiAgICAgICAgICAgICAgICBtb3VzZS5yaWdodF9kb3duID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChldikgPT4ge1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBNb3VzZV9CdXR0b25zLkxlZnQpXG4gICAgICAgICAgICAgICAgbW91c2UubGVmdF9kb3duID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuTWlkZGxlKVxuICAgICAgICAgICAgICAgIG1vdXNlLm1pZGRsZV9kb3duID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IE1vdXNlX0J1dHRvbnMuUmlnaHQpXG4gICAgICAgICAgICAgICAgbW91c2UucmlnaHRfZG93biA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gY29uc3QgY2FudmFzX2NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzX2RpdlwiKSBhcyBIVE1MQ2FudmFzRWxlbWVudCB8IG51bGxcbiAgICBjb25zdCBib2lkX2NhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9pZF9jYW52YXNcIik7XG4gICAgaWYgKGJvaWRfY2FudmFzID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBjYW52YXMgd2l0aCBpZCBgYm9pZF9jYW52YXNgIGlzIGZvdW5kXCIpO1xuICAgIC8vIFRPRE8gbmFtaW5nIGJldHRlciwgdXNlIHNuYWtlIGNhc2UgZXZlcnl3aGVyZSEhXG4gICAgY29uc3QgYm9pZF9jYW52YXNfcmVuZGVyX2N0eCA9IGJvaWRfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoYm9pZF9jYW52YXNfcmVuZGVyX2N0eCA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgIGJvaWRfY2FudmFzX3JlbmRlcl9jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgY29uc3QgW2JhY2tfYnVmZmVyX2ltYWdlX3dpZHRoLCBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHRdID0gW2JvaWRfY2FudmFzX3JlbmRlcl9jdHguY2FudmFzLndpZHRoLCBib2lkX2NhbnZhc19yZW5kZXJfY3R4LmNhbnZhcy5oZWlnaHRdO1xuICAgIGNvbnN0IGJhY2tfYnVmZmVyX2NhbnZhcyA9IG5ldyBPZmZzY3JlZW5DYW52YXMoYmFja19idWZmZXJfaW1hZ2Vfd2lkdGgsIGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCk7XG4gICAgY29uc3QgYmFja19idWZmZXJfcmVuZGVyX2N0eCA9IGJhY2tfYnVmZmVyX2NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgaWYgKGJhY2tfYnVmZmVyX3JlbmRlcl9jdHggPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIjJEIGNvbnRleHQgaXMgbm90IHN1cHBvcnRlZFwiKTtcbiAgICBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgIGNvbnN0IGJhY2tfYnVmZmVyX2FycmF5ID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoICogYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0ICogNCk7XG4gICAgY29uc3QgZGlzcGxheSA9IHtcbiAgICAgICAgcmVuZGVyX2N0eDogYm9pZF9jYW52YXNfcmVuZGVyX2N0eCxcbiAgICAgICAgYmFja19idWZmZXJfcmVuZGVyX2N0eDogYmFja19idWZmZXJfcmVuZGVyX2N0eCxcbiAgICAgICAgYmFja19idWZmZXJfYXJyYXk6IGJhY2tfYnVmZmVyX2FycmF5LFxuICAgICAgICBiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aDogYmFja19idWZmZXJfaW1hZ2Vfd2lkdGgsXG4gICAgICAgIGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodDogYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0LFxuICAgIH07XG4gICAgbGV0IHByZXZfdGltZXN0YW1wID0gMDtcbiAgICBjb25zdCBmcmFtZSA9ICh0aW1lc3RhbXApID0+IHtcbiAgICAgICAgYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICBjb25zdCBkZWx0YV90aW1lID0gKHRpbWVzdGFtcCAtIHByZXZfdGltZXN0YW1wKTtcbiAgICAgICAgcHJldl90aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgICAgIC8vIFRPRE8gRG9uJ3QgbmVlZCBkZWx0YSB0aW1lLCBib2lkIHRoaW5nIGRvc2UgaXQgZm9yIHVzPyBjaGFuZ2U/XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgcmVuZGVyX2JvaWRzKGRpc3BsYXksIGdvKTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgLy8gSW4gbXNcbiAgICAgICAgY29uc3QgcmVuZGVyX3RpbWUgPSBlbmRfdGltZSAtIHN0YXJ0X3RpbWU7XG4gICAgICAgIGlmIChsb2dnZXJfMS5ERUJVR19ESVNQTEFZICYmIElOX0RFVl9NT0RFKVxuICAgICAgICAgICAgcmVuZGVyX2RlYnVnX2luZm8oZGlzcGxheSwgcmVuZGVyX3RpbWUsIGRlbHRhX3RpbWUpO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgICB9O1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKHRpbWVzdGFtcCkgPT4ge1xuICAgICAgICBwcmV2X3RpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gICAgfSk7XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9