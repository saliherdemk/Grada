class Viewer extends Draggable {
  constructor(x, y, w = 300, h = 100) {
    super(x, y, w, h);
    this.line = null;
    this.removeButton = new ImageButton("delete", () => this.handleRemove());
    this.data = [];
    this.dot = null;
    this.dark = false;
  }

  getPressables() {
    return [this.removeButton];
  }

  updateButtonCoordinates() {
    const button = this.removeButton;
    button.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
  }

  postUpdateCoordinates() {
    this.dot.updateCoordinates();
    this.updateButtonCoordinates();
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  adjustOffsets() {}
  handleRemove() {}

  setLine(from) {
    this.line = new WeightlessLine(from, this.dot);
    from.occupy();
    this.dot.occupy();
    this.adjustOffsets();
  }

  showPlaceHolder() {
    LoadingIndiactor.drawText(
      this.x,
      this.y,
      this.w,
      this.h,
      "Go one step to see details",
      18,
    );
  }

  show() {
    const commands = [
      { func: "fill", args: [this.dark ? 30 : 255] },
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10] },
      { func: "textAlign", args: [CENTER, CENTER] },
    ];
    executeDrawingCommands(commands);
    this.data.length ? this.showData() : this.showPlaceHolder();
  }

  draw() {
    this.line?.draw(true);
    this.show();
    this.dot.draw();
    this.removeButton.draw();
  }

  destroy() {
    this.dot.destroy();
    this.dot = null;
    this.line?.destroy();
    this.line = null;
  }
}
