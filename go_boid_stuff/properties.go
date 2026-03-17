package main

import (
	"fmt"
	"log"
	"reflect"
	"strconv"
	"strings"
)

//
// Properties of the simulation.
//
// using tags and reflection to get and set fields, makes it controllable from javascript.
//
// TODO use struct's for categories, will decouple js
// and wasm property tags, might be worth it.
//
type Properties struct {
    // in rough order of when their used

    // regarding property tags.
    //
    // now, you might be thinking:
    //
    //     why do we need 'Property:"int"' when we have go's reflection?
    //
    // because javascript needs to know what property this variables have,
    // and it makes things a whole lot easier if we just send the tag
    // straight to javascript, so we may have to parse it twice, but we
    // can do the parsing the same way both times.

    Max_Boids          int `Property:"int" Range:"0;5000" Default:"1000" Category:"Boid_Spawning"`;
    // how many spawn / de-spawn per second.
    Boid_Spawn_Rate    Boid_Float `Property:"float" Range:"10;1000" Default:"100" Category:"Boid_Spawning"`;

    // for sep, align and coh
    Visual_Range            Boid_Float `Property:"float" Range:"1;25" Default:"15" Category:"Normal_Boid_Parameters"`;
    Separation_Min_Distance Boid_Float `Property:"float" Range:"0;20" Default:"8.5" Category:"Normal_Boid_Parameters"`;

    Separation_Factor Boid_Float `Property:"float" Range:"0;1" Default:"0.50" Category:"Normal_Boid_Parameters"`; // 0.15
    Alignment_Factor  Boid_Float `Property:"float" Range:"0;1" Default:"0.30" Category:"Normal_Boid_Parameters"`; // 0.15
    Cohesion_Factor   Boid_Float `Property:"float" Range:"0;1" Default:"0.15" Category:"Normal_Boid_Parameters"`; // 0.015

    Random_Draw_Factor        Boid_Float `Property:"float" Range:"0;10" Default:"2" Category:"Random_Draw"`;
    Random_Draw_Time_Dilation Boid_Float `Property:"float" Range:"1;10" Default:"2" Category:"Random_Draw"`;

    Center_Draw_Radius_Div Boid_Float `Property:"float" Range:"0;10" Default:"3" Category:"Center_Draw"`;
    Center_Draw_Factor     Boid_Float `Property:"float" Range:"0;10" Default:"1" Category:"Center_Draw"`;

    Wind_X_Factor Boid_Float `Property:"float" Range:"-10;10" Default:"0" Category:"Wind"`;
    Wind_Y_Factor Boid_Float `Property:"float" Range:"-10;10" Default:"0" Category:"Wind"`;

    Mouse_Draw_Factor Boid_Float `Property:"float" Range:"1;20" Default:"2"`;

    // Boid Vision
    Num_Boid_Rays         int        `Property:"int" Range:"1;10" Default:"5" Category:"Vision_Rays"`;
    // in degrees
    Visual_Cone_Angle     Boid_Float `Property:"float" Range:"0;360" Default:"140" Category:"Vision_Rays"`;
    // the boost the boid gets if it trys to hit a wall.
    Boid_Ray_Force_Factor Boid_Float `Property:"float" Range:"0;5" Default:"1" Category:"Vision_Rays"`;


    Final_Acceleration_Boost Boid_Float `Property:"float" Range:"1;25" Default:"10" Category:"Physics"`; // 5
    Final_Drag_Coefficient   Boid_Float `Property:"float" Range:"0;2" Default:"0.15" Category:"Physics"`; // 1


    Toggle_Wrapping bool `Property:"bool" Default:"true" Category:"Boundary_Behavior"`;
    Toggle_Bounding bool `Property:"bool" Default:"false" Category:"Boundary_Behavior"`;

    Margin             Boid_Float `Property:"float" Range:"0;100" Default:"50" Category:"Boundary_Behavior"`;
    Margin_Turn_Factor Boid_Float `Property:"float" Range:"0;20" Default:"4" Category:"Boundary_Behavior"`;

    // boid size for drawing and collision.
    Boid_Radius Boid_Float `Property:"float" Range:"0;10" Default:"2.5"`;


    Pathing_Force       Boid_Float `Property:"float" Range:"1;20" Default:"2" Category:"Pathing"`;
    // Variable names the Long way
    Pathing_How_Close_To_Switch_In_Proportion_To_Boid_Visual_Range Boid_Float `Property:"float" Range:"0.1;10" Default:"3" Category:"Pathing"`;


    // false for software rendering, true for js rendering.
    //
    // at this moment i would want an enum, but don't
    // wanna think about how js is going to parse that.
    Render_Method bool `Property:"bool" Default:"false" Category:"Rendering"`;

    // TODO i would like the category to be "Debug Draw" (without the '_'),
    // but i parse the tags in a dumb way, maybe later.
    //
    // TODO extra spaces are also bad apparently...

    Debug_Draw_How_Many_Boids int `Property:"int" Default:"10" Range:"1;1000" Category:"Debug_Draw"`

    Draw_Spacial_Array  bool `Property:"bool" Default:"false" Category:"Debug_Draw"`;
    Draw_Boundary       bool `Property:"bool" Default:"false" Category:"Debug_Draw"`;
    Draw_Heading        bool `Property:"bool" Default:"false" Category:"Debug_Draw"`;
    Draw_Visual_Ranges  bool `Property:"bool" Default:"false" Category:"Debug_Draw"`;
    Draw_Rectangles     bool `Property:"bool" Default:"false" Category:"Debug_Draw"`;
    Draw_Mouse_Position bool `Property:"bool" Default:"false" Category:"Debug_Draw"`;
    Draw_Boid_Pathing   bool `Property:"bool" Default:"false" Category:"Debug_Draw"`;
    Draw_Rays           bool `Property:"bool" Default:"false" Category:"Debug_Draw"`;
}




// reflection stuff to get and set fields.

type Property_Data_Type int;
const (
    None     Property_Data_Type = iota;
    Property_Data_Float;
    Property_Data_Int;
    Property_Data_Bool;
)

type Property_Struct struct {
    Tag_as_string string;

    Property_data_type Property_Data_Type;

    // Float properties
    Float_range_min float64;
    Float_range_max float64;
    Float_default   float64;

    // Int properties
    Int_range_min int;
    Int_range_max int;
    Int_default   int;

    // Bool properties
    Bool_default bool;


    // category for nice display in javascript.
    category string;
}


type Property_Struct_Field_Flags int;
const (
    Flag_None   Property_Struct_Field_Flags = 0;

    // this is always set. // TODO make it not always set?
    // Flag_Property_type   = 1<<0

    Flag_range     = 1 << 1;
    Flag_default   = 1 << 2;
    Flag_category  = 1 << 3;
)


// contains a list of all properties.
//
// do not get from here, call get_property_structs() to get this.
var __hidden_property_structs map[string]Property_Struct = nil;

// Will panic if there is something funny in the formatting, Call to get the property map.
func get_property_structs() map[string]Property_Struct {
    // use property Structs as a flag, to know when init-ed.
    if __hidden_property_structs == nil {
        __hidden_property_structs = create_property_structs();
    }

    if len(__hidden_property_structs) == 0 { panic("get_property_structs: hidden_property_structs was empty?"); }
    return __hidden_property_structs;
}

func get_default_properties() Properties {
    property_structs := get_property_structs();

    default_properties := Properties{};
    properties_reflected := reflect.ValueOf(&default_properties).Elem();

    for name, prop_struct := range property_structs {
        settable_field := properties_reflected.FieldByName(name);

        switch prop_struct.Property_data_type {
        case Property_Data_Float: settable_field.SetFloat(prop_struct.Float_default);
        case Property_Data_Int:   settable_field.SetInt(int64(prop_struct.Int_default));
        case Property_Data_Bool:  settable_field.SetBool(prop_struct.Bool_default);

        default: log.Panicf("%v: Unknown property data type in 'get_default_properties' switch", name);
        }
    }

    return default_properties;
}

type Union_Like struct {
    As_int   int;
    As_float float64;
    As_bool  bool;
}

func set_properties_with_map(properties *Properties, the_map map[string]Union_Like) {
    property_structs := get_property_structs();

    // check if the name is in the property names.
    bad_name := false;
    for name := range the_map {
        if !Contains(property_structs, name) {
            fmt.Printf("ERROR: '%v' is not in property structs\n", name);
            bad_name = true;
        }
    }

    if bad_name { log.Fatalf("ERROR: There was a bad name.\n"); }

    properties_reflected := reflect.ValueOf(properties).Elem();

    for name, union := range the_map {

        prop_struct := property_structs[name];

        settable_field := properties_reflected.FieldByName(name);

        switch prop_struct.Property_data_type {
        case Property_Data_Float: settable_field.SetFloat(union.As_float);
        case Property_Data_Int:   settable_field.SetInt(int64(union.As_int));
        case Property_Data_Bool:  settable_field.SetBool(union.As_bool);

        default: log.Panicf("%v: Unknown property in 'set_properties_with_map' switch", name);
        }
    }
}



// Creates the property structs, panics on error in formatting, (witch is what we want.)
//
// you can use the returned property structs with no fear, (but you should call 'Get_property_structs()' because it cashes the return value of this function)
func create_property_structs() map[string]Property_Struct {
    property_structs := make(map[string]Property_Struct);

    properties_type := reflect.TypeFor[Properties]();

    for i := range properties_type.NumField() {
        field := properties_type.Field(i);

        name := field.Name;
        tag  := field.Tag;

        _, has_property := tag.Lookup("Property");
        if !has_property {
            // every field must be a property.
            log.Panicf("create_property_structs: Every field in Properties should be a property. but %s did not have the properties tag. (it's tag is `%s`)", field.Name, field.Tag);
            // continue;
        }

        // --------------------------------------------
        //        Parse Tag into property struct
        // --------------------------------------------

        // start parsing the tag into a struct.
        property_struct := Property_Struct{};
        property_struct.Tag_as_string = string(tag);

        // space separated tags.
        //
        // TODO sometimes i want spaces in my tags,
        // this is not a proper way to split things
        tag_split := strings.Split(string(tag), " ");

        // property must always first.
        property_property, property_data_type := tag_property_to_parts(tag_split[0]);

        if property_property != "Property" { log.Panicf("create_property_structs: field '%v' (witch has the property tag), dose not have the property tag first, was %v\n", name, tag); }

        switch property_data_type {
        // TODO use an enum here.
        case "float": { property_struct.Property_data_type = Property_Data_Float; }
        case "int":   { property_struct.Property_data_type = Property_Data_Int;   }
        case "bool":  { property_struct.Property_data_type = Property_Data_Bool;  }

        default: { log.Panicf("create_property_structs: when parsing field '%s', unknown property data type '%v'\n", name, property_data_type); }
        }

        tag_split = tag_split[1:];

        struct_field_flags := Flag_None;

        // TODO maybe split the parsing into different functions?

        for len(tag_split) > 0 {
            left, right := tag_property_to_parts(tag_split[0]);
            tag_split = tag_split[1:];

            switch left {
            case "Range": {
                if struct_field_flags & Flag_range != 0 { log.Panicf("create_property_structs: when parsing field '%s', Range property was set twice.", name); }
                struct_field_flags |= Flag_range;

                switch property_struct.Property_data_type {
                case Property_Data_Float: {
                    ok, min_s, max_s := split_once(right, ";");
                    if !ok { log.Panicf("create_property_structs: when parsing field '%s', right side of range property did not have a ';', was '%v'\n", name, right); }

                    min_f, ok1 := strconv.ParseFloat(min_s, 64);
                    max_f, ok2 := strconv.ParseFloat(max_s, 64);

                    if ok1 != nil || ok2 != nil { log.Panicf("create_property_structs: when parsing field '%s', error parsing floats in range. was '%s'\n", name, right); }

                    property_struct.Float_range_min = min_f;
                    property_struct.Float_range_max = max_f;
                }

                case Property_Data_Int: {
                    ok, min_s, max_s := split_once(right, ";");
                    if !ok { log.Panicf("create_property_structs: when parsing field '%s', right side of range property did not have a ';', was '%s'\n", name, right); }

                    strconv.ParseInt(min_s, 0, 0);
                    min_i, ok1 := strconv.ParseInt(min_s, 10, 0);
                    max_i, ok2 := strconv.ParseInt(max_s, 10, 0);

                    if ok1 != nil || ok2 != nil { log.Panicf("create_property_structs: when parsing field '%s', error parsing ints in range. was '%s'\n", name, right); }

                    property_struct.Int_range_min = int(min_i);
                    property_struct.Int_range_max = int(max_i);
                }

                case Property_Data_Bool: {
                    log.Panicf("create_property_structs: when parsing field '%s', Bool dose not use Range", name);
                }

                default: { log.Panicf("create_property_structs: when parsing field '%s', Unknown property in range switch", name); }
                }

            }

            case "Default": {
                if struct_field_flags & Flag_default != 0 { log.Panicf("create_property_structs: when parsing field '%s', Default property was set twice.\n", name); }
                struct_field_flags |= Flag_default;

                switch property_struct.Property_data_type {
                case Property_Data_Float: {
                    def, ok := strconv.ParseFloat(right, 64);

                    if ok != nil { log.Panicf("create_property_structs: when parsing field '%s', error in Default, could not parse float. was '%v'\n", name, right); }

                    property_struct.Float_default = def;
                }

                case Property_Data_Int: {
                    def, ok := strconv.ParseInt(right, 10, 0);

                    if ok != nil { log.Panicf("create_property_structs: when parsing field '%s', error in Default, could not parse int. was '%v'\n", name, right); }

                    property_struct.Int_default = int(def);
                }

                case Property_Data_Bool: {
                    def, ok := strconv.ParseBool(right);

                    if ok != nil { log.Panicf("create_property_structs: when parsing field '%s', error in Default, could not parse bool. was '%v'\n", name, right); }

                    property_struct.Bool_default = def;
                }

                default: { log.Panicf("create_property_structs: when parsing field '%s', Unknown property in default switch", name); }
                }

            }

            case "Category": {
                if struct_field_flags & Flag_category != 0 { log.Panicf("create_property_structs: when parsing field '%s', Category property was set twice.\n", name); }
                struct_field_flags |= Flag_category;

                property_struct.category = right;
            }

            default: { log.Panicf("create_property_structs: when parsing field '%s', Unknown property type '%s'\n", name, left); }
            }
        }

        // check that all relevant property's fields where set with the flags
        if struct_field_flags & Flag_range == 0 {
            // bool's don't have a range.
            if property_struct.Property_data_type != Property_Data_Bool {
                log.Panicf("create_property_structs: when parsing field '%s', range field was not set.\n", name);
            }
        }
        if struct_field_flags & Flag_default == 0 {
            log.Panicf("create_property_structs: when parsing field '%s', Default field was not set.\n", name);
        }
        //
        // Category can be unset. its fine.
        // better than setting every single one to "None" or "Misc"
        //
        // if struct_field_flags & Flag_category == 0 {}

        property_structs[name] = property_struct;
    }

    return property_structs;
}


// ////////////////
// Helper Functions
// ////////////////

// TODO put some of these in go_has_a_bad_std

func split_once(s string, sep string) (found bool, a string, b string) {
    if s == "" && sep == "" { return false, "", ""; }

    sections := strings.SplitN(s, sep, 2);

    // when no separator was found
    if len(sections) == 1 { return false, s, ""; }

    return true, sections[0], sections[1];
}

func tag_property_to_parts(prop string) (string, string) {
    ok, left, right := split_once(prop, ":");

    if !ok { log.Panicf("tag_property_to_parts: malformed tag (did not have ':'), was '%v'\n", prop); }

    if right[0] != '"' || right[len(right)-1] != '"' { log.Panicf("malformed tag, was '%v'\n", prop); }
    right = right[1:len(right)-1]; // Remove quotes.

    return left, right;
}
