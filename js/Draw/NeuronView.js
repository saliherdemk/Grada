class NeuronView {
  constructor() {
    this.x;
    this.y;
    this.hidden = false;
    this.lines = [];
    this.origin = null;
    this.r = 25;
  }

  clearOrigin() {
    this.lines.forEach((l) => l.clearOrigin());
    this.origin = null;
  }

  setOrigin(obj) {
    this.origin = obj;
  }

  isHidden() {
    return this.hidden;
  }

  hide() {
    this.hidden = true;
  }

  visible() {
    this.hidden = false;
  }

  addLine(line) {
    this.lines.push(line);
  }

  setLines(lines) {
    this.lines = lines;
  }

  updateCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  removeLines() {
    this.lines.forEach((line) => line.destroy());
    this.lines = [];
  }

  destroy() {
    this.removeLines();
    this.instance = null;
  }

  showOriginProps() {
    const origin = this.origin;
    const o = origin.output;
    const b = origin.b;
    const commands = [
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "textSize", args: [8] },
      {
        func: "text",
        args: [b.getFixedData(2), this.x, this.y - this.r / 2 - 5],
      },
      { func: "text", args: [o.getFixedData(2), this.x, this.y] },
    ];
    executeDrawingCommands(commands);
  }

  show() {
    const commands = [
      { func: "fill", args: [255] },
      { func: "circle", args: [this.x, this.y, this.r] },
    ];
    executeDrawingCommands(commands);
  }

  draw() {
    if (!this.hidden) {
      this.lines.forEach((line) => line.draw());
      this.show();
      this.origin && this.showOriginProps();
    }
  }
}
