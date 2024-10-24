class LayerDot extends Dot {
  constructor(parent, isInput = false) {
    super(parent, isInput);
    this.setColor("red");
  }

  updateCoordinates() {
    const parent = this.parent;
    this.x = this.isInput() ? parent.x : parent.x + parent.w;
    this.y = parent.y + parent.h / 2;
  }

  handlePressed() {
    if (this.isHidden() || !iManager.checkRollout(this)) return;

    const activeLine = mainOrganizer.getActiveLine();

    if (!activeLine) {
      !this.isInput() &&
        mainOrganizer.setActiveLine(new WeightlessLine(this, null));
      return;
    }
    if (activeLine.from.getTheme() !== this.getTheme()) return;
    if (this.isInput()) {
      const layer2 = this.parent;
      const layer1 = activeLine.from.parent;
      layer1 !== layer2 && layer1.connectLayer(layer2);
    }
    mainOrganizer.setActiveLine(null);
  }

  show() {
    const r = this.r + (this.rollover ? 5 : 0);
    const start = this.isInput() ? HALF_PI : PI + TWO_PI + HALF_PI;
    const stop = this.isInput() ? HALF_PI + PI : HALF_PI;

    const commands = [
      { func: "fill", args: this.color },
      { func: "arc", args: [this.x, this.y, r, r, start, stop] },
    ];

    executeDrawingCommands(commands);
  }
}
