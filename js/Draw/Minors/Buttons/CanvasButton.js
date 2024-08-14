class CanvasButton {
  constructor(onClick) {
    this.x = 0;
    this.y = 0;
    this.w = 25;
    this.h = 25;
    this.onClick = onClick;
    this.disabled = false;
  }

  disable() {
    this.disabled = true;
  }

  enable() {
    this.disabled = false;
  }

  isDisabled() {
    return this.disabled;
  }

  isRollout() {
    return iManager.isHovered(this);
  }

  setDimensions(w, h) {
    this.w = w;
    this.h = h;
    return this;
  }

  destroy() {
    this.onClick = null;
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  handlePressed() {
    this.isRollout() && !this.isDisabled() && this.onClick();
  }
}
