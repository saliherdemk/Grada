class LoadingIndiactor {
  // more calcualtions going on it's getting faster. what a touch...
  static angle = 0;

  static drawDisabledBackground(x, y, w, h, r = 10) {
    const commands = [
      { func: "fill", args: ["rgba(0, 0, 0, 0.2)"] },
      { func: "rect", args: [x, y, w, h, r] },
    ];
    executeDrawingCommands(commands);
  }

  static drawText(x, y, w, h, text) {
    this.drawDisabledBackground(x, y, w, h);
    const commands = [
      { func: "stroke", args: [255] },
      { func: "strokeWeight", args: [3] },
      { func: "textSize", args: [w / 8] },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "text", args: [text, x + w / 2, y + h / 2] },
    ];
    executeDrawingCommands(commands);
  }

  static draw(x, y, w, h, text = "") {
    const radius = w / 8;
    const commands = [
      { func: "fill", args: ["rgba(0, 0, 0, 0.2)"] },
      { func: "rect", args: [x, y, w, h, 10] },
      { func: "strokeWeight", args: [4] },
      { func: "stroke", args: [255] },
      { func: "noFill", args: [] },
      { func: "translate", args: [x + w / 2, y + h / 2] },
      { func: "rotate", args: [this.angle] },
      { func: "arc", args: [0, 0, radius * 2, radius * 2, 0, HALF_PI] },
    ];

    this.angle += 0.02;
    if (this.angle >= TWO_PI) {
      this.angle = 0;
    }
    executeDrawingCommands(commands);

    text.length && this.drawText(x + w / 2, y + h / 2, text, radius);
  }
}
