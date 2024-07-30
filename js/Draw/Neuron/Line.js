class Line {
  constructor(from, to, temp = false) {
    this.from = from;
    this.to = to;
    this.temp = temp;
  }
  destroy() {
    this.from = null;
    this.to = null;
  }

  isTemp() {
    return this.temp;
  }

  show() {
    const { x, y } = this.isTemp()
      ? iManager.getAbsoluteCoordinates(mouseX, mouseY)
      : { x: this.to.x, y: this.to.y };

    const commands = [{ func: "line", args: [this.from.x, this.from.y, x, y] }];
    executeDrawingCommands(commands);
  }

  draw() {
    const willDrew =
      this.isTemp() || !(this.from.isHidden() || this.to.isHidden());
    willDrew && this.show();
  }
}
