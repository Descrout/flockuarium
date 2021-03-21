class Ray {
  static cast(start, target, _len) {
    const len = _len || 5;
    const ray_start = p5.Vector.div(start, cave.tile_size);
    const target_cell = p5.Vector.div(target, cave.tile_size);
    /*const target_cell = createVector(
      ray_start.x + cos(angle + this.angle_offset) * 3,
      ray_start.y + sin(angle + this.angle_offset) * 3 );*/
        
    const ray_dir = p5.Vector.sub(target_cell, ray_start).normalize();

    const step_size = {
      x: sqrt(1 + (ray_dir.y * ray_dir.y) / (ray_dir.x * ray_dir.x)),
      y: sqrt(1 + (ray_dir.x * ray_dir.x) / (ray_dir.y * ray_dir.y))
    };
    
    const map_check = {
      x: floor(ray_start.x),
      y: floor(ray_start.y)
    };
    const ray_len = {x: 0, y: 0};
    const step = {x: 0, y: 0};
    
    if(ray_dir.x < 0){
      step.x = -1;
      ray_len.x = (ray_start.x - map_check.x) * step_size.x;
    }else {
      step.x = 1;
      ray_len.x = ((map_check.x + 1) - ray_start.x) * step_size.x;
    }

    if(ray_dir.y < 0){
      step.y = -1;
      ray_len.y = (ray_start.y - map_check.y) * step_size.y;
    }else {
      step.y = 1;
      ray_len.y = ((map_check.y + 1) - ray_start.y) * step_size.y;
    }
    
    let distance = 0;
    while(distance < len) {
      if(ray_len.x < ray_len.y) {
        map_check.x += step.x;
        distance = ray_len.x;
        ray_len.x += step_size.x;
      }else {
        map_check.y += step.y;
        distance = ray_len.y;
        ray_len.y += step_size.y;
      }

      const tile = cave.get_tile(map_check.x, map_check.y);
      if(tile == 1) {
        ray_dir.mult(distance);
        ray_start.add(ray_dir);
        ray_start.mult(cave.tile_size);
        return {pos: createVector(ray_start.x, ray_start.y), tile: createVector(map_check.x, map_check.y)};
      }
    }

    return null;
  }
}