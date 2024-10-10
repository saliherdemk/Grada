class CalculationViewer extends Draggable {
  constructor(x, y) {
    super(x, y, 450, 100);
    this.dot = new CalculationDot(this, true);
    this.line = null;
    this.removeButton = new ImageButton("delete", () => this.handleRemove());
    this.data = [];
  }

  setInputData(data, shape) {
    this.data = [this.formatMatrix(data, shape, 0, 0)];
  }

  setData(data) {
    // FIXME divide component to chunk. that way most of the arguments will be elimineted. no need to dynamic align
    let lastY = 0;
    data.forEach((d) => {
      const { slicedW, slicedB, slicedO, sb, sw, so } = d;
      const lD = this.data[this.data.length - 1];
      const longest = Math.max(slicedW.length, slicedB.length, slicedO.length);

      const fW = this.formatMatrix(slicedW, sw, lD.x + lD.w, lastY, longest);
      const fB = this.formatMatrix(slicedB, sb, fW.x + fW.w, lastY, longest);
      const fO = this.formatMatrix(slicedO, so, fB.x + fB.w, lastY, longest);
      lastY = Math.max(fW.y + fW.h, fB.y + fB.h, fO.y + fO.h);
      this.w = Math.max(
        this.w,
        Math.max(fW.x + fW.w, fB.x + fB.w, fO.x + fO.w) + 30,
      );
      const fO1 = this.formatMatrix(slicedO, so, 0, lastY);

      this.data.push(fW, fB, fO, fO1);
    });
    const lastData = this.data[this.data.length - 1];
    this.h = lastData.y + lastData.h + 30;
    this.postUpdateCoordinates();
  }

  formatMatrix(data, shape, x, y, maxRecord = 0) {
    data = data.map((d) =>
      d instanceof Array
        ? d.map((_d) => parseFloat(_d).toFixed(2))
        : [parseFloat(d).toFixed(2)],
    );
    const padding = 30;

    x = x + padding;
    y = y + padding + (Math.max(maxRecord - shape[0], 0) * padding) / 2;

    const rowExceeds = shape[1] > data[0].length;
    const colExceeds = shape[0] > data.length;

    const w =
      data[0].length * padding + (+rowExceeds ? padding : padding / 2) + 7;
    const h = data.length * padding + (+colExceeds ? padding / 2 : 0) - 9;

    return { data, shape, x, y, w, h, rowExceeds, colExceeds };
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

  postUpdateCoordinates() {
    this.dot.updateCoordinates();
    this.updateButtonCoordinates();
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
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
    const { data, shape, x, y, w, h, rowExceeds, colExceeds } = dataObject;
    const p = 30;
    const absoluteX = this.x + x;
    const absoluteY = this.y + y;

    const commands = [];
    data.forEach((row, i) => {
      row.forEach((_, j) => {
        commands.push({
          func: "text",
          args: [row[j], absoluteX + j * p + p / 2, absoluteY + i * p + p / 2],
        });
        if (rowExceeds && j == row.length - 1) {
          commands.push({
            func: "text",
            args: [
              "...",
              absoluteX + (j + 1) * p + p / 2,
              absoluteY + i * p + p / 2,
            ],
          });
        }
        if (colExceeds && i == data.length - 1) {
          commands.push({
            func: "text",
            args: [
              "...",
              absoluteX + j * p + p / 2 + 10,
              absoluteY + (i + 1) * p,
            ],
          });
        }
      });
    });
    commands.push(
      { func: "textAlign", args: [CENTER] },
      {
        func: "text",
        args: [shape.join("x"), absoluteX, absoluteY + h + 5, w, h],
      },
    );

    commands.push(
      { func: "noFill", args: [] },
      { func: "stroke", args: [123] },
      { func: "rect", args: [absoluteX, absoluteY, w, h, 10] },
    );
    executeDrawingCommands(commands);
  }

  showInput() {
    this.data.map((d) => this.createMatrixView(d));
  }

  showPlaceHolder() {
    LoadingIndiactor.drawText(
      this.x,
      this.y,
      this.w,
      this.h,
      "Go one step to see calculation details",
      18,
    );
  }

  draw() {
    this.line?.draw(true);
    this.show();
    this.dot.draw();
    this.removeButton.draw();
    this.data.length ? this.showInput() : this.showPlaceHolder();
  }

  destroy() {
    this.dot.destroy();
    this.dot = null;
    this.line?.destroy();
    this.line = null;
  }
}
