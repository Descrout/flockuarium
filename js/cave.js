class Cave {
  constructor() {
    this.w = ceil(width / TILE_SIZE);
    this.h = ceil(height / TILE_SIZE);
    this.width = this.w * TILE_SIZE;
    this.height = this.h * TILE_SIZE;
    
    this.grid = new Array(this.w);
    for(let i = 0; i < this.w; i++) {
      this.grid[i] = new Array(this.h);
      for(let j = 0; j < this.h; j++) {
        this.grid[i][j] = 0;
      }
    }
  }
  
  get_tile_at(x, y) {
    if(x < 0 || y < 0 || x >= this.width || y >= this.height)
      return -1;
    const i = floor(x / TILE_SIZE);
    const j = floor(y / TILE_SIZE);
    return this.grid[i][j];
  }
  
  get_tile(i, j) {
    if(i < 0 || j < 0 || i >= this.w || j >= this.h)
      return -1;
    return this.grid[i][j];
  }
  
  per_tile(cb) {
    for(let i = 0; i < this.w; i++) {
      for(let j = 0; j < this.h; j++) {
        cb(i, j);
      }
    }
  }
  
  render(to) {
    to.background(40);
    to.fill(0);
    to.noStroke();
    this.per_tile((i, j) => {
      if(this.grid[i][j] == 1) 
        to.square(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE);
    });
  }
}