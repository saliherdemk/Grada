class Dot {
  constructor(parent, isInput) {
    this.parent = parent;
    this.isInput = isInput;
    this.rollover = false;
    this.occupied = false;
    this.r = 20;
    this.updateCoordinates();
  }

  isOccupied() {
    return this.occupied;
  }

  occupy() {
    this.occupied = true;
    this.parent.button.changeImg("brokenLink");
  }

  free() {
    this.occupied = false;
    const allFree = this.parent.dots.every((d) => !d.isOccupied());

    allFree && this.parent.button.changeImg("delete");
  }

  destroy() {
    this.parent = null;
  }

  updateCoordinates() {
    const parent = this.parent;
    this.x = this.isInput ? parent.x : parent.x + parent.w;
    this.y = parent.y + parent.h / 2;
  }

  over() {
    this.rollover = iManager.isHovered(this);
  }

  combineSchemas() {
    const activeLine = organizer.getActiveLine();
    if (!activeLine) return;

    const layer1 = activeLine.from.parent;
    const layer2 = this.parent;
    const [majorLayer, minorLayer] = this.isInput
      ? [layer1, layer2]
      : [layer2, layer1];

    majorLayer.connectLayer(minorLayer);
    organizer.setActiveLine(null);
  }

  handlePressed() {
    if (!this.rollover) return;
    const activeLine = organizer.getActiveLine();

    if (!activeLine) {
      organizer.setActiveLine(new Line(this, null, true));
      return;
    }

    if (activeLine.from === this) {
      organizer.setActiveLine(null);
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
