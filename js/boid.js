class Boid {
	constructor(x, y) {
		this.pos = createVector(x, y);
		this.acc = createVector(0, 0);
		this.vel = createVector(random(-2,2), random(-2,2));
		this.r = 4;
		this.max_speed = 5;
		this.max_force = 0.1;
    	this.color = color(random(255),random(255),random(255));
    	this.angle = 0;
	}

	apply_force(force) {
		this.acc.add(force);
	}

	flock(locals) {
		const sep = this.seperate(locals);
		const ali = this.align(locals);
		const coh = this.cohesion(locals);

		sep.mult(1.4);
		ali.mult(1);
		coh.mult(1);

		this.apply_force(sep);
		this.apply_force(ali);
		this.apply_force(coh);
	}

	avoid() {
		const front = p5.Vector.add(this.pos, this.vel);
	    const result = Ray.cast(this.pos, front);
		if(!result) return createVector(0, 0);

		const mid = createVector(result.tile.x * cave.tile_size + cave.tile_size / 2,
			result.tile.y * cave.tile_size + cave.tile_size / 2);
		const d = p5.Vector.dist(this.pos, result.pos);
		const steer = p5.Vector.sub(result.pos, mid);
		steer.setMag(this.max_speed / d);
		//steer.limit(this.max_force);
		return steer;
	}

	seperate(locals) {
		const steer = createVector(0, 0);
		let count = 0;

		for(const other of locals) {
			if(other == this) continue;
			const d = p5.Vector.dist(this.pos, other.pos);
			const diff = p5.Vector.sub(this.pos, other.pos);
			diff.normalize();
			diff.div(d);
			steer.add(diff);
			count += 1;
		}

		if(count > 0) steer.div(count);
		if(steer.mag() > 0) {
			steer.setMag(this.max_speed);
			steer.sub(this.vel);
			steer.limit(this.max_force);
		}

		return steer;
	}

	align(locals) {
		const sum = createVector(0, 0);
		let count = 0;

		for(const other of locals) {
			if(other == this) continue;
			sum.add(other.vel);
			count += 1;
		}

		if(count > 0) {
			sum.div(count);
			sum.normalize();
			sum.mult(this.max_speed);
			const steer = p5.Vector.sub(sum, this.vel);
			steer.limit(this.max_force);
			return steer;
		}

		return sum;
	}

	cohesion(locals) {
		const sum = createVector(0, 0);
		let count = 0;

		for(const other of locals) {
			if(other == this) continue;
			sum.add(other.pos);
			count += 1;
		}

		if(count > 0) {
			sum.div(count);
			return this.seek(sum);
		}

		return sum;
	}

	seek(target) {
		const desired = p5.Vector.sub(target, this.pos);

		desired.setMag(this.max_speed);

		const steer = p5.Vector.sub(desired, this.vel);
		steer.limit(this.max_force);

		return steer;
	}

	arrive(target) {
		const desired = p5.Vector.sub(target, this.pos);
		const d = desired.mag();

		if(d < 100) {
			const m = map(d, 0, 100, 0, this.max_speed);
			desired.setMag(m);
		}else {
			desired.setMag(this.max_speed);
		}

		const steer = p5.Vector.sub(desired, this.vel);
		steer.limit(this.max_force);

		return steer;
	}

	borders() {
		if(this.pos.x < -this.r) this.pos.x = width + this.r;
		if(this.pos.y < -this.r) this.pos.y = height + this.r;
		if(this.pos.x > width + this.r) this.pos.x = -this.r;
		if(this.pos.y > height + this.r) this.pos.y = -this.r;
	}

	update(dt) {
		this.vel.add(this.acc);
		this.vel.limit(this.max_speed);
		this.pos.add(this.vel);
		this.acc.mult(0);

		const target_angle = this.vel.heading() + PI/2;
		const da = (target_angle - this.angle) % TWO_PI;
        const short = 2 * da % TWO_PI - da;
        this.angle += short * 0.1;
	}

	render() {
	    fill(this.color);
	    push();
	    translate(this.pos.x, this.pos.y);
	    rotate(this.angle);
	    beginShape();
	    vertex(0, -this.r*2);
	    vertex(-this.r, this.r*2);
	    vertex(this.r, this.r*2);
	    endShape(CLOSE);
	    pop();
	}
}