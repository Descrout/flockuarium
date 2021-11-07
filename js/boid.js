class Boid {
	constructor(x, y) {
		this.pos = Vec2.create(x, y);
        this.vel = Vec2.create(0, 0);
        this.acc = Vec2.create(random(-2,2), random(-2,2));

		this.r = HALF_TILE * 0.75;
		this.max_speed = 3;
		this.max_force = 0.14;
    	this.color = floor(random(colors.length));
    	this.angle = 0;
		this.heading = 0;

		this.ray = new Ray(10);
	}

	apply_force(force) {
		Vec2.add(this.acc, force, this.acc);
	}

	flock(locals) {
		const sep = this.seperate(locals);
		const ali = this.align(locals);
		const coh = this.cohesion(locals);

		Vec2.mult(sep, 1.2, sep);
		//Vec2.mult(ali, 1.1, ali);
		//Vec2.mult(coh, 1.1, coh);

		this.apply_force(sep);
		this.apply_force(ali);
		this.apply_force(coh);

		vec_pool.store(sep);
		vec_pool.store(ali);
		vec_pool.store(coh);
	}

	avoid() {
		const out = vec_pool.retrieve(0, 0);
	    const result = this.ray.cast(this.pos[0], this.pos[1], this.heading, out);
		if(!result) return Vec2.set(out, 0, 0);

		const d = Vec2.dist(this.pos, out);
		out[0] -= result.i * TILE_SIZE + HALF_TILE;
		out[1] -= result.j * TILE_SIZE + HALF_TILE;
		Vec2.setMag(out, this.max_speed / d);
		//Vec2.limit(out, this.max_force);
		return out;
	}

	seperate(locals) {
		const steer = vec_pool.retrieve(0, 0);
		let count = 0;

		for(const other of locals) {
			const d = Vec2.dist(this.pos, other.pos);
			const diff = vec_pool.retrieve(0, 0);
			Vec2.sub(this.pos, other.pos, diff);
			Vec2.normalize(diff, diff);
			Vec2.div(diff, d, diff);
			Vec2.add(steer, diff, steer);
			vec_pool.store(diff);
			count += 1;
		}

		if(count > 0) Vec2.div(steer, count, steer);
		if(Vec2.mag(steer) > 0) {
			Vec2.setMag(steer, this.max_speed);
			Vec2.sub(steer, this.vel, steer);
			Vec2.limit(steer, this.max_force);
		}

		return steer;
	}

	align(locals) {
		const sum = vec_pool.retrieve(0, 0);
		let count = 0;

		for(const other of locals) {
			if(this.color != other.color) continue;
			Vec2.add(sum, other.vel, sum);
			count += 1;
		}

		if(count > 0) {
			Vec2.div(sum, count, sum);
			Vec2.normalize(sum, sum);
			Vec2.mult(sum, this.max_speed, sum);
			Vec2.sub(sum, this.vel, sum);
			Vec2.limit(sum, this.max_force);
		}

		return sum;
	}

	cohesion(locals) {
		const sum = vec_pool.retrieve(0, 0);
		let count = 0;

		for(const other of locals) {
			if(this.color != other.color) continue;
			Vec2.add(sum, other.pos, sum);
			count += 1;
		}

		if(count > 0) {
			Vec2.div(sum, count, sum);
			return this.seek(sum);
		}

		return sum;
	}

	seek(target) {
		Vec2.sub(target, this.pos, target);
		Vec2.setMag(target, this.max_speed);

		Vec2.sub(target, this.vel, target);
		Vec2.limit(target, this.max_force);

		return target;
	}

	borders() {
		if(this.pos[0] < -this.r) this.pos[0] = width + this.r;
		if(this.pos[1] < -this.r) this.pos[1] = height + this.r;
		if(this.pos[0] > width + this.r) this.pos[0] = -this.r;
		if(this.pos[1] > height + this.r) this.pos[1] = -this.r;
	}

	update() {
		Vec2.add(this.vel, this.acc, this.vel);
		Vec2.limit(this.vel, this.max_speed);
		Vec2.add(this.pos, this.vel,this.pos);
		this.acc[0] = 0;
		this.acc[1] = 0;

		this.heading = Vec2.angle(this.vel);
		const target_angle = this.heading + PI/2;
		const da = (target_angle - this.angle) % TWO_PI;
    const short = 2 * da % TWO_PI - da;
    this.angle += short * 0.1;
	}

	render() {
    push();
    noStroke();
    fill(colors[this.color]);
    translate(this.pos[0], this.pos[1]);
    rotate(this.angle);
    beginShape();
    vertex(0, -this.r*2);
    vertex(-this.r, this.r*2);
    vertex(this.r, this.r*2);
    endShape(CLOSE);
    pop();
	}
}