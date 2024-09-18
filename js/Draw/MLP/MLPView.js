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
    this.mode = "train";
    this.propsShown = false;
    this.selected = false;
  }

  setInputComponent(component) {
    this.inputComponent = component;
    mainOrganizer.removeComponent(component);
    this.checkCompleted();
  }

  getInput() {
    return this.inputComponent;
  }

  setOutputComponent(component) {
    this.outputComponent = component;
    mainOrganizer.removeComponent(component);
    this.checkCompleted();
  }

  getOutput() {
    return this.outputComponent;
  }

  clearInput() {
    mainOrganizer.addComponent(this.inputComponent);
    this.inputComponent = null;
    this.checkCompleted();
  }

  clearOutput() {
    mainOrganizer.addComponent(this.outputComponent);
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
    this.origin?.setBatchSize(batchSize);
  }

  handleSetMode(mode) {
    this.setMode(mode);
    this.checkCompleted();
  }

  setMode(mode) {
    this.mode = mode;
    this.origin?.setMode(mode);
  }

  getMode() {
    return this.mode;
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
    this.layers.push(layer);
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
    super.setCoordinates(firstX - 35, firstY - 35);
    this.w = lastX - firstX + 70;
    this.h = lastY - firstY + 75;
    this.updateButtonsCoordinates();
  }

  getLayerReversed() {
    return reverseArray(
      [this.getInput(), ...this.getLayers(), this.getOutput()].filter(Boolean),
    );
  }

  getPressables() {
    const pressables = this.getLayerReversed().flatMap((layer) =>
      layer.getPressables(),
    );

    return [...pressables, ...this.controlButtons, this].filter(Boolean);
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
    this.getLayerReversed().forEach((l) => l.doubleClicked());

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

  getProps() {
    return {
      playSpeed: this.playSpeed,
      lr: this.lr,
      errFunc: this.errFunc,
      batchSize: this.batchSize,
    };
  }

  getOriginProps() {
    const {
      totalParams = 0,
      stepCounter = 0,
      epoch = 0,
    } = this.origin ? this.origin.getProps() : {};
    return { totalParams, stepCounter, epoch };
  }

  getTrainCommands() {
    const x = this.x + 5;
    const y = this.y + this.h;
    const { playSpeed, lr, batchSize } = this.getProps();
    const { stepCounter, epoch } = this.getOriginProps();
    const commands = [
      { func: "text", args: [`Learning Rate: ${lr}`, x, y + 60] },
      { func: "text", args: [`Play Speed: ${playSpeed} ms`, x + 125, y + 60] },
      {
        func: "text",
        args: [
          `Step: ${stepCounter}\nEpoch: ${epoch}\nBatch Size: ${batchSize}`,
          x,
          y + 15,
        ],
      },
    ];

    return commands;
  }

  getEvalCommands() {
    const x = this.x + 5;
    const y = this.y + this.h;
    const { playSpeed } = this.getProps();
    return [
      {
        func: "text",
        args: [`Mode: eval\nPlay Speed: ${playSpeed} ms`, x, y + 15],
      },
    ];
  }

  showProps() {
    const { errFunc } = this.getProps();
    const { totalParams } = this.getOriginProps();

    const x = this.x + 5;
    const y = this.y + this.h;
    const common = [
      { func: "text", args: [errFunc, x + this.w - 35, y - 10] },
      { func: "text", args: [`Total Parameters: ${totalParams}\n`, x, y - 10] },
    ];

    const commands =
      this.getMode() == "train"
        ? this.getTrainCommands()
        : this.getEvalCommands();

    executeDrawingCommands([...commands, ...common]);
  }

  show() {
    const commands = [
      { func: "stroke", args: [this.isSelected() ? "lightblue" : 123] },
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10, 10] },
      { func: "noStroke", args: [] },
      { func: "text", args: [this.label, this.x + 5, this.y + 5, this.w, 25] },
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    if (!this.isInactive()) {
      this.show();
      this.isPropsShown() && this.showProps();
      this.controlButtons.forEach((btn) => btn.draw());
    }
    this.inputComponent?.draw();
    this.getLayers().forEach((layer) => layer.draw());
    this.outputComponent?.draw();
  }

  export() {
    const viewsProps = {
      layers: this.layers.map((layer) => layer.export()),
      label: this.label,
      lr: this.lr,
      batchSize: this.batchSize,
      errFunc: this.errFunc,
      playSpeed: this.playSpeed,
    };
    const originProps = this.origin.export();

    downloadJSON({ ...viewsProps, ...originProps }, this.label);
  }

  import(mlpData) {
    const { lr, batchSize, errFunc, label, playSpeed } = mlpData;
    this.setLr(lr);
    this.setBatchSize(batchSize);
    this.setErrFunc(errFunc);
    this.setLabel(label);
    this.setPlaySpeed(playSpeed);
    this.setMode("eval");
    this.resetCoordinates();
    this.toggleMlp();
    const { parameters, stepCounter, epoch } = mlpData;
    this.origin.import(parameters, stepCounter, epoch);
  }
}
