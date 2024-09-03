class WeightlessLine {
  constructor(from, to, temp = false) {
    this.from = from;
    this.to = to;
    this.temp = temp;
  }

  clearOrigin() {}

  getSourceNeuron() {
    return this.from;
  }

  destroy() {
    this.from = null;
    this.to = null;
  }

  isTemp() {
    return this.temp;
  }

  show() {
    const { mouseX, mouseY } = getCurrentMouseCoordinates();
    const { x: targetX, y: targetY } = this.isTemp()
      ? iManager.getAbsoluteCoordinates(mouseX, mouseY)
      : this.to;

    const { x: sourceX, y: sourceY } = this.from;

    const commands = [
      { func: "line", args: [sourceX, sourceY, targetX, targetY] },
    ];
    executeDrawingCommands(commands);
  }

  draw() {
    const shouldDraw =
      this.isTemp() || !(this.from.isHidden() || this.to.isHidden());
    shouldDraw && this.show();
  }
}
