class MlpView extends Playable {
  constructor() {
    super();
    this.layers = [];
    this.label = "MLP1";
    this.origin = null;
    this.lr = 0.1;
    this.batchSize = 1;
    this.errFunc = "mse";
    this.propsShown = true;
    this.selected = false;
  }

  setErrFunc(errFunc) {
    this.errFunc = errFunc;
  }

  getErrFunc() {
    return this.errFunc;
  }

  isInactive() {
    return this.layers[0] instanceof Component && this.layers.length === 1;
  }

  select() {
    this.selected = true;
  }

  deSelect() {
    this.selected = false;
  }

  isSelected() {
    return this.selected;
  }

  setCoordinates(x, y) {
    this.updateLayersCoordinates(x, y);
    super.setCoordinates(x, y);
    this.updateButtonsCoordinates();
  }

  updateButtonsCoordinates() {
    const initBtn = this.initButton;
    const y = this.y + this.h + 5;
    initBtn.setCoordinates(this.x + this.w - initBtn.w, y);

    this.controlButtons.forEach((b, i) => {
      const x = this.x + (this.w - b.w) / 2 + (i % 2 ? 1 : -1) * 40;
      b.setCoordinates(x, y);
    });
  }

  setLabel(label) {
    this.label = label;
  }

  setLr(lr) {
    this.lr = lr;
    this.origin.setLr(lr);
  }

  setBatchSize(batchSize) {
    this.batchSize = batchSize;
  }

  setLayers(layers) {
    this.layers = layers;
    layers.forEach((l) => {
      l.setParent(this);
    });
  }

  isPropsShown() {
    return this.propsShown;
  }

  togglePropsShown() {
    this.propsShown = !this.propsShown;
  }

  updateLayersCoordinates(newX, newY) {
    const prevX = this.x;
    const prevY = this.y;
    this.layers.forEach((layer) => {
      layer.updateCoordinates(newX + layer.x - prevX, newY + layer.y - prevY);
    });
  }

  getPrevAndNext(layer) {
    const layers = this.getLayers();
    const index = layers.indexOf(layer);
    return { prev: layers[index - 1], next: layers[index + 1], index: index };
  }

  getLayers() {
    return this.layers;
  }

  setOrigin(obj) {
    this.origin = obj;
  }

  moveLayers(targetMlpView) {
    this.getLayers().forEach((layer) => {
      targetMlpView.pushLayer(layer);
    });
    targetMlpView.updateBorders();
    targetMlpView.checkMlpCompleted();
    this.setLayers([]);
    this.destroy();
  }

  pushLayer(layer) {
    layer.parent = this;
    this.getLayers().push(layer);
  }

  updateBorders() {
    let lastX = -Infinity,
      firstX = Infinity,
      firstY = Infinity,
      lastY = -Infinity;

    const layers = this.getLayers();
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      if (layer instanceof Component) continue;

      lastX = Math.max(layer.x + layer.w, lastX);
      firstX = Math.min(layer.x, firstX);

      firstY = Math.min(layer.y, firstY);
      lastY = Math.max(lastY, layer.y + layer.h);
    }
    this.w = lastX - firstX + 50;
    // FIXME: find a way to call setCoordinates without adding base case
    this.x = firstX - 25;
    this.y = firstY - 35;
    this.h = lastY - firstY + 75;
    this.updateButtonsCoordinates();
  }

  pressed() {
    iManager.checkRollout(this);
  }

  handlePressed() {
    this.getLayers().forEach((layer) => layer.pressed());
    if (this.isInactive() || iManager.isBusy()) return;

    this.controlButtons.forEach((btn) => btn.handlePressed());
    this.initButton.handlePressed();
    this.pressed();
  }

  // FIXME potantiel refire
  resetCoordinates() {
    const layers = this.getLayers();
    const originLayer = layers[0];

    let lastX = originLayer.x;

    layers.forEach((layer, index) => {
      const y = originLayer.y - (layer.h - originLayer.h) / 2;
      const x = lastX + (index != 0) * 50;
      lastX = x + layer.w;
      layer.setCoordinates(x, y);
      layer.parent.updateBorders();
    });
  }

  handleKeyPressed() {
    iManager.isHovered(this) && this.resetCoordinates();
  }

  handleReleased() {
    this.getLayers().forEach((layer) => {
      layer.released();
    });
    this.released();
  }

  handleDoubleClicked() {
    this.getLayers().forEach((layer) => layer.doubleClicked());
    if (this.isInactive() || iManager.isBusy()) {
      iManager.handleRelease();
      return;
    }
    iManager.checkRollout(this) && editMLPOrganizer.setSelected(this);
    iManager.handleRelease();
    // Double click fires after two clicks =
    // pressed-released pressed-released handleDoubleClicked
    // iManager selected values: obj->null->obj->null -> obj
    // So we need to call handleRelease to free iManager
  }

  destroy() {
    this.getLayers().forEach((l) => l.destroy());
    this.setLayers([]);
    if (editMLPOrganizer.getSelected() == this) {
      editMLPOrganizer.disable();
    }
    mainOrganizer.removeMlpView(this);
  }

  showProps() {
    const commands = [
      {
        func: "text",
        args: [
          `Play Speed: ${this.playSpeed} ms \n
          Learning Rate: ${this.lr} \n
          Batch Size: ${this.batchSize}`,
          this.x + 5,
          this.y + this.h + 5,
          this.w + 50,
          75,
        ],
      },
    ];

    executeDrawingCommands(commands);
  }

  show() {
    const commands = [
      { func: "stroke", args: [this.isSelected() ? "lightblue" : 123] },
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10, 10] },
      { func: "noStroke", args: [] },
      { func: "text", args: [this.label, this.x + 5, this.y + 5, this.w, 25] },
      {
        func: "text",
        args: [this.errFunc, this.x + this.w - 50, this.y + this.h - 10],
      },
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    if (!this.isInactive()) {
      this.show();
      this.isPropsShown() && this.showProps();
      this.controlButtons.forEach((btn) => btn.draw());
      this.initButton.draw();
    }
    this.getLayers().forEach((layer) => layer.draw());
  }
}
