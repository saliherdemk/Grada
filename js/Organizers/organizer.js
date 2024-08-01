class Organizer {
  constructor(instance) {
    this.p = instance;
    this.activeLine = null;
    this.schemas = [];
    this.inputs = [];
    this.images = {
      brokenLink: this.p.loadImage("media/broken-link.png"),
      delete: this.p.loadImage("media/delete-icon.png"),
      lock: this.p.loadImage("media/lock.png"),
      lockOpen: this.p.loadImage("media/lock-open.png"),
    };
  }

  getImageByKey(key) {
    return this.images[key];
  }

  getInstance() {
    return this.p;
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
    this.getActiveLine()?.draw();
  }
}
