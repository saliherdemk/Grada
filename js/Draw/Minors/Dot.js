class Dot {
  constructor(parent) {
    this.parent = parent;
    this.rollover = false;
    this.occupied = false;
    this.r = 20;
    this.hidden = false;
    this.color = [244, 63, 94];
    this.theme = "red";
    this.setColor();
    this.updateCoordinates();
  }

  isHidden() {
    return this.hidden || this.isOccupied();
  }

  hide() {
    this.hidden = true;
  }

  visible() {
    this.hidden = false;
  }

  isInput() {
    return this.parent.inputDot == this;
  }

  isOccupied() {
    return this.occupied;
  }

  occupy() {
    this.occupied = true;
    this.parent.removeButton?.changeImg("brokenLink");
  }

  free() {
    this.occupied = false;
    const parent = this.parent;
    const allFree = parent.getDots().every((d) => !d?.isOccupied());

    allFree && parent.removeButton?.changeImg("delete");
  }

  destroy() {
    this.parent = null;
  }

  updateCoordinates() {
    const parent = this.parent;
    this.x = this.isInput() ? parent.x : parent.x + parent.w;
    this.y = parent.y + parent.h / 2;
  }

  over() {
    this.rollover = iManager.isHovered(this);
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
      const layer1 = activeLine.from.parent;
      const layer2 = this.parent;
      layer1 !== layer2 && layer1.connectLayer(layer2);
    }
    mainOrganizer.setActiveLine(null);
  }

  getTheme() {
    return this.theme;
  }

  setColor(theme = "red") {
    this.theme = theme;
    this.color = themeManager.getColor(theme);
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

  draw() {
    if (this.isHidden()) return;
    this.show();
    this.over();
  }
}
