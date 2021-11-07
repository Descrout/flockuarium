class BinLattice {
  constructor(tile_size) {
    this.tile_size = tile_size;
    this.w = ceil(WIDTH / tile_size);
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
    const i = floor(obj.pos[0] / this.tile_size);
    const j = floor(obj.pos[1] / this.tile_size);
    if(this.tile_in_bound(i, j)) this.grid[i][j].push(obj);
  }

  retrieve(obj) {
    const i = floor(obj.pos[0] / this.tile_size);
    const j = floor(obj.pos[1] / this.tile_size);

    if(this.tile_in_bound(i, j)) return this.grid[i][j].filter(el => el != obj);
    return EMPTY_ARR;
  }

  tile_in_bound(i, j) {
    return (i >= 0 && j >= 0 && i < this.w && j < this.h);
  }
}