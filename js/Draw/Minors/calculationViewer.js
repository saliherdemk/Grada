class CalculationViewer extends Draggable {
  constructor(x, y) {
    super(x, y, 300, 225);
    this.dot = new CalculationDot(this, true);
    this.line = null;
    this.removeButton = new ImageButton("delete", () => this.handleRemove());
    this.data = [];
    this.inputData = null;
  }

  setInputData(data, shape) {
    this.inputData = { data, shape };
  }

  setData(data) {
    console.log(this.inputData);
    console.log(data);
  }

  getPressables() {
    return [this.removeButton];
  }

  updateButtonCoordinates() {
    const button = this.removeButton;
    button.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
  }

  handleRemove() {
    this.line.from.parent.removeCalculationComponent();
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.dot.updateCoordinates();
    this.updateButtonCoordinates();
  }

  setLine(from) {
    this.line = new WeightlessLine(from, this.dot);
    this.line.setOffsets(0, 60);
    from.occupy();
    this.dot.occupy();
  }

  show() {
    const commands = [
      { func: "fill", args: [255] },
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10] },
      { func: "textAlign", args: [CENTER, CENTER] },
    ];
    executeDrawingCommands(commands);
  }

  createMatrixView(dataObject) {
    const { data, shape } = dataObject;
    const padding = 30;
    const boxX = this.x + padding;
    const offset = (Math.max(6 - shape[0], 0) * padding) / 2;
    const boxY = this.y + offset + padding;

    const rowExceeds = shape[1] > data[0].length;
    const colExceeds = shape[0] > data.length;

    const x = boxX - padding / 2;
    const y = boxY - padding / 2;
    const w = (data[0].length + +rowExceeds) * padding + 7;
    const h = (data.length + +colExceeds) * padding - 9;

    const commands = [];
    data.forEach((row, i) => {
      row.forEach((_, j) => {
        commands.push({
          func: "text",
          args: [row[j], boxX + j * padding, boxY + i * padding],
        });
        if (rowExceeds && j == row.length - 1) {
          commands.push({
            func: "text",
            args: ["...", boxX + (j + 1) * padding, boxY + i * padding],
          });
        }
        if (colExceeds && i == data.length - 1) {
          commands.push({
            func: "text",
            args: ["...", boxX + j * padding, boxY + (i + 1) * padding],
          });
        }
      });
    });
    commands.push(
      { func: "textAlign", args: [CENTER] },
      {
        func: "text",
        args: [shape.join("x"), x, y + h + 5, w, h],
      },
    );

    commands.push(
      { func: "noFill", args: [] },
      { func: "stroke", args: [123] },
      { func: "rect", args: [x, y, w, h, 10] },
    );
    return { commands, x, y, w, h };
  }

  showInput() {
    const inputMatrix = this.createMatrixView(this.inputData);
    executeDrawingCommands(inputMatrix.commands);
  }

  draw() {
    this.line?.draw(true);
    this.show();
    this.dot.draw();
    this.removeButton.draw();
    this.inputData && this.showInput();
  }

  destroy() {
    this.dot.destroy();
    this.dot = null;
    this.line?.destroy();
    this.line = null;
  }
}
