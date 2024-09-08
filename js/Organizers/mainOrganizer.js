class MainOrganizer {
  constructor() {
    this.activeLine = null;
    this.mlpViews = [];
    this.mainDisabled = false;
    this.setImages();
  }

  enable() {
    getElementById("disable-background").style.display = "none";
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
      goOnce: p.loadImage("media/goOnce.png"),
      play: p.loadImage("media/play.png"),
      pause: p.loadImage("media/pause.png"),
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
  getActiveLine() {
    return this.activeLine;
  }

  setActiveLine(line) {
    this.activeLine = line;
  }

  draw() {
    this.mlpViews.forEach((mlpView) => mlpView.draw());
    this.getActiveLine()?.draw();
  }
}
