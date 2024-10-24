class DigitInput extends Draggable {
  constructor(x, y) {
    super(x, y, 280 + 50, 280 + 75);
    this.grid = new DigitInputGrid(0, 0);
    this.outputDot = new LayerDot(this, false);
    this.connectedLine = null;
    this.initialize();
  }

  clearConnected() {
    this.outputDot.free();
    this.connectedLine.destroy();
    this.connectedLine = null;
  }

  setConnected(component) {
    this.connectedLine = new Line(this.outputDot, component.inputDot);
    component.setSource(this);
  }

  handleRemove() {
    if (this.connectedLine) {
      this.connectedLine.to.parent.clearSource();
      return;
    }
    this.destroy();
  }

  setPartSize(ps) {
    this.partSize = ps;
  }

  initialize() {
    this.outputDot.setColor("black");
    this.clearButton = new TextButton("Clear shortcut: R", () => {
      this.grid.clear();
    }).setDimensions(this.grid.w, 25);
    this.postUpdateCoordinates();
  }

  postUpdateCoordinates() {
    this.grid.setCoordinates(this.x + 25, this.y + 25);
    this.clearButton.setCoordinates(this.x + 25, this.y + this.h - 35);
    this.outputDot.updateCoordinates();
    super.postUpdateCoordinates();
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  getPressables() {
    return [this.removeButton, this.clearButton, this.outputDot, this.grid];
  }

  doubleClicked() {}

  handleKeyPressed(k) {
    iManager.isHovered(this) && k == "r" && this.grid.clear();
  }

  show() {
    const middleX = this.x + this.w / 2;
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10] },
      { func: "textAlign", args: [CENTER, CENTER] },
      {
        func: "text",
        args: ["Grid Input", middleX, this.y - 10],
      },
    ];

    executeDrawingCommands(commands);
  }

  destroy() {
    mainOrganizer.removeComponent(this);
  }

  draw() {
    this.show();
    this.grid.draw();
    this.clearButton.draw();
    this.removeButton.draw();
    this.outputDot.draw();
    this.connectedLine?.draw(true);
  }
}
