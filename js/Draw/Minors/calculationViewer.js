class CalculationViewer extends Draggable {
  constructor(x, y) {
    super(x, y, 0, 100);
    this.dot = new CalculationDot(this, true);
    this.line = null;
    this.removeButton = new ImageButton("delete", () => this.handleRemove());
    this.cellSize = 240;
    this.headerSize = 50;
    this.rows = 0;
    this.padding = 30;
    this.w = this.cellSize * 4 + this.headerSize;
    this.data = [];
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

  setInputData(data, shape) {
    this.data = [this.formatMatrix(data, shape, 0, 0)];
  }

  setData(data) {
    this.rows = 0;
    data.forEach(({ slicedW, slicedB, slicedO, sb, sw, so }, i) => {
      const y = this.rows * this.cellSize;
      this.data.push(
        this.formatMatrix(slicedW, sw, this.cellSize, y),
        this.formatMatrix(slicedB, sb, this.cellSize * 2, y),
        this.formatMatrix(slicedO, so, this.cellSize * 3, y),
      );
      if (i !== data.length - 1) {
        this.data.push(
          this.formatMatrix(slicedO, so, 0, ++this.rows * this.cellSize),
        );
      }
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
    const p = this.padding;

    const rowExceeds = shape[1] > data[0].length;
    const colExceeds = shape[0] > data.length;

    const w = data[0].length * p + (+rowExceeds ? p : p / 2) + 7;
    const h = data.length * p + (+colExceeds ? p / 2 : 0) - 9;
    x = x + (this.cellSize - w) / 2 + this.headerSize + this.headerSize / 4;
    y = y + (this.cellSize - h) / 2 + this.headerSize;

    return { data, shape, x, y, w, h, rowExceeds, colExceeds };
  }

  createTxtCmd(text, x, y, w, h) {
    return { func: "text", args: [text, x, y, w, h] };
  }

  showMatrix(dataObject) {
    const { data, shape, x, y, w, h, rowExceeds, colExceeds } = dataObject;
    const p = this.padding;
    const absoluteX = this.x + x;
    const absoluteY = this.y + y;

    const commands = [];
    data.forEach((row, i) => {
      row.forEach((_, j) => {
        const elementX = absoluteX + j * p + p / 2;
        const elementY = absoluteY + i * p + p / 2;
        commands.push(this.createTxtCmd(row[j], elementX, elementY));

        if (rowExceeds && j == row.length - 1) {
          commands.push(this.createTxtCmd("...", elementX + p, elementY));
        }
        if (colExceeds && i == data.length - 1) {
          commands.push(
            this.createTxtCmd("...", elementX + 10, elementY + p / 2),
          );
        }
      });
    });
    commands.push(
      { func: "textAlign", args: [CENTER] },
      this.createTxtCmd(shape.join("x"), absoluteX, absoluteY + h + 5, w, h),
    );

    commands.push(
      { func: "noFill", args: [] },
      { func: "stroke", args: [123] },
      { func: "rect", args: [absoluteX, absoluteY, w, h, 10] },
    );
    executeDrawingCommands(commands);
  }

  showHeaders() {
    const headers = ["Inputs", "Weights", "Biases", "Outputs"];
    const x = this.x;
    const hs = this.headerSize;
    const cs = this.cellSize;

    const commands = [
      {
        func: "line",
        args: [x, this.y + hs, x + this.w, this.y + hs],
      },
      {
        func: "line",
        args: [x + hs, this.y, x + hs, this.y + this.h],
      },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "textSize", args: [16] },
      ...headers.map((header, i) =>
        this.createTxtCmd(header, x + hs + cs * i, this.y, cs, hs),
      ),
      ...Array.from({ length: this.rows }).map((_, i) => {
        const y = this.y + i * cs + hs;
        return this.createTxtCmd(`L${i}`, x, y, hs, cs);
      }),
    ];

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

  showSigns() {
    const signs = ["@", "+", "="];
    const commands = [
      { func: "textSize", args: [16] },
      { func: "textAlign", args: [CENTER, CENTER] },
    ];

    const { x, y, cellSize: cs, headerSize: hs, padding: p } = this;

    for (let i = 0; i <= this.rows; i++) {
      const yPos = y + (i ? (i - 1) * cs + hs : 0);
      signs.forEach((sign, si) => {
        commands.push(
          this.createTxtCmd(sign, x + cs * (si + 1) + hs, yPos, p, i ? cs : hs),
        );
      });
    }

    executeDrawingCommands(commands);
  }

  showDecorations() {
    this.showLines();
    this.showHeaders();
    this.showSigns();
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
