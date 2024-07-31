class Organizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.activeLine = null;
    this.schemas = [];
    this.inputs = [];
    this.images = {
      brokenLink: loadImage("media/broken-link.png"),
      delete: loadImage("media/delete-icon.png"),
      lock: loadImage("media/lock.png"),
      lockOpen: loadImage("media/lock-open.png"),
    };
  }

  getImageByKey(key) {
    return this.images[key];
  }

  getCanvas() {
    return this.canvas;
  }

  addInput(input) {
    this.inputs.push(input);
  }

  removeInput(input) {
    let indexToRemove = this.inputs.findIndex((i) => i === input);
    this.inputs.splice(indexToRemove, 1);
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

  draw() {
    this.schemas.forEach((schema) => schema.draw());
    this.inputs.forEach((input) => input.draw());
    this.getActiveLine()?.draw();
  }
}
