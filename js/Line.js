class Line {
  constructor(from, to) {
    this.from = from;
    this.to = to;
    this.w = new Value(Math.random() * 2 - 1);
  }

  draw() {
    !(this.from.isHidden() || this.to.isHidden()) &&
      line(this.from.x, this.from.y, this.to.x, this.to.y);
  }
}
