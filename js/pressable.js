class Pressable {
  constructor() {
    this.onClick = () => {};
  }

  handlePressed() {
    iManager.checkRollout(this) && this.onClick();
  }

  setOnClick(func) {
    this.onClick = func;
  }

  destroy() {
    this.onClick = null;
  }
}
