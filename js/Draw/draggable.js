class Draggable {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.dragging = false;
    this.rollover = false;
  }

  over() {
    this.rollover =
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h;
  }

  pressed(force = false) {
    if (!(this.rollover || force)) return;

    if (!organizer.getDragActive() || force) {
      this.dragging = true;
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;

      if (this.layers !== undefined) {
        this.layers.forEach((layer) => layer.pressed(true));
      }

      organizer.setDragActive(true);
    }
  }

  doubleClicked() {
    if (this.rollover && !editOrganizer.getSelected()) {
      editOrganizer.enable(this);
    }
  }

  released() {
    this.dragging = false;
    organizer.setDragActive(false);
  }

  postUpdateCoordinates() {
    throw new Error("You have to implement the method postUpdateCoordinates!");
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
    this.postUpdateCoordinates();
  }

  updateCoordinates() {
    if (this.dragging) {
      this.setCoordinates(mouseX + this.offsetX, mouseY + this.offsetY);
    }

    this.layers && this.updateBorders(); // This is works because when you drag layer you also drag mlp
  }
}
