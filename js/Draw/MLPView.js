class MlpView extends Draggable {
  constructor(x, y, initialLayer = null) {
    super(x, y);
    this.layers = [];
    this.label = "MLP1";
    this.lr = 0.1;
    this.batchSize = 1;
    this.propsShown = true;
    this.selected = false;
    this.layersLocked = false; // maybe we can get rid of this
    this.initializeLayers(initialLayer);
    this.updateBorders();
  }

  initializeLayers(initialLayer) {
    const layer = initialLayer ?? new HiddenLayer(this.x, this.y, this);
    layer.setParent(this);
    this.layers.push(layer);
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
    this.x = x;
    this.y = y;
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

  togglePropsShown() {
    this.propsShown = !this.propsShown;
  }

  toggleLayersLocks() {
    this.layersLocked = !this.layersLocked;
    this.layers.forEach((layer) => {
      this.layersLocked == layer.isEditModeOpen() && layer.toggleEditMode();
    });
  }

  areLayersLocked() {
    return this.layersLocked;
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

  moveLayers(targetMlpView) {
    this.getLayers().forEach((layer) => {
      targetMlpView.pushLayer(layer);
    });
    targetMlpView.updateBorders();
    this.setLayers([]);
    this.destroy();
  }

  destroy() {
    this.getLayers().forEach((l) => l.destroy());
    this.setLayers([]);
    if (editMLPOrganizer.getSelected() == this) {
      editMLPOrganizer.disable();
    }
    mainOrganizer.removeMlpView(this);
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
  }

  pressed() {
    if (iManager.checkRollout(this) && getMouseButton() == "right") {
      this.toggleLayersLocks();
    }
  }

  handlePressed() {
    this.getLayers().forEach((layer) => layer.pressed());
    if (iManager.isBusy()) return;
    this.pressed();
  }

  resetCoordinates() {
    const layers = this.getLayers();
    const originLayer = layers[0];

    let lastX = originLayer.x;

    layers.forEach((layer, index) => {
      const y = originLayer.y - (layer.h - originLayer.h) / 2;
      const x = lastX + (index != 0) * layer.w * 2;
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
  }
}
