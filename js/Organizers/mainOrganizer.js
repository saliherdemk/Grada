class MainOrganizer {
  constructor() {
    this.activeLine = null;
    this.components = [];
    this.mlpViews = [];
    this.mainDisabled = false;
    this.setImages();
    this.enable();
  }

  setMainDisabled(isDisabled) {
    this.mainDisabled = isDisabled;
  }

  enable() {
    const parent = getElementById("disable-background");
    addClass(parent, "hidden");
    Array.from(parent.children).forEach((c) => removeClass(c, "hidden"));
    this.setMainDisabled(false);
  }

  disable() {
    const parent = getElementById("disable-background");
    removeClass(parent, "hidden");
    Array.from(parent.children).forEach((c) => addClass(c, "hidden"));
    this.setMainDisabled(true);
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
      zoomIn: p.loadImage("media/zoom-in.png"),
      zoomOut: p.loadImage("media/zoom-out.png"),
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

  addComponent(component) {
    this.components.push(component);
  }

  removeComponent(component) {
    let indexToRemove = this.components.findIndex((c) => c === component);
    this.components.splice(indexToRemove, 1);
  }

  getActiveLine() {
    return this.activeLine;
  }

  getAll() {
    return [...this.mlpViews, ...this.components];
  }

  setActiveLine(line) {
    this.activeLine = line;
  }

  draw() {
    this.getAll().forEach((el) => el.draw());
    this.getActiveLine()?.draw();
  }
}
