package main

import "time"

// how long until something is considered 'held', in seconds.
const HELD_TIME = 0.10;

type User_Input struct {
    Mouse_Position            Vec2[Boid_Float];
    Mouse_Position_Previously Vec2[Boid_Float];

    //
    // left middle and right mouse buttons.
    //
    // should i prefix these with mouse?
    //
    // like putting them in a struct with the mouse position, so we can remove the prefix there,
    //
    // however, mouse buttons are ubiquitous, or at least thats my excuse.
    //
    Left, Middle, Right Single_Mouse_Button;

    // TODO middle mouse scroll
    // TODO keyboard inputs?
}

type Single_Mouse_Button struct {
    Down bool;
    // if it was not down last time input was updated, but down now.
    Clicked bool;
    // if it was up last time, and down now.
    Released bool;
    // if the mouse button was held for more than HELD_TIME
    Held bool;
    // if it was held on the previous input, but not now.
    Held_Previously bool;

    // internal for keeping track of Held
    down_since time.Time;
}


// this function takes an Input_Status and returns one,
//
// maybe some day i will add rewind and playback with this.
func Update_Input(prev User_Input, is_left_down, is_middle_down, is_right_down bool, mouse_pos Vec2[Boid_Float]) User_Input {
    new_input_status := User_Input{};

    new_input_status.Mouse_Position            = mouse_pos;
    new_input_status.Mouse_Position_Previously = prev.Mouse_Position;

    { // handling mouse buttons.
        update_single_mouse_button := func(button_down bool, previous_button Single_Mouse_Button, current_time time.Time) Single_Mouse_Button {
            new_button := Single_Mouse_Button{};

            new_button.Down            = button_down;
            new_button.Released        = previous_button.Down && !button_down;
            new_button.Held_Previously = previous_button.Held;
            new_button.down_since      = previous_button.down_since;

            // check if the previous frame did not ;have them down.
            if button_down && !previous_button.Down {
                new_button.Clicked = true;
                new_button.down_since = current_time;
            }

            // check for held.
            if button_down && current_time.Sub(prev.Left.down_since).Seconds() >= HELD_TIME {
                new_button.Held = true;
            }

            return new_button;
        };

        current_time := time.Now();

        new_input_status.Left   = update_single_mouse_button(is_left_down,   prev.Left,   current_time);
        new_input_status.Middle = update_single_mouse_button(is_middle_down, prev.Middle, current_time);
        new_input_status.Right  = update_single_mouse_button(is_right_down,  prev.Right,  current_time);
    }

    return new_input_status;
}
