package main

import "math"

//
// This is just what a color is.
//
// some of this stuff is just for software rendering. (aka Blend_Color)
//

type Color uint32;

func (c Color) to_rgba() (uint8, uint8, uint8, uint8) {
    r := uint8((c >> (8*0)) & 0xFF);
    g := uint8((c >> (8*1)) & 0xFF);
    b := uint8((c >> (8*2)) & 0xFF);
    a := uint8((c >> (8*3)) & 0xFF);
    return r, g, b, a;
}

// Go type switch statements are sensitive to distinct
// types, js.ValueOf() will panic if it gets a "Color".
func (c Color) js() uint32 { return uint32(c); }

// packs it into a color with the correct endianness for this project.
func rgba_to_color(r, g, b, a uint8) Color {
    result := (uint32(r) << (8*0)) |
              (uint32(g) << (8*1)) |
              (uint32(b) << (8*2)) |
              (uint32(a) << (8*3));
    return Color(result);
}

func convert_0_1_to_0_255[T Float](x T) uint8 {
    a := Clamp(Round(x * 255), 0, 255);
    return uint8(a);
}

// wish this could have a type parameter, but methods cant have
// them, and i don't want to make this function twice.
func (c *Color) Set_Alpha(a float32) {
    // this could be slightly faster...
    // just skip the destructuring.
    r, g, b, _ := c.to_rgba();
    *c = rgba_to_color(r, g, b, convert_0_1_to_0_255(a));
}

// my editor has a feature where if you put rgb(28, 110, 192),
// it makes a color picker. this was probably intended for HTML/CSS,
// but it works anywhere. Sick Hack.
func rgb(r, g, b uint8) Color {
    return rgba_to_color(r, g, b, 255);
}
func rgba(r, g, b uint8, a float32) Color {
    return rgba_to_color(r, g, b, convert_0_1_to_0_255(a));
}

// https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
func HSL_to_RGB[T Float](H, S, L T) Color {
    H = Clamp(H, 0, 360);
    S = Clamp(S, 0, 1);
    L = Clamp(L, 0, 1);

    a := S * min(L, 1-L);
    f := func(n T) T {
        k := T(math.Mod(float64(n+H/30), 12));
        return L - a*max(-1, min(k-3, 9-k, 1));
    }

    r := convert_0_1_to_0_255(f(0));
    g := convert_0_1_to_0_255(f(8));
    b := convert_0_1_to_0_255(f(4));
    return rgba_to_color(r, g, b, 255);
}

// returned alpha is c1.a
func blend_color(c1, c2 Color) Color {
    _r1, _g1, _b1, _a1 := c1.to_rgba();
    _r2, _g2, _b2, _a2 := c2.to_rgba();

    // has to be converted into a bigger int type,
    // because theres not enough precision with the uint8's
    //
    // uint for speed? maybe? so the compiler dosnt have to do dumb int things.
    r1, g1, b1, a1 := uint(_r1), uint(_g1), uint(_b1), uint(_a1);
    r2, g2, b2, a2 := uint(_r2), uint(_g2), uint(_b2), uint(_a2);

    r3 := (r1*(255 - a2) + r2*a2)/255;
    g3 := (g1*(255 - a2) + g2*a2)/255;
    b3 := (b1*(255 - a2) + b2*a2)/255;

    r3 = min(r3, 255);
    g3 = min(g3, 255);
    b3 = min(b3, 255);

    return rgba_to_color(uint8(r3), uint8(g3), uint8(b3), uint8(a1));
}
