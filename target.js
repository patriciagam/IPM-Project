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
    this.wasClicked = false;
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
    this.wasClicked = dist(this.x, this.y, mouse_x, mouse_y) < this.width / 2;
    return this.wasClicked;
  }

  // Draws the target and its label
  draw(colour, first, last)
  {
    // Draw target
    fill(colour);                 
    circle(this.x, this.y, this.width);

    if (!this.wasClicked)
    {
       // Draw inner circle (more contrast - black)
      fill(color(0, 0, 0));
      circle(this.x, this.y, this.width * 0.85);
    }
    else
    {
      // Draw inner circle (different color)
      fill(color(60, 60, 60));
      circle(this.x, this.y, this.width * 0.85);
    }

    // Draw label
    textFont("Arial", 12);
    fill(color(255,255,255));
    textAlign(CENTER);
    // Capitalizing the third letter
    let label = this.label[0] + this.label[1] + this.label[2].toUpperCase() + this.label.slice(3); 
    text(label, this.x, this.y);


    this.drawBox(colour, first, last);

    noStroke();

    textFont("Arial", 16);
    fill(color(255, 255, 255));
  }

  drawBox(colour, first, last)
  {
    strokeWeight(2);
    noFill();
    stroke(colour);

    if (!first && !last) 
    {
      //upper line
      line(this.x - this.width - this.width/4, this.y - this.width/2, this.x + this.width + this.width/4, this.y - this.width/2);
      // lower line
      line(this.x - this.width - this.width/4, this.y + this.width/2, this.x + this.width + this.width/4, this.y + this.width/2);
    }

    else
    {
      // upper line
      line(this.x - this.width * 3/4, this.y - this.width/2, this.x + this.width * 3/4, this.y - this.width/2);
      // lower line
      line(this.x - this.width * 3/4, this.y + this.width/2, this.x + this.width * 3/4, this.y + this.width/2);

      if (first) 
      { 
        // left line
        line(this.x - this.width * 3/4, this.y - this.width/2, this.x -  this.width * 3/4, this.y + this.width/2);
        noFill();
        stroke(0); 
        rect(this.x - this.width * 3/4, this.y - 18, 1, 36);
    
        textFont("Arial", 36);
        fill(color(colour));
        textAlign(CENTER);
    
        if (this.label[1] == 'é') 
        {
          text('e', this.x - this.width * 3/4, this.y + this.width/8);
        }
        else
        {
          text(this.label[1], this.x - this.width * 3/4, this.y + this.width/8);
        }
      }

      if (last)
      { 
        // right line
        line(this.x + this.width * 3/4, this.y - this.width/2, this.x +  this.width * 3/4, this.y + this.width/2);
      }
    }

  }

}

