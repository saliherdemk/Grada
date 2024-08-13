class TextButton extends CanvasButton {
  constructor(text, onClick) {
    super(onClick);
    this.text = text;
    this.padding = 5;
    this.theme = "blue";
  }

  setTheme(theme) {
    this.theme = theme;
    return this;
  }

  getTheme() {
    const alpha = this.isDisabled() ? 125 : 255;
    let defaultColor;
    let activeColor;
    if (this.theme == "blue") {
      defaultColor = [0, 86, 179, alpha];
      activeColor = [0, 123, 255, alpha];
    } else if (this.theme == "red") {
      defaultColor = [244, 63, 94, alpha];
      activeColor = [199, 44, 72, alpha];
    }

    return { defaultColor, activeColor };
  }

  setText(text) {
    this.text = text;
    return this;
  }

  show() {
    const x = this.x;
    const y = this.y;
    const w = this.w;
    const h = this.h;

    const { defaultColor, activeColor } = this.getTheme();

    const color = this.isRollout() ? defaultColor : activeColor;

    const commands = [
      { func: "fill", args: color },
      { func: "noStroke", args: [] },
      { func: "rect", args: [x, y, w, h, 5] },
      { func: "fill", args: [255, 255, 255] },
      { func: "textAlign", args: [CENTER, CENTER] },
      {
        func: "text",
        args: [this.text, x, y, w, h],
      },
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    this.show();
  }
}
