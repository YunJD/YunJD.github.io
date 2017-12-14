---
layout: markdown
title: Implicit Surface Rendering Experiment - Quick Help / Reference
---
# Implicit Surface Rendering Experiment - Quick Help / Reference

## Keyboard shortcuts

{:.shortcuts-table}
| **Escape** | Open bottom sheet |
| **Ctrl+Enter** | Compile SDF shader when bottom sheet is open |

## CSG

I'm simply going to provide a link to an article I found very helpful: [modeling with distance functions](http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm)

## Other signed distance functions

~~~glsl
//Simple plane:
return p.x - p.y - 1.;

//Paraboloid
return p.y - pow(p.x, 2.) / 350. - pow(p.x, 2.) / 350.;

//Hyperboloid
return p.y + pow(p.x, 2.) / 350. - pow(p.x, 2.) / 350.;

//Bubbly
return sin(p.x) * cos(p.z) - p.y;
~~~

## Included Functions

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

//Complex operations
vec2 cmul(in vec2 a, in vec2 b);
vec2 cdiv(in vec2 a, in vec2 b);
float cabs2(in vec2 a);
float cabs(in vec2 a);

//Quaternion operations
vec4 qmul(in vec4 q1, in vec4 q2);
~~~

## Graphical Glitch?

If you get a surface like the following:

<div class="large">
    <img src="{{site.baseurl}}/images/sdf-glitch.png" />
</div>

That means that the calculations are taking too many steps.  Other reasons could be that there are numerical errors, caused by the fact that squares have rapid increase.  The screenshot shows bounds of -400 to 400, and 400<sup>2</sup> is 160,000 (GPUs suck at tiny/large numbers it seems)!

### Option 1: Reduce Bounds

<div class="large">
    <img src="{{site.baseurl}}/images/sdf-reduce-bounds.png"/>
</div>

Reducing bounds realistically does something similar to axis scaling, i.e. we're hiding the parts the ray marcher is bad at.  It also causes the ray to start at the bounding box, which is closer to that part of the surface.

### Option 2: Increase the denominator of the squares (better scales)

<div class="large">
    <img src="{{site.baseurl}}/images/sdf-scale-dims.png" />
</div>

Increasing the denominator gives a more reasonable result.  Admittedly it means certain scales can't be visualized due to computational difficulties. Note that this is also similar to decreasing the bounds further.

### Results

<p class="large">
    <img src="{{site.baseurl}}/images/sdf-nice1.png" />
</p>

<p class="large">
    <img src="{{site.baseurl}}/images/sdf-nice2.png" />
</p>

Those steps will prevent sections where the ray marching diverges / can't find the threshold.  If better techniques are known, feel free to open issues and tell me how it's done!

