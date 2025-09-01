export default `
/* Intersection tests
 * Although these can be used to ray trace shapes, they're really meant to provide bounds for
 * rendering, which can speed things up. For example, sphere intersections can skip a few steps
 * if we know an sdf is bounded within.
 * AABB is an Axis-Aligned Bounding Box
 */
bool insideAABB(in vec3 b1, in vec3 b2, in vec3 p) {
    return p.x >= b1.x && p.x <= b2.x
        && p.y >= b1.y && p.y <= b2.y
        && p.z >= b1.z && p.z <= b2.z;
}

bool intersectAABB(in vec3 b1, in vec3 b2, in vec3 rp, in vec3 rd, out float t0, out float t1) {
    bvec3 isNeg = bvec3(
        rd.x < 0.,
        rd.y < 0.,
        rd.z < 0.
    );

    vec3 invDir = 1. / rd;

    float tmin, tmax, ttmin, ttmax;
    tmin = isNeg.x ? (b2.x - rp.x) * invDir.x : (b1.x - rp.x) * invDir.x;
    tmax = isNeg.x ? (b1.x - rp.x) * invDir.x : (b2.x - rp.x) * invDir.x;

    ttmin = isNeg.y ? (b2.y - rp.y) * invDir.y : (b1.y - rp.y) * invDir.y;
    ttmax = isNeg.y ? (b1.y - rp.y) * invDir.y : (b2.y - rp.y) * invDir.y;

    if((ttmin > tmax) || (ttmax < tmin)) {
        return false;
    }

    tmin = max(tmin, ttmin);
    tmax = min(tmax, ttmax);

    ttmin = isNeg.z ? (b2.z - rp.z) * invDir.z : (b1.z - rp.z) * invDir.z;
    ttmax = isNeg.z ? (b1.z - rp.z) * invDir.z : (b2.z - rp.z) * invDir.z;

    if((ttmin > tmax) || (ttmax < tmin)) {
        return false;
    }

    t0 = max(tmin, ttmin);
    t1 = min(tmax, ttmax);

    return true;
}

bool quadratic(float a, float b, float c, out float tmin, out float tmax) {
    float discr = b * b - 4. * a * c;
    if(discr < 0.) {
        return false;
    }
    if(discr == 0.) {
        tmin = tmax = -0.5 * b / a;
    }
    else {
        float q = -0.5 * (b > 0.
            ? b + sqrt(discr)
            : b - sqrt(discr)
        );
        float x0 = q / a;
        float x1 = c / q;
        tmin = min(x0, x1);
        tmax = max(x0, x1);
    }
    return true;
}

bool intersectSphere(float radius, in vec3 rp, in vec3 rd, out float tmin, out float tmax) {
    float a = dot(rd, rd);
    float b = 2. * dot(rd, rp);
    float c = dot(rp, rp) - radius * radius;
    if(!quadratic(a, b, c, tmin, tmax)) {
        return false;
    }
    return true;
}
`
