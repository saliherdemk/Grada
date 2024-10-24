class FlattenInputDot extends Dot {
  constructor(parent) {
    super(parent, true);
    this.setColor("black");
  }

  updateCoordinates() {
    this.x = this.parent.x;
    this.y = this.parent.y + this.parent.h / 2;
  }

  handlePressed() {
    if (this.isHidden() || !iManager.checkRollout(this)) return;
    const activeLine = mainOrganizer.getActiveLine();

    if ((!activeLine, activeLine.from.getTheme() !== this.getTheme())) return;
    activeLine.from.parent.setConnected(this.parent);
    this.occupy();
    activeLine.from.occupy();
    mainOrganizer.setActiveLine(null);
  }

  show() {
    const r = this.r + (this.rollover ? 5 : 0);
    const commands = [
      { func: "fill", args: this.color },
      { func: "arc", args: [this.x, this.y, r, r, HALF_PI, HALF_PI + PI] },
    ];

    executeDrawingCommands(commands);
  }
}
