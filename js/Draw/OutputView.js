class OutputView extends Draggable {
  constructor(name, data) {
    const { x, y } = iManager.getAbsoluteCoordinates(800, 300);
    super(x, y);
    this.name = name;
    this.w = 200;
    this.h = 300;
    this.data = data;
  }
  pressed() {
    iManager.checkRollout(this);
  }
  handlePressed() {
    this.pressed();
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10, 10] },
      {
        func: "text",
        args: [this.name + " Output", this.x + 5, this.y - 20, this.w, this.h],
      },
    ];
    executeDrawingCommands(commands);
  }
}
