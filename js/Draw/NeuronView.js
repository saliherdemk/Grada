class NeuronView {
  constructor() {
    this.x;
    this.y;
    this.hidden = false;
    this.lines = [];
    this.origin = null;
    this._output = ""; // FIXME I hated it.
    this.r = 25;
  }

  setOutput(o) {
    this._output = o;
  }

  getOutput() {
    return this._output;
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

  getOriginProps() {
    const origin = this.origin;
    const o = origin.output;
    const b = origin.b;
    const { defaultColor: blue } = themeManager.getTheme("blue");
    const { defaultColor: cyan } = themeManager.getTheme("cyan");
    const { defaultColor: gray } = themeManager.getTheme("gray");
    return [
      { func: "fill", args: [blue] },
      { func: "stroke", args: [blue] },
      {
        func: "text",
        args: [b.getFixedData(2), this.x, this.y - this.r / 2 - 5],
      },
      { func: "fill", args: [cyan] },
      { func: "stroke", args: [cyan] },
      {
        func: "text",
        args: [b.getFixedGrad(2), this.x, this.y - this.r / 2 - 15],
      },
      { func: "fill", args: [gray] },
      { func: "stroke", args: [gray] },
      { func: "text", args: [o.getFixedData(2), this.x, this.y] },
    ];
  }

  getOutputProps() {
    const { defaultColor: gray } = themeManager.getTheme("gray");
    return [
      { func: "fill", args: [gray] },
      { func: "stroke", args: [gray] },
      { func: "text", args: [this.getOutput(), this.x, this.y] },
    ];
  }

  show() {
    const commands = [
      { func: "fill", args: [255] },
      { func: "circle", args: [this.x, this.y, this.r] },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "textSize", args: [8] },
    ];
    const props = this.origin ? this.getOriginProps() : this.getOutputProps();
    props.forEach((p) => commands.push(p));
    executeDrawingCommands(commands);
  }

  draw() {
    if (!this.hidden) {
      this.lines.forEach((line) => line.draw());
      this.show();
    }
  }
}
