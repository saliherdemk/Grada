class MainOrganizer {
  constructor() {
    this.activeLine = null;
    this.inputViews = [];
    this.mlpViews = [];
    this.outputViews = [];
    this.mainDisabled = false;
    this.setImages();
  }

  enable() {
    getElementById("disable-background").style.display = "none";
    getElementById("create-dataset-container").style.display = "none";
    getElementById("canvas-parent").style.display = "none";
    this.mainDisabled = false;
  }

  disable() {
    getElementById("disable-background").style.display = "flex";
    this.mainDisabled = true;
  }

  isDisabled() {
    return this.mainDisabled;
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

  addMlpView(mlpView) {
    this.mlpViews.push(mlpView);
  }

  removeMlpView(mlpView) {
    let indexToRemove = this.mlpViews.findIndex((s) => s === mlpView);
    this.mlpViews.splice(indexToRemove, 1);
  }

  addInputView(inputView) {
    this.inputViews.push(inputView);
  }

  addOutputView(outputView) {
    this.outputViews.push(outputView);
  }

  getActiveLine() {
    return this.activeLine;
  }

  setActiveLine(line) {
    this.activeLine = line;
  }

  draw() {
    this.mlpViews.forEach((mlpView) => mlpView.draw());
    this.inputViews.forEach((inputView) => inputView.draw());
    this.outputViews.forEach((outputView) => outputView.draw());
    this.getActiveLine()?.draw();
  }
}
