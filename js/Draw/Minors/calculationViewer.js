class CalculationViewer extends Draggable {
  constructor(x, y) {
    super(x, y, 0, 100);
    this.dot = new CalculationDot(this, true);
    this.line = null;
    this.removeButton = new ImageButton("delete", () => this.handleRemove());
    this.cellSize = 240;
    this.headerSize = 50;
    this.rows = 0;
    this.w = this.cellSize * 4;
    this.data = [];
  }

  setInputData(data, shape) {
    this.data = [this.formatMatrix(data, shape, 0, 0)];
  }

  setData(data) {
    this.rows = 0;
    data.forEach((d) => {
      const y = this.rows * this.cellSize;
      const { slicedW, slicedB, slicedO, sb, sw, so } = d;

      this.data.push(
        this.formatMatrix(slicedW, sw, this.cellSize, y),
        this.formatMatrix(slicedB, sb, this.cellSize * 2, y),
        this.formatMatrix(slicedO, so, this.cellSize * 3, y),
        this.formatMatrix(slicedO, so, 0, ++this.rows * this.cellSize),
      );
    });

    this.h = ++this.rows * this.cellSize + this.headerSize;
    this.postUpdateCoordinates();
  }

  formatMatrix(data, shape, x, y) {
    data = data.map((d) =>
      d instanceof Array
        ? d.map((_d) => parseFloat(_d).toFixed(2))
        : [parseFloat(d).toFixed(2)],
    );
    const padding = 30;

    const rowExceeds = shape[1] > data[0].length;
    const colExceeds = shape[0] > data.length;

    const w =
      data[0].length * padding + (+rowExceeds ? padding : padding / 2) + 7;
    const h = data.length * padding + (+colExceeds ? padding / 2 : 0) - 9;
    x = x + (this.cellSize - w) / 2 + this.headerSize;
    y = y + (this.cellSize - h) / 2 + this.headerSize;

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

  showMatrix(dataObject) {
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

  showLines() {
    const commands = [];
    for (let i = 1; i < this.rows; i++) {
      const y = this.y + i * this.cellSize + this.headerSize;
      commands.push({ func: "line", args: [this.x, y, this.x + this.w, y] });
    }
    executeDrawingCommands(commands);
  }

  showHeader() {
    const headers = ["Inputs", "Weights", "Biases", "Outputs"];
    const commands = [
      {
        func: "line",
        args: [
          this.x,
          this.y + this.headerSize,
          this.x + this.w,
          this.y + this.headerSize,
        ],
      },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "textSize", args: [16] },
      ...headers.map((header, i) => ({
        func: "text",
        args: [
          header,
          this.x + this.headerSize + this.cellSize * i,
          this.y,
          this.cellSize,
          this.headerSize,
        ],
      })),
      ...Array.from({ length: this.rows }).map((r, i) => {
        const y = this.y + i * this.cellSize + this.headerSize;
        return {
          func: "text",
          args: [`L${i}`, this.x, y, this.headerSize, this.cellSize],
        };
      }),
      {
        func: "line",
        args: [
          this.x + this.headerSize,
          this.y,
          this.x + this.headerSize,
          this.y + this.h,
        ],
      },
    ];

    executeDrawingCommands(commands);
  }

  showDecorations() {
    this.showLines();
    this.showHeader();
  }

  showCalculations() {
    this.data.map((d) => this.showMatrix(d));
    this.showDecorations();
  }

  show() {
    const commands = [
      { func: "fill", args: [255] },
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10] },
      { func: "textAlign", args: [CENTER, CENTER] },
    ];
    executeDrawingCommands(commands);
    this.data.length ? this.showCalculations() : this.showPlaceHolder();
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
  }

  destroy() {
    this.dot.destroy();
    this.dot = null;
    this.line?.destroy();
    this.line = null;
  }
}
