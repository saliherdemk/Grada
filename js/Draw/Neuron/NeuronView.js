class DrawNeuron {
  constructor(cnv) {
    this.canvas = cnv;
    this.x;
    this.y;
    this.hidden = false;
    this.lines = [];
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
    this.canvas = null;
  }

  show() {
    const commands = [
      { func: "fill", args: [255] },
      { func: "circle", args: [this.x, this.y, 25, 25] },
      { func: "fill", args: [0] },
      {
        func: "text",
        args: [this.output?.data.toFixed(2), this.x + 30, this.y],
      },
      {
        func: "text",
        args: [this.output?.grad.toFixed(2), this.x + 30, this.y + 25],
      },
      { func: "fill", args: [255] },
    ];
    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    if (!this.hidden) {
      this.lines.forEach((line) => line.draw());
      this.show();
    }
  }
}
