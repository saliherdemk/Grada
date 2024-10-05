class NeuronView {
  constructor(i) {
    this.x;
    this.y;
    this.index = i;
    this.hidden = false;
    this.lines = [];
    this.origin = null;
    this.r = 25;
  }

  getOutput() {
    return this.origin?.outputs[this.index] ?? "";
  }

  getBias() {
    return this.origin.biases.data[this.index];
  }

  getBiasGrad() {
    return this.origin.biases.grad?.[this.index] ?? 0;
  }

  clearOrigin() {
    this.lines.forEach((l) => l.clearOrigin());
    this.origin = null;
  }

  setOrigin(obj) {
    console.log(obj);
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
    const { defaultColor: blue } = themeManager.getTheme("blue");
    const { defaultColor: cyan } = themeManager.getTheme("cyan");
    const { defaultColor: gray } = themeManager.getTheme("gray");
    return [
      { func: "fill", args: [blue] },
      { func: "stroke", args: [blue] },
      {
        func: "text",
        args: [this.getBias(), this.x, this.y - this.r / 2 - 5],
      },
      { func: "fill", args: [cyan] },
      { func: "stroke", args: [cyan] },
      {
        func: "text",
        args: [this.getBiasGrad(), this.x, this.y - this.r / 2 - 15],
      },
      { func: "fill", args: [gray] },
      { func: "stroke", args: [gray] },
      {
        func: "text",
        args: [this.getOutput(), this.x, this.y],
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

    this.origin && this.getOriginProps().forEach((p) => commands.push(p));
    executeDrawingCommands(commands);
  }

  draw() {
    if (!this.hidden) {
      this.lines.forEach((line) => line.draw());
      this.show();
    }
  }
}
