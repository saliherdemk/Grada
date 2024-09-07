class WeightlessLine {
  constructor(from, to) {
    this.from = from;
    this.to = to;
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
    return this.to == null;
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
