
import { get_property_structs, Property_Struct, Property_Data_Type, DEFAULT_PROPERTY_CATEGORY } from "./properties.js";


// puts some sliders up to control some parameters
export function setup_sliders() {
    const property_structs = get_property_structs();

    const SLIDER_CONTAINER_ID = "slideContainer"
    const slider_container = document.getElementById(SLIDER_CONTAINER_ID);
    if (slider_container === null)    throw new Error("Cannot Get slider container");

    // TODO for the slides that have a small range (like cohesion factor) make the value the square of the number.


    // Group property_structs by category for collapsible rendering
    const category_map = new Map<string, Property_Struct[]>();
    for (const ps of property_structs) {
        const category = ps.category || DEFAULT_PROPERTY_CATEGORY;

        if (!category_map.has(category)) category_map.set(category, []);
        category_map.get(category)!.push(ps);
    }

    // Sort categories alphabetically, but place the DEFAULT_CATEGORY last
    const categories = Array.from(category_map.keys()).sort((a,b) => {
        if (a === DEFAULT_PROPERTY_CATEGORY) return +1;
        if (b === DEFAULT_PROPERTY_CATEGORY) return -1;
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
            make_slider(body, property_struct);
        }

        details.appendChild(body);
        slider_container.appendChild(details);
    }
};


function make_slider(slider_container: HTMLElement, property_struct: Property_Struct) {
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

                property_struct.set_bool(the_slider.checked);
                // property_struct.__as_bool_value = the_slider.checked;
                // set_property(property_struct.property_name, the_slider.checked);
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

                if (is_float_slider) {
                    property_struct.set_float(slider_number);
                } else {
                    property_struct.set_int(slider_number);
                }
            });
        } break;

        default: { throw new Error(`in ${property_struct.property_name}, found unknown property type ${property_struct.property_data_type}`); }
    }
}
