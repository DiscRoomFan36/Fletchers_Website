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
    const [left, right_] = prop.split(":");
    const right = right_.slice(1, right_.length - 1);
    return [left, right];
}
;
function parseBool(s) {
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
    const slider_container = document.getElementById("slideContainer");
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
            const [left, right] = tag_prop_to_parts(tag_split[0]);
            tag_split.shift();
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
                                property_struct.bool_default = parseBool(right);
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
const IN_DEV_MODE = (window.location.hostname == "localhost");
;
;
// NOTE we keep the @ts-ignore's in here
async function GetGoFunctions() {
    // @ts-ignore
    const go = new Go(); // NOTE this comes from the wasm_exec.js thing
    const result = await WebAssembly.instantiateStreaming(fetch("dist/boid.wasm"), go.importObject);
    go.run(result.instance);
    return {
        // @ts-ignore
        SetProperties: SetProperties,
        // @ts-ignore
        GetProperties: GetProperties,
        // @ts-ignore
        GetNextFrame: GetNextFrame,
    };
}
;
;
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
        // to account for letters like j
        height: dom_rect.height + 5,
    };
}
;
function get_all_collide_able_rects() {
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
function renderBoids(display, go) {
    const rects = get_all_collide_able_rects();
    const width = Math.floor(display.ctx.canvas.width / SQUISH_FACTOR);
    const height = Math.floor(display.ctx.canvas.height / SQUISH_FACTOR);
    const buffer_size = width * height * NUM_COLOR_COMPONENTS;
    if (display.backImageWidth !== width || display.backImageHeight !== height) {
        (0, logger_1.log)(logger_1.Log_Type.General, "Oh god. were resizing the buffer");
        if (display.backBufferArray.length < buffer_size) {
            (0, logger_1.log)(logger_1.Log_Type.General, "Its getting bigger"); // my penis
            // make the buffer bigger
            display.backBufferArray = new Uint8ClampedArray(buffer_size);
        }
        const backCanvas = new OffscreenCanvas(width, height);
        const backCtx = backCanvas.getContext("2d");
        if (backCtx === null)
            throw new Error("2D context is not supported");
        display.backCtx = backCtx;
        display.backCtx.imageSmoothingEnabled = false;
        display.backImageWidth = width;
        display.backImageHeight = height;
    }
    const buffer = display.backBufferArray.subarray(0, buffer_size);
    const args = {
        width: width,
        height: height,
        buffer: buffer,
        mouse: mouse,
        rects: rects,
    };
    const numFilled = go.GetNextFrame(args);
    if (numFilled !== buffer_size)
        throw new Error(`GetNextFrame got ${numFilled}`);
    // @ts-ignore // why dose this line make an error in my editor
    const imageData = new ImageData(buffer, width, height);
    // is this cool?
    display.backCtx.putImageData(imageData, 0, 0);
    // NOTE this will stretch the thing.
    // canvas.width might change during the time this is running
    display.ctx.drawImage(display.backCtx.canvas, 0, 0, display.ctx.canvas.width, display.ctx.canvas.height);
    // imageData = null
}
;
const renderTimes = [];
const deltaTimes = [];
// Credit: https://github.com/tsoding/koil
function renderDebugInfo(display, renderTime, deltaTime) {
    const FONT_SIZE = 28;
    display.ctx.font = `${FONT_SIZE}px bold`;
    const labels = [];
    renderTimes.push(renderTime);
    if (renderTimes.length > 60) {
        renderTimes.shift();
    }
    deltaTimes.push(deltaTime);
    if (deltaTimes.length > 60) {
        deltaTimes.shift();
    }
    const renderAvg = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const deltaAvg = deltaTimes.reduce((a, b) => a + b, 0) / deltaTimes.length;
    const frames_per_second = (1 / deltaAvg * 1000).toFixed(2);
    const seconds_per_frame = (deltaAvg / 1000).toFixed(5);
    labels.push(`F/S: ${frames_per_second}    S/F: ${seconds_per_frame}`);
    labels.push(`WASM Render Time Avg (ms): ${renderAvg.toFixed(2)}`);
    labels.push(`Render/Sec (MAX): ${(1 / renderAvg * 1000).toFixed(2)}`);
    const PADDING = 70;
    const SHADOW_OFFSET = FONT_SIZE * 0.06;
    for (let i = 0; i < labels.length; i++) {
        display.ctx.fillStyle = "black";
        display.ctx.fillText(labels[i], PADDING, PADDING + FONT_SIZE * i);
        display.ctx.fillStyle = "white";
        display.ctx.fillText(labels[i], PADDING + SHADOW_OFFSET, PADDING - SHADOW_OFFSET + FONT_SIZE * i);
    }
}
;
(async () => {
    if (IN_DEV_MODE)
        console.log("In Dev Mode");
    const go = await GetGoFunctions();
    { // Handle slider stuff
        const properties = Object.entries(go.GetProperties());
        function set_property(name, value) {
            // https://stackoverflow.com/questions/12710905/how-do-i-dynamically-assign-properties-to-an-object-in-typescript
            const obj = {};
            obj[name] = value;
            go.SetProperties(obj);
        }
        ;
        // TODO maybe make this dev mode only...
        // it also has to remove the Settings thing...
        (0, setup_sliders_1.setup_sliders)(properties, set_property);
    }
    { // setup input handling.
        // why doesn't typescript have an enum for this?
        let mouse_buttons;
        (function (mouse_buttons) {
            mouse_buttons[mouse_buttons["MOUSE_LEFT"] = 0] = "MOUSE_LEFT";
            mouse_buttons[mouse_buttons["MOUSE_MIDDLE"] = 1] = "MOUSE_MIDDLE";
            mouse_buttons[mouse_buttons["MOUSE_RIGHT"] = 2] = "MOUSE_RIGHT";
        })(mouse_buttons || (mouse_buttons = {}));
        ;
        const root = document.getRootNode();
        root.addEventListener('mousemove', (ev) => {
            mouse.pos = { x: ev.x, y: ev.y };
        });
        // this will break if the user slides there mouse outside of the screen while clicking, but this is the web, people expect it to suck.
        root.addEventListener('mousedown', (ev) => {
            if (ev.button == mouse_buttons.MOUSE_LEFT)
                mouse.left_down = true;
            if (ev.button == mouse_buttons.MOUSE_MIDDLE)
                mouse.middle_down = true;
            if (ev.button == mouse_buttons.MOUSE_RIGHT)
                mouse.right_down = true;
        });
        root.addEventListener('mouseup', (ev) => {
            if (ev.button == mouse_buttons.MOUSE_LEFT)
                mouse.left_down = false;
            if (ev.button == mouse_buttons.MOUSE_MIDDLE)
                mouse.middle_down = false;
            if (ev.button == mouse_buttons.MOUSE_RIGHT)
                mouse.right_down = false;
        });
    }
    // TODO naming better, use snake case everywhere!!
    // TODO naming better, use snake case everywhere!!
    // TODO naming better, use snake case everywhere!!
    // TODO naming better, use snake case everywhere!!
    // TODO naming better, use snake case everywhere!!
    // const canvas_container = document.getElementById("canvas_div") as HTMLCanvasElement | null
    const boidCanvas = document.getElementById("boid_canvas");
    if (boidCanvas === null)
        throw new Error("No canvas with id `boid_canvas` is found");
    const ctx = boidCanvas.getContext("2d");
    if (ctx === null)
        throw new Error("2D context is not supported");
    ctx.imageSmoothingEnabled = false;
    const [backImageWidth, backImageHeight] = [ctx.canvas.width, ctx.canvas.height];
    const backCanvas = new OffscreenCanvas(backImageWidth, backImageHeight);
    const backCtx = backCanvas.getContext("2d");
    if (backCtx === null)
        throw new Error("2D context is not supported");
    backCtx.imageSmoothingEnabled = false;
    const backBufferArray = new Uint8ClampedArray(backImageWidth * backImageHeight * 4);
    const display = {
        ctx,
        backCtx,
        backBufferArray,
        backImageWidth,
        backImageHeight,
    };
    let prevTimestamp = 0;
    const frame = (timestamp) => {
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        const deltaTime = (timestamp - prevTimestamp);
        prevTimestamp = timestamp;
        // TODO Don't need delta time, boid thing dose it for us? change?
        const startTime = performance.now();
        renderBoids(display, go);
        const endTime = performance.now();
        // In ms
        const renderTime = endTime - startTime;
        if (logger_1.DEBUG_DISPLAY && IN_DEV_MODE)
            renderDebugInfo(display, renderTime, deltaTime);
        window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame((timestamp) => {
        prevTimestamp = timestamp;
        window.requestAnimationFrame(frame);
    });
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYm9pZHMvLi93ZWJfc3JjL2xvZ2dlci50cyIsIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvc2V0dXBfc2xpZGVycy50cyIsIndlYnBhY2s6Ly9ib2lkcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9ib2lkcy8uL3dlYl9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkxvZ19UeXBlID0gZXhwb3J0cy5ERUJVR19TTElERVJTID0gZXhwb3J0cy5ERUJVR19ESVNQTEFZID0gdm9pZCAwO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG4vLyBpcyBpdCBjb3JyZWN0IHRvIGhhdmUgdGhlc2UgaGVyZT8gdGhpcyBvbmUgZWZmZWN0c1xuLy8gZHJhd2luZyBvbiB0aGUgc2NyZWVuLCBub3QganVzdCBsb2dnaW5nPyBhbHRob3VnaCB3ZVxuLy8gY291bGQgbWFrZSBhbGwgbG9ncyBhcHBlYXIgb24gc2NyZWVuLi4uXG5leHBvcnRzLkRFQlVHX0RJU1BMQVkgPSB0cnVlO1xuZXhwb3J0cy5ERUJVR19TTElERVJTID0gZmFsc2U7XG52YXIgTG9nX1R5cGU7XG4oZnVuY3Rpb24gKExvZ19UeXBlKSB7XG4gICAgTG9nX1R5cGVbTG9nX1R5cGVbXCJHZW5lcmFsXCJdID0gMF0gPSBcIkdlbmVyYWxcIjtcbiAgICBMb2dfVHlwZVtMb2dfVHlwZVtcIkRlYnVnX0Rpc3BsYXlcIl0gPSAxXSA9IFwiRGVidWdfRGlzcGxheVwiO1xuICAgIExvZ19UeXBlW0xvZ19UeXBlW1wiRGVidWdfU2xpZGVyc1wiXSA9IDJdID0gXCJEZWJ1Z19TbGlkZXJzXCI7XG59KShMb2dfVHlwZSB8fCAoZXhwb3J0cy5Mb2dfVHlwZSA9IExvZ19UeXBlID0ge30pKTtcbjtcbmZ1bmN0aW9uIGxvZyhsb2dfdHlwZSwgLi4uZGF0YSkge1xuICAgIC8vIGlmIHRoaXMgaXMgdGhlIGVtcHR5IHN0cmluZ1xuICAgIHZhciBkb19sb2cgPSBmYWxzZTtcbiAgICB2YXIgbG9nX2hlYWRlciA9IFwiXCI7XG4gICAgc3dpdGNoIChsb2dfdHlwZSkge1xuICAgICAgICBjYXNlIExvZ19UeXBlLkdlbmVyYWw6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgZG9fbG9nID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIExvZ19UeXBlLkRlYnVnX0Rpc3BsYXk6XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbG9nX2hlYWRlciA9IFwiREVCVUdfRElTUExBWVwiO1xuICAgICAgICAgICAgICAgIGlmIChleHBvcnRzLkRFQlVHX0RJU1BMQVkpXG4gICAgICAgICAgICAgICAgICAgIGRvX2xvZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBMb2dfVHlwZS5EZWJ1Z19TbGlkZXJzOlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxvZ19oZWFkZXIgPSBcIkRFQlVHX1NMSURFUlNcIjtcbiAgICAgICAgICAgICAgICBpZiAoZXhwb3J0cy5ERUJVR19TTElERVJTKVxuICAgICAgICAgICAgICAgICAgICBkb19sb2cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGlmIChkb19sb2cpIHtcbiAgICAgICAgaWYgKGxvZ19oZWFkZXIgIT0gXCJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYCR7bG9nX2hlYWRlcn06IGAsIC4uLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coLi4uZGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG59XG47XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2V0dXBfc2xpZGVycyA9IHNldHVwX3NsaWRlcnM7XG5jb25zdCBsb2dnZXJfMSA9IHJlcXVpcmUoXCIuL2xvZ2dlclwiKTtcbnZhciBQcm9wZXJ0eV9UeXBlO1xuKGZ1bmN0aW9uIChQcm9wZXJ0eV9UeXBlKSB7XG4gICAgUHJvcGVydHlfVHlwZVtQcm9wZXJ0eV9UeXBlW1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XG4gICAgUHJvcGVydHlfVHlwZVtQcm9wZXJ0eV9UeXBlW1wiUHJvcGVydHlfRmxvYXRcIl0gPSAxXSA9IFwiUHJvcGVydHlfRmxvYXRcIjtcbiAgICBQcm9wZXJ0eV9UeXBlW1Byb3BlcnR5X1R5cGVbXCJQcm9wZXJ0eV9JbnRcIl0gPSAyXSA9IFwiUHJvcGVydHlfSW50XCI7XG4gICAgUHJvcGVydHlfVHlwZVtQcm9wZXJ0eV9UeXBlW1wiUHJvcGVydHlfQm9vbFwiXSA9IDNdID0gXCJQcm9wZXJ0eV9Cb29sXCI7XG59KShQcm9wZXJ0eV9UeXBlIHx8IChQcm9wZXJ0eV9UeXBlID0ge30pKTtcbjtcbmNsYXNzIFByb3BlcnR5X1N0cnVjdCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMucHJvcGVydHlfdHlwZSA9IFByb3BlcnR5X1R5cGUuTm9uZTtcbiAgICAgICAgLy8gRmxvYXQgcHJvcGVydGllc1xuICAgICAgICB0aGlzLmZsb2F0X3JhbmdlX21pbiA9IDA7XG4gICAgICAgIHRoaXMuZmxvYXRfcmFuZ2VfbWF4ID0gMDtcbiAgICAgICAgdGhpcy5mbG9hdF9kZWZhdWx0ID0gMDtcbiAgICAgICAgLy8gSW50IHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5pbnRfcmFuZ2VfbWluID0gMDtcbiAgICAgICAgdGhpcy5pbnRfcmFuZ2VfbWF4ID0gMDtcbiAgICAgICAgdGhpcy5pbnRfZGVmYXVsdCA9IDA7XG4gICAgICAgIHRoaXMuYm9vbF9kZWZhdWx0ID0gZmFsc2U7XG4gICAgfVxufVxuO1xuZnVuY3Rpb24gdGFnX3Byb3BfdG9fcGFydHMocHJvcCkge1xuICAgIGNvbnN0IFtsZWZ0LCByaWdodF9dID0gcHJvcC5zcGxpdChcIjpcIik7XG4gICAgY29uc3QgcmlnaHQgPSByaWdodF8uc2xpY2UoMSwgcmlnaHRfLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiBbbGVmdCwgcmlnaHRdO1xufVxuO1xuZnVuY3Rpb24gcGFyc2VCb29sKHMpIHtcbiAgICAvLyAxLCB0LCBULCBUUlVFLCB0cnVlLCBUcnVlLFxuICAgIC8vIDAsIGYsIEYsIEZBTFNFLCBmYWxzZSwgRmFsc2VcbiAgICBzd2l0Y2ggKHMpIHtcbiAgICAgICAgY2FzZSBcIjFcIjpcbiAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgY2FzZSBcIlRcIjpcbiAgICAgICAgY2FzZSBcIlRSVUVcIjpcbiAgICAgICAgY2FzZSBcInRydWVcIjpcbiAgICAgICAgY2FzZSBcIlRydWVcIjoge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcIjBcIjpcbiAgICAgICAgY2FzZSBcImZcIjpcbiAgICAgICAgY2FzZSBcIkZcIjpcbiAgICAgICAgY2FzZSBcIkZBTFNFXCI6XG4gICAgICAgIGNhc2UgXCJmYWxzZVwiOlxuICAgICAgICBjYXNlIFwiRmFsc2VcIjoge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biBzdHJpbmcgaW4gcGFyc2VCb29sLCB3YXMgJHtzfWApO1xuICAgIH1cbn1cbjtcbi8vIHB1dHMgc29tZSBzbGlkZXJzIHVwIHRvIGNvbnRyb2wgc29tZSBwYXJhbWV0ZXJzXG5mdW5jdGlvbiBzZXR1cF9zbGlkZXJzKHByb3BlcnRpZXMsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IHNsaWRlcl9jb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNsaWRlQ29udGFpbmVyXCIpO1xuICAgIGlmIChzbGlkZXJfY29udGFpbmVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgR2V0IHNsaWRlciBjb250YWluZXJcIik7XG4gICAgLy8gVE9ETyBmb3IgdGhlIHNsaWRlcyB0aGF0IGhhdmUgYSBzbWFsbCByYW5nZSAobGlrZSBjb2hlc2lvbiBmYWN0b3IpIG1ha2UgdGhlIHZhbHVlIHRoZSBzcXVhcmUgb2YgdGhlIG51bWJlci5cbiAgICBwcm9wZXJ0aWVzLnNvcnQoKTsgLy8gaG9wZSBzb21lb25lIGVsc2Ugd2Fzbid0IHVzaW5nIHRoaXMuXG4gICAgZm9yIChjb25zdCBbbmFtZSwgdGFnXSBvZiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkRlYnVnX1NsaWRlcnMsIGB0eXBlc2NyaXB0OiAke25hbWV9OiAke3RhZ31gKTtcbiAgICAgICAgLy8gVE9ETyB0aGlzIGZ1bmN0aW9uIGlzIGdyb3dpbmcgdG8gYmlnLCBwdXQgaXQgaW4gYSBzZXBhcmF0ZSBmaWxlLlxuICAgICAgICBjb25zdCB0YWdfc3BsaXQgPSB0YWcuc3BsaXQoXCIgXCIpO1xuICAgICAgICBjb25zdCBbcHJvcF9wcm9wZXJ0eSwgcHJvcF90eXBlXSA9IHRhZ19wcm9wX3RvX3BhcnRzKHRhZ19zcGxpdFswXSk7XG4gICAgICAgIGlmIChwcm9wX3Byb3BlcnR5ICE9IFwiUHJvcGVydHlcIilcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRmlyc3QgcHJvcGVydHkgaXMgbm90IHByb3BlcnR5LCB0YWcgd2FzICR7dGFnfWApO1xuICAgICAgICBjb25zdCBwcm9wZXJ0eV9zdHJ1Y3QgPSBuZXcgUHJvcGVydHlfU3RydWN0KCk7XG4gICAgICAgIHN3aXRjaCAocHJvcF90eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwiZmxvYXRcIjpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlID0gUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9GbG9hdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiaW50XCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSA9IFByb3BlcnR5X1R5cGUuUHJvcGVydHlfSW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJib29sXCI6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSA9IFByb3BlcnR5X1R5cGUuUHJvcGVydHlfQm9vbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHJvcCB0eXBlICR7cHJvcF90eXBlfWApO1xuICAgICAgICB9XG4gICAgICAgIHRhZ19zcGxpdC5zaGlmdCgpO1xuICAgICAgICB3aGlsZSAodGFnX3NwbGl0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IFtsZWZ0LCByaWdodF0gPSB0YWdfcHJvcF90b19wYXJ0cyh0YWdfc3BsaXRbMF0pO1xuICAgICAgICAgICAgdGFnX3NwbGl0LnNoaWZ0KCk7XG4gICAgICAgICAgICBzd2l0Y2ggKGxlZnQpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiUmFuZ2VcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Zsb2F0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW21pbl9zLCBtYXhfc10gPSByaWdodC5zcGxpdChcIjtcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5mbG9hdF9yYW5nZV9taW4gPSBwYXJzZUZsb2F0KG1pbl9zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21heCA9IHBhcnNlRmxvYXQobWF4X3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9JbnQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbbWluX3MsIG1heF9zXSA9IHJpZ2h0LnNwbGl0KFwiO1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9taW4gPSBwYXJzZUludChtaW5fcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5X3N0cnVjdC5pbnRfcmFuZ2VfbWF4ID0gcGFyc2VJbnQobWF4X3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9Cb29sOiB0aHJvdyBuZXcgRXJyb3IoXCJCb29sZWFuIGRvc2Ugbm90IGhhdmUgYSByYW5nZSFcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdHlwZSBpbiAke25hbWV9YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIkRlZmF1bHRcIjpcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwcm9wZXJ0eV9zdHJ1Y3QucHJvcGVydHlfdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Zsb2F0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHQgPSBwYXJzZUZsb2F0KHJpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfSW50OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmludF9kZWZhdWx0ID0gcGFyc2VJbnQocmlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgUHJvcGVydHlfVHlwZS5Qcm9wZXJ0eV9Cb29sOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlfc3RydWN0LmJvb2xfZGVmYXVsdCA9IHBhcnNlQm9vbChyaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHR5cGUgaW4gJHtuYW1lfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcihgVW5rbm93biBwcm9wZXJ0eSAke2xlZnR9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyBzb21lIHdheSB0byBwcmludCBhbiBvYmplY3QuXG4gICAgICAgIC8vIGxvZyhMb2dfVHlwZS5EZWJ1Z19TbGlkZXJzLCBgcHJvcGVydHkgc3RydWN0ICR7cHJvcGVydHlfc3RydWN0fWApO1xuICAgICAgICBzd2l0Y2ggKHByb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFByb3BlcnR5X1R5cGUuUHJvcGVydHlfRmxvYXQ6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtYWtlX2Zsb2F0X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0ludDpcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG1ha2VfaW50X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQcm9wZXJ0eV9UeXBlLlByb3BlcnR5X0Jvb2w6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBtYWtlX2Jvb2xfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIG5hbWUsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcHJvcGVydHkgdHlwZSAke3Byb3BlcnR5X3N0cnVjdC5wcm9wZXJ0eV90eXBlfWApO1xuICAgICAgICB9XG4gICAgfVxufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgTWFrZSBhIHNsaWRlciBmb3IgYW4gZmxvYXRcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2Zsb2F0X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IGlkID0gYHNsaWRlcl8ke25hbWV9YDtcbiAgICBjb25zdCBwYXJhX2lkID0gYCR7aWR9X3BhcmFncmFwaGA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtuYW1lLnJlcGxhY2UoL18vZywgXCIgXCIpfWA7XG4gICAgY29uc3QgaHRtbF9zdHJpbmcgPSBgXG4gICAgICAgIDxwIGNsYXNzPVwic2xpZGVyS2V5XCIgaWQ9XCIke3BhcmFfaWR9XCI+XG4gICAgICAgICAgICAke3BhcmFncmFwaF90ZXh0fTogJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfZGVmYXVsdH1cbiAgICAgICAgPC9wPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInJhbmdlXCIgbWluPVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuZmxvYXRfcmFuZ2VfbWlufVwiIG1heD1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X3JhbmdlX21heH1cIiB2YWx1ZT1cIiR7cHJvcGVydHlfc3RydWN0LmZsb2F0X2RlZmF1bHR9XCIgc3RlcD1cIjAuMDA1XCIgY2xhc3M9XCJzbGlkZXJcIiBpZD1cIiR7aWR9XCI+XG4gICAgICAgIGA7XG4gICAgY29uc3QgbmV3X3RoaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuZXdfdGhpbmcuY2xhc3NOYW1lID0gXCJyYW5nZUhvbGRlclwiO1xuICAgIG5ld190aGluZy5pbm5lckhUTUwgPSBodG1sX3N0cmluZztcbiAgICBzbGlkZXJfY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld190aGluZyk7XG4gICAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBmaW5kIHRoZSBzbGlkZXJcIik7XG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qgc2xpZGVyX3ZhbHVlX3N0cmluZyA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgY29uc3Qgc2xpZGVyX251bWJlciA9IE51bWJlcihzbGlkZXJfdmFsdWVfc3RyaW5nKTtcbiAgICAgICAgY29uc3Qgc2xpZGVyX3RleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXJhX2lkKTtcbiAgICAgICAgaWYgKHNsaWRlcl90ZXh0ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjb3VsZCBub3QgZmluZCBzbGlkZXJfdGV4dCAke3BhcmFfaWR9YCk7XG4gICAgICAgIHNsaWRlcl90ZXh0LnRleHRDb250ZW50ID0gYCR7cGFyYWdyYXBoX3RleHR9OiAke3NsaWRlcl9udW1iZXJ9YDtcbiAgICAgICAgc2V0X3Byb3BlcnR5KG5hbWUsIHNsaWRlcl9udW1iZXIpO1xuICAgIH0pO1xufVxuO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vICAgICAgICAgIE1ha2UgYSBzbGlkZXIgZm9yIGFuIGludFxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbmZ1bmN0aW9uIG1ha2VfaW50X3NsaWRlcihzbGlkZXJfY29udGFpbmVyLCBuYW1lLCBwcm9wZXJ0eV9zdHJ1Y3QsIHNldF9wcm9wZXJ0eSkge1xuICAgIGNvbnN0IGlkID0gYHNsaWRlcl8ke25hbWV9YDtcbiAgICBjb25zdCBwYXJhX2lkID0gYCR7aWR9X3BhcmFncmFwaGA7XG4gICAgY29uc3QgcGFyYWdyYXBoX3RleHQgPSBgJHtuYW1lLnJlcGxhY2UoL18vZywgXCIgXCIpfWA7XG4gICAgY29uc3QgaHRtbF9zdHJpbmcgPSBgXG4gICAgICAgIDxwIGNsYXNzPVwic2xpZGVyS2V5XCIgaWQ9XCIke3BhcmFfaWR9XCI+XG4gICAgICAgICAgICAke3BhcmFncmFwaF90ZXh0fTogJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X2RlZmF1bHR9XG4gICAgICAgIDwvcD5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJyYW5nZVwiIG1pbj1cIiR7cHJvcGVydHlfc3RydWN0LmludF9yYW5nZV9taW59XCIgbWF4PVwiJHtwcm9wZXJ0eV9zdHJ1Y3QuaW50X3JhbmdlX21heH1cIiB2YWx1ZT1cIiR7cHJvcGVydHlfc3RydWN0LmludF9kZWZhdWx0fVwiIGNsYXNzPVwic2xpZGVyXCIgaWQ9XCIke2lkfVwiPlxuICAgICAgICBgO1xuICAgIGNvbnN0IG5ld190aGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbmV3X3RoaW5nLmNsYXNzTmFtZSA9IFwicmFuZ2VIb2xkZXJcIjtcbiAgICBuZXdfdGhpbmcuaW5uZXJIVE1MID0gaHRtbF9zdHJpbmc7XG4gICAgc2xpZGVyX2NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdfdGhpbmcpO1xuICAgIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoc2xpZGVyID09PSBudWxsKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgZmluZCB0aGUgc2xpZGVyXCIpO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHNsaWRlcl92YWx1ZV9zdHJpbmcgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIGNvbnN0IHNsaWRlcl9udW1iZXIgPSBOdW1iZXIoc2xpZGVyX3ZhbHVlX3N0cmluZyk7XG4gICAgICAgIGNvbnN0IHNsaWRlcl90ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFyYV9pZCk7XG4gICAgICAgIGlmIChzbGlkZXJfdGV4dCA9PT0gbnVsbClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgY291bGQgbm90IGZpbmQgc2xpZGVyX3RleHQgJHtwYXJhX2lkfWApO1xuICAgICAgICBzbGlkZXJfdGV4dC50ZXh0Q29udGVudCA9IGAke3BhcmFncmFwaF90ZXh0fTogJHtzbGlkZXJfbnVtYmVyfWA7XG4gICAgICAgIHNldF9wcm9wZXJ0eShuYW1lLCBzbGlkZXJfbnVtYmVyKTtcbiAgICB9KTtcbn1cbjtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyAgICAgTWFrZSBhIHNsaWRlciBmb3IgYW4gYm9vbGVhbiB0b2dnbGVcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBtYWtlX2Jvb2xfc2xpZGVyKHNsaWRlcl9jb250YWluZXIsIG5hbWUsIHByb3BlcnR5X3N0cnVjdCwgc2V0X3Byb3BlcnR5KSB7XG4gICAgY29uc3QgaWQgPSBgc2xpZGVyXyR7bmFtZX1gO1xuICAgIGNvbnN0IHBhcmFncmFwaF90ZXh0ID0gYCR7bmFtZS5yZXBsYWNlKC9fL2csIFwiIFwiKX1gO1xuICAgIGNvbnN0IGh0bWxfc3RyaW5nID0gYFxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgJHtwcm9wZXJ0eV9zdHJ1Y3QuYm9vbF9kZWZhdWx0ID8gXCJjaGVja2VkXCIgOiBcIlwifSBjbGFzcz1cImNoZWNrYm94X3RvZ2dsZVwiIGlkPVwiJHtpZH1cIj5cbiAgICAgICAgPGxhYmVsIGZvcj1cIiR7aWR9XCIgY2xhc3M9XCJjaGVja2JveF90b2dnbGVfbGFiZWxcIj4ke3BhcmFncmFwaF90ZXh0fTwvbGFiZWw+XG4gICAgICAgIGA7XG4gICAgY29uc3QgbmV3X3RoaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBuZXdfdGhpbmcuY2xhc3NOYW1lID0gXCJyYW5nZUhvbGRlclwiO1xuICAgIG5ld190aGluZy5pbm5lckhUTUwgPSBodG1sX3N0cmluZztcbiAgICBzbGlkZXJfY29udGFpbmVyLmFwcGVuZENoaWxkKG5ld190aGluZyk7XG4gICAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmIChzbGlkZXIgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBmaW5kIHRoZSBzbGlkZXJcIik7XG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBpZiAodGFyZ2V0ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFyZ2V0IHdhcyBudWxsLCBkaWQgb3duIG93biBlbGVtZW50IGdldCBkZWxldGVkP1wiKTtcbiAgICAgICAgc2V0X3Byb3BlcnR5KG5hbWUsIHRhcmdldC5jaGVja2VkKTtcbiAgICB9KTtcbn1cbjtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIHR5cGVzY3JpcHQgZ2x1ZSBjb2RlLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgbG9nZ2VyXzEgPSByZXF1aXJlKFwiLi9sb2dnZXJcIik7XG5jb25zdCBzZXR1cF9zbGlkZXJzXzEgPSByZXF1aXJlKFwiLi9zZXR1cF9zbGlkZXJzXCIpO1xuY29uc3QgSU5fREVWX01PREUgPSAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09IFwibG9jYWxob3N0XCIpO1xuO1xuO1xuLy8gTk9URSB3ZSBrZWVwIHRoZSBAdHMtaWdub3JlJ3MgaW4gaGVyZVxuYXN5bmMgZnVuY3Rpb24gR2V0R29GdW5jdGlvbnMoKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNvbnN0IGdvID0gbmV3IEdvKCk7IC8vIE5PVEUgdGhpcyBjb21lcyBmcm9tIHRoZSB3YXNtX2V4ZWMuanMgdGhpbmdcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhmZXRjaChcImRpc3QvYm9pZC53YXNtXCIpLCBnby5pbXBvcnRPYmplY3QpO1xuICAgIGdvLnJ1bihyZXN1bHQuaW5zdGFuY2UpO1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgU2V0UHJvcGVydGllczogU2V0UHJvcGVydGllcyxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBHZXRQcm9wZXJ0aWVzOiBHZXRQcm9wZXJ0aWVzLFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEdldE5leHRGcmFtZTogR2V0TmV4dEZyYW1lLFxuICAgIH07XG59XG47XG47XG5jb25zdCBOVU1fQ09MT1JfQ09NUE9ORU5UUyA9IDQ7XG5jb25zdCBTUVVJU0hfRkFDVE9SID0gMTtcbjtcbjtcbjtcbmNvbnN0IG1vdXNlID0ge1xuICAgIHBvczogeyB4OiAwLCB5OiAwIH0sXG4gICAgbGVmdF9kb3duOiBmYWxzZSxcbiAgICBtaWRkbGVfZG93bjogZmFsc2UsXG4gICAgcmlnaHRfZG93bjogZmFsc2UsXG59O1xuZnVuY3Rpb24gZG9tX3JlY3RfdG9fcmVjdChkb21fcmVjdCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IGRvbV9yZWN0LngsXG4gICAgICAgIHk6IGRvbV9yZWN0LnksXG4gICAgICAgIHdpZHRoOiBkb21fcmVjdC53aWR0aCxcbiAgICAgICAgLy8gdG8gYWNjb3VudCBmb3IgbGV0dGVycyBsaWtlIGpcbiAgICAgICAgaGVpZ2h0OiBkb21fcmVjdC5oZWlnaHQgKyA1LFxuICAgIH07XG59XG47XG5mdW5jdGlvbiBnZXRfYWxsX2NvbGxpZGVfYWJsZV9yZWN0cygpIHtcbiAgICBjb25zdCBDTEFTUyA9IFwiY29sbGlkZVwiO1xuICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShDTEFTUyk7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICAgIGNvbnN0IGRvbV9yZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgcmVzdWx0LnB1c2goZG9tX3JlY3RfdG9fcmVjdChkb21fcmVjdCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuO1xuZnVuY3Rpb24gcmVuZGVyQm9pZHMoZGlzcGxheSwgZ28pIHtcbiAgICBjb25zdCByZWN0cyA9IGdldF9hbGxfY29sbGlkZV9hYmxlX3JlY3RzKCk7XG4gICAgY29uc3Qgd2lkdGggPSBNYXRoLmZsb29yKGRpc3BsYXkuY3R4LmNhbnZhcy53aWR0aCAvIFNRVUlTSF9GQUNUT1IpO1xuICAgIGNvbnN0IGhlaWdodCA9IE1hdGguZmxvb3IoZGlzcGxheS5jdHguY2FudmFzLmhlaWdodCAvIFNRVUlTSF9GQUNUT1IpO1xuICAgIGNvbnN0IGJ1ZmZlcl9zaXplID0gd2lkdGggKiBoZWlnaHQgKiBOVU1fQ09MT1JfQ09NUE9ORU5UUztcbiAgICBpZiAoZGlzcGxheS5iYWNrSW1hZ2VXaWR0aCAhPT0gd2lkdGggfHwgZGlzcGxheS5iYWNrSW1hZ2VIZWlnaHQgIT09IGhlaWdodCkge1xuICAgICAgICAoMCwgbG9nZ2VyXzEubG9nKShsb2dnZXJfMS5Mb2dfVHlwZS5HZW5lcmFsLCBcIk9oIGdvZC4gd2VyZSByZXNpemluZyB0aGUgYnVmZmVyXCIpO1xuICAgICAgICBpZiAoZGlzcGxheS5iYWNrQnVmZmVyQXJyYXkubGVuZ3RoIDwgYnVmZmVyX3NpemUpIHtcbiAgICAgICAgICAgICgwLCBsb2dnZXJfMS5sb2cpKGxvZ2dlcl8xLkxvZ19UeXBlLkdlbmVyYWwsIFwiSXRzIGdldHRpbmcgYmlnZ2VyXCIpOyAvLyBteSBwZW5pc1xuICAgICAgICAgICAgLy8gbWFrZSB0aGUgYnVmZmVyIGJpZ2dlclxuICAgICAgICAgICAgZGlzcGxheS5iYWNrQnVmZmVyQXJyYXkgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkoYnVmZmVyX3NpemUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJhY2tDYW52YXMgPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICBjb25zdCBiYWNrQ3R4ID0gYmFja0NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICAgIGlmIChiYWNrQ3R4ID09PSBudWxsKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICBkaXNwbGF5LmJhY2tDdHggPSBiYWNrQ3R4O1xuICAgICAgICBkaXNwbGF5LmJhY2tDdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGRpc3BsYXkuYmFja0ltYWdlV2lkdGggPSB3aWR0aDtcbiAgICAgICAgZGlzcGxheS5iYWNrSW1hZ2VIZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICAgIGNvbnN0IGJ1ZmZlciA9IGRpc3BsYXkuYmFja0J1ZmZlckFycmF5LnN1YmFycmF5KDAsIGJ1ZmZlcl9zaXplKTtcbiAgICBjb25zdCBhcmdzID0ge1xuICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICBidWZmZXI6IGJ1ZmZlcixcbiAgICAgICAgbW91c2U6IG1vdXNlLFxuICAgICAgICByZWN0czogcmVjdHMsXG4gICAgfTtcbiAgICBjb25zdCBudW1GaWxsZWQgPSBnby5HZXROZXh0RnJhbWUoYXJncyk7XG4gICAgaWYgKG51bUZpbGxlZCAhPT0gYnVmZmVyX3NpemUpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgR2V0TmV4dEZyYW1lIGdvdCAke251bUZpbGxlZH1gKTtcbiAgICAvLyBAdHMtaWdub3JlIC8vIHdoeSBkb3NlIHRoaXMgbGluZSBtYWtlIGFuIGVycm9yIGluIG15IGVkaXRvclxuICAgIGNvbnN0IGltYWdlRGF0YSA9IG5ldyBJbWFnZURhdGEoYnVmZmVyLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAvLyBpcyB0aGlzIGNvb2w/XG4gICAgZGlzcGxheS5iYWNrQ3R4LnB1dEltYWdlRGF0YShpbWFnZURhdGEsIDAsIDApO1xuICAgIC8vIE5PVEUgdGhpcyB3aWxsIHN0cmV0Y2ggdGhlIHRoaW5nLlxuICAgIC8vIGNhbnZhcy53aWR0aCBtaWdodCBjaGFuZ2UgZHVyaW5nIHRoZSB0aW1lIHRoaXMgaXMgcnVubmluZ1xuICAgIGRpc3BsYXkuY3R4LmRyYXdJbWFnZShkaXNwbGF5LmJhY2tDdHguY2FudmFzLCAwLCAwLCBkaXNwbGF5LmN0eC5jYW52YXMud2lkdGgsIGRpc3BsYXkuY3R4LmNhbnZhcy5oZWlnaHQpO1xuICAgIC8vIGltYWdlRGF0YSA9IG51bGxcbn1cbjtcbmNvbnN0IHJlbmRlclRpbWVzID0gW107XG5jb25zdCBkZWx0YVRpbWVzID0gW107XG4vLyBDcmVkaXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS90c29kaW5nL2tvaWxcbmZ1bmN0aW9uIHJlbmRlckRlYnVnSW5mbyhkaXNwbGF5LCByZW5kZXJUaW1lLCBkZWx0YVRpbWUpIHtcbiAgICBjb25zdCBGT05UX1NJWkUgPSAyODtcbiAgICBkaXNwbGF5LmN0eC5mb250ID0gYCR7Rk9OVF9TSVpFfXB4IGJvbGRgO1xuICAgIGNvbnN0IGxhYmVscyA9IFtdO1xuICAgIHJlbmRlclRpbWVzLnB1c2gocmVuZGVyVGltZSk7XG4gICAgaWYgKHJlbmRlclRpbWVzLmxlbmd0aCA+IDYwKSB7XG4gICAgICAgIHJlbmRlclRpbWVzLnNoaWZ0KCk7XG4gICAgfVxuICAgIGRlbHRhVGltZXMucHVzaChkZWx0YVRpbWUpO1xuICAgIGlmIChkZWx0YVRpbWVzLmxlbmd0aCA+IDYwKSB7XG4gICAgICAgIGRlbHRhVGltZXMuc2hpZnQoKTtcbiAgICB9XG4gICAgY29uc3QgcmVuZGVyQXZnID0gcmVuZGVyVGltZXMucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCkgLyByZW5kZXJUaW1lcy5sZW5ndGg7XG4gICAgY29uc3QgZGVsdGFBdmcgPSBkZWx0YVRpbWVzLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8gZGVsdGFUaW1lcy5sZW5ndGg7XG4gICAgY29uc3QgZnJhbWVzX3Blcl9zZWNvbmQgPSAoMSAvIGRlbHRhQXZnICogMTAwMCkudG9GaXhlZCgyKTtcbiAgICBjb25zdCBzZWNvbmRzX3Blcl9mcmFtZSA9IChkZWx0YUF2ZyAvIDEwMDApLnRvRml4ZWQoNSk7XG4gICAgbGFiZWxzLnB1c2goYEYvUzogJHtmcmFtZXNfcGVyX3NlY29uZH0gICAgUy9GOiAke3NlY29uZHNfcGVyX2ZyYW1lfWApO1xuICAgIGxhYmVscy5wdXNoKGBXQVNNIFJlbmRlciBUaW1lIEF2ZyAobXMpOiAke3JlbmRlckF2Zy50b0ZpeGVkKDIpfWApO1xuICAgIGxhYmVscy5wdXNoKGBSZW5kZXIvU2VjIChNQVgpOiAkeygxIC8gcmVuZGVyQXZnICogMTAwMCkudG9GaXhlZCgyKX1gKTtcbiAgICBjb25zdCBQQURESU5HID0gNzA7XG4gICAgY29uc3QgU0hBRE9XX09GRlNFVCA9IEZPTlRfU0laRSAqIDAuMDY7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYWJlbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGlzcGxheS5jdHguZmlsbFN0eWxlID0gXCJibGFja1wiO1xuICAgICAgICBkaXNwbGF5LmN0eC5maWxsVGV4dChsYWJlbHNbaV0sIFBBRERJTkcsIFBBRERJTkcgKyBGT05UX1NJWkUgKiBpKTtcbiAgICAgICAgZGlzcGxheS5jdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgICBkaXNwbGF5LmN0eC5maWxsVGV4dChsYWJlbHNbaV0sIFBBRERJTkcgKyBTSEFET1dfT0ZGU0VULCBQQURESU5HIC0gU0hBRE9XX09GRlNFVCArIEZPTlRfU0laRSAqIGkpO1xuICAgIH1cbn1cbjtcbihhc3luYyAoKSA9PiB7XG4gICAgaWYgKElOX0RFVl9NT0RFKVxuICAgICAgICBjb25zb2xlLmxvZyhcIkluIERldiBNb2RlXCIpO1xuICAgIGNvbnN0IGdvID0gYXdhaXQgR2V0R29GdW5jdGlvbnMoKTtcbiAgICB7IC8vIEhhbmRsZSBzbGlkZXIgc3R1ZmZcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5lbnRyaWVzKGdvLkdldFByb3BlcnRpZXMoKSk7XG4gICAgICAgIGZ1bmN0aW9uIHNldF9wcm9wZXJ0eShuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTI3MTA5MDUvaG93LWRvLWktZHluYW1pY2FsbHktYXNzaWduLXByb3BlcnRpZXMtdG8tYW4tb2JqZWN0LWluLXR5cGVzY3JpcHRcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IHt9O1xuICAgICAgICAgICAgb2JqW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICBnby5TZXRQcm9wZXJ0aWVzKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgO1xuICAgICAgICAvLyBUT0RPIG1heWJlIG1ha2UgdGhpcyBkZXYgbW9kZSBvbmx5Li4uXG4gICAgICAgIC8vIGl0IGFsc28gaGFzIHRvIHJlbW92ZSB0aGUgU2V0dGluZ3MgdGhpbmcuLi5cbiAgICAgICAgKDAsIHNldHVwX3NsaWRlcnNfMS5zZXR1cF9zbGlkZXJzKShwcm9wZXJ0aWVzLCBzZXRfcHJvcGVydHkpO1xuICAgIH1cbiAgICB7IC8vIHNldHVwIGlucHV0IGhhbmRsaW5nLlxuICAgICAgICAvLyB3aHkgZG9lc24ndCB0eXBlc2NyaXB0IGhhdmUgYW4gZW51bSBmb3IgdGhpcz9cbiAgICAgICAgbGV0IG1vdXNlX2J1dHRvbnM7XG4gICAgICAgIChmdW5jdGlvbiAobW91c2VfYnV0dG9ucykge1xuICAgICAgICAgICAgbW91c2VfYnV0dG9uc1ttb3VzZV9idXR0b25zW1wiTU9VU0VfTEVGVFwiXSA9IDBdID0gXCJNT1VTRV9MRUZUXCI7XG4gICAgICAgICAgICBtb3VzZV9idXR0b25zW21vdXNlX2J1dHRvbnNbXCJNT1VTRV9NSURETEVcIl0gPSAxXSA9IFwiTU9VU0VfTUlERExFXCI7XG4gICAgICAgICAgICBtb3VzZV9idXR0b25zW21vdXNlX2J1dHRvbnNbXCJNT1VTRV9SSUdIVFwiXSA9IDJdID0gXCJNT1VTRV9SSUdIVFwiO1xuICAgICAgICB9KShtb3VzZV9idXR0b25zIHx8IChtb3VzZV9idXR0b25zID0ge30pKTtcbiAgICAgICAgO1xuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQuZ2V0Um9vdE5vZGUoKTtcbiAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXYpID0+IHtcbiAgICAgICAgICAgIG1vdXNlLnBvcyA9IHsgeDogZXYueCwgeTogZXYueSB9O1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gdGhpcyB3aWxsIGJyZWFrIGlmIHRoZSB1c2VyIHNsaWRlcyB0aGVyZSBtb3VzZSBvdXRzaWRlIG9mIHRoZSBzY3JlZW4gd2hpbGUgY2xpY2tpbmcsIGJ1dCB0aGlzIGlzIHRoZSB3ZWIsIHBlb3BsZSBleHBlY3QgaXQgdG8gc3Vjay5cbiAgICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZXYpID0+IHtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gbW91c2VfYnV0dG9ucy5NT1VTRV9MRUZUKVxuICAgICAgICAgICAgICAgIG1vdXNlLmxlZnRfZG93biA9IHRydWU7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IG1vdXNlX2J1dHRvbnMuTU9VU0VfTUlERExFKVxuICAgICAgICAgICAgICAgIG1vdXNlLm1pZGRsZV9kb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChldi5idXR0b24gPT0gbW91c2VfYnV0dG9ucy5NT1VTRV9SSUdIVClcbiAgICAgICAgICAgICAgICBtb3VzZS5yaWdodF9kb3duID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChldikgPT4ge1xuICAgICAgICAgICAgaWYgKGV2LmJ1dHRvbiA9PSBtb3VzZV9idXR0b25zLk1PVVNFX0xFRlQpXG4gICAgICAgICAgICAgICAgbW91c2UubGVmdF9kb3duID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IG1vdXNlX2J1dHRvbnMuTU9VU0VfTUlERExFKVxuICAgICAgICAgICAgICAgIG1vdXNlLm1pZGRsZV9kb3duID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoZXYuYnV0dG9uID09IG1vdXNlX2J1dHRvbnMuTU9VU0VfUklHSFQpXG4gICAgICAgICAgICAgICAgbW91c2UucmlnaHRfZG93biA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gVE9ETyBuYW1pbmcgYmV0dGVyLCB1c2Ugc25ha2UgY2FzZSBldmVyeXdoZXJlISFcbiAgICAvLyBUT0RPIG5hbWluZyBiZXR0ZXIsIHVzZSBzbmFrZSBjYXNlIGV2ZXJ5d2hlcmUhIVxuICAgIC8vIFRPRE8gbmFtaW5nIGJldHRlciwgdXNlIHNuYWtlIGNhc2UgZXZlcnl3aGVyZSEhXG4gICAgLy8gVE9ETyBuYW1pbmcgYmV0dGVyLCB1c2Ugc25ha2UgY2FzZSBldmVyeXdoZXJlISFcbiAgICAvLyBUT0RPIG5hbWluZyBiZXR0ZXIsIHVzZSBzbmFrZSBjYXNlIGV2ZXJ5d2hlcmUhIVxuICAgIC8vIGNvbnN0IGNhbnZhc19jb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc19kaXZcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQgfCBudWxsXG4gICAgY29uc3QgYm9pZENhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm9pZF9jYW52YXNcIik7XG4gICAgaWYgKGJvaWRDYW52YXMgPT09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGNhbnZhcyB3aXRoIGlkIGBib2lkX2NhbnZhc2AgaXMgZm91bmRcIik7XG4gICAgY29uc3QgY3R4ID0gYm9pZENhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgaWYgKGN0eCA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICBjb25zdCBbYmFja0ltYWdlV2lkdGgsIGJhY2tJbWFnZUhlaWdodF0gPSBbY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHRdO1xuICAgIGNvbnN0IGJhY2tDYW52YXMgPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKGJhY2tJbWFnZVdpZHRoLCBiYWNrSW1hZ2VIZWlnaHQpO1xuICAgIGNvbnN0IGJhY2tDdHggPSBiYWNrQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICBpZiAoYmFja0N0eCA9PT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiMkQgY29udGV4dCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgIGJhY2tDdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgY29uc3QgYmFja0J1ZmZlckFycmF5ID0gbmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGJhY2tJbWFnZVdpZHRoICogYmFja0ltYWdlSGVpZ2h0ICogNCk7XG4gICAgY29uc3QgZGlzcGxheSA9IHtcbiAgICAgICAgY3R4LFxuICAgICAgICBiYWNrQ3R4LFxuICAgICAgICBiYWNrQnVmZmVyQXJyYXksXG4gICAgICAgIGJhY2tJbWFnZVdpZHRoLFxuICAgICAgICBiYWNrSW1hZ2VIZWlnaHQsXG4gICAgfTtcbiAgICBsZXQgcHJldlRpbWVzdGFtcCA9IDA7XG4gICAgY29uc3QgZnJhbWUgPSAodGltZXN0YW1wKSA9PiB7XG4gICAgICAgIGN0eC5jYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIGNvbnN0IGRlbHRhVGltZSA9ICh0aW1lc3RhbXAgLSBwcmV2VGltZXN0YW1wKTtcbiAgICAgICAgcHJldlRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICAgICAgLy8gVE9ETyBEb24ndCBuZWVkIGRlbHRhIHRpbWUsIGJvaWQgdGhpbmcgZG9zZSBpdCBmb3IgdXM/IGNoYW5nZT9cbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHJlbmRlckJvaWRzKGRpc3BsYXksIGdvKTtcbiAgICAgICAgY29uc3QgZW5kVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAvLyBJbiBtc1xuICAgICAgICBjb25zdCByZW5kZXJUaW1lID0gZW5kVGltZSAtIHN0YXJ0VGltZTtcbiAgICAgICAgaWYgKGxvZ2dlcl8xLkRFQlVHX0RJU1BMQVkgJiYgSU5fREVWX01PREUpXG4gICAgICAgICAgICByZW5kZXJEZWJ1Z0luZm8oZGlzcGxheSwgcmVuZGVyVGltZSwgZGVsdGFUaW1lKTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gICAgfTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCh0aW1lc3RhbXApID0+IHtcbiAgICAgICAgcHJldlRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gICAgfSk7XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9