// Target class (position and width)
class Target
{
  constructor(x, y, w, l, id)
  {
    this.x      = x;
    this.y      = y;
    this.width  = w;
    this.label  = l;
    this.id     = id;
    this.selected = false;
    this.hidden = false;
  }
  
  getLabel() { return this.label; }

  getX() { return this.x; }

  getY() { return this.y; }

  getWidth() { return this.width; }

  getHeigth() { return this.width; }

  // Checks if a mouse click took place
  // within the target
  clicked(mouse_x, mouse_y) {
    let was_clicked = dist(this.x, this.y, mouse_x, mouse_y) < this.width / 2;
    if (was_clicked) {
      this.selected = true;
    }
    return was_clicked;
  }

  // Draws the target and its label
  draw() { 
    // Draw target
    fill(color(0,0,0));      
    if (this.selected) {
      stroke(255); // Set stroke color to white
      strokeWeight(3); // Set stroke thickness
    } else {
      noStroke();
    } 

    if (!this.hidden) {
      rect(this.x - this.width * 1.2 / 2, this.y - this.width / 2, 
      this.width * 1.2, this.width * 0.85, 10);

      noStroke();
  
      // Capitalizing the third letter
      let label = this.label[0].toUpperCase() + this.label[1].toUpperCase() + this.label[2].toUpperCase();
      // Draw first three letters of label
      fill(color(255,255,255));
      textAlign(CENTER);
      textFont("Arial", 17);
      text(label, this.x, this.y - 12);

      // Draw label
      textFont("Arial", 16);
      text(this.label, this.x, this.y + 10);
    }
  }

  hideTarget(letter) {
    if (!areEqual(this.label.charAt(this.label.length - 1), letter)) {
      this.hidden = true;
    }
  }

  showTarget() {
    this.hidden = false;
  }

}


