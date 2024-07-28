class Line {
  constructor(from, to, temp = false) {
    this.from = from;
    this.to = to;
    this.temp = temp;
  }
  destroy() {
    this.from = null;
    this.to = null;
  }

  isTemp() {
    return this.temp;
  }

  show() {
    line(
      this.from.x,
      this.from.y,
      this.isTemp() ? mouseX : this.to.x,
      this.isTemp() ? mouseY : this.to.y,
    );
  }

  draw() {
    const willDrew =
      this.isTemp() || !(this.from.isHidden() || this.to.isHidden());
    willDrew && this.show();
  }
}
