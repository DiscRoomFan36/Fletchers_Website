package main

import (
	"iter"
)

// anything that "has a position" can be used in the spacial array.
type Has_Position[T Number] interface {
    Get_Position() Vec2[T];
}


// how many points can fit into a box before its full.
const SPACIAL_ARRAY_BOX_SIZE = 32;

// thought about making this zero or something,
// but it makes some loops easier to form with -1.
//
// though you could make a case to use a uint and the max uint16,
// might shave a few cycles, lol
const SPACIAL_ARRAY_BOX_INVALID_NEXT int16 = -1;

// pack the point and the pointer together, better memory locality.
type Position_And_Ptr[T Has_Position[U], U Number] struct {
    // pointer first because its a known size.
    item *T;
    position Vec2[U];
}

type Spacial_Array_Box[T Has_Position[U], U Number] struct {
    // how many slots are filled.
    Count uint16;

    // The next box in the linked list
    // index into boxes array, -1 is "no next box"
    //
    // 32768 is more than enough boxes for everyone
    Next int16;

    Points_And_Pointers [SPACIAL_ARRAY_BOX_SIZE]Position_And_Ptr[T, U];
}

type Spacial_Array[T Has_Position[U], U Number] struct {
    // this is weather or not we have been given points
    inited bool;

    Boxes_wide int;
    Boxes_high int;

    Min_x U;
    Min_y U;
    Max_x U;
    Max_y U;

    // the backup boxes are at the end of this array,
    // hopefully the cache will like that. praise be.
    Boxes []Spacial_Array_Box[T, U];

    backup_boxes_in_use int;
}

// TODO find some way to make this zero initialized.
func New_Spacial_Array[T Has_Position[U], U Number]() Spacial_Array[T, U] {
    result := Spacial_Array[T, U]{
        inited: false,

        Boxes_wide: 32,
        Boxes_high: 32,

        // these will be set when you give this thing points
        Min_x: 0,
        Min_y: 0,
        Max_x: 0,
        Max_y: 0,

        backup_boxes_in_use: 0,
    };

    const INITIAL_EXTRA_SPACE_FOR_BACKUP_BOXES = 32;

    result.Boxes = make([]Spacial_Array_Box[T, U], (result.Boxes_wide*result.Boxes_high) + INITIAL_EXTRA_SPACE_FOR_BACKUP_BOXES);

    // easy way to set Boxes[i].Next = BOX_INVALID_NEXT
    result.Clear();

    return result;
}

// you can also pass in defaults, sets a min size.
// 
// TODO pass a "this is how many wide we want"?
// or just make the boxes square and calc on the road.
func (array *Spacial_Array[T, U]) Append_array_of_things(things []T, x_min_default, y_min_default, x_max_default, y_max_default U) {
    if array.inited { panic("cannot append 2 sets of points, sorry"); }
    array.inited = true;

    { // set the bounds of the array
        min_x, min_y, max_x, max_y := find_mins_and_maxs(things);
        array.Min_x = min(min_x, x_min_default);
        array.Min_y = min(min_y, y_min_default);
        array.Max_x = max(max_x, x_max_default);
        array.Max_y = max(max_y, y_max_default);
    }

    for index, thing := range things {
        thing_position := thing.Get_Position();
        box_x, box_y := array.point_to_box_loc(thing_position);
        the_box := &array.Boxes[box_y*array.Boxes_wide+box_x];

        // find a box with room.
        for the_box.Count == SPACIAL_ARRAY_BOX_SIZE {
            // get a new box into the linked list if next is nil.
            if the_box.Next == SPACIAL_ARRAY_BOX_INVALID_NEXT {

                // hate the name, but it is slightly shorter, and we use this
                // calculation a lot... maybe just make this a call on the
                // spacial array? meh.
                number_of_boxes_in_grid := array.Boxes_high*array.Boxes_wide;

                // make a new box if there are no spares.
                if number_of_boxes_in_grid + array.backup_boxes_in_use == len(array.Boxes) {
                    // this bad boy is gonna do one hell of a memcpy.
                    // but i left some space at the end of the array
                    // so hopefully this never occurs.
                    //
                    // or if it dose, it will only happen once, and the underlining array
                    // is made much bigger.
                    //
                    // TODO panic here? check this?
                    Append(&array.Boxes, Spacial_Array_Box[T, U]{});
                }

                // get the next box
                the_box.Next = int16(number_of_boxes_in_grid + array.backup_boxes_in_use);
                array.backup_boxes_in_use += 1;

                // reset the important fields.
                array.Boxes[the_box.Next].Count = 0;
                array.Boxes[the_box.Next].Next  = SPACIAL_ARRAY_BOX_INVALID_NEXT;
            }
            the_box = &array.Boxes[the_box.Next];
        }

        pos_and_ptr := &the_box.Points_And_Pointers[the_box.Count];
        pos_and_ptr.position = thing_position;
        pos_and_ptr.item = &things[index];

        the_box.Count += 1;
    }
}

// after seeing jai's for expansions, this just looks like garbage in comparison...
//
// is a range over the points id, and the point in question.
func (array Spacial_Array[T, U]) Iter_Over_Near(point Vec2[U], radius U) iter.Seq2[*T, Vec2[U]] {
    return func(yield func(*T, Vec2[U]) bool) {

        min_x, min_y := array.point_to_box_loc(Sub(point, Make_Vec2(radius, radius)));
        max_x, max_y := array.point_to_box_loc(Add(point, Make_Vec2(radius, radius)));

        for j := min_y; j <= max_y; j++ {
            for i := min_x; i <= max_x; i++ {
                next := int16(j*array.Boxes_wide + i);

                for next != -1 {
                    box := &array.Boxes[next];

                    for k := range box.Count {
                        checking_item := box.Points_And_Pointers[k];

                        // if the entire box is covered in the radius,
                        // the point *must* be within the radius,
                        //
                        // is it worth doing a check outside of
                        // this loop to fast track that case?
                        if DistSqr(point, checking_item.position) < radius*radius {
                            if !yield(checking_item.item, checking_item.position) { return; }
                        }
                    }

                    next = box.Next;
                }
            }
        }
    }
}

func (array *Spacial_Array[T, U]) Clear() {
    array.inited = false;

    for i := range array.Boxes_wide*array.Boxes_high {
        array.Boxes[i].Count = 0;
        array.Boxes[i].Next = SPACIAL_ARRAY_BOX_INVALID_NEXT;
    }

    array.backup_boxes_in_use = 0;
}

func (array Spacial_Array[T, U]) point_to_box_loc(point Vec2[U]) (int, int) {
    x := map_and_clamp_range(point.x, array.Min_x, array.Max_x);
    y := map_and_clamp_range(point.y, array.Min_y, array.Max_y);

    i_x := min(int(x*U(array.Boxes_wide)), array.Boxes_wide-1);
    i_y := min(int(y*U(array.Boxes_high)), array.Boxes_high-1);

    return i_x, i_y;
}

// returns min_x, min_y, max_x, max_y
func find_mins_and_maxs[T Has_Position[U], U Number](things []T) (U, U, U, U) {
    if len(things) == 0 { return 0, 0, 0, 0; }

    first_position := things[0].Get_Position();
    min_x := first_position.x;
    max_x := first_position.x;
    min_y := first_position.y;
    max_y := first_position.y;
    for _, thing := range things[1:] {
        pos := thing.Get_Position();
        min_x = min(min_x, pos.x);
        max_x = max(max_x, pos.x);
        min_y = min(min_y, pos.y);
        max_y = max(max_y, pos.y);
    }
    return min_x, min_y, max_x, max_y;
}

// returns a number from 0..1 inclusive
// TODO can this be done better with ints? mult and div?
func map_and_clamp_range[T Number](x, mini, maxi T) T {
    diff := maxi - mini;
    if diff == 0 { return 0; }
    y := (x - mini) / diff;
    return Clamp(y, 0, 1);
}
