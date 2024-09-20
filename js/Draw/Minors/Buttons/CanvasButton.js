class CanvasButton extends Pressable {
  constructor(onClick) {
    super();
    this.x = 0;
    this.y = 0;
    this.w = 25;
    this.h = 25;
    this.disabled = false;
    this.hidden = false;
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

  draw() {
    !this.isHidden() && this.show();
  }
}
