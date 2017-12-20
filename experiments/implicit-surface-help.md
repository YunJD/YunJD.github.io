---
layout: markdown
title: Distance Field Experiment Help / Reference
---
# YJD
## Distance Field Experiment Help & Reference

### Keyboard shortcuts

{:.shortcuts-table}
| **Shift + Escape** | Open bottom sheet |
| **Ctrl + Enter** | Compile SDF shader when bottom sheet is open |

### Distance Fields

I'm simply going to provide a link to an article, but the whole site is filled with gems: [modeling with distance functions](http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm).  



### Included Functions

These functions have been implemented and can be called in the code block.

~~~glsl
//b1 - Lower bounds
//b2 - Upper bounds
//p - A point
//Returns: Whether or not p is between b1 and b2
bool insideAABB(in vec3 b1, in vec3 b2, in vec3 p);

//b1 - Lower bounds
//b2 - Upper bounds
//rp - Ray point
//rd - Ray direction
//t0 - Minimum t along rd that intersects the bounds
//t1 - Maximum t along rd that intersects the bounds
//Returns; True if the ray intersected the bounds
bool intersectAABB(in vec3 b1, in vec3 b2, in vec3 rp, in vec3 rd, out float t0, out float t1);

//Solves the equation a * x^2 + b * x + c, other parameters are similar to the intersect equation.
bool quadratic(float a, float b, float c, out float tmin, out float tmax);

//Intersect a sphere with radius <radius>, other parameters are similar to intersectAABB
bool intersectSphere(float radius, in vec3 rp, in vec3 rd, out float tmin, out float tmax);

//CSG operations
/* These take a vec2 since one of the parameters will specify a primitive.  This allows for identification, 
 * optimizations (e.g. when computing gradients), and different materials.
 */
vec2 opUnion(in vec2 a, in vec2 b)

//Complex operations
vec2 cmul(in vec2 a, in vec2 b);
vec2 cdiv(in vec2 a, in vec2 b);
float cabs2(in vec2 a);
float cabs(in vec2 a);

//Quaternion operations
vec4 qmul(in vec4 q1, in vec4 q2);

//Fractals
float julia4D(in vec4 p, in vec4 c)
vec4 julia4DGrad(in vec4 p, in vec4 c)

//Numerical Differentiation
/* This uses a macro so a function can be specified.
 * fn - function with the signature float f(in vec3 p)
 * p - vec3 or vec4 variable, point at which to differentiate
 * delta - float, the delta term in the derivative equation
 */
#define NUM_GRAD3(fn, p, delta)
~~~
