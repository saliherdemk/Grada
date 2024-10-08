class Dot {
  constructor(parent, isInput) {
    this.parent = parent;
    this.rollover = false;
    this.occupied = false;
    this.input = isInput;
    this.r = 20;
    this.hidden = false;
    this.color = [244, 63, 94];
    this.setColor();
    this.updateCoordinates();
  }

  isHidden() {
    return this.hidden || this.isOccupied();
  }

  isInput() {
    return this.input;
  }

  hide() {
    this.hidden = true;
  }

  visible() {
    this.hidden = false;
  }

  isOccupied() {
    return this.occupied;
  }

  over() {
    this.rollover = iManager.isHovered(this);
  }

  getTheme() {
    return this.theme;
  }

  handlePressed() {}

  setColor(theme = "red") {
    this.theme = theme;
    this.color = themeManager.getColor(theme);
  }

  draw() {
    if (this.isHidden()) return;
    this.show();
    this.over();
  }
}
