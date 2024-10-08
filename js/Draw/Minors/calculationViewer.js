class CalculationViewer extends Draggable {
  constructor(x, y) {
    super(x, y, 200, 200);
  }

  draw() {
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10] },
      { func: "textAlign", args: [CENTER, CENTER] },
    ];
    executeDrawingCommands(commands);
  }
}
