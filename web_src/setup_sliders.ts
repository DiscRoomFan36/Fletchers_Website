
import { Log_Type, log } from "./logger";

const DEFAULT_CATEGORY = "None";

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
};

enum Property_Data_Type {
    None,
    Property_Data_Float,
    Property_Data_Int,
    Property_Data_Bool,
};



// puts some sliders up to control some parameters
export function setup_sliders(properties: [string, string][], set_property: (name:string, value:number|boolean) => void) {

    const SLIDER_CONTAINER_ID = "slideContainer"
    const slider_container = document.getElementById(SLIDER_CONTAINER_ID);
    if (slider_container === null)    throw new Error("Cannot Get slider container");

    // TODO for the slides that have a small range (like cohesion factor) make the value the square of the number.

    properties.sort(); // hope someone else wasn't using this.

    const property_structs: Property_Struct[] = [];

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

        property_structs.push(property_struct);
    }

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
            switch (property_struct.property_data_type) {
            case Property_Data_Type.Property_Data_Float : { make_float_slider(body, property_struct, set_property); } break;
            case Property_Data_Type.Property_Data_Int   : { make_int_slider  (body, property_struct, set_property); } break;
            case Property_Data_Type.Property_Data_Bool  : { make_bool_slider (body, property_struct, set_property); } break;
            default: { throw new Error(`in ${property_struct.property_name}, found unknown property type ${property_struct.property_data_type}`); }
            }
        }

        details.appendChild(body);
        slider_container.appendChild(details);
    }
};



///////////////////////////////////////////////
//         Make a slider for a float
///////////////////////////////////////////////

function make_float_slider(slider_container: HTMLElement, property_struct: Property_Struct, set_property: (name:string, value:number|boolean) => void) {
    const slider_id      = `slider_${property_struct.property_name}`;
    const paragraph_id   = `${slider_id}_paragraph`;
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

    const slider = new_element.querySelector('input') as HTMLInputElement | null;
    if (slider === null)    throw new Error(`Could not find input for slider id='${slider_id}' inside its container`);

    if (slider.id != slider_id) throw new Error(`Found slider with id='${slider.id}' but expected id='${slider_id}'`);

    slider.addEventListener("input", (event) => {
        const the_slider = event.target as HTMLInputElement | null
        if (the_slider === null)    throw new Error(`Slider input for '${property_struct.property_name}' disappeared unexpectedly`)

        const slider_number = Number(the_slider.value);

        const slider_text = new_element.querySelector(`#${paragraph_id}`) as HTMLParagraphElement | null;
        if (slider_text === null)    throw new Error(`Could not find label paragraph '${paragraph_id}' for slider '${slider_id}'`);

        slider_text.textContent = `${paragraph_text}: ${slider_number}`;

        set_property(property_struct.property_name, slider_number);
    });
};


///////////////////////////////////////////////
//          Make a slider for an int
///////////////////////////////////////////////

function make_int_slider(slider_container: HTMLElement, property_struct: Property_Struct, set_property: (name:string, value:number|boolean) => void) {
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

    const slider = new_thing.querySelector('input') as HTMLInputElement | null;
    if (slider === null)    throw new Error(`Could not find input for slider id='${slider_id}' inside its container`);

    if (slider.id != slider_id) throw new Error(`Found slider with id='${slider.id}' but expected id='${slider_id}'`);

    slider.addEventListener("input", (event) => {
        const the_slider = event.target as HTMLInputElement | null
        if (the_slider === null)    throw new Error(`Slider input for '${property_struct.property_name}' disappeared unexpectedly`)

        const slider_number = Number(the_slider.value);

        const slider_text = new_thing.querySelector(`#${para_id}`) as HTMLParagraphElement | null;
        if (slider_text === null)    throw new Error(`Could not find label paragraph '${para_id}' for slider '${slider_id}'`);

        slider_text.textContent = `${paragraph_text}: ${slider_number}`;

        set_property(property_struct.property_name, slider_number);
    });
};


///////////////////////////////////////////////
//     Make a slider for an boolean toggle
///////////////////////////////////////////////

function make_bool_slider(slider_container: HTMLElement, property_struct: Property_Struct, set_property: (name:string, value:number|boolean) => void) {
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

    const slider = new_thing.querySelector('input') as HTMLInputElement | null;
    if (slider === null) throw new Error(`Could not find checkbox input for id='${slider_id}' inside its container`);

    if (slider.id != slider_id) throw new Error(`Found slider with id='${slider.id}' but expected id='${slider_id}'`);

    slider.addEventListener("input", (event) => {
        const the_slider = event.target as HTMLInputElement | null;
        if (the_slider === null)    throw new Error(`Checkbox input for '${property_struct.property_name}' disappeared unexpectedly`);

        set_property(property_struct.property_name, the_slider.checked);
    });
};




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


