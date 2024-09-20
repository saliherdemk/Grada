class CanvasButton extends Pressable {
  constructor(onClick) {
    super();
    this.x = 0;
    this.y = 0;
    this.w = 25;
    this.h = 25;
    this.disabled = false;
    this.hidden = false;
    this.angle = 0;
    this.loading = false;
    this.setOnClick(() => !this.isDisabled() && onClick());
  }

  isHidden() {
    return this.hidden;
  }

  hide() {
    this.hidden = true;
    this.disable();
    return this;
  }

  visible() {
    this.hidden = false;
    this.enable();
    return this;
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

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  setLoading(state) {
    this.loading = state;
    this.loading ? this.disable() : this.enable();
  }

  showLoading() {
    let radius = 10;
    const commands = [
      { func: "strokeWeight", args: [4] },
      { func: "stroke", args: [0] },
      { func: "noFill", args: [] },
      { func: "translate", args: [this.x + this.w / 2, this.y + this.h / 2] },
      { func: "rotate", args: [this.angle] },
      {
        func: "arc",
        args: [0, 0, radius * 2, radius * 2, 0, HALF_PI],
      },
    ];

    this.angle += 0.05;
    if (this.angle >= TWO_PI) {
      this.angle = 0;
    }
    executeDrawingCommands(commands);
  }

  draw() {
    !this.isHidden() && this.show();
    this.showLoading();
  }
}
