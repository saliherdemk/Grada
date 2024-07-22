class Organizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.dragActive = false;
    this.lastUsedId = 0;
    this.activeLine = null;
    this.schemas = [];
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

  getNextId() {
    return ++this.lastUsedId;
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

  handlePressed() {
    this.schemas.forEach((schema) => schema.handlePressed());
  }

  handleReleased() {
    this.schemas.forEach((schema) => schema.handleReleased());
  }

  handleDoubleClicked() {
    this.schemas.forEach((schema) => schema.handleDoubleClicked());
  }

  draw() {
    this.getActiveLine()?.draw();
    this.schemas.forEach((schema) => schema.draw());
  }
}
