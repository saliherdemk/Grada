class LossGraphDot extends Dot {
  constructor(parent, isInput = false) {
    super(parent, isInput);
    this.setColor("sky");
  }

  updateCoordinates() {
    const parent = this.parent;
    this.x = parent.x + parent.w / 2;
    this.y = parent.y;
  }

  show() {
    const r = this.r + (this.rollover ? 5 : 0);
    const start = PI;
    const stop = 0;

    const commands = [
      { func: "fill", args: this.color },
      { func: "arc", args: [this.x, this.y, r, r, start, stop] },
    ];

    executeDrawingCommands(commands);
  }
}
