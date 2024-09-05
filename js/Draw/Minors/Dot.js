class Dot {
  constructor(parent) {
    this.parent = parent;
    this.rollover = false;
    this.occupied = false;
    this.r = 20;
    this.hidden = false;
    this.updateCoordinates();
  }

  isHidden() {
    return this.hidden;
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

  combineMlpViews() {
    const activeLine = mainOrganizer.getActiveLine();
    if (!activeLine) return;

    const isInput = this.isInput();

    const layer1 = activeLine.from.parent;
    const layer2 = this.parent;
    if (layer1 instanceof InputLayer && !isInput) return;
    if (layer1 instanceof OutputLayer && isInput) return;
    const [majorLayer, minorLayer] = isInput
      ? [layer1, layer2]
      : [layer2, layer1];

    majorLayer.connectLayer(minorLayer);
    mainOrganizer.setActiveLine(null);
  }

  handlePressed() {
    if (this.isHidden() || !this.rollover) return;
    const activeLine = mainOrganizer.getActiveLine();

    if (!activeLine) {
      mainOrganizer.setActiveLine(new WeightlessLine(this, null, true));
      return;
    }

    if (activeLine.from === this) {
      mainOrganizer.setActiveLine(null);
      return;
    }

    this.combineMlpViews();
  }

  show() {
    const r = this.r + (this.rollover ? 5 : 0);
    const start = this.isInput() ? HALF_PI : PI + TWO_PI + HALF_PI;
    const stop = this.isInput() ? HALF_PI + PI : HALF_PI;

    const commands = [
      { func: "fill", args: this.isOccupied() ? [0, 255, 0] : [255, 0, 0] },
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
