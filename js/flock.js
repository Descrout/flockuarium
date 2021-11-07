class Flock {
	constructor(count) {
		this.boids = [];
		for(let i = 0; i < count; i++) {
			const tile = random(cave_generator.rooms[0].tiles);
			this.add(tile.x * TILE_SIZE + HALF_TILE, tile.y * TILE_SIZE + HALF_TILE);
		}
	}

	add(x, y) {
		this.boids.push(new Boid(x, y));
	}

	behave() {
		for(const boid of this.boids) {
			const locals = bin_lattice.retrieve(boid);
			boid.flock(locals);

			if(mouseIsPressed) {
				const seek = boid.seek(vec_pool.retrieve(mouseX / scaleMultiplier, mouseY / scaleMultiplier));
				Vec2.mult(seek, 1, seek);
				boid.apply_force(seek);
				vec_pool.store(seek);
			}

			const avo = boid.avoid();
			Vec2.mult(avo, 3, avo);
			boid.apply_force(avo);
			vec_pool.store(avo);
		}
	}

	update(dt) {
		for(const boid of this.boids) {
			boid.update();
			boid.borders();
		}
	}

	render() {
		for(const boid of this.boids) {
			boid.render();
		}
	}
}