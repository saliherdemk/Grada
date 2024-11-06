class Draggable {
  constructor(_x, _y, w, h) {
    const { x, y } = iManager.getAbsoluteCoordinates(_x, _y);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.removeButton = new ImageButton("delete", () => this.handleRemove());
  }

  handleDoubleClicked() {}

  doubleClicked() {}

  handleRemove() {
    this.destroy();
  }

  updateButtons(hide) {
    const button = this.removeButton;
    hide ? button.hide() : button.visible();
  }

  destroy() {}

  getDots() {
    let dots = [];
    this.inputDot && dots.push(this.inputDot);
    this.outputDot && dots.push(this.outputDot);
    return dots;
  }

  getPressables() {
    return [this.removeButton];
  }

  postUpdateCoordinates() {
    const btn = this.removeButton;
    btn.setCoordinates(this.x + (this.w - btn.w) / 2, this.y + this.h);
  }

  handleDrag(x, y) {
    this.updateCoordinates(x, y);
  }

  handlePressed() {
    this.getPressables().forEach((p) => p.handlePressed());
    iManager.checkRollout(this);
  }

  handleKeyPressed(_k) {}

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  setDimensions(w, h) {
    this.w = w;
    this.h = h;
    return this;
  }

  updateCoordinates(x, y) {
    this.setCoordinates(x, y);
  }
}
