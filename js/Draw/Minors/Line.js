class Line {
  constructor(from, to, temp = false) {
    this.w = null;
    this.from = from;
    this.to = to;
    this.temp = temp;
  }

  getSourceNeuron() {
    return this.from;
  }

  clearOrigin() {
    this.w = null;
  }

  setOrigin(w) {
    this.w = w;
  }

  getWeight() {
    return this.w?.data.toFixed(4).toString() ?? "";
  }

  destroy() {
    this.w = null;
    this.from = null;
    this.to = null;
  }

  isTemp() {
    return this.temp;
  }

  showProps() {
    const x1 = this.from.x;
    const x2 = this.to.x;
    const y1 = this.from.y;
    const y2 = this.to.y;
    let angle = atan2(y2 - y1, x2 - x1);
    const text = this.getWeight();
    let totalTextWidth = 0;
    for (let i = 0; i < text.length; i++) {
      totalTextWidth += textWidth(text[i]);
    }

    let lineLength = dist(x1, y1, x2, y2);
    let offsetX = (lineLength - totalTextWidth) / 2;

    let x = x1 + cos(angle) * offsetX;
    let y = y1 + sin(angle) * offsetX;

    for (let i = 0; i < text.length; i++) {
      const commands = [
        {
          func: "translate",
          args: [x, y],
        },
        { func: "rotate", args: [angle] },
        { func: "text", args: [text[i], 0, 0] },
      ];
      executeDrawingCommands(commands);

      x += cos(angle) * textWidth(text[i]);
      y += sin(angle) * textWidth(text[i]);
    }
  }

  show() {
    const { mouseX, mouseY } = getCurrentMouseCoordinates();
    const { x: targetX, y: targetY } = this.isTemp()
      ? iManager.getAbsoluteCoordinates(mouseX, mouseY)
      : { x: this.to.x, y: this.to.y };
    const sourceX = this.from.x;
    const sourceY = this.from.y;

    const commands = [
      { func: "line", args: [sourceX, sourceY, targetX, targetY] },
    ];

    executeDrawingCommands(commands);
    !this.isTemp() && this.showProps();
  }

  draw() {
    const willDrew =
      this.isTemp() || !(this.from.isHidden() || this.to.isHidden());
    willDrew && this.show();
  }
}
