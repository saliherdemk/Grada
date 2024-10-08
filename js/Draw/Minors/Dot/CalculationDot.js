class CalculationDot extends Dot {
  constructor(parent, isInput = false) {
    super(parent, isInput);
    this.setColor("yellow");
  }

  updateCoordinates() {
    const parent = this.parent;
    this.x = parent.x + parent.w / 2;
    this.y = parent.y + (this.isInput() ? 0 : parent.h);
  }

  handlePressed() {
    if (this.isHidden() || !iManager.checkRollout(this)) return;
    const calculationViewer = new CalculationViewer(0, 0);
    calculationViewer.setLine(this);
    this.parent.setCalculationComponent(calculationViewer);
  }

  show() {
    const r = this.r + (this.rollover ? 5 : 0);
    const start = this.isInput() ? PI : 0;
    const stop = this.isInput() ? 0 : PI;

    const commands = [
      { func: "fill", args: this.color },
      { func: "arc", args: [this.x, this.y, r, r, start, stop] },
    ];

    executeDrawingCommands(commands);
  }
}
