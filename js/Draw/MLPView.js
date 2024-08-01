class Schema extends Draggable {
  constructor(x, y, instance = organizer.getInstance()) {
    super(x, y);
    this.p = instance;
    this.layers = [new HiddenLayer(this.x, this.y, this, this.p)];
    this.editMode = true;
    this.updateBorders();
  }

  isEditModeOpen() {
    return this.editMode;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.layers.forEach((layer) => {
      this.editMode != layer.isEditModeOpen() && layer.toggleEditMode();
    });
  }

  setCoordinates(x, y) {
    this.updateLayersCoordinates(x, y);
    this.x = x;
    this.y = y;
    this.updateButtonCoordinates();
  }

  updateButtonCoordinates() {
    // const button = this.button;
    // button?.setCoordinates(this.x + this.w - button.w, this.y + this.h + 5);
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
      l.parent = this;
    });
  }

  moveLayers(targetSchema) {
    this.getLayers().forEach((layer) => {
      targetSchema.pushLayer(layer);
    });
    targetSchema.updateBorders();
    this.setLayers([]);
    this.destroy();
  }

  destroy() {
    this.p = null;
    this.getLayers().forEach((l) => l.destroy());
    this.setLayers([]);
    organizer.removeSchema(this);
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
    this.y = firstY - 25;
    this.h = lastY - firstY + 75;
    this.updateButtonCoordinates();
  }

  pressed() {
    if (iManager.checkRollout(this) && this.p?.mouseButton == "right") {
      this.toggleEditMode();
    }
  }

  handlePressed() {
    this.getLayers().some((layer) => layer.pressed());
    if (iManager.isBusy()) return;
    this.pressed();
    if (iManager.isBusy()) return;
    iManager.setCanvasDragging(true);
    iManager.setLastMouseCoordinates();
  }

  resetCoordinates() {
    const layers = this.getLayers();
    const originLayer = layers[0];

    layers.forEach((layer, index) => {
      const y = originLayer.y - (layer.h - originLayer.h) / 2;
      const x = originLayer.x + index * layer.w * 2;
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
  }

  show() {
    const commands = [{ func: "rect", args: [this.x, this.y, this.w, this.h] }];

    executeDrawingCommands(commands, this.p);
  }

  draw() {
    this.show();
    this.getLayers().forEach((layer) => layer.draw());
  }
}
