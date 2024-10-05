class NeuronView {
  constructor(i) {
    this.x;
    this.y;
    this.output = "";
    this.bias = "";
    this.biasGrad = "";
    this.index = i;
    this.hidden = false;
    this.lines = [];
    this.r = 25;
  }

  setOutput(o) {
    this.output = o.toFixed(2).toString();
  }

  setBias(b) {
    this.bias = b.toFixed(2).toString();
  }

  setBiasGrad(g) {
    this.biasGrad = g.toFixed(2).toString();
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
    const { defaultColor: blue } = themeManager.getTheme("blue");
    const { defaultColor: cyan } = themeManager.getTheme("cyan");
    const { defaultColor: gray } = themeManager.getTheme("gray");
    return [
      { func: "fill", args: [blue] },
      { func: "stroke", args: [blue] },
      {
        func: "text",
        args: [this.bias, this.x, this.y - this.r / 2 - 5],
      },
      { func: "fill", args: [cyan] },
      { func: "stroke", args: [cyan] },
      {
        func: "text",
        args: [this.biasGrad, this.x, this.y - this.r / 2 - 15],
      },
      { func: "fill", args: [gray] },
      { func: "stroke", args: [gray] },
      {
        func: "text",
        args: [this.output, this.x, this.y],
      },
    ];
  }

  show() {
    const commands = [
      { func: "fill", args: [255] },
      { func: "circle", args: [this.x, this.y, this.r] },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "textSize", args: [8] },
    ];

    this.getOriginProps().forEach((p) => commands.push(p));
    executeDrawingCommands(commands);
  }

  draw() {
    if (!this.hidden) {
      this.lines.forEach((line) => line.draw());
      this.show();
    }
  }
}
