class MlpView extends Playable {
  constructor() {
    super();
    this.inputComponent = null;
    this.outputComponent = null;
    this.layers = [];
    this.label = "MLP1";
    this.origin = null;
    this.lr = 0.1;
    this.batchSize = 1;
    this.errFunc = "mse";
    this.propsShown = false;
    this.selected = false;
  }

  setInputComponent(component) {
    this.inputComponent = component;
    this.checkCompleted();
  }

  getInput() {
    return this.inputComponent;
  }

  setOutputComponent(component) {
    this.outputComponent = component;
    this.checkCompleted();
  }

  getOutput() {
    return this.outputComponent;
  }

  clearInput() {
    this.inputComponent = null;
    this.checkCompleted();
  }

  clearOutput() {
    this.outputComponent = null;
    this.checkCompleted();
  }

  isInactive() {
    return this.layers[0].isComponent() && this.layers.length === 1;
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

  setLabel(label) {
    this.label = label;
  }

  setLr(lr) {
    this.lr = lr;
    this.origin?.setLr(lr);
  }

  setErrFunc(errFunc) {
    this.errFunc = errFunc;
    this.origin?.setErrFunc(errFunc);
  }

  setBatchSize(batchSize) {
    this.batchSize = batchSize;
  }

  setLayers(layers) {
    this.layers = layers;
    layers.forEach((l) => l.setParent(this));
    this.updateBorders();
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
      if (layer.isComponent()) continue;

      lastX = Math.max(layer.x + layer.w, lastX);
      firstX = Math.min(layer.x, firstX);

      firstY = Math.min(layer.y, firstY);
      lastY = Math.max(lastY, layer.y + layer.h);
    }
    this.w = lastX - firstX + 70;
    // FIXME: find a way to call setCoordinates without adding base case
    this.x = firstX - 35;
    this.y = firstY - 35;
    this.h = lastY - firstY + 75;
    this.updateButtonsCoordinates();
  }

  getPressables() {
    return [
      ...this.getLayers().flatMap((l) => l.getPressables()),
      ...this.controlButtons,
      this,
    ];
  }

  resetCoordinates() {
    const layers = this.getLayers();
    const originLayer = layers[0];

    let lastX = originLayer.x;

    const input = this.getInput();
    input?.setCoordinates(
      lastX - input.w - 50,
      originLayer.y - (input.h - originLayer.h) / 2,
    );

    layers.forEach((layer, index) => {
      const y = originLayer.y - (layer.h - originLayer.h) / 2;
      const x = lastX + (index != 0) * 50;
      lastX = x + layer.w;
      layer.setCoordinates(x, y);
    });

    const output = this.getOutput();
    output?.setCoordinates(
      lastX + 50,
      originLayer.y - (output.h - originLayer.h) / 2,
    );

    originLayer.parent.updateBorders();
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
    this.getInput()?.clearLines();
    this.getOutput()?.clearLines();
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
        args: [this.errFunc, this.x + this.w - 35, this.y + this.h - 10],
      },
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    if (!this.isInactive()) {
      this.show();
      this.isPropsShown() && this.showProps();
      this.controlButtons.forEach((btn) => btn.draw());
    }
    this.getLayers().forEach((layer) => layer.draw());
  }

  export() {
    downloadJSON({ ...this.origin.export(), label: this.label }, this.label);
  }

  import(mlpData) {
    this.setLabel(mlpData.label);
    this.setLr(mlpData.lr);
    this.setBatchSize(mlpData.batchSize);
    this.setErrFunc(mlpData.errFunc);
    this.resetCoordinates();
    this.initializeMlp();
    this.origin.import(mlpData.parameters);
    // this.destroyMlp();
  }
}
