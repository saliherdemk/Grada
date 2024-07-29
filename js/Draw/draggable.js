class Draggable {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  doubleClicked() {
    if (this.rollover && !editOrganizer.getSelected()) {
      editOrganizer.enable(this);
    }
  }

  setCoordinates() {
    throw new Error("You have to implement the method setCoordinates!");
  }

  updateCoordinates(x, y) {
    this.setCoordinates(x, y);
  }
}
