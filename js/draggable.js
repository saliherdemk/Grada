class Draggable extends Pressable {
  constructor(x, y, w, h) {
    super();
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  setDimensions(w, h) {
    this.w = w;
    this.h = h;
    return this;
  }

  updateCoordinates(x, y) {
    this.setCoordinates(x, y);
  }
}
