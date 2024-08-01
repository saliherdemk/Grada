class MainOrganizer {
  constructor() {
    this.activeLine = null;
    this.schemas = [];
    this.setImages();
  }

  setImages() {
    const p = canvasManager.getInstance();
    this.images = {
      brokenLink: p.loadImage("media/broken-link.png"),
      delete: p.loadImage("media/delete-icon.png"),
      lock: p.loadImage("media/lock.png"),
      lockOpen: p.loadImage("media/lock-open.png"),
    };
  }

  getImageByKey(key) {
    return this.images[key];
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
