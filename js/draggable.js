class Draggable {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  handleDoubleClicked() {}

  doubleClicked() {}

  handleDrag(x, y) {
    this.updateCoordinates(x, y);
  }

  handlePressed() {
    iManager.checkRollout(this);
  }

  handleKeyPressed(_k) {}

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
