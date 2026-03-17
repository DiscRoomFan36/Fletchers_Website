import { Log_Type, log } from "./logger";

export const DEFAULT_PROPERTY_CATEGORY = "Misc";

export const enum Property_Data_Type {
    None,
    Property_Data_Float,
    Property_Data_Int,
    Property_Data_Bool,
};

export class Property_Struct {
    readonly property_name:      string;

    readonly property_data_type: Property_Data_Type = Property_Data_Type.None;

    // Float properties
    readonly float_range_min:    number = 0;
    readonly float_range_max:    number = 0;
    readonly float_default:      number = 0;

    // Int properties
    readonly int_range_min:      number = 0;
    readonly int_range_max:      number = 0;
    readonly int_default:        number = 0;

    // Bool properties
    readonly bool_default:       boolean = false;

    // for nice property visualization.
    readonly category:           string = DEFAULT_PROPERTY_CATEGORY;

    // TODO got some type checking for these guys, i kinda wish typescript had inline structs.
    private __as_float_value: number  = 0;
    private __as_int_value:   number  = 0;
    private __as_bool_value:  boolean = false;

    // this links to the function that will set the property in the boid simulation.
    private setter_function: ((value: number | boolean) => void);


    ////////////////////////////////////////////
    //           Member functions
    ////////////////////////////////////////////

    constructor(name: string, tag: string, set_property_function: (name:string, value: number | boolean) => void) {
        this.property_name = name;
        this.setter_function = (value: number | boolean) => set_property_function(name, value);


        // TODO this function is growing to big, put it in a separate file.

        const tag_split = (tag as string).split(" ");

        const [prop_property, property_data_type] = tag_prop_to_parts(tag_split[0]);
        if (prop_property != "Property")    throw new Error(`First property is not property, tag was ${tag}`);

        // const property_struct = new Property_Struct(
        //     name,
        //     (value: number | boolean) => setter_function(name, value)
        // );

        if (this.category != DEFAULT_PROPERTY_CATEGORY)    throw new Error(`in ${name}, property_struct.category was set to ${this.category} but it should be ${DEFAULT_PROPERTY_CATEGORY} at this point`);

        switch (property_data_type) {
        case "float": { this.property_data_type = Property_Data_Type.Property_Data_Float; } break;
        case "int":   { this.property_data_type = Property_Data_Type.Property_Data_Int;   } break;
        case "bool":  { this.property_data_type = Property_Data_Type.Property_Data_Bool;  } break;

        default: { throw new Error(`in ${name}, Unknown property data type ${property_data_type}`); }
        }

        tag_split.shift();


        while (tag_split.length > 0) {
            const [left, right] = tag_prop_to_parts(tag_split.shift()!);

            switch (left) {
            case "Range": {
                switch (this.property_data_type) {
                case Property_Data_Type.Property_Data_Float: {
                    const [min_as_string, max_as_string] = right.split(";");
                    this.float_range_min = parseFloat(min_as_string);
                    this.float_range_max = parseFloat(max_as_string);
                } break;

                case Property_Data_Type.Property_Data_Int: {
                    const [min_as_string, max_as_string] = right.split(";");
                    this.int_range_min = parseInt(min_as_string);
                    this.int_range_max = parseInt(max_as_string);
                } break;

                case Property_Data_Type.Property_Data_Bool: { throw new Error("Boolean dose not have a range!"); }

                default: { throw new Error(`Unknown data type in ${name}`); }
                }
            } break;

            case "Default": {
                switch (this.property_data_type) {
                    case Property_Data_Type.Property_Data_Float: { this.float_default = parseFloat(right); } break;
                    case Property_Data_Type.Property_Data_Int  : { this.int_default   = parseInt  (right); } break;
                    case Property_Data_Type.Property_Data_Bool : { this.bool_default  = parse_bool(right); } break;

                    default: { throw new Error(`Unknown data type in ${name}`); }
                }

            } break;

            case "Category": {
                this.category = right;
            } break;

            default: { throw new Error(`in ${name}, found unknown property '${left}'`); }
            }
        }

    }


    /////////////////////////////////////////////////////////
    //                 Getters And Setters
    /////////////////////////////////////////////////////////

    get_bool(): boolean {
        if (this.property_data_type != Property_Data_Type.Property_Data_Bool) {
            throw new Error(`Tried to get property '${this.property_name}' as a bool but it is not a bool!`);
        }
        return this.__as_bool_value;
    };

    get_int(): number {
        if (this.property_data_type != Property_Data_Type.Property_Data_Int) {
            throw new Error(`Tried to get property '${this.property_name}' as an int but it is not an int!`);
        }
        return this.__as_int_value;
    };

    get_float(): number {
        if (this.property_data_type != Property_Data_Type.Property_Data_Float) {
            throw new Error(`Tried to get property '${this.property_name}' as a float but it is not a float!`);
        }
        return this.__as_float_value;
    };


    set_bool(value: boolean) {
        if (this.property_data_type != Property_Data_Type.Property_Data_Bool) {
            throw new Error(`Tried to set property '${this.property_name}' as a bool but it is not a bool!`);
        }
        this.__as_bool_value = value;
        this.setter_function(value);
    }

    set_int(value: number) {
        if (this.property_data_type != Property_Data_Type.Property_Data_Int) {
            throw new Error(`Tried to set property '${this.property_name}' as an int but it is not an int!`);
        }
        this.__as_int_value = value;
        this.setter_function(value);
    }

    set_float(value: number) {
        if (this.property_data_type != Property_Data_Type.Property_Data_Float) {
            throw new Error(`Tried to set property '${this.property_name}' as a float but it is not a float!`);
        }
        this.__as_float_value = value;
        this.setter_function(value);
    }
};

//
// call this first.
//
export function setup_global_properties(properties: [string, string][], set_property_function: (name:string, value:number|boolean) => void) {
    properties.sort(); // hope someone else wasn't using this.

    __Global_Property_Structs = [];

    for (const [name, tag] of properties) {
        log(Log_Type.Debug_Sliders, `typescript: ${name}: ${tag}`);

        const property_struct = new Property_Struct(
            name,
            tag,
            set_property_function,
        );

        __Global_Property_Structs.push(property_struct);
    }
};



// gets all property structs.
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



// lets the whole program interact with the properties,
let __Global_Property_Structs: Property_Struct[] | null = null;



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

