class Dot {
  constructor(parent) {
    this.parent = parent;
    this.rollover = false;
    this.occupied = false;
    this.r = 20;
    this.updateCoordinates();
  }

  isInput() {
    return this.parent.inputDot == this;
  }

  isOccupied() {
    return this.occupied;
  }

  occupy() {
    this.occupied = true;
    this.parent.removeButton.changeImg("brokenLink");
  }

  free() {
    this.occupied = false;
    const parent = this.parent;
    const allFree = parent.getDots().every((d) => !d.isOccupied());

    allFree && parent.removeButton.changeImg("delete");
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

  combineSchemas() {
    const activeLine = mainOrganizer.getActiveLine();
    if (!activeLine) return;

    const layer1 = activeLine.from.parent;
    const layer2 = this.parent;
    const [majorLayer, minorLayer] = this.isInput()
      ? [layer1, layer2]
      : [layer2, layer1];

    majorLayer.connectLayer(minorLayer);
    mainOrganizer.setActiveLine(null);
  }

  handlePressed() {
    if (!this.rollover) return;
    const activeLine = mainOrganizer.getActiveLine();

    if (!activeLine) {
      mainOrganizer.setActiveLine(new Line(this, null, true));
      return;
    }

    if (activeLine.from === this) {
      mainOrganizer.setActiveLine(null);
      return;
    }

    this.combineSchemas();
  }

  show() {
    const r = this.r + (this.rollover ? 5 : 0);
    const commands = [
      { func: "fill", args: this.isOccupied() ? [0, 255, 0] : [255, 0, 0] },
      { func: "circle", args: [this.x, this.y, r] },
    ];

    executeDrawingCommands(commands);
  }
  draw() {
    this.show();
    this.over();
  }
}
