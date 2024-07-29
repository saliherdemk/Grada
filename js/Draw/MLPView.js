class Schema extends Draggable {
  constructor(x, y, cnv = organizer.getCanvas()) {
    super(x, y);
    this.canvas = cnv;
    this.layers = [new DrawLayer(this.x, this.y, this, this.canvas)];
    this.editModeOpen = true;
    this.button;
    this.updateBorders();
    this.initializeButton();
  }

  initializeButton() {
    this.button = new CanvasButton(loadImage("lock-open.png"), () =>
      this.toggleEditMode(),
    );

    this.updateButtonCoordinates();
  }

  toggleEditMode() {
    this.editModeOpen = !this.editModeOpen;
    this.button?.changeImg(this.editModeOpen ? "lockOpen" : "lock");
  }

  setCoordinates(x, y) {
    this.updateLayersCoordinates(x, y);
    this.x = x;
    this.y = y;
    this.updateButtonCoordinates();
  }

  updateButtonCoordinates() {
    const button = this.button;
    button?.setCoordinates(this.x + this.w - button.w / 2, this.y + this.h + 5);
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
    this.updateBorders();
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
    this.canvas = null;
    this.button.destroy();
    this.button = null;
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

      lastX = Math.max(layer.x, lastX);
      firstX = Math.min(layer.x, firstX);

      firstY = Math.min(layer.y, firstY);
      lastY = Math.max(lastY, layer.y + layer.h);
    }
    this.w = lastX - firstX + 100;
    // FIXME: find a way to call setCoordinates without adding base case
    this.x = firstX - 25;
    this.y = firstY - 25;
    this.h = lastY - firstY + 75;
    this.updateButtonCoordinates();
  }

  pressed(x, y) {
    this.button?.handlePressed();
    return iManager.checkRollout(x, y, this);
  }

  handlePressed(x, y) {
    const isHandledByLayer = this.getLayers().some((layer) =>
      layer.pressed(x, y),
    );

    if (isHandledByLayer || this.pressed(x, y)) return;

    iManager.setCanvasDragging(true);
    iManager.setLastMouseCoordinates(x, y);
  }

  resetCoordinates() {
    const layers = this.getLayers();
    const originLayer = layers[0];

    layers.forEach((layer, index) => {
      const y = originLayer.y - (layer.h - originLayer.h) / 2;
      const x = originLayer.x + index * layer.w * 2;
      layer.setCoordinates(x, y);
      layer.updateNeuronsCoordinates();
      layer.parent.updateBorders();
    });
  }

  handleKeyPressed() {
    this.rollover && this.resetCoordinates();
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
    const commands = [
      { func: "fill", args: [255] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    this.show();
    this.button?.draw();
    this.getLayers().forEach((layer) => layer.draw());

    // !organizer.getDragActive() && this.over();

    // (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}
