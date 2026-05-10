package main

import (
	"iter"
)



type Pointer_Stable_Item[T any] struct {
    // might fuck up your alignment, but just deal with it.
    is_alive bool;
    item T;
}

// TODO naming collision.
const POINTER_STABLE_BOX_SIZE = 32;
type Pointer_Stable_Box[T any] struct {
    items [512]Pointer_Stable_Item[T];
}

// an array that you can safely append to, without messing up your pointers to other things.
type Pointer_Stable_Array[T any] struct {
    boxes []*Pointer_Stable_Box[T];
    // how many items in the array
    count int;
}

// return a pointer to the item you just added.
func (array *Pointer_Stable_Array[T]) Add() *T {
	clear_item_memory := func(item_ptr *T) {
		var clear_item T;
		*item_ptr = clear_item; 
	}

    for _, box := range array.boxes {
        for i := range box.items {
            if box.items[i].is_alive == false {
				box.items[i].is_alive = true;
				clear_item_memory(&box.items[i].item);
				return &box.items[i].item;
			}
        }
    }

	// no more room, add a new box.
	new_box := new(Pointer_Stable_Box[T]);
	// not using go_has_a_bad_std.Append(), this is the only thing in
	// the file that would depend on that. not worth it.
	array.boxes = append(array.boxes, new_box);

	newest_box := array.boxes[len(array.boxes)-1];
	newest_item := &newest_box.items[0];

	newest_item.is_alive = true;
	clear_item_memory(&newest_item.item);

	return &newest_item.item;
}

// return a pointer to the item you just added.
func (array *Pointer_Stable_Array[T]) Append(item T) *T {
	new_item := array.Add();
	*new_item = item;
	return new_item;
}


func (array *Pointer_Stable_Array[T]) Get_Stable_Item_By_Pointer(item_ptr *T) *Pointer_Stable_Item[T] {
	// TODO this could be WAY faster, but golang dose not have the most friendly pointer math.
	for _, box := range array.boxes {
		for i := range box.items {
			ps_item := &box.items[i];
			if &ps_item.item == item_ptr {
				return ps_item;
			}
        }
    }

	return nil;
}

// return weather or not the pointer is for this array.
func (array *Pointer_Stable_Array[T]) Remove(item *T) bool {
	stable_ptr := array.Get_Stable_Item_By_Pointer(item);
	if stable_ptr == nil    { return false; }
	if !stable_ptr.is_alive { return false; }

	stable_ptr.is_alive = false;
	return true;
}



// iterate over an array by pointer
func (array *Pointer_Stable_Array[T]) Iter() iter.Seq[*T] {
    return func(yield func(*T) bool) {
        for _, box := range array.boxes {
            for i := range box.items {
                if box.items[i].is_alive {
                    if !yield(&box.items[i].item) { return; }
                }
            }
        }
    }
}

// iterate over an array by value
func (array *Pointer_Stable_Array[T]) Iter_by_value() iter.Seq[T] {
    return func(yield func(T) bool) {
        for _, box := range array.boxes {
            for i := range box.items {
                if box.items[i].is_alive {
                    if !yield(box.items[i].item) { return; }
                }
            }
        }
    }
}
