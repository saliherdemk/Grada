class MLP extends Draggable {
  constructor(nin, nouts, x, y, cnv) {
    super("mlp");
    let sz = [nin, ...nouts];
    this.x = x;
    this.y = y;
    this.h;
    this.w;
    this.canvas = cnv;
    this.inputLayer = new Layer(sz[0], this.x - 50, this.y, "Input Layer", cnv);
    this.layers = [this.inputLayer];

    for (let i = 0; i < nouts.length; i++) {
      const layer = new Layer(
        sz[i + 1],
        this.x + i * 100 + 50,
        this.y,
        "L" + (i + 1),
        cnv,
      );

      if (this.layers.length > 0) {
        let prevLayer = this.layers[this.layers.length - 1];
        prevLayer.setNextLayer(layer);
        layer.setPrevLayer(prevLayer);
      }

      this.layers.push(layer);
    }

    this.updateBorders();
  }

  updateBorders() {
    let lastX = 0;
    let firstX = width;
    let firstY = height;
    let lastY = 0;
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      lastX = Math.max(layer.x, lastX);
      firstX = Math.min(layer.x, firstX);

      firstY = Math.min(layer.y, firstY);
      lastY = Math.max(lastY, layer.y + layer.h);
    }
    this.w = lastX - firstX + 100;
    this.x = firstX - 25;
    this.y = firstY - 25;
    this.h = lastY - firstY + 50;
  }

  call(x) {
    return this.layers.reduce((input, layer) => layer.call(input), x);
  }

  parameters() {
    return this.layers.flatMap((layer) => layer.parameters());
  }

  show() {
    const commands = [
      { func: "fill", args: [255, 255, 255, 0.5] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  handlePressed() {
    this.layers.forEach((layer) => {
      layer.pressed();
    });
    if (organizer.getDragActive()) return;
    this.pressed();
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

  draw() {
    this.layers.forEach((layer) => layer.draw());
    this.show();

    !organizer.getDragActive() && this.over();
    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}
