
import { Log_Type, log } from "./logger";

const DEFAULT_CATEGORY = "Misc";

class Property_Struct {
    property_name:      string = "";

    property_data_type: Property_Data_Type = Property_Data_Type.None;

    // Float properties
    float_range_min:    number = 0;
    float_range_max:    number = 0;
    float_default:      number = 0;

    // Int properties
    int_range_min:      number = 0;
    int_range_max:      number = 0;
    int_default:        number = 0;

    // Bool properties
    bool_default:       boolean = false;

    // for nice property visualization.
    category:           string = DEFAULT_CATEGORY;

    // TODO got some type checking for these guys, i kinda wish typescript had inline structs.
    __as_float_value: number  = 0;
    __as_int_value:   number  = 0;
    __as_bool_value:  boolean = false;

    as_bool(): boolean {
        if (this.property_data_type != Property_Data_Type.Property_Data_Bool) {
            throw new Error(`Tried to get property '${this.property_name}' as a bool but it is not a bool!`);
        }
        return this.__as_bool_value;
    };

    as_int(): number {
        if (this.property_data_type != Property_Data_Type.Property_Data_Int) {
            throw new Error(`Tried to get property '${this.property_name}' as an int but it is not an int!`);
        }
        return this.__as_int_value;
    };

    as_float(): number {
        if (this.property_data_type != Property_Data_Type.Property_Data_Float) {
            throw new Error(`Tried to get property '${this.property_name}' as a float but it is not a float!`);
        }
        return this.__as_float_value;
    };
};


const enum Property_Data_Type {
    None,
    Property_Data_Float,
    Property_Data_Int,
    Property_Data_Bool,
};

// lets the whole program interact with the properties, 
let __Global_Property_Structs: Property_Struct[] | null = null;

export function get_property_structs(): Property_Struct[] {
    if (__Global_Property_Structs === null) throw new Error("Global_Property_Structs was null in get_property_structs, did you forget to call setup_sliders?");
    return __Global_Property_Structs;
}

export function get_property_struct_by_name(name: string): Property_Struct {
    const property_structs = get_property_structs();

    for (const property_struct of property_structs) {
        if (property_struct.property_name === name) {
            return property_struct;
        }
    }

    throw new Error(`Could not find property struct with name '${name}'`);
}

export function setup_global_properties(properties: [string, string][]) {
    properties.sort(); // hope someone else wasn't using this.

    __Global_Property_Structs = [];
    // const property_structs: Property_Struct[] = [];

    for (const [name, tag] of properties) {

        log(Log_Type.Debug_Sliders, `typescript: ${name}: ${tag}`);

        // TODO this function is growing to big, put it in a separate file.

        const tag_split = (tag as string).split(" ");

        const [prop_property, property_data_type] = tag_prop_to_parts(tag_split[0]);
        if (prop_property != "Property")    throw new Error(`First property is not property, tag was ${tag}`);

        const property_struct = new Property_Struct();
        property_struct.property_name = name;

        if (property_struct.category != DEFAULT_CATEGORY)    throw new Error(`in ${name}, property_struct.category was set to ${property_struct.category} but it should be ${DEFAULT_CATEGORY} at this point`);

        switch (property_data_type) {
        case "float": { property_struct.property_data_type = Property_Data_Type.Property_Data_Float; } break;
        case "int":   { property_struct.property_data_type = Property_Data_Type.Property_Data_Int;   } break;
        case "bool":  { property_struct.property_data_type = Property_Data_Type.Property_Data_Bool;  } break;

        default: { throw new Error(`in ${name}, Unknown property data type ${property_data_type}`); }
        }

        tag_split.shift();


        while (tag_split.length > 0) {
            const [left, right] = tag_prop_to_parts(tag_split.shift()!);

            switch (left) {
            case "Range": {
                switch (property_struct.property_data_type) {
                case Property_Data_Type.Property_Data_Float: {
                    const [min_as_string, max_as_string] = right.split(";");
                    property_struct.float_range_min = parseFloat(min_as_string);
                    property_struct.float_range_max = parseFloat(max_as_string);
                } break;

                case Property_Data_Type.Property_Data_Int: {
                    const [min_as_string, max_as_string] = right.split(";");
                    property_struct.int_range_min = parseInt(min_as_string);
                    property_struct.int_range_max = parseInt(max_as_string);
                } break;

                case Property_Data_Type.Property_Data_Bool: { throw new Error("Boolean dose not have a range!"); }

                default: { throw new Error(`Unknown data type in ${name}`); }
                }
            } break;

            case "Default": {
                switch (property_struct.property_data_type) {
                    case Property_Data_Type.Property_Data_Float: { property_struct.float_default = parseFloat(right); } break;
                    case Property_Data_Type.Property_Data_Int  : { property_struct.int_default   = parseInt  (right); } break;
                    case Property_Data_Type.Property_Data_Bool : { property_struct.bool_default  = parse_bool(right); } break;

                    default: { throw new Error(`Unknown data type in ${name}`); }
                }

            } break;

            case "Category": {
                property_struct.category = right;
            } break;

            default: { throw new Error(`in ${name}, found unknown property '${left}'`); }
            }
        }

        __Global_Property_Structs.push(property_struct);
    }
};



// puts some sliders up to control some parameters
export function setup_sliders(set_property: (name:string, value:number|boolean) => void) {
    const property_structs = get_property_structs();

    const SLIDER_CONTAINER_ID = "slideContainer"
    const slider_container = document.getElementById(SLIDER_CONTAINER_ID);
    if (slider_container === null)    throw new Error("Cannot Get slider container");

    // TODO for the slides that have a small range (like cohesion factor) make the value the square of the number.


    // Group property_structs by category for collapsible rendering
    const category_map = new Map<string, Property_Struct[]>();
    for (const ps of property_structs) {
        const category = ps.category || DEFAULT_CATEGORY;

        if (!category_map.has(category)) category_map.set(category, []);
        category_map.get(category)!.push(ps);
    }

    // Sort categories alphabetically, but place the DEFAULT_CATEGORY last
    const categories = Array.from(category_map.keys()).sort((a,b) => {
        if (a === DEFAULT_CATEGORY) return +1;
        if (b === DEFAULT_CATEGORY) return -1;
        return a.localeCompare(b);
    });

    for (const category of categories) {
        const items = category_map.get(category)!;

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
};


function make_slider(slider_container: HTMLElement, property_struct: Property_Struct, set_property: (name:string, value:number|boolean) => void) {
    const slider_id  = `slider_${property_struct.property_name}`;
    const label_text = property_struct.property_name.replace(/_/g, " ");

    switch (property_struct.property_data_type) {
        case Property_Data_Type.Property_Data_Bool: {
            const html_string = `
                <label for="${slider_id}" class="checkbox_toggle_label">${label_text}</label>
                <input  id="${slider_id}" type="checkbox" ${property_struct.bool_default ? "checked" : ""} class="checkbox_toggle">
            `;

            const wrapper = document.createElement("div");
            wrapper.className = "rangeHolder";
            wrapper.innerHTML = html_string;
            slider_container.appendChild(wrapper);

            const slider_element = wrapper.querySelector('input') as HTMLInputElement | null;
            if (slider_element === null) throw new Error(`Could not find checkbox input for id='${slider_id}' inside its container`);

            if (slider_element.id != slider_id) throw new Error(`Found slider with id='${slider_element.id}' but expected id='${slider_id}'`);

            slider_element.addEventListener("input", (event) => {
                const the_slider = event.target as HTMLInputElement | null;
                if (the_slider === null)    throw new Error(`Checkbox input for '${property_struct.property_name}' disappeared unexpectedly`);

                property_struct.__as_bool_value = the_slider.checked;
                set_property(property_struct.property_name, the_slider.checked);
            });
        } break;

        case Property_Data_Type.Property_Data_Float:
        case Property_Data_Type.Property_Data_Int: {
            const is_float_slider = property_struct.property_data_type === Property_Data_Type.Property_Data_Float;

            const min_value     = is_float_slider ? property_struct.float_range_min : property_struct.int_range_min;
            const max_value     = is_float_slider ? property_struct.float_range_max : property_struct.int_range_max;
            const default_value = is_float_slider ? property_struct.float_default   : property_struct.int_default;

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

            const slider_element = wrapper.querySelector('input') as HTMLInputElement | null;
            if (slider_element === null)    throw new Error(`Could not find input for slider id='${slider_id}' inside its container`);

            if (slider_element.id != slider_id) throw new Error(`Found slider with id='${slider_element.id}' but expected id='${slider_id}'`);

            slider_element.addEventListener("input", (event) => {
                const the_slider = event.target as HTMLInputElement | null
                if (the_slider === null)    throw new Error(`Slider input for '${property_struct.property_name}' disappeared unexpectedly`)

                const slider_number = is_float_slider ? parseFloat(the_slider.value) : parseInt(the_slider.value);

                const slider_text = wrapper.querySelector(`#${paragraph_id}`) as HTMLParagraphElement | null;
                if (slider_text === null)    throw new Error(`Could not find label paragraph '${paragraph_id}' for slider '${slider_id}'`);

                slider_text.textContent = `${label_text}: ${slider_number}`;

                // i don't need to check here, either works.
                property_struct.__as_float_value = slider_number;
                property_struct.__as_int_value   = slider_number;
                set_property(property_struct.property_name, slider_number);
            });
        } break;

        default: { throw new Error(`in ${property_struct.property_name}, found unknown property type ${property_struct.property_data_type}`); }
    }
}



////////////////////////////////////
//         Helper functions
////////////////////////////////////

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


