class Cave {
  constructor(tile_size) {
    this.tile_size = tile_size;
    this.w = ceil(width / tile_size);
    this.h = ceil(height / tile_size);
    this.width = this.w * tile_size;
    this.height = this.h * tile_size;
    
    this.grid = new Array(this.w);
    for(let i = 0; i < this.w; i++) {
      this.grid[i] = new Array(this.h);
      for(let j = 0; j < this.h; j++) {
        this.grid[i][j] = 0;
      }
    }
  }
  
  get_tile_by_pos(x, y) {
    if(x < 0 || y < 0 || x >= this.width || y >= this.height)
      return -1;
    const i = floor(x / this.tile_size);
    const j = floor(y / this.tile_size);
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
  
  render() {
    fill(71, 43, 40);
    this.per_tile((i, j) => {
      if(this.grid[i][j] == 1) 
        square(i * this.tile_size, j * this.tile_size, this.tile_size);
    });
  }
}