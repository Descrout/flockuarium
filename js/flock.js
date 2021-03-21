class Flock {
	constructor() {
		this.boids = [];
	}

	add(x, y) {
		this.boids.push(new Boid(x, y));
	}

	add_to_tiles(tiles) {
		const tile = random(tiles);
		this.add(tile.x * cave.tile_size + cave.tile_size / 2, tile.y * cave.tile_size + cave.tile_size / 2);
	}

	behave() {
		for(const boid of this.boids) {
			const locals = bin_lattice.retrieve(boid);
			boid.flock(locals);

			if(mouseIsPressed && mouseButton == CENTER) {
				const seek = boid.seek(createVector(mouseX, mouseY));
				seek.mult(0.5);
				boid.apply_force(seek);
			}

			const avo = boid.avoid();
			avo.mult(3);
			boid.apply_force(avo);
		}
	}

	update(dt) {
		for(const boid of this.boids) {
			boid.update(dt);
			boid.borders();
		}
	}

	render() {
		for(const boid of this.boids) {
			boid.render();
		}
	}
}