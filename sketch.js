function setup() {
	canvas = createCanvas(WIDTH, HEIGHT);
  scaleMultiplier = scaleToWindow(canvas.elt);
	document.addEventListener('contextmenu', event => event.preventDefault());
	noStroke();

	caveImg = createGraphics(WIDTH, HEIGHT);

	bin_lattice = new BinLattice(64);
	cave = new Cave();
	cave_generator = new CaveGenerator(cave, random(Date.now()), 42);
	cave_generator.generate();
	cave.render(caveImg);

	colors = [color(255, 0, 0), color(0, 255, 0)];

	flock = new Flock(400);
}

function update(dt) {
	bin_lattice.update(flock.boids);
	flock.behave();
	flock.update(dt);
}

function render() {
	image(caveImg, 0, 0);
	flock.render();
}

function draw() {
	let dt = deltaTime / 1000;
	if(dt >= 0.033) dt = 0.033;
	update(dt);
	render();
}

function windowResized() {
  scaleMultiplier = scaleToWindow(canvas.elt);
}