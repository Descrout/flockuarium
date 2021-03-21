class BinLattice {
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
        this.grid[i][j] = [];
      }
    }
  }
  
  refresh() {
    for(let i = 0; i < this.w; i++) {
      for(let j = 0; j < this.h; j++) {
        this.grid[i][j].length = 0;
      }
    }
  }

  update(objs) {
    this.refresh();
    for(const obj of objs) bin_lattice.insert(obj);
  }

  insert(obj) {
    const i = floor(obj.pos.x / this.tile_size);
    const j = floor(obj.pos.y / this.tile_size);
    if(this.tile_in_bound(i, j)) this.grid[i][j].push(obj);
  }

  retrieve(obj) {
    const i = floor(obj.pos.x / this.tile_size);
    const j = floor(obj.pos.y / this.tile_size);

    if(this.tile_in_bound(i, j)) return this.grid[i][j];
    return [];
  }
  
  pos_in_bound(x, y) {
    return !(x < 0 || y < 0 || x >= this.width || y >= this.height);
  }

  tile_in_bound(i, j) {
    return !(i < 0 || j < 0 || i >= this.w || j >= this.h);
  }
}