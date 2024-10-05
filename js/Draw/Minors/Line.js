class Line extends WeightlessLine {
  constructor(from, to) {
    super(from, to);
    this.weight = null;
    this.grad = null;
  }

  setWeight(w) {
    this.weight = w;
  }

  setGrad(g) {
    this.grad = g;
  }

  getWeight() {
    return this.weight?.toFixed(2).toString() ?? "";
  }

  getGrad() {
    return this.grad?.toFixed(2).toString() ?? "";
  }

  showData() {
    this.drawText(this.getWeight(), themeManager.getColor("blue"));
  }

  showGrad() {
    this.drawText(this.getGrad(), themeManager.getColor("cyan"), 10);
  }

  drawText(text, colorArg, yOffset = 0) {
    let { x, y, angle } = this.getTextCoordinates(text);
    y += yOffset;

    for (const char of text) {
      const commands = [
        { func: "stroke", args: colorArg },
        { func: "fill", args: colorArg },
        { func: "translate", args: [x, y] },
        { func: "rotate", args: [angle] },
        { func: "textSize", args: [6] },
        { func: "text", args: [char, 0, 0] },
      ];
      executeDrawingCommands(commands);

      const charWidth = textWidth(char);
      x += cos(angle) * charWidth;
      y += sin(angle) * charWidth;
    }
  }

  getTextCoordinates(text) {
    const { x: x1, y: y1 } = this.from;
    const { x: x2, y: y2 } = this.to;

    const angle = atan2(y2 - y1, x2 - x1);
    let totalTextWidth = 0;
    for (let i = 0; i < text.length; i++) {
      totalTextWidth += textWidth(text[i]);
    }
    const lineLength = dist(x1, y1, x2, y2);
    const offsetX = (lineLength - totalTextWidth) / 2;

    const x = x1 + cos(angle) * offsetX;
    const y = y1 - 2 + sin(angle) * offsetX;

    return { x, y, angle };
  }

  show() {
    super.show();
    this.showData();
    this.showGrad();
  }
}
