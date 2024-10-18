class CalculationViewer extends Viewer {
  constructor(x, y) {
    super(x, y, 0, 100);
    this.dot = new CalculationDot(this, true);
    this.cellSize = 300;
    this.headerSize = 50;
    this.rows = 0;
    this.paddingX = 50;
    this.paddingY = 30;
    this.w = this.cellSize * 5 + this.headerSize;
  }

  adjustOffsets() {
    this.line.setOffsets(0, 60);
  }

  handleRemove() {
    this.line.from.parent.removeCalculationComponent();
  }

  setInputData(data, shape) {
    this.data = [this.formatMatrix(data, shape, 0, 0)];
  }

  setData(data) {
    this.rows = 0;
    data.forEach(
      ({ slicedW, slicedB, slicedZ, slicedO, sb, sw, sz, so }, i) => {
        const y = this.rows * this.cellSize;
        this.data.push(
          this.formatMatrix(slicedW, sw, this.cellSize, y),
          this.formatMatrix(slicedB, sb, this.cellSize * 2, y),
          this.formatMatrix(slicedZ, sz, this.cellSize * 3, y),
          this.formatMatrix(slicedO, so, this.cellSize * 4, y),
        );
        if (i !== data.length - 1) {
          this.data.push(
            this.formatMatrix(slicedO, so, 0, ++this.rows * this.cellSize),
          );
        }
      },
    );
    this.h = ++this.rows * this.cellSize + this.headerSize;
    this.postUpdateCoordinates();
  }

  formatScientific(num, significantDigits) {
    return parseFloat(num).toExponential(significantDigits);
  }

  formatMatrix(data, shape, x, y) {
    data = data.map((d) =>
      d instanceof Array
        ? d.map((_d) => this.formatScientific(_d, 2))
        : [this.formatScientific(d, 2)],
    );
    const px = this.paddingX;
    const py = this.paddingY;

    const rowExceeds = shape[1] > data[0].length;
    const colExceeds = shape[0] > data.length;

    const w = data[0].length * px + (+rowExceeds ? px : px / 2) + 9;
    const h = data.length * py + (+colExceeds ? py / 2 : 0) - 9;
    x = x + (this.cellSize - w) / 2 + this.headerSize + this.headerSize / 4;
    y = y + (this.cellSize - h) / 2 + this.headerSize;

    return { data, shape, x, y, w, h, rowExceeds, colExceeds };
  }

  createTxtCmd(text, x, y, w, h) {
    return { func: "text", args: [text, x, y, w, h] };
  }

  showMatrix(dataObject) {
    const { data, shape, x, y, w, h, rowExceeds, colExceeds } = dataObject;
    const px = this.paddingX;
    const py = this.paddingY;
    const absoluteX = this.x + x;
    const absoluteY = this.y + y;

    const commands = [];
    data.forEach((row, i) => {
      row.forEach((_, j) => {
        const elementX = absoluteX + j * px + px / 2;
        const elementY = absoluteY + i * py + py / 2;
        commands.push(this.createTxtCmd(row[j], elementX, elementY));

        if (rowExceeds && j == row.length - 1) {
          commands.push(this.createTxtCmd("...", elementX + px, elementY));
        }
        if (colExceeds && i == data.length - 1) {
          commands.push(
            this.createTxtCmd("...", elementX + 10, elementY + py / 2),
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
    const headers = ["Inputs", "Weights", "Biases", "z", "σ(z)"];
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
    const signs = ["@", "+", "=", "=>"];
    const commands = [
      { func: "textSize", args: [16] },
      { func: "textAlign", args: [CENTER, CENTER] },
    ];

    const { x, y, cellSize: cs, headerSize: hs, paddingY: p } = this;

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

  showData() {
    this.data.map((d) => this.showMatrix(d));
    this.showLines();
    this.showHeaders();
    this.showSigns();
  }
}
