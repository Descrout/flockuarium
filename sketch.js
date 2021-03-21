let flock, bin_lattice, cave, cave_generator;

function setup() {
	createCanvas(windowWidth, windowHeight);
	document.addEventListener('contextmenu', event => event.preventDefault());
	noStroke();

	bin_lattice = new BinLattice(80);
	cave = new Cave(16);
	cave_generator = new CaveGenerator(cave, random(10000), 44);
	cave_generator.generate();

	flock = new Flock();
	for(let i = 0; i < 100; i++) {
		flock.add_to_tiles(cave_generator.rooms[0].tiles);
	}
}

function update(dt) {
	bin_lattice.update(flock.boids);
	flock.behave();
	flock.update(dt);
	if(mouseIsPressed) handle_wall();
}

function render() {
	cave.render();
	flock.render();
}

function draw() {
	let dt = deltaTime / 1000;
	if(dt >= 0.033) dt = 0.033;
	update(dt);
	background(92, 168, 230);
	render();
}


function handle_wall() {
	const i = floor(mouseX / cave.tile_size);
	const j = floor(mouseY / cave.tile_size);
	const cell = cave.get_tile(i, j);
	if(cell != -1) {
		if(mouseButton == LEFT) cave.grid[i][j] = 1;
		else if(mouseButton == RIGHT) cave.grid[i][j] = 0;
	}
}