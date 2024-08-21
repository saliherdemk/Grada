class Draggable {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  updateCoordinates(x, y) {
    this.setCoordinates(x, y);
  }
}
