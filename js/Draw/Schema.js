class Schema extends Draggable {
  constructor(mlp, cnv, x, y) {
    super(x, y);
    this.origin = mlp;
    this.canvas = cnv;
    this.layers = [];

    this.initialize();
  }

  initialize() {
    this.origin.layers.forEach((layer, i) => {
      const newLayer = new DrawLayer(layer, this.canvas, this.x, this.y, this);
      i > 0 && this.layers[i - 1].connectLayer(newLayer);

      this.pushLayer(newLayer, i);
    });

    this.resetCoordinates();
    this.updateBorders();
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

  destroy() {
    this.origin = null;
    organizer.removeSchema(this);
  }

  pushLayer(layer) {
    this.layers.push(layer);
    this.updateOrigin();
  }

  removeLayer(layer) {
    const layers = this.layers;
    const index = layers.indexOf(layer);
    const prevLayer = layers[index - 1];
    prevLayer.splitMLp(layer);
    layers.splice(index, 1);
    console.log(layers);
  }

  updateOrigin() {
    const origin = this.origin;
    origin.layers = [];
    this.layers.forEach((l) => origin.layers.push(l.origin));
  }

  updateBorders() {
    let lastX = 0,
      firstX = width,
      firstY = height,
      lastY = 0;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      lastX = Math.max(layer.x, lastX);
      firstX = Math.min(layer.x, firstX);

      firstY = Math.min(layer.y, firstY);
      lastY = Math.max(lastY, layer.y + layer.h);
    }
    this.w = lastX - firstX + 100;
    this.setCoordinates(firstX - 25, firstY - 25);
    this.h = lastY - firstY + 50;
  }

  handlePressed() {
    this.layers.forEach((layer) => {
      layer.handlePressed();
    });
    if (organizer.getDragActive()) return;
    this.pressed();
  }

  resetCoordinates() {
    const layers = this.layers;
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
    this.layers.forEach((layer) => {
      layer.released();
    });
    this.released();
  }

  handleDoubleClicked() {
    this.layers.forEach((layer) => layer.doubleClicked());
  }

  show() {
    const commands = [
      { func: "fill", args: [255, 255, 255, 0.5] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    this.layers.forEach((layer) => layer.draw());
    this.layers.length > 1 && this.show();

    !organizer.getDragActive() && this.over();

    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}
