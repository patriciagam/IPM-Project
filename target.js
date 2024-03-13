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
  }
  
  // Getter
  getLabel() 
  {
    return this.label;
  }

  // Checks if a mouse click took place
  // within the target
  clicked(mouse_x, mouse_y)
  { 
    return dist(this.x, this.y, mouse_x, mouse_y) < this.width / 2;
  }

  // Draws the target and its label
  draw(colour, first, last)
  { 
    this.drawBox(colour, first, last);

    // Draw target
    fill(colour);                 
    circle(this.x, this.y, this.width);
    fill(color(0, 0, 0));
    circle(this.x, this.y, this.width * 0.9);
 
    // Draw label
    textFont("Arial", 13);
    fill(color(255,255,255));
    textAlign(CENTER);

    // Capitalizing the third letter
    let label = this.label[0].toUpperCase() + this.label[1].toUpperCase() + this.label[2].toUpperCase();
    text(this.label, this.x, this.y + 10);
    textFont("Arial", 15);
    text(label, this.x, this.y - 10);

    textFont("Arial", 16);
    fill(color(255, 255, 255));
  }

  // Draws the box around the target
  drawBox(colour, first, last)
  {
    fill(color(colour));

    if (!first && !last) 
    {
      rect(this.x, this.y - this.width/2, this.width * 2, this.width);
    }

    if (first && !last)
    { 
      rect(this.x, this.y - this.width/2, this.width *2, this.width); 
    }

    if (last)
    {
      fill(color(0, 0, 0));
      rect(this.x, this.y - this.width/2, this.width, this.width);
      fill(color(colour));
    }

    if (first && !last || first && last)
    {
      fill(color(0, 0, 0));
      rect(this.x - this.width * 3/4, this.y - 18, 10, 40);
      textFont("Cambria", 36);
      fill(color(colour));
      textAlign(CENTER);
    
      if (this.label[1] == 'é') 
      {
        text('E', this.x - this.width * 3/4, this.y + this.width/8);
      }
      else
      {
        text(this.label[1].toUpperCase(), this.x - this.width * 3/4, this.y + this.width/8);
      }
    }

    noFill();

  }

}

