function create2DArray(w, h) {
  const arr = new Array(w);
  
  for(let i = 0; i < w; i++) {
    arr[i] = new Array(h);
  }
  
  return arr;
}

class Room {
  constructor(tiles, map) {
    this.tiles = tiles;
    this.size = tiles.length;
    this.edge_tiles = [];
    this.connected_rooms = [];
    this.is_main = false;
    this.accessible_from_main = false;
    
    for(const tile of tiles) {
       for(let i = tile.x - 1; i <= tile.x + 1; i++) {
        for(let j = tile.y - 1; j <= tile.y + 1; j++) {
          if(i == tile.x || j == tile.y) {
            if(map[i][j] == 1) {
              this.edge_tiles.push(tile);
            }
          }   
        }
       }
    }
  }
  
  set_accessible_from_main() {
    if(!this.accessible_from_main) {
      this.accessible_from_main = true;
      for(const connected of this.connected_rooms) {
        connected.set_accessible_from_main();
      }
    }
  }
  
  static connect_rooms(room_a, room_b) {
    if(room_a.accessible_from_main) {
      room_b.set_accessible_from_main();
    }else if(room_b.accessible_from_main) {
      room_a.set_accessible_from_main();
    }
    room_a.connected_rooms.push(room_b);
    room_b.connected_rooms.push(room_a);
  }
  
  is_connected(other) {
    return this.connected_rooms.includes(other);
  }
}

class CaveGenerator {
  constructor(cave, seed, percent) {
    this.seed = seed;
    this.randomFillPercent = percent;
    this.smoothingStep = 5;
    this.neighborLookup = 4;


    this.map = cave.grid;
    this.w = cave.w;
    this.h = cave.h;
  }

  generate() {
    this.rooms = [];
    this.corridors = [];

    for (let i = 0; i < this.w; i++) {
      for (let j = 0; j < this.h; j++) {
        this.map[i][j] = 0;
      }
    }

    this.fillMap();

    for (let i = 0; i < this.smoothingStep; i++) {
      this.smoothMap();
    }

    this.polish_map(50, 50);
  }

  smoothMap() {
    for (let i = 0; i < this.w; i++) {
      for (let j = 0; j < this.h; j++) {
        const neighborCount = this.getNeighborCount(i, j);
        if (neighborCount > 4) {
          this.map[i][j] = 1;
        }else if (neighborCount < this.neighborLookup) {
          this.map[i][j] = 0;
        }
      }
    }
  }

  in_bounds(x, y) {
    return x >= 0 && x < this.w && y >= 0 && y < this.h;
  }
  
  getNeighborCount(i, j) {
    let count = 0;
    for (let x = i - 1; x <= i + 1; x++) {
      for (let y = j - 1; y <= j + 1; y++) {
        if (this.in_bounds(x, y)) {
          if (x != i || y != j) count += this.map[x][y];
        }else {
          count++;
        }
  
      }
    }
    return count;
  }

  fillMap() {
    randomSeed(this.seed);

    for (let i = 0; i < this.w; i++) {
      for (let j = 0; j < this.h; j++) {
        if (i == 0 || i == this.w - 1 || j == 0 || j == this.h - 1) this.map[i][j] = 1;
        else this.map[i][j] = (random(0, 100) < this.randomFillPercent) ? 1 : 0;
      }
    }
  }

  get_regions(tile_type) {
    const regions = [];
    const map_flags = create2DArray(this.w, this.h);
    
    for (let i = 0; i < this.w; i++) {
      for (let j = 0; j < this.h; j++) {
        if(!map_flags[i][j] && this.map[i][j] == tile_type) {
          const region = this.get_region(i, j);
          regions.push(region);
          
          for(const tile of region) {
            map_flags[tile.x][tile.y] = 1;
          }
        }
      }
    }
    return regions;
  }
  
  get_region(start_x, start_y) {
    const tiles = [];
    const tile_type = this.map[start_x][start_y];
    const map_flags = create2DArray(this.w, this.h);
    
    const queue = [];
    queue.push({x: start_x, y: start_y});
    map_flags[start_x][start_y] = 1;
    
    while(queue.length) {
      const tile = queue.shift();
      tiles.push(tile);
      
      for(let i = tile.x - 1; i <= tile.x + 1; i++) {
        for(let j = tile.y - 1; j <= tile.y + 1; j++) {
          if(this.in_bounds(i, j) && (j == tile.y || i == tile.x)) {
            if(!map_flags[i][j] && this.map[i][j] == tile_type) {
              map_flags[i][j] = 1;
              queue.push({x: i, y: j});
            }
          }
        }
      }
    }
    return tiles;
  }
  
  polish_map(wall_threshold, room_threshold) {
    const wall_regions = this.get_regions(1);
    for(const region of wall_regions) {
      if(region.length < wall_threshold) {
        for(const tile of region) {
          this.map[tile.x][tile.y] = 0;
        }
      }
    }
    
    const room_regions = this.get_regions(0);
    const survived_rooms = [];
    
    for(const region of room_regions) {
      if(region.length < room_threshold) {
        for(const tile of region) {
          this.map[tile.x][tile.y] = 1;
        }
      }else {
        survived_rooms.push(new Room(region, this.map)); 
      }
    }
    
    const sorted = survived_rooms.sort((a, b) => b.size - a.size);
    sorted[0].is_main = true;
    sorted[0].accessible_from_main = true;
    
    this.connect_closest_rooms(sorted, false);
    this.rooms = sorted;
  }
  
  connect_closest_rooms(rooms, force_acces_to_main) {
    let room_list_a = [];
    let room_list_b = [];
    
    if(force_acces_to_main) {
      for(const room of rooms) {
        if(room.accessible_from_main) {
          room_list_b.push(room);
        }else {
          room_list_a.push(room);
        }
      }
    } else {
      room_list_a = rooms;
      room_list_b = rooms;
    }
    
    let best_distance = 0;
    let best_tile_a, best_tile_b;
    let best_room_a, best_room_b;
    let possible_connection_found = false;
    
    for(const room_a of room_list_a) {
     if(!force_acces_to_main) {
       possible_connection_found = false;
       if(room_a.connected_rooms.length > 0) {
         continue;
       }
     }
      
      for(const room_b of room_list_b) {
        if(room_a == room_b || room_a.is_connected(room_b)) continue;
           
        for(let idx_a = 0; idx_a < room_a.edge_tiles.length; idx_a++) {
          for(let idx_b = 0; idx_b < room_b.edge_tiles.length; idx_b++) {
            const tile_a = room_a.edge_tiles[idx_a];
            const tile_b = room_b.edge_tiles[idx_b];
            const distance = (tile_a.x - tile_b.x) * (tile_a.x - tile_b.x) + 
                  (tile_a.y - tile_b.y) * (tile_a.y - tile_b.y);
            if(distance < best_distance || !possible_connection_found) {
              best_distance = distance;
              possible_connection_found = true;
              best_tile_a = tile_a;
              best_tile_b = tile_b;
              best_room_a = room_a;
              best_room_b = room_b;
            }
          }  
        }
      }
      
      if(possible_connection_found && !force_acces_to_main) {
        this.create_passage(best_room_a, best_room_b, best_tile_a, best_tile_b);
      }
    }
    
    if(possible_connection_found && force_acces_to_main) {
      this.create_passage(best_room_a, best_room_b, best_tile_a, best_tile_b);
      this.connect_closest_rooms(rooms, true);
    }
    
    if(!force_acces_to_main) {
      this.connect_closest_rooms(rooms, true);
    }
  }
  
  create_passage(room_a, room_b, tile_a, tile_b) {
    Room.connect_rooms(room_a, room_b);

    const line_tiles = this.get_line(tile_a, tile_b);
  
    const corridor = new Map();
    
    for(const tile of line_tiles) {
      const carved = this.carve_circle(tile, random([1,2]));
      for(const c_tile of carved) {
        corridor.set(`${c_tile.x},${c_tile.y}`, c_tile);
      }
    }
    
    this.corridors.push(Array.from(corridor.values()));
  }
  
  carve_circle(pos, r) {
    const carved = []
    for(let i = -r; i <= r; i++) {
      for(let j = -r; j <= r; j++) {
        if(i*i + j*j <= r*r) {
          const carve_x = pos.x + i;
          const carve_y = pos.y + j;
          if(this.in_bounds(carve_x, carve_y) && this.map[carve_x][carve_y]) {
            this.map[carve_x][carve_y] = 0;
            carved.push({x: carve_x, y: carve_y});
          }
        }
      }
    }
    return carved;
  }
  
  get_line(from, to) {
    const line_tiles = [];
    
    let x = from.x;
    let y = from.y;
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    let step = Math.sign(dx);
    let gradient_step = Math.sign(dy);
    
    let longest = abs(dx);
    let shortest = abs(dy);
    
    let inverted = false;
    
    if(longest < shortest) {
      inverted = true;
      longest = abs(dy);
      shortest = abs(dx);
      
      step = Math.sign(dy);
      gradient_step = Math.sign(dx);
    }
    
    let gradient_acc = longest / 2;
    for( let i = 0; i < longest; i++) {
      line_tiles.push({x: x, y: y});
      if(inverted) {
        y += step;
      }else {
        x += step;
      }
      
      gradient_acc += shortest;
      if(gradient_acc >= longest) {
        if(inverted) {
          x += gradient_step;
        }else {
          y += gradient_step;
        }
        gradient_acc -= longest;
      }
    }
    return line_tiles;
  }
}