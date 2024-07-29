class Organizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.dragActive = false;
    this.activeLine = null;
    this.schemas = [];
    this.images = {
      brokenLink: loadImage("broken-link.png"),
      delete: loadImage("delete-icon.png"),
      lock: loadImage("lock.png"),
      lockOpen: loadImage("lock-open.png"),
    };
  }

  getImageByKey(key) {
    return this.images[key];
  }

  getCanvas() {
    return this.canvas;
  }

  addSchema(schema) {
    this.schemas.push(schema);
  }

  removeSchema(schema) {
    let indexToRemove = this.schemas.findIndex((s) => s === schema);
    this.schemas.splice(indexToRemove, 1);
  }

  getActiveLine() {
    return this.activeLine;
  }

  setActiveLine(line) {
    this.activeLine = line;
  }

  setDragActive(dragActive) {
    this.dragActive = dragActive;
  }

  getDragActive() {
    return this.dragActive;
  }

  handleKeyPressed(key) {
    key.toLowerCase() == "e" &&
      this.schemas.forEach((schema) => schema.handleKeyPressed());
  }

  handleDoubleClicked() {
    this.schemas.forEach((schema) => schema.handleDoubleClicked());
  }

  draw() {
    this.schemas.forEach((schema) => schema.draw());
    this.getActiveLine()?.draw();
  }
}
