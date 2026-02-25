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
            make_slider(body, property_struct, set_property);
        }
        details.appendChild(body);
        slider_container.appendChild(details);
    }
}
;
function make_slider(slider_container, property_struct, set_property) {
    const slider_id = `slider_${property_struct.property_name}`;
    const label_text = property_struct.property_name.replace(/_/g, " ");
    switch (property_struct.property_data_type) {
        case Property_Data_Type.Property_Data_Bool:
            {
                const html_string = `
                <label for="${slider_id}" class="checkbox_toggle_label">${label_text}</label>
                <input  id="${slider_id}" type="checkbox" ${property_struct.bool_default ? "checked" : ""} class="checkbox_toggle">
            `;
                const wrapper = document.createElement("div");
                wrapper.className = "rangeHolder";
                wrapper.innerHTML = html_string;
                slider_container.appendChild(wrapper);
                const slider_element = wrapper.querySelector('input');
                if (slider_element === null)
                    throw new Error(`Could not find checkbox input for id='${slider_id}' inside its container`);
                if (slider_element.id != slider_id)
                    throw new Error(`Found slider with id='${slider_element.id}' but expected id='${slider_id}'`);
                slider_element.addEventListener("input", (event) => {
                    const the_slider = event.target;
                    if (the_slider === null)
                        throw new Error(`Checkbox input for '${property_struct.property_name}' disappeared unexpectedly`);
                    set_property(property_struct.property_name, the_slider.checked);
                });
            }
            break;
        case Property_Data_Type.Property_Data_Float:
        case Property_Data_Type.Property_Data_Int:
            {
                const is_float_slider = property_struct.property_data_type === Property_Data_Type.Property_Data_Float;
                const min_value = is_float_slider ? property_struct.float_range_min : property_struct.int_range_min;
                const max_value = is_float_slider ? property_struct.float_range_max : property_struct.int_range_max;
                const default_value = is_float_slider ? property_struct.float_default : property_struct.int_default;
                const step = is_float_slider ? 0.005 : 1;
                const paragraph_id = `${slider_id}_paragraph`;
                const html_string = `
                <p class="sliderKey" id="${paragraph_id}"> ${label_text}: ${default_value} </p>
                <input type="range" min="${min_value}" max="${max_value}" value="${default_value}" step="${step}" class="slider" id="${slider_id}">
            `;
                const wrapper = document.createElement("div");
                wrapper.className = "rangeHolder";
                wrapper.innerHTML = html_string;
                slider_container.appendChild(wrapper);
                const slider_element = wrapper.querySelector('input');
                if (slider_element === null)
                    throw new Error(`Could not find input for slider id='${slider_id}' inside its container`);
                if (slider_element.id != slider_id)
                    throw new Error(`Found slider with id='${slider_element.id}' but expected id='${slider_id}'`);
                slider_element.addEventListener("input", (event) => {
                    const the_slider = event.target;
                    if (the_slider === null)
                        throw new Error(`Slider input for '${property_struct.property_name}' disappeared unexpectedly`);
                    const slider_number = is_float_slider ? parseFloat(the_slider.value) : parseInt(the_slider.value);
                    const slider_text = wrapper.querySelector(`#${paragraph_id}`);
                    if (slider_text === null)
                        throw new Error(`Could not find label paragraph '${paragraph_id}' for slider '${slider_id}'`);
                    slider_text.textContent = `${label_text}: ${slider_number}`;
                    set_property(property_struct.property_name, slider_number);
                });
            }
            break;
        default: {
            throw new Error(`in ${property_struct.property_name}, found unknown property type ${property_struct.property_data_type}`);
        }
    }
}
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
const IN_DEV_MODE = (window.location.hostname === "localhost");
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
        if (boid_properties.length === 0)
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
            if (ev.button === Mouse_Buttons.Left)
                mouse.left_down = true;
            if (ev.button === Mouse_Buttons.Middle)
                mouse.middle_down = true;
            if (ev.button === Mouse_Buttons.Right)
                mouse.right_down = true;
        });
        root.addEventListener('mouseup', (ev) => {
            if (ev.button === Mouse_Buttons.Left)
                mouse.left_down = false;
            if (ev.button === Mouse_Buttons.Middle)
                mouse.middle_down = false;
            if (ev.button === Mouse_Buttons.Right)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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b0JBQW9CLG1CQUFtQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxzQ0FBc0M7QUFDL0M7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvbG9nZ2VyLnRzIiwid2VicGFjazovL2JvaWRzLy4vd2ViX3NyYy9zZXR1cF9zbGlkZXJzLnRzIiwid2VicGFjazovL2JvaWRzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2JvaWRzLy4vd2ViX3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTG9nX1R5cGUgPSBleHBvcnRzLkRFQlVHX1NMSURFUlMgPSBleHBvcnRzLkRFQlVHX0RJU1BMQVkgPSB2b2lkIDA7XG5leHBvcnRzLmxvZyA9IGxvZztcbi8vIGlzIGl0IGNvcnJlY3QgdG8gaGF2ZSB0aGVzZSBoZXJlPyB0aGlzIG9uZSBlZmZlY3RzXG4vLyBkcmF3aW5nIG9uIHRoZSBzY3JlZW4sIG5vdCBqdXN0IGxvZ2dpbmc/IGFsdGhvdWdoIHdlXG4vLyBjb3VsZCBtYWtlIGFsbCBsb2dzIGFwcGVhciBvbiBzY3JlZW4uLi5cbmV4cG9ydHMuREVCVUdfRElTUExBWSA9IHRydWU7XG5leHBvcnRzLkRFQlVHX1NMSURFUlMgPSBmYWxzZTtcbnZhciBMb2dfVHlwZTtcbihmdW5jdGlvbiAoTG9nX1R5cGUpIHtcbiAgICBMb2dfVHlwZVtMb2dfVHlwZVtcIkdlbmVyYWxcIl0gPSAwXSA9IFwiR2VuZXJhbFwiO1xuICAgIExvZ19UeXBlW0xvZ19UeXBlW1wiRGVidWdfRGlzcGxheVwiXSA9IDFdID0gXCJEZWJ1Z19EaXNwbGF5XCI7XG4gICAgTG9nX1R5cGVbTG9nX1R5cGVbXCJEZWJ1Z19TbGlkZXJzXCJdID0gMl0gPSBcIkRlYnVnX1NsaWRlcnNcIjtcbn0pKExvZ19UeXBlIHx8IChleHBvcnRzLkxvZ19UeXBlID0gTG9nX1R5cGUgPSB7fSkpO1xuO1xuZnVuY3Rpb24gbG9nKGxvZ190eXBlLCAuLi5kYXRhKSB7XG4gICAgLy8gaWYgdGhpcyBpcyB0aGUgZW1wdHkgc3RyaW5nXG4gICAgdmFyIGRvX2xvZyA9IGZhbHNlO1xuICAgIHZhciBsb2dfaGVhZGVyID0gXCJcIjtcbiAgICBzd2l0Y2ggKGxvZ190eXBlKSB7XG4gICAgICAgIGNhc2UgTG9nX1R5cGUuR2VuZXJhbDpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2dfaGVhZGVyID0gXCJcIjtcbiAgICAgICAgICAgICAgICBkb19sb2cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgTG9nX1R5cGUuRGVidWdfRGlzcGxheTpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2dfaGVhZGVyID0gXCJERUJVR19ESVNQTEFZXCI7XG4gICAgICAgICAgICAgICAgaWYgKGV4cG9ydHMuREVCVUdfRElTUExBWSlcbiAgICAgICAgICAgICAgICAgICAgZG9fbG9nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIExvZ19UeXBlLkRlYnVnX1NsaWRlcnM6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiREVCVUdfU0xJREVSU1wiO1xuICAgICAgICAgICAgICAgIGlmIChleHBvcnRzLkRFQlVHX1NMSURFUlMpXG4gICAgICAgICAgICAgICAgICAgIGRvX2xvZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGRvX2xvZykge1xuICAgICAgICBpZiAobG9nX2hlYWRlciAhPSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtsb2dfaGVhZGVyfTogYCwgLi4uZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyguLi5kYXRhKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zZXR1cF9zbGlkZXJzID0gc2V0dXBfc2xpZGVycztcbmNvbnN0IGxvZ2dlcl8xID0gcmVxdWlyZShcIi4vbG9nZ2VyXCIpO1xuY29uc3QgREVGQVVMVF9DQVRFR09SWSA9IFwiTWlzY1wiO1xuY2xhc3MgUHJvcGVydHlfU3RydWN0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5wcm9wZXJ0eV9uYW1lID0gXCJcIjtcbiAgICAgICAgdGhpcy5wcm9wZXJ0eV9kYXRhX3R5cGUgPSBQcm9wZXJ0eV9EYXRhX1R5cGUuTm9uZTtcbiAgICAgICAgLy8gRmxvYXQgcHJvcGVydGllc1xuICAgICAgICB0aGlzLmZsb2F0X3JhbmdlX21pbiA9IDA7XG4gICAgICAgIHRoaXMuZmxvYXRfcmFuZ2VfbWF4ID0gMDtcbiAgICAgICAgdGhpcy5mbG9hdF9kZWZhdWx0ID0gMDtcbiAgICAgICAgLy8gSW50IHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5pbnRfcmFuZ2VfbWluID0gMDtcbiAgICAgICAgdGhpcy5pbnRfcmFuZ2VfbWF4ID0gMDtcbiAgICAgICAgdGhpcy5pbnRfZGVmYXVsdCA9IDA7XG4gICAgICAgIC8vIEJvb2wgcHJvcGVydGllc1xuICAgICAgICB0aGlzLmJvb2xfZGVmYXVsdCA9IGZhbHNlO1xuICAgICAgICAvLyBmb3IgbmljZSBwcm9wZXJ0eSB2aXN1YWxpemF0aW9uLlxuICAgICAgICB0aGlzLmNhdGVnb3J5ID0gREVGQVVMVF9DQVRFR09SWTtcbiAgICB9XG59XG47XG52YXIgUHJvcGVydHlfRGF0YV9UeXBlO1xuKGZ1bmN0aW9uIChQcm9wZXJ0eV9EYXRhX1R5cGUpIHtcbiAgICBQcm9wZXJ0eV9EYXRhX1R5cGVbUHJvcGVydHlfRGF0YV9UeXBlW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XG4gICAgUHJvcGVydHlfRGF0YV9UeXBlW1Byb3BlcnR5X0RhdGFfVHlwZVtcIlByb3BlcnR5X0RhdGFfRmxvYXRcIl0gPSAxXSA9IFwiUHJvcGVydHlfRGF0YV9GbG9hdFwiO1xuICAgIFByb3BlcnR5X0RhdGFfVHlwZVtQcm9wZXJ0eV9EYXRhX1R5cGVbXCJQcm9wZXJ0eV9EYXRhX0ludFwiXSA9IDJdID0gXCJQcm9wZXJ0eV9EYXRhX0ludFwiO1xuICAgIFByb3BlcnR5X0RhdGFfVHlwZVtQcm9wZXJ0eV9EYXRhX1R5cGVbXCJQcm9wZXJ0eV9EYXRhX0Jvb2xcIl0gPSAzXSA9IFwiUHJvcGVydHlfRGF0YV9Cb29sXCI7XG59KShQcm9wZXJ0eV9EYXRhX1R5cGUgfHwgKFByb3BlcnR5X0RhdGFfVHlwZSA9IHt9KSk7XG47XG4vLyBwdXRzIHNvbWUgc2xpZGVycyB1cCB0byBjb250cm9sIHNvbWUgcGFyYW1ldGVyc1xuZnVuY3Rpb24gc2V0dXBfc2xpZGVycyhwcm9wZXJ0aWVzLCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBTTElERVJfQ09OVEFJTkVSX0lEID0gXCJzbGlkZUNvbnRhaW5lclwiO1xuICAgIGNvbnN0IHNsaWRlcl9jb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChTTElERVJfQ09OVEFJTkVSX0lEKTtcbiAgICBpZiAoc2xpZGVyX2NvbnRhaW5lciA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IEdldCBzbGlkZXIgY29udGFpbmVyXCIpO1xuICAgIC8vIFRPRE8gZm9yIHRoZSBzbGlkZXMgdGhhdCBoYXZlIGEgc21hbGwgcmFuZ2UgKGxpa2UgY29oZXNpb24gZmFjdG9yKSBtYWtlIHRoZSB2YWx1ZSB0aGUgc3F1YXJlIG9mIHRoZSBudW1iZXIuXG4gICAgcHJvcGVydGllcy5zb3J0KCk7IC8vIGhvcGUgc29tZW9uZSBlbHNlIHdhc24ndCB1c2luZyB0aGlzLlxuICAgIGNvbnN0IHByb3BlcnR5X3N0cnVjdHMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB0YWddIG9mIHByb3BlcnRpZXMpIHtcbiAgICAgICAgKDAsIGxvZ2dlcl8xLmxvZykobG9nZ2VyXzEuTG9nX1R5cGUuRGVidWdfU2xpZGVycywgYHR5cGVzY3JpcHQ6ICR7bmFtZX06ICR7dGFnfWApO1xuICAgICAgICAvLyBUT0RPIHRoaXMgZnVuY3Rpb24gaXMgZ3Jvd2luZyB0byBiaWcsIHB1dCBpdCBpbiBhIHNlcGFyYXRlIGZpbGUuXG4gICAgICAgIGNvbnN0IHRhZ19zcGxpdCA9IHRhZy5zcGxpdChcIiBcIik7XG4gICAgICAgIGNvbnN0IFtwcm9wX3Byb3BlcnR5LCBwcm9wZXJ0eV9kYXRhX3R5cGVdID0gdGFnX3Byb3BfdG9fcGFydHModGFnX3NwbGl0WzBdKTtcbiAgICAgICAgaWYgKHByb3BfcHJvcGVydHkgIT0gXCJQcm9wZXJ0eVwiKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGaXJzdCBwcm9wZXJ0eSBpcyBub3QgcHJvcGVydHksIHRhZyB3YXMgJHt0YWd9YCk7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5X3N0cnVjdCA9IG5ldyBQcm9wZXJ0eV9TdHJ1Y3QoKTtcbiAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWUgPSBuYW1lO1xuICAgICAgICBpZiAocHJvcGVydHlfc3RydWN0LmNhdGVnb3J5ICE9IERFRkFVTFRfQ0FURUdPUlkpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGluICR7bmFtZX0sIHByb3BlcnR5X3N0cnVjdC5jYXRlZ29yeSB3YXMgc2V0IHRvICR7cHJvcGVydHlfc3RydWN0LmNhdGVnb3J5fSBidXQgaXQgc2hvdWxkIGJlICR7REVGQVVMVF9DQVRFR09SWX0gYXQgdGhpcyBwb2ludGApO1xuICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X2RhdGFfdHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImZsb2F0XCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfZGF0YV90eXBlID0gUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfRmxvYXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImludFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZSA9IFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0ludDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiYm9vbFwiOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X2RhdGFfdHlwZSA9IFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Jvb2w7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaW4gJHtuYW1lfSwgVW5rbm93biBwcm9wZXJ0eSBkYXRhIHR5cGUgJHtwcm9wZXJ0eV9kYXRhX3R5cGV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGFnX3NwbGl0LnNoaWZ0KCk7XG4gICAgICAgIHdoaWxlICh0YWdfc3BsaXQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgW2xlZnQsIHJpZ2h0XSA9IHRhZ19wcm9wX3RvX3BhcnRzKHRhZ19zcGxpdC5zaGlmdCgpKTtcbiAgICAgICAgICAgIHN3aXRjaCAobGVmdCkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJSYW5nZVwiOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Zsb2F0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbbWluX2FzX3N0cmluZywgbWF4X2FzX3N0cmluZ10gPSByaWdodC5zcGxpdChcIjtcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWluID0gcGFyc2VGbG9hdChtaW5fYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5mbG9hdF9yYW5nZV9tYXggPSBwYXJzZUZsb2F0KG1heF9hc19zdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfSW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbbWluX2FzX3N0cmluZywgbWF4X2FzX3N0cmluZ10gPSByaWdodC5zcGxpdChcIjtcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21pbiA9IHBhcnNlSW50KG1pbl9hc19zdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9tYXggPSBwYXJzZUludChtYXhfYXNfc3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Jvb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQm9vbGVhbiBkb3NlIG5vdCBoYXZlIGEgcmFuZ2UhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBkYXRhIHR5cGUgaW4gJHtuYW1lfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiRGVmYXVsdFwiOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Zsb2F0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfZGVmYXVsdCA9IHBhcnNlRmxvYXQocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfSW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHQgPSBwYXJzZUludChyaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9EYXRhX1R5cGUuUHJvcGVydHlfRGF0YV9Cb29sOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QuYm9vbF9kZWZhdWx0ID0gcGFyc2VfYm9vbChyaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gZGF0YSB0eXBlIGluICR7bmFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkNhdGVnb3J5XCI6XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5jYXRlZ29yeSA9IHJpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbiAke25hbWV9LCBmb3VuZCB1bmtub3duIHByb3BlcnR5ICcke2xlZnR9J2ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3RzLnB1c2gocHJvcGVydHlfc3RydWN0KTtcbiAgICB9XG4gICAgLy8gR3JvdXAgcHJvcGVydHlfc3RydWN0cyBieSBjYXRlZ29yeSBmb3IgY29sbGFwc2libGUgcmVuZGVyaW5nXG4gICAgY29uc3QgY2F0ZWdvcnlfbWFwID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgcHMgb2YgcHJvcGVydHlfc3RydWN0cykge1xuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IHBzLmNhdGVnb3J5IHx8IERFRkFVTFRfQ0FURUdPUlk7XG4gICAgICAgIGlmICghY2F0ZWdvcnlfbWFwLmhhcyhjYXRlZ29yeSkpXG4gICAgICAgICAgICBjYXRlZ29yeV9tYXAuc2V0KGNhdGVnb3J5LCBbXSk7XG4gICAgICAgIGNhdGVnb3J5X21hcC5nZXQoY2F0ZWdvcnkpLnB1c2gocHMpO1xuICAgIH1cbiAgICAvLyBTb3J0IGNhdGVnb3JpZXMgYWxwaGFiZXRpY2FsbHksIGJ1dCBwbGFjZSB0aGUgREVGQVVMVF9DQVRFR09SWSBsYXN0XG4gICAgY29uc3QgY2F0ZWdvcmllcyA9IEFycmF5LmZyb20oY2F0ZWdvcnlfbWFwLmtleXMoKSkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBpZiAoYSA9PT0gREVGQVVMVF9DQVRFR09SWSlcbiAgICAgICAgICAgIHJldHVybiArMTtcbiAgICAgICAgaWYgKGIgPT09IERFRkFVTFRfQ0FURUdPUlkpXG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIHJldHVybiBhLmxvY2FsZUNvbXBhcmUoYik7XG4gICAgfSk7XG4gICAgZm9yIChjb25zdCBjYXRlZ29yeSBvZiBjYXRlZ29yaWVzKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gY2F0ZWdvcnlfbWFwLmdldChjYXRlZ29yeSk7XG4gICAgICAgIGNvbnN0IGRldGFpbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGV0YWlsc1wiKTtcbiAgICAgICAgZGV0YWlscy5jbGFzc05hbWUgPSBcImNhdGVnb3J5R3JvdXBcIjtcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdW1tYXJ5XCIpO1xuICAgICAgICBzdW1tYXJ5LmNsYXNzTmFtZSA9IFwiY2F0ZWdvcnlIZWFkZXJcIjtcbiAgICAgICAgc3VtbWFyeS50ZXh0Q29udGVudCA9IGNhdGVnb3J5LnJlcGxhY2UoL18vZywgXCIgXCIpO1xuICAgICAgICBkZXRhaWxzLmFwcGVuZENoaWxkKHN1bW1hcnkpO1xuICAgICAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgYm9keS5jbGFzc05hbWUgPSBcImNhdGVnb3J5Qm9keVwiO1xuICAgICAgICBmb3IgKGNvbnN0IHByb3BlcnR5X3N0cnVjdCBvZiBpdGVtcykge1xuICAgICAgICAgICAgbWFrZV9zbGlkZXIoYm9keSwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpO1xuICAgICAgICB9XG4gICAgICAgIGRldGFpbHMuYXBwZW5kQ2hpbGQoYm9keSk7XG4gICAgICAgIHNsaWRlcl9jb250YWluZXIuYXBwZW5kQ2hpbGQoZGV0YWlscyk7XG4gICAgfVxufVxuO1xuZnVuY3Rpb24gbWFrZV9zbGlkZXIoc2xpZGVyX2NvbnRhaW5lciwgcHJvcGVydHlfc3RydWN0LCBzZXRfcHJvcGVydHkpIHtcbiAgICBjb25zdCBzbGlkZXJfaWQgPSBgc2xpZGVyXyR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWV9YDtcbiAgICBjb25zdCBsYWJlbF90ZXh0ID0gcHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWUucmVwbGFjZSgvXy9nLCBcIiBcIik7XG4gICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfZGF0YV90eXBlKSB7XG4gICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfQm9vbDpcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sX3N0cmluZyA9IGBcbiAgICAgICAgICAgICAgICA8bGFiZWwgZm9yPVwiJHtzbGlkZXJfaWR9XCIgY2xhc3M9XCJjaGVja2JveF90b2dnbGVfbGFiZWxcIj4ke2xhYmVsX3RleHR9PC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8aW5wdXQgIGlkPVwiJHtzbGlkZXJfaWR9XCIgdHlwZT1cImNoZWNrYm94XCIgJHtwcm9wZXJ0eV9zdHJ1Y3QuYm9vbF9kZWZhdWx0ID8gXCJjaGVja2VkXCIgOiBcIlwifSBjbGFzcz1cImNoZWNrYm94X3RvZ2dsZVwiPlxuICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICB3cmFwcGVyLmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICAgICAgICAgICAgICB3cmFwcGVyLmlubmVySFRNTCA9IGh0bWxfc3RyaW5nO1xuICAgICAgICAgICAgICAgIHNsaWRlcl9jb250YWluZXIuYXBwZW5kQ2hpbGQod3JhcHBlcik7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2xpZGVyX2VsZW1lbnQgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlcl9lbGVtZW50ID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGNoZWNrYm94IGlucHV0IGZvciBpZD0nJHtzbGlkZXJfaWR9JyBpbnNpZGUgaXRzIGNvbnRhaW5lcmApO1xuICAgICAgICAgICAgICAgIGlmIChzbGlkZXJfZWxlbWVudC5pZCAhPSBzbGlkZXJfaWQpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRm91bmQgc2xpZGVyIHdpdGggaWQ9JyR7c2xpZGVyX2VsZW1lbnQuaWR9JyBidXQgZXhwZWN0ZWQgaWQ9JyR7c2xpZGVyX2lkfSdgKTtcbiAgICAgICAgICAgICAgICBzbGlkZXJfZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRoZV9zbGlkZXIgPSBldmVudC50YXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGVfc2xpZGVyID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGVja2JveCBpbnB1dCBmb3IgJyR7cHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWV9JyBkaXNhcHBlYXJlZCB1bmV4cGVjdGVkbHlgKTtcbiAgICAgICAgICAgICAgICAgICAgc2V0X3Byb3BlcnR5KHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9uYW1lLCB0aGVfc2xpZGVyLmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfRmxvYXQ6XG4gICAgICAgIGNhc2UgUHJvcGVydHlfRGF0YV9UeXBlLlByb3BlcnR5X0RhdGFfSW50OlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzX2Zsb2F0X3NsaWRlciA9IHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGUgPT09IFByb3BlcnR5X0RhdGFfVHlwZS5Qcm9wZXJ0eV9EYXRhX0Zsb2F0O1xuICAgICAgICAgICAgICAgIGNvbnN0IG1pbl92YWx1ZSA9IGlzX2Zsb2F0X3NsaWRlciA/IHByb3BlcnR5X3N0cnVjdC5mbG9hdF9yYW5nZV9taW4gOiBwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21pbjtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXhfdmFsdWUgPSBpc19mbG9hdF9zbGlkZXIgPyBwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWF4IDogcHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9tYXg7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdF92YWx1ZSA9IGlzX2Zsb2F0X3NsaWRlciA/IHByb3BlcnR5X3N0cnVjdC5mbG9hdF9kZWZhdWx0IDogcHJvcGVydHlfc3RydWN0LmludF9kZWZhdWx0O1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSBpc19mbG9hdF9zbGlkZXIgPyAwLjAwNSA6IDE7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyYWdyYXBoX2lkID0gYCR7c2xpZGVyX2lkfV9wYXJhZ3JhcGhgO1xuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxfc3RyaW5nID0gYFxuICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwic2xpZGVyS2V5XCIgaWQ9XCIke3BhcmFncmFwaF9pZH1cIj4gJHtsYWJlbF90ZXh0fTogJHtkZWZhdWx0X3ZhbHVlfSA8L3A+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIG1pbj1cIiR7bWluX3ZhbHVlfVwiIG1heD1cIiR7bWF4X3ZhbHVlfVwiIHZhbHVlPVwiJHtkZWZhdWx0X3ZhbHVlfVwiIHN0ZXA9XCIke3N0ZXB9XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7c2xpZGVyX2lkfVwiPlxuICAgICAgICAgICAgYDtcbiAgICAgICAgICAgICAgICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICB3cmFwcGVyLmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICAgICAgICAgICAgICB3cmFwcGVyLmlubmVySFRNTCA9IGh0bWxfc3RyaW5nO1xuICAgICAgICAgICAgICAgIHNsaWRlcl9jb250YWluZXIuYXBwZW5kQ2hpbGQod3JhcHBlcik7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2xpZGVyX2VsZW1lbnQgPSB3cmFwcGVyLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Jyk7XG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlcl9lbGVtZW50ID09PSBudWxsKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGlucHV0IGZvciBzbGlkZXIgaWQ9JyR7c2xpZGVyX2lkfScgaW5zaWRlIGl0cyBjb250YWluZXJgKTtcbiAgICAgICAgICAgICAgICBpZiAoc2xpZGVyX2VsZW1lbnQuaWQgIT0gc2xpZGVyX2lkKVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZvdW5kIHNsaWRlciB3aXRoIGlkPScke3NsaWRlcl9lbGVtZW50LmlkfScgYnV0IGV4cGVjdGVkIGlkPScke3NsaWRlcl9pZH0nYCk7XG4gICAgICAgICAgICAgICAgc2xpZGVyX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0aGVfc2xpZGVyID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhlX3NsaWRlciA9PT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2xpZGVyIGlucHV0IGZvciAnJHtwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfbmFtZX0nIGRpc2FwcGVhcmVkIHVuZXhwZWN0ZWRseWApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzbGlkZXJfbnVtYmVyID0gaXNfZmxvYXRfc2xpZGVyID8gcGFyc2VGbG9hdCh0aGVfc2xpZGVyLnZhbHVlKSA6IHBhcnNlSW50KHRoZV9zbGlkZXIudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzbGlkZXJfdGV4dCA9IHdyYXBwZXIucXVlcnlTZWxlY3RvcihgIyR7cGFyYWdyYXBoX2lkfWApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2xpZGVyX3RleHQgPT09IG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGxhYmVsIHBhcmFncmFwaCAnJHtwYXJhZ3JhcGhfaWR9JyBmb3Igc2xpZGVyICcke3NsaWRlcl9pZH0nYCk7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlcl90ZXh0LnRleHRDb250ZW50ID0gYCR7bGFiZWxfdGV4dH06ICR7c2xpZGVyX251bWJlcn1gO1xuICAgICAgICAgICAgICAgICAgICBzZXRfcHJvcGVydHkocHJvcGVydHlfc3RydWN0LnByb3BlcnR5X25hbWUsIHNsaWRlcl9udW1iZXIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaW4gJHtwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfbmFtZX0sIGZvdW5kIHVua25vd24gcHJvcGVydHkgdHlwZSAke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV9kYXRhX3R5cGV9YCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgSGVscGVyIGZ1bmN0aW9uc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiB0YWdfcHJvcF90b19wYXJ0cyhwcm9wKSB7XG4gICAgY29uc3QgW2xlZnQsIHJpZ2h0X3dpdGhfanVua10gPSBwcm9wLnNwbGl0KFwiOlwiKTtcbiAgICBjb25zdCByaWdodCA9IHJpZ2h0X3dpdGhfanVuay5zbGljZSgxLCByaWdodF93aXRoX2p1bmsubGVuZ3RoIC0gMSk7XG4gICAgcmV0dXJuIFtsZWZ0LCByaWdodF07XG59XG47XG5mdW5jdGlvbiBwYXJzZV9ib29sKHMpIHtcbiAgICAvLyAxLCB0LCBULCBUUlVFLCB0cnVlLCBUcnVlLFxuICAgIC8vIDAsIGYsIEYsIEZBTFNFLCBmYWxzZSwgRmFsc2VcbiAgICBzd2l0Y2ggKHMpIHtcbiAgICAgICAgY2FzZSBcIjFcIjpcbiAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgY2FzZSBcIlRSVUVcIjpcbiAgICAgICAgY2FzZSBcInRydWVcIjpcbiAgICAgICAgY2FzZSBcIlRydWVcIjoge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIjBcIjpcbiAgICAgICAgY2FzZSBcImZcIjpcbiAgICAgICAgY2FzZSBcIkZcIjpcbiAgICAgICAgY2FzZSBcIkZBTFNFXCI6XG4gICAgICAgIGNhc2UgXCJmYWxzZVwiOlxuICAgICAgICBjYXNlIFwiRmFsc2VcIjoge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzdHJpbmcgaW4gcGFyc2VCb29sLCB3YXMgJHtzfWApO1xuICAgIH1cbn1cbjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGV4aXN0cyAoZGV2ZWxvcG1lbnQgb25seSlcblx0aWYgKF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdID09PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gdHlwZXNjcmlwdCBnbHVlIGNvZGUuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcbmNvbnN0IHNldHVwX3NsaWRlcnNfMSA9IHJlcXVpcmUoXCIuL3NldHVwX3NsaWRlcnNcIik7XG4vLyBjb29sIHRyaWNrXG5jb25zdCBJTl9ERVZfTU9ERSA9ICh3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09IFwibG9jYWxob3N0XCIpO1xuO1xuO1xuLy8gTk9URSB3ZSBrZWVwIHRoZSBAdHMtaWdub3JlJ3MgaW4gaGVyZVxuYXN5bmMgZnVuY3Rpb24gZ2V0X2dvX2Z1bmN0aW9ucygpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgZ28gPSBuZXcgR28oKTsgLy8gTk9URSB0aGlzIGNvbWVzIGZyb20gdGhlIHdhc21fZXhlYy5qcyB0aGluZ1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKGZldGNoKFwiZGlzdC9ib2lkLndhc21cIiksIGdvLmltcG9ydE9iamVjdCk7XG4gICAgZ28ucnVuKHJlc3VsdC5pbnN0YW5jZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBzZXRfcHJvcGVydGllczogU2V0UHJvcGVydGllcyxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnZXRfcHJvcGVydGllczogR2V0UHJvcGVydGllcyxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBnZXRfbmV4dF9mcmFtZTogR2V0TmV4dEZyYW1lLFxuICAgIH07XG59XG47XG47XG47XG47XG47XG5jb25zdCBtb3VzZSA9IHtcbiAgICBwb3M6IHsgeDogMCwgeTogMCB9LFxuICAgIGxlZnRfZG93bjogZmFsc2UsXG4gICAgbWlkZGxlX2Rvd246IGZhbHNlLFxuICAgIHJpZ2h0X2Rvd246IGZhbHNlLFxufTtcbmZ1bmN0aW9uIGRvbV9yZWN0X3RvX3JlY3QoZG9tX3JlY3QpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBkb21fcmVjdC54LFxuICAgICAgICB5OiBkb21fcmVjdC55LFxuICAgICAgICB3OiBkb21fcmVjdC53aWR0aCxcbiAgICAgICAgLy8gdG8gYWNjb3VudCBmb3IgbGV0dGVycyBsaWtlICdqJ1xuICAgICAgICBoOiBkb21fcmVjdC5oZWlnaHQgKyA1LFxuICAgIH07XG59XG47XG5mdW5jdGlvbiBnZXRfYWxsX2NvbGxpZGFibGVfcmVjdHMoKSB7XG4gICAgY29uc3QgQ0xBU1MgPSBcImNvbGxpZGVcIjtcbiAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoQ0xBU1MpO1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRzW2ldO1xuICAgICAgICBjb25zdCBkb21fcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGRvbV9yZWN0X3RvX3JlY3QoZG9tX3JlY3QpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbjtcbmZ1bmN0aW9uIHJlbmRlcl9ib2lkcyhkaXNwbGF5LCBnbykge1xuICAgIC8vIHdlIGdldCB0aGUgYm91bmRpbmcgcmVjdGFuZ2xlcyBvZiBlbGVtZW50cyBpbiB0aGUgZG9jdW1lbnQsXG4gICAgLy9cbiAgICAvLyB3ZSBDT1VMRCBoYXZlIGp1c3QgcmVuZGVyZWQgdGhlIHRleHQgb3Vyc2VsdmVzLCAod2l0aCAuZmlsbFRleHQoKSlcbiAgICAvLyBidXQgaSB3YW50IHRoZSB1c2VyIHRvIGJlIGFibGUgdG8gc2VsZWN0IHRoZSBlbWFpbCB0ZXh0LlxuICAgIC8vXG4gICAgLy8gbWF5YmUgd2hlbiB0aGF0IGVtYWlsIHRleHQgaXMgbW92ZXMgc29tZXdoZXJlIGVsc2Ugd2UgY291bGQgaGF2ZSBhbGxcbiAgICAvLyB0aGUgYm9pZCB0ZXh0IHJlbmRlcmVkIGJ5IHRoZSBib2lkIHNpbSBpdHNlbGYuXG4gICAgLy9cbiAgICAvLyBhbHRob3VnaCB0aGF0IG1pZ2h0IGludHJvZHVjZSBpc3N1ZXMgd2hlbiB0aGUgYm9pZCB3YXNtIGhhc24ndCBsb2FkZWQuXG4gICAgY29uc3QgY29sbGlkYWJsZV9yZWN0YW5nbGVzID0gZ2V0X2FsbF9jb2xsaWRhYmxlX3JlY3RzKCk7XG4gICAgY29uc3QgQk9JRF9DQU5WQVNfU1FVSVNIX0ZBQ1RPUiA9IDE7XG4gICAgLy8gdGhpcyBpcyB0aGUgY2FudmFzIHRoYXQgdGhlIHdhc20gaXMgZ29pbmcgdG8gZHJhdyBpbnRvLlxuICAgIC8vXG4gICAgLy8gYmFzZWQgb24gdGhlIHJlbmRlciBjYW52YXMgZm9yIG5vdy5cbiAgICAvL1xuICAgIC8vIHVzaW5nIHNxdWlzaCBmYWN0b3IsIHdlIGNhbiBjaGFuZ2UgdGhlIHJlbmRlcmluZyBzaXplIG9mIHRoZSBib2lkIGltYWdlIHdlIGp1c3QgZ290LlxuICAgIC8vIFRPRE8gd2hlbiBzcXVpc2hlZCwgbW91c2UgaW5wdXQgZG9zZSBub3Qgd29yayByaWdodC5cbiAgICBjb25zdCBib2lkX2NhbnZhc193aWR0aCA9IC8qIDE2KjI1OyAqLyBNYXRoLmZsb29yKGRpc3BsYXkucmVuZGVyX2N0eC5jYW52YXMud2lkdGggLyBCT0lEX0NBTlZBU19TUVVJU0hfRkFDVE9SKTtcbiAgICBjb25zdCBib2lkX2NhbnZhc19oZWlnaHQgPSAvKiAgOSoyNTsgKi8gTWF0aC5mbG9vcihkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLmhlaWdodCAvIEJPSURfQ0FOVkFTX1NRVUlTSF9GQUNUT1IpO1xuICAgIC8vIFtyLCBnLCBiLCBhXSwgbm90IG5lY2Vzc2FyaWx5IGluIHRoYXQgb3JkZXJcbiAgICBjb25zdCBOVU1fQ09MT1JfQ09NUE9ORU5UUyA9IDQ7XG4gICAgY29uc3QgYnVmZmVyX3NpemUgPSBib2lkX2NhbnZhc193aWR0aCAqIGJvaWRfY2FudmFzX2hlaWdodCAqIE5VTV9DT0xPUl9DT01QT05FTlRTO1xuICAgIC8vIHJlc2l6ZSBiYWNrIGJ1ZmZlciBpZiBjYW52YXMgc2l6ZSBjaGFuZ2VkLlxuICAgIGlmIChkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoICE9PSBib2lkX2NhbnZhc193aWR0aCB8fCBkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodCAhPT0gYm9pZF9jYW52YXNfaGVpZ2h0KSB7XG4gICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkdlbmVyYWwsIFwiT2ggZ29kLiB3ZXJlIHJlc2l6aW5nIHRoZSBidWZmZXJcIik7XG4gICAgICAgIGlmIChkaXNwbGF5LmJhY2tfYnVmZmVyX2FycmF5Lmxlbmd0aCA8IGJ1ZmZlcl9zaXplKSB7XG4gICAgICAgICAgICAoMCwgbG9nZ2VyXzEubG9nKShsb2dnZXJfMS5Mb2dfVHlwZS5HZW5lcmFsLCBcIkJhY2sgYnVmZmVyIGFycmF5IGdldHRpbmcgYmlnZ2VyXCIpOyAvLyBteSBwZW5pc1xuICAgICAgICAgICAgLy8gbWFrZSB0aGUgYnVmZmVyIGJpZ2dlclxuICAgICAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9hcnJheSA9IG5ldyBVaW50OENsYW1wZWRBcnJheShidWZmZXJfc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmFja19jYW52YXMgPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKGJvaWRfY2FudmFzX3dpZHRoLCBib2lkX2NhbnZhc19oZWlnaHQpO1xuICAgICAgICBjb25zdCBiYWNrX2N0eCA9IGJhY2tfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgaWYgKGJhY2tfY3R4ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHggPSBiYWNrX2N0eDtcbiAgICAgICAgZGlzcGxheS5iYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBkaXNwbGF5LmJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoID0gYm9pZF9jYW52YXNfd2lkdGg7XG4gICAgICAgIGRpc3BsYXkuYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0ID0gYm9pZF9jYW52YXNfaGVpZ2h0O1xuICAgIH1cbiAgICBjb25zdCBidWZmZXIgPSBkaXNwbGF5LmJhY2tfYnVmZmVyX2FycmF5LnN1YmFycmF5KDAsIGJ1ZmZlcl9zaXplKTtcbiAgICBjb25zdCBhcmdzID0ge1xuICAgICAgICB3aWR0aDogYm9pZF9jYW52YXNfd2lkdGgsXG4gICAgICAgIGhlaWdodDogYm9pZF9jYW52YXNfaGVpZ2h0LFxuICAgICAgICBidWZmZXI6IGJ1ZmZlcixcbiAgICAgICAgbW91c2U6IG1vdXNlLFxuICAgICAgICByZWN0YW5nbGVzOiBjb2xsaWRhYmxlX3JlY3RhbmdsZXMsXG4gICAgfTtcbiAgICBjb25zdCBudW1fYnl0ZXNfZmlsbGVkID0gZ28uZ2V0X25leHRfZnJhbWUoYXJncyk7XG4gICAgaWYgKG51bV9ieXRlc19maWxsZWQgIT09IGJ1ZmZlcl9zaXplKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGdvLmdldF9uZXh0X2ZyYW1lIGdvdCBpbmNvcnJlY3QgbnVtYmVyIG9mIGJ5dGVzLCB3YW50ZWQ6ICR7YnVmZmVyX3NpemV9LCBnb3Q6ICR7bnVtX2J5dGVzX2ZpbGxlZH1gKTtcbiAgICAvLyBAdHMtaWdub3JlIC8vIHdoeSBkb3NlIHRoaXMgbGluZSBtYWtlIGFuIGVycm9yIGluIG15IGVkaXRvclxuICAgIGNvbnN0IGltYWdlX2RhdGEgPSBuZXcgSW1hZ2VEYXRhKGJ1ZmZlciwgYm9pZF9jYW52YXNfd2lkdGgsIGJvaWRfY2FudmFzX2hlaWdodCk7XG4gICAgLy8gaXMgdGhpcyBjb29sP1xuICAgIC8vXG4gICAgLy8gdGhlIHdob2xlIHBvaW50IG9mIHRoaXMgYmFja19idWZmZXIgaXMgdG8gcHJldmVudCBmbGlja2VyaW5nIGFuZFxuICAgIC8vIHN0dWZmLCBidWYgaWYgd2VyZSBvbmx5IGdvaW5nIHRvIGJlIGRyYXdpbmcgb25lIHRoaW5nLi4uXG4gICAgLy8gd2hhdHMgdGhlIHBvaW50P1xuICAgIGRpc3BsYXkuYmFja19idWZmZXJfcmVuZGVyX2N0eC5wdXRJbWFnZURhdGEoaW1hZ2VfZGF0YSwgMCwgMCk7XG4gICAgLy8gTk9URSB0aGlzIHdpbGwgc3RyZXRjaCB0aGUgdGhpbmcuXG4gICAgLy8gY2FudmFzLndpZHRoIG1pZ2h0IGNoYW5nZSBkdXJpbmcgdGhlIHRpbWUgdGhpcyBpcyBydW5uaW5nXG4gICAgZGlzcGxheS5yZW5kZXJfY3R4LmRyYXdJbWFnZShkaXNwbGF5LmJhY2tfYnVmZmVyX3JlbmRlcl9jdHguY2FudmFzLCAwLCAwLCBkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLndpZHRoLCBkaXNwbGF5LnJlbmRlcl9jdHguY2FudmFzLmhlaWdodCk7XG4gICAgLy8gbGV0cyBob3BlIGphdmFzY3JpcHQgaXMgc21hcnQgZW5vdWdoIHRvIGRlYWxsb2NhdGUgdGhpcy4uLlxuICAgIC8vIGltYWdlRGF0YSA9IG51bGxcbn1cbjtcbi8vIFRPRE8gbWFrZSB0aGlzIHNtYXJ0ZXIuXG5jb25zdCByZW5kZXJfdGltZXMgPSBbXTtcbmNvbnN0IGRlbHRhX3RpbWVzID0gW107XG4vLyBDcmVkaXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS90c29kaW5nL2tvaWxcbi8vIFxuLy8gVE9ETyByZW1vdmUgbmV3X3JlbmRlcl90aW1lLCBhbmQgbmV3X2RlbHRhX3RpbWUsIGp1c3QgbWFrZSBhIGNsYXNzIG9yIHNvbWV0aGluZy5cbmZ1bmN0aW9uIHJlbmRlcl9kZWJ1Z19pbmZvKGRpc3BsYXksIG5ld19yZW5kZXJfdGltZSwgbmV3X2RlbHRhX3RpbWUpIHtcbiAgICBjb25zdCBGT05UX1NJWkUgPSAyODtcbiAgICBkaXNwbGF5LnJlbmRlcl9jdHguZm9udCA9IGAke0ZPTlRfU0laRX1weCBib2xkYDtcbiAgICByZW5kZXJfdGltZXMucHVzaChuZXdfcmVuZGVyX3RpbWUpO1xuICAgIGlmIChyZW5kZXJfdGltZXMubGVuZ3RoID4gNjApIHtcbiAgICAgICAgcmVuZGVyX3RpbWVzLnNoaWZ0KCk7XG4gICAgfVxuICAgIGRlbHRhX3RpbWVzLnB1c2gobmV3X2RlbHRhX3RpbWUpO1xuICAgIGlmIChkZWx0YV90aW1lcy5sZW5ndGggPiA2MCkge1xuICAgICAgICBkZWx0YV90aW1lcy5zaGlmdCgpO1xuICAgIH1cbiAgICBjb25zdCByZW5kZXJfYXZnID0gcmVuZGVyX3RpbWVzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gcmVuZGVyX3RpbWVzLmxlbmd0aDtcbiAgICBjb25zdCBkZWx0YV9hdmcgPSBkZWx0YV90aW1lcy5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKSAvIGRlbHRhX3RpbWVzLmxlbmd0aDtcbiAgICBjb25zdCBsYWJlbHMgPSBbXTtcbiAgICB7IC8vIGNvbnN0cnVjdCB0aGUgbGFiZWxzLlxuICAgICAgICAvLyB0aGlzIGlzIHRoZSBvbmx5IHVuaXF1ZSB0aGluZ3MgYmV0d2VlbiByZW5kZXJfdGltZXMgYW5kIGRlbHRhX3RpbWVzXG4gICAgICAgIGNvbnN0IGZyYW1lc19wZXJfc2Vjb25kID0gKDEgLyBkZWx0YV9hdmcgKiAxMDAwKS50b0ZpeGVkKDIpO1xuICAgICAgICBjb25zdCBzZWNvbmRzX3Blcl9mcmFtZSA9IChkZWx0YV9hdmcgLyAxMDAwKS50b0ZpeGVkKDUpO1xuICAgICAgICBsYWJlbHMucHVzaChgRi9TOiAke2ZyYW1lc19wZXJfc2Vjb25kfSAgICBTL0Y6ICR7c2Vjb25kc19wZXJfZnJhbWV9YCk7XG4gICAgICAgIGxhYmVscy5wdXNoKGBXQVNNIFJlbmRlciBUaW1lIEF2ZyAobXMpOiAke3JlbmRlcl9hdmcudG9GaXhlZCgyKX1gKTtcbiAgICAgICAgbGFiZWxzLnB1c2goYFJlbmRlci9TZWMgKE1BWCk6ICR7KDEgLyByZW5kZXJfYXZnICogMTAwMCkudG9GaXhlZCgyKX1gKTtcbiAgICB9XG4gICAgY29uc3QgUEFERElORyA9IDcwO1xuICAgIGNvbnN0IFNIQURPV19PRkZTRVQgPSBGT05UX1NJWkUgKiAwLjA2O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGFiZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICAgIGRpc3BsYXkucmVuZGVyX2N0eC5maWxsVGV4dChsYWJlbHNbaV0sIFBBRERJTkcsIFBBRERJTkcgKyBGT05UX1NJWkUgKiBpKTtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxTdHlsZSA9IFwid2hpdGVcIjtcbiAgICAgICAgZGlzcGxheS5yZW5kZXJfY3R4LmZpbGxUZXh0KGxhYmVsc1tpXSwgUEFERElORyArIFNIQURPV19PRkZTRVQsIFBBRERJTkcgLSBTSEFET1dfT0ZGU0VUICsgRk9OVF9TSVpFICogaSk7XG4gICAgfVxufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgICAgVGhlIE1haW4gRnVuY3Rpb25cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4oYXN5bmMgKCkgPT4ge1xuICAgIGlmIChJTl9ERVZfTU9ERSlcbiAgICAgICAgY29uc29sZS5sb2coXCJJbiBEZXYgTW9kZVwiKTtcbiAgICBjb25zdCBnbyA9IGF3YWl0IGdldF9nb19mdW5jdGlvbnMoKTtcbiAgICB7IC8vIEhhbmRsZSBzbGlkZXIgc3R1ZmZcbiAgICAgICAgY29uc3QgYm9pZF9wcm9wZXJ0aWVzID0gT2JqZWN0LmVudHJpZXMoZ28uZ2V0X3Byb3BlcnRpZXMoKSk7XG4gICAgICAgIGlmIChib2lkX3Byb3BlcnRpZXMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gcHJvcGVydGllcyB3aGVyZSBnaXZlbiB0byBqYXZhc2NyaXB0IVwiKTtcbiAgICAgICAgZnVuY3Rpb24gc2V0X3Byb3BlcnR5KG5hbWUsIHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjcxMDkwNS9ob3ctZG8taS1keW5hbWljYWxseS1hc3NpZ24tcHJvcGVydGllcy10by1hbi1vYmplY3QtaW4tdHlwZXNjcmlwdFxuICAgICAgICAgICAgY29uc3Qgb2JqID0ge307XG4gICAgICAgICAgICBvYmpbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIGdvLnNldF9wcm9wZXJ0aWVzKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgO1xuICAgICAgICAvLyBUT0RPIG1heWJlIG1ha2UgdGhpcyBkZXYgbW9kZSBvbmx5Li4uXG4gICAgICAgIC8vIGl0IGFsc28gaGFzIHRvIHJlbW92ZSB0aGUgU2V0dGluZ3MgdGhpbmcuLi5cbiAgICAgICAgKDAsIHNldHVwX3NsaWRlcnNfMS5zZXR1cF9zbGlkZXJzKShib2lkX3Byb3BlcnRpZXMsIHNldF9wcm9wZXJ0eSk7XG4gICAgfVxuICAgIHsgLy8gc2V0dXAgaW5wdXQgaGFuZGxpbmcuXG4gICAgICAgIC8vIHdoeSBkb2Vzbid0IHR5cGVzY3JpcHQgaGF2ZSBhbiBlbnVtIGZvciB0aGlzP1xuICAgICAgICBsZXQgTW91c2VfQnV0dG9ucztcbiAgICAgICAgKGZ1bmN0aW9uIChNb3VzZV9CdXR0b25zKSB7XG4gICAgICAgICAgICBNb3VzZV9CdXR0b25zW01vdXNlX0J1dHRvbnNbXCJMZWZ0XCJdID0gMF0gPSBcIkxlZnRcIjtcbiAgICAgICAgICAgIE1vdXNlX0J1dHRvbnNbTW91c2VfQnV0dG9uc1tcIk1pZGRsZVwiXSA9IDFdID0gXCJNaWRkbGVcIjtcbiAgICAgICAgICAgIE1vdXNlX0J1dHRvbnNbTW91c2VfQnV0dG9uc1tcIlJpZ2h0XCJdID0gMl0gPSBcIlJpZ2h0XCI7XG4gICAgICAgIH0pKE1vdXNlX0J1dHRvbnMgfHwgKE1vdXNlX0J1dHRvbnMgPSB7fSkpO1xuICAgICAgICA7XG4gICAgICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5nZXRSb290Tm9kZSgpO1xuICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChldikgPT4ge1xuICAgICAgICAgICAgbW91c2UucG9zID0geyB4OiBldi54LCB5OiBldi55IH07XG4gICAgICAgIH0pO1xuICAgICAgICAvLyB0aGlzIHdpbGwgYnJlYWsgaWYgdGhlIHVzZXIgc2xpZGVzIHRoZXJlIG1vdXNlIG91dHNpZGUgb2YgdGhlIHNjcmVlbiB3aGlsZSBjbGlja2luZywgYnV0IHRoaXMgaXMgdGhlIHdlYiwgcGVvcGxlIGV4cGVjdCBpdCB0byBzdWNrLlxuICAgICAgICByb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChldikgPT4ge1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PT0gTW91c2VfQnV0dG9ucy5MZWZ0KVxuICAgICAgICAgICAgICAgIG1vdXNlLmxlZnRfZG93biA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09PSBNb3VzZV9CdXR0b25zLk1pZGRsZSlcbiAgICAgICAgICAgICAgICBtb3VzZS5taWRkbGVfZG93biA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09PSBNb3VzZV9CdXR0b25zLlJpZ2h0KVxuICAgICAgICAgICAgICAgIG1vdXNlLnJpZ2h0X2Rvd24gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGV2KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09PSBNb3VzZV9CdXR0b25zLkxlZnQpXG4gICAgICAgICAgICAgICAgbW91c2UubGVmdF9kb3duID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09PSBNb3VzZV9CdXR0b25zLk1pZGRsZSlcbiAgICAgICAgICAgICAgICBtb3VzZS5taWRkbGVfZG93biA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PT0gTW91c2VfQnV0dG9ucy5SaWdodClcbiAgICAgICAgICAgICAgICBtb3VzZS5yaWdodF9kb3duID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBjb25zdCBjYW52YXNfY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNfZGl2XCIpIGFzIEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbFxuICAgIGNvbnN0IGJvaWRfY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2lkX2NhbnZhc1wiKTtcbiAgICBpZiAoYm9pZF9jYW52YXMgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGNhbnZhcyB3aXRoIGlkIGBib2lkX2NhbnZhc2AgaXMgZm91bmRcIik7XG4gICAgLy8gVE9ETyBuYW1pbmcgYmV0dGVyLCB1c2Ugc25ha2UgY2FzZSBldmVyeXdoZXJlISFcbiAgICBjb25zdCBib2lkX2NhbnZhc19yZW5kZXJfY3R4ID0gYm9pZF9jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIGlmIChib2lkX2NhbnZhc19yZW5kZXJfY3R4ID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIyRCBjb250ZXh0IGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICBjb25zdCBbYmFja19idWZmZXJfaW1hZ2Vfd2lkdGgsIGJhY2tfYnVmZmVyX2ltYWdlX2hlaWdodF0gPSBbYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5jYW52YXMud2lkdGgsIGJvaWRfY2FudmFzX3JlbmRlcl9jdHguY2FudmFzLmhlaWdodF07XG4gICAgY29uc3QgYmFja19idWZmZXJfY2FudmFzID0gbmV3IE9mZnNjcmVlbkNhbnZhcyhiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCwgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0KTtcbiAgICBjb25zdCBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4ID0gYmFja19idWZmZXJfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoYmFja19idWZmZXJfcmVuZGVyX2N0eCA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgIGJhY2tfYnVmZmVyX3JlbmRlcl9jdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgY29uc3QgYmFja19idWZmZXJfYXJyYXkgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkoYmFja19idWZmZXJfaW1hZ2Vfd2lkdGggKiBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQgKiA0KTtcbiAgICBjb25zdCBkaXNwbGF5ID0ge1xuICAgICAgICByZW5kZXJfY3R4OiBib2lkX2NhbnZhc19yZW5kZXJfY3R4LFxuICAgICAgICBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4OiBiYWNrX2J1ZmZlcl9yZW5kZXJfY3R4LFxuICAgICAgICBiYWNrX2J1ZmZlcl9hcnJheTogYmFja19idWZmZXJfYXJyYXksXG4gICAgICAgIGJhY2tfYnVmZmVyX2ltYWdlX3dpZHRoOiBiYWNrX2J1ZmZlcl9pbWFnZV93aWR0aCxcbiAgICAgICAgYmFja19idWZmZXJfaW1hZ2VfaGVpZ2h0OiBiYWNrX2J1ZmZlcl9pbWFnZV9oZWlnaHQsXG4gICAgfTtcbiAgICBsZXQgcHJldl90aW1lc3RhbXAgPSAwO1xuICAgIGNvbnN0IGZyYW1lID0gKHRpbWVzdGFtcCkgPT4ge1xuICAgICAgICBjb25zdCBib2lkQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib2lkX2NvbnRhaW5lclwiKTtcbiAgICAgICAgaWYgKGJvaWRDb250YWluZXIgPT09IG51bGwpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBlbGVtZW50IHdpdGggaWQgYGJvaWRfY29udGFpbmVyYCBpcyBmb3VuZFwiKTtcbiAgICAgICAgYm9pZF9jYW52YXNfcmVuZGVyX2N0eC5jYW52YXMud2lkdGggPSBib2lkQ29udGFpbmVyLmNsaWVudFdpZHRoO1xuICAgICAgICBib2lkX2NhbnZhc19yZW5kZXJfY3R4LmNhbnZhcy5oZWlnaHQgPSBib2lkQ29udGFpbmVyLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29uc3QgZGVsdGFfdGltZSA9ICh0aW1lc3RhbXAgLSBwcmV2X3RpbWVzdGFtcCk7XG4gICAgICAgIHByZXZfdGltZXN0YW1wID0gdGltZXN0YW1wO1xuICAgICAgICAvLyBUT0RPIERvbid0IG5lZWQgZGVsdGEgdGltZSwgYm9pZCB0aGluZyBkb3NlIGl0IGZvciB1cz8gY2hhbmdlP1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHJlbmRlcl9ib2lkcyhkaXNwbGF5LCBnbyk7XG4gICAgICAgIGNvbnN0IGVuZF90aW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIC8vIEluIG1zXG4gICAgICAgIGNvbnN0IHJlbmRlcl90aW1lID0gZW5kX3RpbWUgLSBzdGFydF90aW1lO1xuICAgICAgICBpZiAobG9nZ2VyXzEuREVCVUdfRElTUExBWSAmJiBJTl9ERVZfTU9ERSlcbiAgICAgICAgICAgIHJlbmRlcl9kZWJ1Z19pbmZvKGRpc3BsYXksIHJlbmRlcl90aW1lLCBkZWx0YV90aW1lKTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gICAgfTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCh0aW1lc3RhbXApID0+IHtcbiAgICAgICAgcHJldl90aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgIH0pO1xufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==