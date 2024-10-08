class CalculationViewer extends Draggable {
  constructor(x, y) {
    super(x, y, 200, 200);
    this.dot = new CalculationDot(this, true);
    this.line = null;
    this.removeButton = new ImageButton("delete", () => this.handleRemove());
  }

  getPressables() {
    return [this.removeButton];
  }

  updateButtonCoordinates() {
    const button = this.removeButton;
    button.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
  }

  handleRemove() {
    this.line.from.parent.removeCalculationComponent();
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.dot.updateCoordinates();
    this.updateButtonCoordinates();
  }

  setLine(from) {
    this.line = new WeightlessLine(from, this.dot);
    this.line.setOffsets(0, 50);
    from.occupy();
    this.dot.occupy();
  }

  show() {
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10] },
      { func: "textAlign", args: [CENTER, CENTER] },
    ];
    executeDrawingCommands(commands);
  }

  draw() {
    this.show();
    this.dot.draw();
    this.line?.draw(true);
    this.removeButton.draw();
  }

  destroy() {
    this.dot.destroy();
    this.dot = null;
    this.line?.destroy();
    this.line = null;
  }
}
