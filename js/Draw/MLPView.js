class MlpView extends Draggable {
  constructor() {
    super(0, 0);
    this.layers = [];
    this.label = "MLP1";
    this.origin = null;
    this.lr = 0.1;
    this.batchSize = 1;
    this.propsShown = true;
    this.selected = false;
    this.initialized = false;
    this.controlButtons = [];
    this.initButton;
    this.dataStatus = -1;
    this.createToggleMlpButton();
  }

  updateStatus(status) {
    this.status = status;
  }

  getDataStatus() {
    return this.dataStatus;
  }

  isInitialized() {
    return this.initialized;
  }

  createToggleMlpButton() {
    const btn = new TextButton("Initialize MLP", () => {
      this.toggleMlp();
    });
    btn.setDimensions(100, 35).disable();
    this.initButton = btn;
  }

  goOnce() {
    const btn = this.controlButtons[0];
    if (this.getDataStatus() > 0) {
      this.executeOnce();
      btn.setTheme("yellow");
      btn.setText("Fetch Next");
      return;
    }
    this.fetchNext();
    btn.setTheme("green");
    btn.setText("Execute");
  }

  executeOnce() {
    const layers = this.getLayers();
    const inputLayer = layers[0];
    const inputValues = inputLayer.setValues();

    const outputLayer = layers[layers.length - 1];
    const outputValues = outputLayer.setValues();

    this.origin.goOneCycle(inputValues, outputValues);
    this.dataStatus = 0;
  }

  fetchNext() {
    const layers = this.getLayers();
    layers[0].fetchNext();
    layers[layers.length - 1].fetchNext();
    this.dataStatus = 1;
  }

  createGoOnceButton() {
    const btn = new TextButton("Fetch Next", () => {
      this.goOnce();
    });
    btn.setDimensions(75, 35).setTheme("yellow");
    this.controlButtons.push(btn);
  }

  createTogglePlayButton() {
    const btn = new TextButton("Play", () => {
      console.log("play");
    });
    btn.setDimensions(75, 35).setTheme("cyan");
    this.controlButtons.push(btn);
  }

  destroyControlButtons() {
    this.controlButtons.forEach((b) => b.destroy()); // probably no needed
    this.controlButtons = [];
  }

  createControlButtons() {
    this.createGoOnceButton();
    this.createTogglePlayButton();
    this.updateButtonsCoordinates();
  }

  toggleMlp() {
    this.isInitialized() ? this.destroyMlp() : this.initializeMlp();
    this.toggleLockLayers();
  }

  updateToggleMlpButton(text, theme) {
    this.initButton.setText(text).setTheme(theme);
  }

  initializeMlp() {
    const layers = this.layers;
    const mlp = new MLP([], this.lr, this.batchSize);
    for (let i = 1; i < layers.length; i++) {
      const layer = layers[i];
      const layerOrigin = new Layer(
        layers[i - 1].neurons.length,
        layer.neurons.length,
      );
      layer.setOrigin(layerOrigin);
      mlp.addLayer(layerOrigin);
    }
    this.setOrigin(mlp);
    this.initialized = true;
    this.updateToggleMlpButton("Terminate MLP", "red");
    this.createControlButtons();
  }

  clearOrigin() {
    this.layers.forEach((l) => l.clearOrigin());
    this.origin = null;
  }

  destroyMlp() {
    this.origin.destroy();
    this.clearOrigin();
    this.initialized = false;
    this.updateToggleMlpButton("Initialize MLP", "blue");
    this.destroyControlButtons();
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
  }

  setBatchSize(batchSize) {
    this.batchSize = batchSize;
  }

  setLayers(layers) {
    this.layers.forEach((l) => l.destroy());
    this.layers = layers;
  }

  isPropsShown() {
    return this.propsShown;
  }

  isCompleted() {
    const layers = this.layers;
    return (
      layers[0] instanceof InputLayer &&
      layers[layers.length - 1] instanceof OutputLayer
    );
  }

  togglePropsShown() {
    this.propsShown = !this.propsShown;
  }

  toggleLockLayers() {
    this.layers.forEach((layer) => {
      this.initialized == layer.isEditModeOpen() && layer.toggleEditMode();
    });
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

  setLayers(layers) {
    this.layers = layers;
    layers.forEach((l) => {
      l.setParent(this);
    });
  }

  checkMlpCompleted() {
    const initBtn = this.initButton;
    this.isCompleted() ? initBtn.enable() : initBtn.disable();
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

    for (let i = 0; i < this.getLayers().length; i++) {
      const layer = this.getLayers()[i];

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
    if (iManager.isBusy()) return;

    this.controlButtons.forEach((btn) => btn.handlePressed());
    this.initButton.handlePressed();
    this.pressed();
  }

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
    if (iManager.isBusy()) {
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
          `Learning Rate: ${this.lr} \n
          Batch Size: ${this.batchSize}`,
          this.x + 5,
          this.y + this.h + 5,
          this.w + 50,
          50,
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
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    this.show();
    this.isPropsShown() && this.showProps();
    this.getLayers().forEach((layer) => layer.draw());
    this.controlButtons.forEach((btn) => btn.draw());
    this.initButton.draw();
  }
}
