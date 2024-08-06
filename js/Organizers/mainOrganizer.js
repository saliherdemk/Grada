class MainOrganizer {
  constructor() {
    this.activeLine = null;
    this.schemas = [];
    this.displayedFps = 0;
    this.fps = 0;
    this.counter = 0;
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

  accumulateFps() {
    this.fps += getFps();
    this.counter++;
  }

  updateDisplay() {
    this.displayedFps = parseFloat((this.fps / this.counter).toFixed(2));
    this.counter = 0;
    this.fps = 0;
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

  showFps() {
    const commands = [
      {
        func: "text",
        args: ["FPS:" + this.displayedFps, 500, 10, 25, 25],
      },
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    this.showFps();
    this.accumulateFps();
    this.counter == 100 && this.updateDisplay();
    this.schemas.forEach((schema) => schema.draw());
    this.getActiveLine()?.draw();
  }
}
