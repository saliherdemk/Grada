class Draggable {
  constructor(type) {
    this.type = type;
    this.dragging = false;
    this.rollover = false;
  }

  over() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    ) {
      this.rollover = true;
    } else {
      this.rollover = false;
    }
  }

  pressed(force = false) {
    if (this.rollover || force) {
      this.dragging = true;
      this.offsetX = this.x - mouseX;
      this.offsetY = this.y - mouseY;
      isBusy = this.type == "layer" && !force;

      if (this.type == "mlp") {
        for (let i = 0; i < this.layers.length; i++) {
          this.layers[i].pressed(true);
        }
      }
    }
  }

  released() {
    this.dragging = false;
    isBusy = false;
  }

  updateCoordinates() {
    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
      this.type == "layer" && this.updateNeuronsCoordinates();
    }

    this.type == "mlp" && this.updateLayersCoordinates();
  }
}
