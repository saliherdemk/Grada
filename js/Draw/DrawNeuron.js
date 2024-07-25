class DrawNeuron {
  constructor(neuron, cnv, x, y) {
    this.origin = neuron;
    this.canvas = cnv;
    this.x = x;
    this.y = y;
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

  destroy() {
    this.lines.forEach((line) => line.destroy());
    this.lines = [];
    this.origin = null;
    this.canvas = null;
  }

  show() {
    const commands = [
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

class Line {
  constructor(from, to, isTemp = false) {
    this.from = from;
    this.to = to;
    this.isTemp = isTemp;
  }
  destroy() {
    this.from = null;
    this.to = null;
  }

  show() {
    line(
      this.from.x,
      this.from.y,
      this.isTemp ? mouseX : this.to.x,
      this.isTemp ? mouseY : this.to.y,
    );
  }

  draw() {
    const willDrew =
      organizer.getActiveLine() ||
      !(this.from.isHidden() || this.to.isHidden());
    willDrew && this.show();
  }
}
