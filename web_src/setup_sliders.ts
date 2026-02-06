
import { Log_Type, log } from "./logger";

enum Property_Type {
    None,
    Property_Float,
    Property_Int,
    Property_Bool,
};

class Property_Struct {
    property_type:   Property_Type = Property_Type.None;

    // Float properties
    float_range_min: number = 0;
    float_range_max: number = 0;
    float_default:   number = 0;

    // Int properties
    int_range_min:   number = 0;
    int_range_max:   number = 0;
    int_default:     number = 0;

    bool_default:    boolean = false;
};

function tag_prop_to_parts(prop: string): [string, string] {
    const [left, right_with_junk] = prop.split(":");
    const right = right_with_junk.slice(1, right_with_junk.length-1);
    return [left, right];
};

function parse_bool(s: string): boolean {
    // 1, t, T, TRUE, true, True,
    // 0, f, F, FALSE, false, False
    switch (s) {
    case "1":
    case "t": case "T":
    case "TRUE": case "true": case "True": {
        return true;
    }

    case "0":
    case "f": case "F":
    case "FALSE": case "false": case "False": {
        return false;
    }

    default: throw new Error(`Unknown string in parseBool, was ${s}`);
    }
};


// puts some sliders up to control some parameters
export function setup_sliders(properties: [string, string][], set_property: (name:string, value:number|boolean) => void) {

    const SLIDER_CONTAINER_ID = "slideContainer"
    const slider_container = document.getElementById(SLIDER_CONTAINER_ID);
    if (slider_container === null)    throw new Error("Cannot Get slider container");

    // TODO for the slides that have a small range (like cohesion factor) make the value the square of the number.

    properties.sort(); // hope someone else wasn't using this.

    for (const [name, tag] of properties) {

        log(Log_Type.Debug_Sliders, `typescript: ${name}: ${tag}`);

        // TODO this function is growing to big, put it in a separate file.

        const tag_split = (tag as string).split(" ");

        const [prop_property, prop_type] = tag_prop_to_parts(tag_split[0]);
        if (prop_property != "Property")    throw new Error(`First property is not property, tag was ${tag}`);

        const property_struct = new Property_Struct();

        switch (prop_type) {
        case "float": { property_struct.property_type = Property_Type.Property_Float; } break;
        case "int":   { property_struct.property_type = Property_Type.Property_Int;   } break;
        case "bool":  { property_struct.property_type = Property_Type.Property_Bool;  } break;

        default: throw new Error(`Unknown prop type ${prop_type}`);
        }

        tag_split.shift();


        while (tag_split.length > 0) {
            const [left, right] = tag_prop_to_parts(tag_split.shift()!);

            switch (left) {
            case "Range":
                switch (property_struct.property_type) {
                case Property_Type.Property_Float: {
                    const [min_as_string, max_as_string] = right.split(";");
                    property_struct.float_range_min = parseFloat(min_as_string);
                    property_struct.float_range_max = parseFloat(max_as_string);
                } break;

                case Property_Type.Property_Int: {
                    const [min_as_string, max_as_string] = right.split(";");
                    property_struct.int_range_min = parseInt(min_as_string);
                    property_struct.int_range_max = parseInt(max_as_string);
                } break;

                case Property_Type.Property_Bool: throw new Error("Boolean dose not have a range!");

                default: throw new Error(`Unknown type in ${name}`);
                }

                break;

            case "Default":
                switch (property_struct.property_type) {
                case Property_Type.Property_Float: { property_struct.float_default = parseFloat(right); } break;
                case Property_Type.Property_Int  : { property_struct.int_default   = parseInt  (right); } break;
                case Property_Type.Property_Bool : { property_struct.bool_default  = parse_bool(right); } break;

                default: throw new Error(`Unknown type in ${name}`);
                }

                break;

            default: throw new Error(`Unknown property ${left}`);
            }
        }

        // TODO some way to print an object.
        // log(Log_Type.Debug_Sliders, `property struct ${property_struct}`);

        switch (property_struct.property_type) {
        case Property_Type.Property_Float : { make_float_slider(slider_container, name, property_struct, set_property); } break;
        case Property_Type.Property_Int   : { make_int_slider  (slider_container, name, property_struct, set_property); } break;
        case Property_Type.Property_Bool  : { make_bool_slider (slider_container, name, property_struct, set_property); } break;

        default: throw new Error(`Unknown property type ${property_struct.property_type}`);
        }
    }
};


///////////////////////////////////////////////
//         Make a slider for an float
///////////////////////////////////////////////

function make_float_slider(slider_container: HTMLElement, name: string, property_struct: Property_Struct, set_property: (name:string, value:number|boolean) => void) {
    const slider_id      = `slider_${name}`;
    const paragraph_id   = `${slider_id}_paragraph`;
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

    const slider = document.getElementById(slider_id) as HTMLInputElement | null;
    if (slider === null)    throw new Error("Could not find the slider we just made...");


    slider.addEventListener("input", (event) => {
        const slider_value_string = (event.target as HTMLInputElement).value;

        const slider_number = Number(slider_value_string);

        const slider_text = document.getElementById(paragraph_id) as HTMLParagraphElement | null;
        if (slider_text === null)    throw new Error(`could not find slider_text ${paragraph_id}`);

        slider_text.textContent = `${paragraph_text}: ${slider_number}`;

        set_property(name, slider_number);
    });
};


///////////////////////////////////////////////
//          Make a slider for an int
///////////////////////////////////////////////

function make_int_slider(slider_container: HTMLElement, name: string, property_struct: Property_Struct, set_property: (name:string, value:number|boolean) => void) {
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

    const slider = document.getElementById(id) as HTMLInputElement | null;
    if (slider === null)    throw new Error("Could not find the slider");


    slider.addEventListener("input", (event) => {
        const slider_value_string = (event.target as HTMLInputElement).value;

        const slider_number = Number(slider_value_string);

        const slider_text = document.getElementById(para_id) as HTMLParagraphElement | null;
        if (slider_text === null)    throw new Error(`could not find slider_text ${para_id}`);

        slider_text.textContent = `${paragraph_text}: ${slider_number}`;

        set_property(name, slider_number);
    });
};


///////////////////////////////////////////////
//     Make a slider for an boolean toggle
///////////////////////////////////////////////

function make_bool_slider(slider_container: HTMLElement, name: string, property_struct: Property_Struct, set_property: (name:string, value:number|boolean) => void) {
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

    const slider = document.getElementById(id) as HTMLInputElement | null;
    if (slider === null) throw new Error("Could not find the slider");

    slider.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement | null;
        if (target === null) throw new Error("Target was null, did own own element get deleted?");

        set_property(name, target.checked);
    });
};
