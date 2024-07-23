class Draggable {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w;
    this.h;
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
      editOrganizer.setSelected(this);
    }
  }

  released() {
    this.dragging = false;
    organizer.setDragActive(false);
  }

  updateCoordinates() {
    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
      this.neurons && this.updateNeuronsCoordinates();
    }

    this.layers && this.updateBorders(); // This is works because when you drag layer you also drag mlp
  }
}
