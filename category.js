class Category {
  constructor(x, y, size, id, letter) {
      this.x = x;
      this.y = y;
      this.width = size;
      this.col = id;
      this.letter = letter;
  }
  
  getLetter() { return this.letter; }
  
  clicked(mouse_x, mouse_y) {
    return dist(this.x, this.y, mouse_x, mouse_y) < this.width / 2;
  }

  draw() {
    textFont("Arial", 20);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    fill(color(255,255,255));
    rect(this.x - this.width / 2, this.y - this.width / 2, this.width, this.width);
    fill(color(0,0,0));

    switch(this.col) {
      case 0:
        text("A", this.x, this.y);
        break;
      case 1:
        text("D", this.x, this.y);
         break;
      case 2:
        text("E", this.x, this.y);
        break;
      case 3:
        text("G", this.x, this.y);
        break;
      case 4:
        text("H", this.x, this.y);
        break;
      case 5:
        text("I", this.x, this.y);
        break;
      case 6:
        text("K", this.x, this.y);
        break;
      case 7:
        text("L", this.x, this.y);
        break;
      case 8:
        text("M", this.x, this.y);
        break;
      case 9:
        text("N", this.x, this.y);
        break;
      case 10:
        text("O", this.x, this.y);
        break;
      case 11:
        text("R", this.x, this.y);
        break;      
      case 12:
        text("S", this.x, this.y);
        break;
      case 13:
        text("T", this.x, this.y);
        break;
      case 14:
        text("U", this.x, this.y);
        break;
      case 15:
        text("V", this.x, this.y);
        break;
      case 16:
        text("Y", this.x, this.y);
        break;
      case 17:
        text("Z", this.x, this.y);
        break;
    }
    noStroke();
  }
}