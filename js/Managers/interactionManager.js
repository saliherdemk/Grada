class InteractionManager {
  constructor() {
    this.offsetX;
    this.offsetY;
    this.scaleFactor = 1;
    this.panX = 0;
    this.panY = 0;
    this.selected;
    this.canvasDragging = false;
    this.lastMouseX;
    this.lastMouseY;
  }

  getSelected() {
    return this.selected;
  }

  isCanvasDragging() {
    return this.canvasDragging;
  }

  setOffsets() {
    const selected = this.getSelected();
    this.offsetX = mouseX - (selected.x * this.scaleFactor + this.panX);
    this.offsetY = mouseY - (selected.y * this.scaleFactor + this.panY);
  }

  setSelected(obj) {
    this.selected = obj;
  }

  setCanvasDragging(value) {
    this.canvasDragging = value;
  }

  setLastMouseCoordinates() {
    this.lastMouseX = mouseX;
    this.lastMouseY = mouseY;
  }

  updatePanCoordinates() {
    this.panX += mouseX - this.lastMouseX;
    this.panY += mouseY - this.lastMouseY;
    this.setLastMouseCoordinates();
  }

  updateSelectedCoordinates() {
    const x = (mouseX - this.offsetX - this.panX) / this.scaleFactor;
    const y = (mouseY - this.offsetY - this.panY) / this.scaleFactor;
    this.selected.updateCoordinates(x, y);
  }

  getAbsoluteCoordinates(x, y) {
    return {
      x: (x - this.panX) / this.scaleFactor,
      y: (y - this.panY) / this.scaleFactor,
    };
  }

  handlePress() {
    organizer.schemas.forEach((schema) => schema.handlePressed());
  }

  handleDrag() {
    if (this.getSelected()) {
      this.updateSelectedCoordinates();
      return;
    }

    if (this.isCanvasDragging()) {
      this.updatePanCoordinates();
    }
  }

  handleRelease() {
    this.selected = null;
    this.setCanvasDragging(false);
  }

  isHovered(obj) {
    const { x: px, y: py } = this.getAbsoluteCoordinates(mouseX, mouseY);
    if (obj.r) {
      const d = Math.sqrt((px - obj.x) ** 2 + (py - obj.y) ** 2);
      return d < obj.r / 2;
    }
    return px > obj.x && px < obj.x + obj.w && py > obj.y && py < obj.y + obj.h;
  }

  checkRollout(object) {
    if (this.isHovered(object)) {
      iManager.setSelected(object);
      iManager.setOffsets();
      return true;
    }
    return false;
  }

  applyTransforms() {
    // executeDrawingCommands pop's the changes but we need apply to canvas before poping out
    translate(this.panX, this.panY);
    scale(this.scaleFactor);
  }
}
