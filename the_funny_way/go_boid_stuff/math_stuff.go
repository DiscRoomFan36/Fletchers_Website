package main

import (
	"math"
)

// TODO just make it float32? i like the generics, but it might be a bit much.

// The Classic Vector, i wouldn't do all this [T Number] stuff if go has a better math library... well... maybe i would
type Vec2[T Number] struct { x, y T; }

//go:inline
func Make_Vec2[T Number](x, y T) Vec2[T] { return Vec2[T]{x, y}; }

func (a Vec2[Number]) Splat() (Number, Number) { return a.x, a.y; }

// Really useful helper, would recommend
//
// converts a Vec type number T to Vec type number U,
func Transform_Vec[T Number, U Number](v Vec2[T]) Vec2[U] {
    return Vec2[U]{
        x: U(v.x),
        y: U(v.y),
    };
}


// These math operators a dumb actually.

func (a *Vec2[Number]) Add(vs ...Vec2[Number]) {
    for _, b := range vs {
        a.x += b.x;
        a.y += b.y;
    }
}
func Add[T Number](a Vec2[T], vs ...Vec2[T]) Vec2[T] {
    a.Add(vs...); // I hope the compiler knows what its doing
    return a;
}

func (a *Vec2[Number]) Sub(vs ...Vec2[Number]) {
    for _, b := range vs {
        a.x -= b.x;
        a.y -= b.y;
    }
}
func Sub[T Number](a Vec2[T], vs ...Vec2[T]) Vec2[T] {
    a.Sub(vs...);
    return a;
}

func (a *Vec2[Number]) Mult(s Number) {
    a.x *= s;
    a.y *= s;
}
func Mult[T Number](a Vec2[T], s T) Vec2[T] {
    a.Mult(s);
    return a;
}

//go:inline
func Dot[T Number](a, b Vec2[T]) T { return a.x*b.x + a.y*b.y; }
func (a Vec2[Number]) Dot() Number { return Dot(a, a); }

func (a Vec2[Number]) Mag() Number { return Number(math.Sqrt(float64(Dot(a, a)))); }

func (a *Vec2[Number]) SetMag(new_mag Number) {
    mag := a.Mag();
    if mag == 0 { mag = 1; }
    a.Mult(new_mag / mag);
}

func (a *Vec2[Number]) ClampMag(mini, maxi Number) {
    mag := a.Mag();
    if mag == 0 {
        // if the vector is zero, just set x to something. maybe a random vector?
        a.x = mini;
        return;
    }

    if        mag < mini { a.Mult(mini / mag);
    } else if mag > maxi { a.Mult(maxi / mag); }
}

func (a *Vec2[Float]) Normalize() { a.Mult(1 / a.Mag()); }

func Normalized[T Float](a Vec2[T]) Vec2[T] {
    a.Normalize();
    return a;
}

func Dist   [T Number](a, b Vec2[T]) T { return Sub(a, b).Mag(); }
//go:inline
func DistSqr[T Number](a, b Vec2[T]) T {
    x, y := (a.x-b.x), (a.y-b.y);
    return x*x + y*y;
}



const DEG_TO_RAD = math.Pi / 180;
const RAD_TO_DEG = 180 / math.Pi;

// in radians
func Random_unit_vector[T Float]() Vec2[T] {
    theta := rand_f64() * 2 * math.Pi;
    sin, cos := math.Sincos(theta);
    return Make_Vec2(T(cos), T(sin));
}

// in radians
func GetTheta[T Float](a Vec2[T]) T {
    return T(math.Atan2(float64(a.y), float64(a.x)));
}

// https://math.stackexchange.com/questions/2506306/rotation-of-a-vector-around-origin
//
// in radians
func Rotate[T Float](a Vec2[T], theta T) Vec2[T] {
    sin, cos := math.Sincos(float64(theta));

    x := float64(a.x)*cos - float64(a.y)*sin;
    y := float64(a.x)*sin + float64(a.y)*cos;

    return Vec2[T]{T(x), T(y)};
}

// in radians
func Unit_Vector_With_Rotation[T Float](theta T) Vec2[T] {
    sin, cos := math.Sincos(float64(theta));
    return Make_Vec2(T(cos), T(sin));
}


// kinda annoying that I have Boid_Float here, but I really only need these with the floats.


type Rectangle[T Number] struct {
    x, y, w, h T;
}

func make_rectangle[T Number](x, y, w, h T) Rectangle[T] {
    return Rectangle[T]{x: x, y: y, w: w, h: h};
}

// returns x, y, w, h
func (rect Rectangle[T]) Splat() (T, T, T, T) {
    return rect.x, rect.y, rect.w, rect.h;
}

// returns x1, y1, x2, y2
func (rect Rectangle[T]) Splat_Vec() (T, T, T, T) {
    return rect.x, rect.y, rect.x + rect.w, rect.x + rect.h;
}

func fix_rectangle_so_that_width_and_height_are_positive[T Number](r Rectangle[T]) Rectangle[T] {
    x, y, w, h := r.Splat();

    if w < 0 { x = x + w; w = -w; }
    if h < 0 { y = y + h; h = -h; }

    return make_rectangle(x, y, w, h);
}



type Line[T Number] struct {
    x1, y1, x2, y2 T;
}

func line_from_vec[T Number](a, b Vec2[T]) Line[T] {
    return Line[T]{
        x1: a.x, y1: a.y,
        x2: b.x, y2: b.y,
    };
}

func (line Line[T]) to_vec() (Vec2[T], Vec2[T]) {
    return Vec2[T]{line.x1, line.y1}, Vec2[T]{line.x2, line.y2};
}

func Scale[T Number](line Line[T], s T) Line[T] {
    line.x1 *= s;
    line.y1 *= s;
    line.x2 *= s;
    line.y2 *= s;
    return line;
}

func rectangle_to_lines[T Number](x, y, w, h T) [4]Line[T] {
    lines := [4]Line[T]{
        {x,     y,     x + w, y    },
        {x + w, y,     x + w, y + h},
        {x + w, y + h, x,     y + h},
        {x,     y + h, x,     y    },
    };
    return lines;
}
//go:inline
func rectangle_to_lines_r[T Number](r Rectangle[T]) [4]Line[T] { return rectangle_to_lines(r.x, r.y, r.w, r.h); }



// assert(x1 <= x2 && y1 <= y2);
type Axis_Aligned_Bounding_Box[T Number] struct {
    x1, y1, x2, y2 T;
}

//go:inline
func aabb_from_points[T Number](x1, y1, x2, y2 T) Axis_Aligned_Bounding_Box[T] {
    return Axis_Aligned_Bounding_Box[T]{
        x1: min(x1, x2), y1: min(y1, y2),
        x2: max(x1, x2), y2: max(y1, y2),
    };
}
//go:inline
func aabb_from_points_unchecked[T Number](x1, y1, x2, y2 T) Axis_Aligned_Bounding_Box[T] {
    return Axis_Aligned_Bounding_Box[T]{
        x1: x1, y1: y1,
        x2: x2, y2: y2,
    };
}
//go:inline
func aabb_from_line[T Number](l Line[T]) Axis_Aligned_Bounding_Box[T] { return aabb_from_points(l.x1, l.y1, l.x2, l.y2); }
//go:inline
func aabb_from_rect[T Number](r Rectangle[T]) Axis_Aligned_Bounding_Box[T] {
    x1, y1, x2, y2 := r.x, r.y, r.x + r.w, r.y + r.h;
    return aabb_from_points(x1, y1, x2, y2);
}
//go:inline
func aabb_from_rect_unchecked[T Number](r Rectangle[T]) Axis_Aligned_Bounding_Box[T] {
    x1, y1, x2, y2 := r.x, r.y, r.x + r.w, r.y + r.h;
    return aabb_from_points_unchecked(x1, y1, x2, y2);
}



///////////////////////////////////////////////////////
//              Collision Functions
///////////////////////////////////////////////////////


// point in rect
func point_rect_collision[T Number](x, y, rx, ry, rw, rh T) bool {
    return (rx <= x && x <= rx + rw) && (ry <= y && y <= ry + rh);
}
//go:inline
func point_rect_collision_vr[T Number](p Vec2[T], r Rectangle[T]) bool { return point_rect_collision(p.x, p.y, r.x, r.y, r.w, r.h); }


// returns weather it hit, and the location of the hit.
// 
// TODO accept all numbers? gotta refactor.
func line_line_intersection[T Number](x1, y1, x2, y2, x3, y3, x4, y4 T) (bool, Vec2[T]) {

    /*
    // calculate the distance to intersection point
    uA := ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    uB := ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    // TODO faster to always calc the loc?
    if (0 <= uA && uA <= 1) && (0 <= uB && uB <= 1) {
        loc := Vec2[T]{
            x1 + (uA * (x2-x1)),
            y1 + (uA * (y2-y1)),
        };
        return true, loc;
    }
    return false, Vec2[T]{};
    */



    // calculate the distance to intersection point
    uA_numerator   := ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3));
    uA_denominator := ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    uB_numerator   := ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3));
    uB_denominator := ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    // this might not handle the case where 'denominator' is zero...
    frac_is_0_to_1 := func(numerator, denominator T) bool {
        // check less than 0,
        //
        // if one is negative, and the other isn't, its less than zero.
        if (numerator < 0) != (denominator < 0) { return false; }

        // check if greater than 1
        if Abs(numerator) > Abs(denominator) { return false; }

        return true;
    }

    // TODO faster to always calc the loc?
    if frac_is_0_to_1(uA_numerator, uA_denominator) && frac_is_0_to_1(uB_numerator, uB_denominator) {
        // yes these are suppose'd to both be uA.
        loc := Vec2[T]{
            x1 + (uA_numerator * (x2-x1)) / uA_denominator,
            y1 + (uA_numerator * (y2-y1)) / uA_denominator,
        };
        return true, loc;
    }
    return false, Vec2[T]{};
}
//go:inline
func line_line_intersection_l[T Number](l1, l2 Line[T]) (bool, Vec2[T]) { return line_line_intersection(l1.x1, l1.y1, l1.x2, l1.y2, l2.x1, l2.y1, l2.x2, l2.y2); }


func aabb_aabb_collision[T Number](a, b Axis_Aligned_Bounding_Box[T]) bool {
    return (a.x2 >= b.x1) && (a.x1 <= b.x2) && (a.y2 >= b.y1) && (a.y1 <= b.y2);
}

