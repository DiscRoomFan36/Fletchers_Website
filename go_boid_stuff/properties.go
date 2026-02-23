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

    Max_Boids          int `Property:"int" Range:"0;5000" Default:"1000"`;
    // how many spawn / de-spawn per second.
    Boid_Spawn_Rate    Boid_Float `Property:"float" Range:"10;1000" Default:"100"`;

    Visual_Range            Boid_Float `Property:"float" Range:"1;25" Default:"15"`;
    Separation_Min_Distance Boid_Float `Property:"float" Range:"0;20" Default:"8.5"`;

    Separation_Factor Boid_Float `Property:"float" Range:"0;1" Default:"0.50"`; // 0.15
    Alignment_Factor  Boid_Float `Property:"float" Range:"0;1" Default:"0.30"`; // 0.15
    Cohesion_Factor   Boid_Float `Property:"float" Range:"0;1" Default:"0.15"`; // 0.015

    Margin             Boid_Float `Property:"float" Range:"0;100" Default:"50"`;
    Margin_Turn_Factor Boid_Float `Property:"float" Range:"0;20" Default:"4"`;

    Random_Draw_Factor        Boid_Float `Property:"float" Range:"0;10" Default:"2"`;
    Random_Draw_Time_Dilation Boid_Float `Property:"float" Range:"1;10" Default:"2"`;

    Center_Draw_Radius_Div Boid_Float `Property:"float" Range:"0;10" Default:"3"`;
    Center_Draw_Factor     Boid_Float `Property:"float" Range:"0;10" Default:"1"`;

    Wind_X_Factor Boid_Float `Property:"float" Range:"-10;10" Default:"0"`;
    Wind_Y_Factor Boid_Float `Property:"float" Range:"-10;10" Default:"0"`;

    Mouse_Draw_Factor Boid_Float `Property:"float" Range:"1;20" Default:"2"`;

    Num_Boid_Rays      int        `Property:"int" Range:"1;10" Default:"5"`;
    // in radians
    Visual_Cone_Radius Boid_Float `Property:"float" Range:"0;360" Default:"140"`;
    Boid_Vision_Factor Boid_Float `Property:"float" Range:"0;5" Default:"1"`;

    Final_Acceleration_Boost Boid_Float `Property:"float" Range:"1;25" Default:"10"`; // 5
    Final_Drag_Coefficient   Boid_Float `Property:"float" Range:"0;2" Default:"0.15"`; // 1


    Toggle_Wrapping bool `Property:"bool" Default:"true"`;
    Toggle_Bounding bool `Property:"bool" Default:"false"`;


    Boid_Radius Boid_Float `Property:"float" Range:"0;10" Default:"2.5"`;
}




// reflection stuff to get and set fields.

type Property_Type int;
const (
    None    Property_Type = iota;
    Property_Float;
    Property_Int;
    Property_Bool;
)

type Property_Struct struct {
    Tag_as_string string;

    Property_type Property_Type;

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
}


type Property_Struct_Field_Flags int;
const (
    Flag_None   Property_Struct_Field_Flags = 0;

    // this is always set. // TODO make it not always set?
    // Flag_Property_type   = 1<<0

    Flag_range     = 1 << 1;
    Flag_default   = 1 << 2;
)


// contains a list of all properties.
//
// do not get from here, call Get_property_structs() to get this.
var hidden_property_structs map[string]Property_Struct = nil;

// Will panic if there is something funny in the formatting, Call to get the property map.
func Get_property_structs() map[string]Property_Struct {
    // use property Structs as a flag, to know when init-ed.
    if hidden_property_structs == nil {
        hidden_property_structs = create_property_structs();
    }

    if len(hidden_property_structs) == 0 { panic("Get_property_structs: hidden_property_structs was empty?"); }
    return hidden_property_structs;
}


func set_boid_defaults(boid_sim *Boid_simulation) {
    property_structs := Get_property_structs();

    properties_reflected := reflect.ValueOf(&boid_sim.properties).Elem();

    for name, prop_struct := range property_structs {

        settable_field := properties_reflected.FieldByName(name);

        switch prop_struct.Property_type {
        case Property_Float: settable_field.SetFloat(prop_struct.Float_default);
        case Property_Int:   settable_field.SetInt(int64(prop_struct.Int_default));
        case Property_Bool:  settable_field.SetBool(prop_struct.Bool_default);

        default: log.Panicf("%v: Unknown property in 'set_boid_defaults' switch", name);
        }
    }
}

type Union_Like struct {
    As_int   int;
    As_float float64;
    As_bool  bool;
}

func (boid_sim *Boid_simulation) Set_Properties_with_map(the_map map[string]Union_Like) {
    property_structs := Get_property_structs();

    // check if the name is in the property names.
    bad_name := false;
    for name := range the_map {
        if !contains(property_structs, name) {
            fmt.Printf("ERROR: '%v' is not in property structs\n", name);
            bad_name = true;
        }
    }

    if bad_name { log.Fatalf("ERROR: There was a bad name.\n"); }

    properties_reflected := reflect.ValueOf(&boid_sim.properties).Elem();

    for name, union := range the_map {

        prop_struct := property_structs[name];

        settable_field := properties_reflected.FieldByName(name);

        switch prop_struct.Property_type {
        case Property_Float: settable_field.SetFloat(union.As_float);
        case Property_Int:   settable_field.SetInt(int64(union.As_int));
        case Property_Bool:  settable_field.SetBool(union.As_bool);

        default: log.Panicf("%v: Unknown property in 'Set_Properties_with_map' switch", name);
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
        if !has_property { continue; }

        // --------------------------------------------
        //        Parse Tag into property struct
        // --------------------------------------------

        // start parsing the tag into a struct.
        property_struct := Property_Struct{};
        property_struct.Tag_as_string = string(tag);

        // space separated tags.
        tag_split := strings.Split(string(tag), " ");

        // property must always first.
        property_property, prop_type := tag_property_to_parts(tag_split[0]);

        if property_property != "Property" { log.Panicf("field '%v' (witch has the property tag), dose not have the property tag first, was %v\n", name, tag); }

        switch prop_type {
        // TODO use an enum here.
        case "float": { property_struct.Property_type = Property_Float; }
        case "int":   { property_struct.Property_type = Property_Int;   }
        case "bool":  { property_struct.Property_type = Property_Bool;  }

        default: { log.Panicf("%v: unknown property type '%v'\n", name, prop_type); }
        }

        tag_split = tag_split[1:];

        struct_field_flags := Flag_None;

        // TODO maybe split the parsing into different functions?

        for len(tag_split) > 0 {
            left, right := tag_property_to_parts(tag_split[0]);
            tag_split = tag_split[1:];

            switch left {
            case "Range": {
                if struct_field_flags & Flag_range != 0 { log.Panicf("%v: Range property was set twice.", name); }
                struct_field_flags |= Flag_range;

                switch property_struct.Property_type {
                case Property_Float: {
                    ok, min_s, max_s := split_once(right, ";");
                    if !ok { log.Panicf("%v: right side of range property did not have a ';', was '%v'\n", name, right); }

                    min_f, ok1 := strconv.ParseFloat(min_s, 64);
                    max_f, ok2 := strconv.ParseFloat(max_s, 64);

                    if ok1 != nil || ok2 != nil { log.Panicf("%v: error parsing floats in range. was '%v'\n", name, right); }

                    property_struct.Float_range_min = min_f;
                    property_struct.Float_range_max = max_f;
                }

                case Property_Int: {
                    ok, min_s, max_s := split_once(right, ";");
                    if !ok { log.Panicf("%v: right side of range property did not have a ';', was '%v'\n", name, right); }

                    strconv.ParseInt(min_s, 0, 0);
                    min_i, ok1 := strconv.ParseInt(min_s, 10, 0);
                    max_i, ok2 := strconv.ParseInt(max_s, 10, 0);

                    if ok1 != nil || ok2 != nil { log.Panicf("%v: error parsing ints in range. was '%v'\n", name, right); }

                    property_struct.Int_range_min = int(min_i);
                    property_struct.Int_range_max = int(max_i);
                }

                case Property_Bool: {
                    log.Panicf("%v: Bool dose not use Range", name);
                }

                default: { log.Panicf("%v: Unknown property in range switch", name); }
                }

            }

            case "Default": {
                if struct_field_flags & Flag_default != 0 { log.Panicf("%v: Default property was set twice.\n", name); }
                struct_field_flags |= Flag_default;

                switch property_struct.Property_type {
                case Property_Float: {
                    def, ok := strconv.ParseFloat(right, 64);

                    if ok != nil { log.Panicf("%v: error in Default, could not parse float. was '%v'\n", name, right); }

                    property_struct.Float_default = def;
                }

                case Property_Int: {
                    def, ok := strconv.ParseInt(right, 10, 0);

                    if ok != nil { log.Panicf("%v: error in Default, could not parse int. was '%v'\n", name, right); }

                    property_struct.Int_default = int(def);
                }

                case Property_Bool: {
                    def, ok := strconv.ParseBool(right);

                    if ok != nil { log.Panicf("%v: error in Default, could not parse bool. was '%v'\n", name, right); }

                    property_struct.Bool_default = def;
                }

                default: { log.Panicf("%v: Unknown property in default switch", name); }
                }

            }

            default: { log.Panicf("%v: Unknown property %v\n", name, left); }
            }
        }

        // check that all relevant property's fields where set with the flags
        if struct_field_flags & Flag_range == 0 {
            // bool's don't have a range.
            if property_struct.Property_type != Property_Bool {
                log.Panicf("%v: range field was not set.\n", name);
            }
        }
        if struct_field_flags & Flag_default == 0 {
            log.Panicf("%v: Default field was not set.\n", name);
        }

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

func contains[T comparable, U any](m map[T]U, key T) bool {
    _, ok := m[key];
    return ok;
}

func tag_property_to_parts(prop string) (string, string) {
    ok, left, right := split_once(prop, ":");

    if !ok { log.Panicf("malformed tag, was '%v'\n", prop); }

    if right[0] != '"' || right[len(right)-1] != '"' { log.Panicf("malformed tag, was '%v'\n", prop); }
    right = right[1:len(right)-1]; // Remove quotes.

    return left, right;
}
