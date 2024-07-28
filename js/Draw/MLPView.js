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

  updateButtonCoordinates() {
    const button = this.button;
    button?.setCoordinates(this.x + this.w - button.w / 2, this.y + this.h + 5);
  }

  postUpdateCoordinates() {
    this.updateButtonCoordinates();
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
    let lastX = 0,
      firstX = width,
      firstY = height,
      lastY = 0;

    for (let i = 0; i < this.getLayers().length; i++) {
      const layer = this.getLayers()[i];

      lastX = Math.max(layer.x, lastX);
      firstX = Math.min(layer.x, firstX);

      firstY = Math.min(layer.y, firstY);
      lastY = Math.max(lastY, layer.y + layer.h);
    }
    this.w = lastX - firstX + 100;
    this.setCoordinates(firstX - 25, firstY - 25);
    this.h = lastY - firstY + 75;
    this.updateButtonCoordinates();
  }

  handlePressed() {
    this.getLayers().forEach((layer) => {
      layer.handlePressed();
    });
    if (organizer.getDragActive()) return;
    this.button?.handlePressed();
    this.pressed();
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
      { func: "fill", args: [255, 255, 255, 0.5] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    this.button?.draw();
    this.getLayers().forEach((layer) => layer.draw());
    this.show();

    !organizer.getDragActive() && this.over();

    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}
