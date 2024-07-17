class Draggable {
  constructor(type) {
    this.type = type;
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

      if (this.type === "mlp") {
        this.layers.forEach((layer) => layer.pressed(true));
      }

      organizer.setDragActive(true);
    }
  }

  doubleClicked() {
    if (this.rollover && !editOrganizer.getSelected()) {
      editOrganizer.enable();
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
      this.type == "layer" && this.updateNeuronsCoordinates();
    }

    this.type == "mlp" && this.updateBorders(); // This is works because when you drag layer you also drag mlp
  }
}
