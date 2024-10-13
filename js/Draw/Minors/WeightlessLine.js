class WeightlessLine {
  constructor(from, to) {
    this.from = from;
    this.to = to;
    this.offsetX = 0;
    this.offsetY = 0;
    this.tidy = false;
  }

  setOffsets(x, y) {
    this.tidy = true;
    this.offsetX = x;
    this.offsetY = y;
  }

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

    const commands = this.tidy
      ? [
          { func: "noFill", args: [] },
          { func: "beginShape", args: [] },
          { func: "vertex", args: [sourceX, sourceY] },
          { func: "vertex", args: [sourceX, sourceY + this.offsetY] },
          { func: "vertex", args: [targetX, sourceY + this.offsetY] },
          { func: "vertex", args: [targetX, targetY] },
          { func: "endShape", args: [] },
        ]
      : [{ func: "line", args: [sourceX, sourceY, targetX, targetY] }];

    executeDrawingCommands(commands);
  }

  draw(forceDraw = false) {
    const shouldDraw =
      forceDraw ||
      this.isTemp() ||
      !(this.from.isHidden() || this.to.isHidden());
    shouldDraw && this.show();
  }
}
