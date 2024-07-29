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

  getScaleFactor() {
    return this.scaleFactor;
  }

  getPanValues() {
    return { x: this.panX, y: this.panY };
  }

  getSelected() {
    return this.selected;
  }

  isCanvasDragging() {
    return this.canvasDragging;
  }

  setOffsets(x, y) {
    const selected = this.getSelected();
    this.offsetX = x - (selected.x * this.scaleFactor + this.panX);
    this.offsetY = y - (selected.y * this.scaleFactor + this.panY);
  }

  setSelected(obj) {
    this.selected = obj;
  }

  setCanvasDragging(value) {
    this.canvasDragging = value;
  }

  setLastMouseCoordinates(x, y) {
    this.lastMouseX = x;
    this.lastMouseY = y;
  }

  updatePanCoordinates(x, y) {
    this.panX += x - this.lastMouseX;
    this.panY += y - this.lastMouseY;
    this.setLastMouseCoordinates(x, y);
  }

  updateSelectedCoordinates() {
    const x = (mouseX - this.offsetX - this.panX) / this.scaleFactor;
    const y = (mouseY - this.offsetY - this.panY) / this.scaleFactor;
    this.selected.updateCoordinates(x, y);
  }

  handlePress(x, y) {
    organizer.schemas.forEach((schema) => schema.handlePressed(x, y));
  }

  handleDrag(x, y) {
    if (this.getSelected()) {
      this.updateSelectedCoordinates();
      return;
    }

    if (this.isCanvasDragging()) {
      this.updatePanCoordinates(x, y);
    }
  }

  contains(x, y, obj) {
    const px = x / this.scaleFactor - this.panX / this.scaleFactor;
    const py = y / this.scaleFactor - this.panY / this.scaleFactor;
    if (obj.r) {
      const d = Math.sqrt((px - obj.x) ** 2 + (py - obj.y) ** 2);
      return d < obj.r / 2;
    }
    return px > obj.x && px < obj.x + obj.w && py > obj.y && py < obj.y + obj.h;
  }

  handleRelease() {
    this.selected = null;
    this.setCanvasDragging(false);
  }

  checkRollout(x, y, object) {
    if (iManager.contains(x, y, object)) {
      iManager.setSelected(object);
      iManager.setOffsets(x, y);
      return true;
    }
    return false;
  }
  applyTransforms() {
    const commands = [
      { func: "translate", args: [this.panX, this.panY] },
      { func: "scale", args: [this.scaleFactor] },
    ];

    executeDrawingCommands(organizer.getCanvas(), commands);
  }
}
