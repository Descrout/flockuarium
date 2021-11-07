const TILE_SIZE = 4;
const HALF_TILE = 2;
const EMPTY_ARR = [];
let flock, bin_lattice, cave, cave_generator, colors;

function create2DArray(w, h) {
    const arr = new Array(w);

    for (let i = 0; i < w; i++) {
        arr[i] = new Array(h);
    }

    return arr;
}

class Vec2 {
    static create(x, y) {
        return new Float32Array([x || 0, y || 0]);
    }

    static set(a, x, y) {
        a[0] = x;
        a[1] = y;
        return a;
    }

    static add(a, b, out) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
    }

    static sub(a, b, out) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
    }

    static mult(a, v, out) {
        out[0] = a[0] * v;
        out[1] = a[1] * v;
    }

    static div(a, v, out) {
        out[0] = a[0] / v;
        out[1] = a[1] / v;
    }

    static mag(a) {
        return Math.sqrt(Vec2.magSq(a));
    }

    static setMag(a, v) {
        Vec2.normalize(a, a);
        Vec2.mult(a, v, a);
    }

    static limit(a, v) {
        if(Vec2.mag(a) > v) Vec2.setMag(a, v);
    }

    static magSq(a) {
        const x = a[0];
        const y = a[1];
        return x * x + y * y;
    }

    static normalize(a, out) {
        const mag = Vec2.mag(a);
        const scale = (mag == 0) ? 0 : 1 / mag;
        out[0] = a[0] * scale;
        out[1] = a[1] * scale;
    }

    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }

    static dotNorm(a, b) {
        return Vec2.dot(a, b) / (Vec2.mag(a) * Vec2.mag(b));
    }

    static angle(a) {
        return Math.atan2(a[1], a[0]);
    }

    //trig[0] = cos(angle), trig[1] = sin(angle)
    static rotate_origin(vec, origin, trig, out) {
        const x = vec[0] - origin[0];
        const y = vec[1] - origin[1];

        out[0] = (trig[0] * x - trig[1] * y) + origin[0];
        out[1] = (trig[1] * x + trig[0] * y) + origin[1];
    }

    //trig[0] = cos(angle), trig[1] = sin(angle)
    static rotate(vec, trig, out) {
        const x = vec[0];
        const y = vec[1];

        out[0] = trig[0] * x - trig[1] * y;
        out[1] = trig[1] * x + trig[0] * y;
    }

    static dist(a, b) {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class Line{
    constructor(x1, y1, x2, y2) {
        this.start = Vec2.create(0, 0);
        this.end = Vec2.create(0, 0);
        this.unit = Vec2.create(0, 0);

        this.reinit(x1, y1, x2, y2);
    }

    reinit(x1, y1, x2, y2) {
        Vec2.set(this.start, x1, y1);
        Vec2.set(this.end, x2, y2);

        this.calc_unit();

        return this;
    }

    calc_unit() {
        Vec2.sub(this.end, this.start, this.unit);
        Vec2.normalize(this.unit, this.unit);
    }
}

class Ray {
    constructor(len) {
        this.len = len;
        this.start = Vec2.create(0, 0);
        this.dir = Vec2.create(0, 0);
    }

    cast(x, y, angle, out) {
        const ray_start = Vec2.set(this.start, x, y);
        Vec2.div(ray_start, TILE_SIZE, ray_start);

        const ray_dir = Vec2.set(this.dir, Math.cos(angle), Math.sin(angle));

        const step_size = {
            x: Math.sqrt(1 + (ray_dir[1] * ray_dir[1]) / (ray_dir[0] * ray_dir[0])),
            y: Math.sqrt(1 + (ray_dir[0] * ray_dir[0]) / (ray_dir[1] * ray_dir[1]))
        };

        const map_check = {
            x: Math.floor(ray_start[0]),
            y: Math.floor(ray_start[1])
        };

        const ray_len = { x: 0, y: 0 };
        const step = { x: 0, y: 0 };

        if (ray_dir[0] < 0) {
            step.x = -1;
            ray_len.x = (ray_start[0] - map_check.x) * step_size.x;
        } else {
            step.x = 1;
            ray_len.x = ((map_check.x + 1) - ray_start[0]) * step_size.x;
        }

        if (ray_dir[1] < 0) {
            step.y = -1;
            ray_len.y = (ray_start[1] - map_check.y) * step_size.y;
        } else {
            step.y = 1;
            ray_len.y = ((map_check.y + 1) - ray_start[1]) * step_size.y;
        }

        let distance = 0;
        while (distance < this.len) {
            if (ray_len.x < ray_len.y) {
                map_check.x += step.x;
                distance = ray_len.x;
                ray_len.x += step_size.x;
            } else {
                map_check.y += step.y;
                distance = ray_len.y;
                ray_len.y += step_size.y;
            }
            if (distance < this.len && cave.get_tile(map_check.x, map_check.y) === 1) {
                Vec2.mult(ray_dir, distance, ray_dir);
                Vec2.add(ray_start, ray_dir, out);
                Vec2.mult(out, TILE_SIZE, out);
                return { i: map_check.x, j: map_check.y, len: distance };
            }
        }

        Vec2.mult(ray_dir, this.len, ray_dir);
        Vec2.add(ray_start, ray_dir, out);
        Vec2.mult(out, TILE_SIZE, out);
        return null;
    }
}

class VecPool {
    constructor(count) {
        this.vecs = [];
        for(let i = 0; i < count; i++) {
            this.vecs.push(Vec2.create(0, 0));
        }
    }

    retrieve(x, y) {
        return Vec2.set(this.vecs.pop(), x, y);
    }

    store(vec) {
        this.vecs.push(vec);
    }
}

const vec_pool = new VecPool(50);
