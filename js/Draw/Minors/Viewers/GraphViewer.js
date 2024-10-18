class GraphViewer extends Viewer {
  constructor(x, y) {
    super(x, y, 500, 300);
    this.dot = new GraphDot(this, true);
    this.dark = true;
    this.scale = this.data.length > 2000 ? 1 : 0.1;
    this.gridRows = 20;
    this.gridCols = 10;
    this.buttons = [];
    this.initializeButtons();
  }

  initializeButtons() {
    this.buttons = [
      new ImageButton("zoomIn", () => {
        this.decreaseScale();
      }).setDimensions(20, 20),
      new ImageButton("zoomOut", () => {
        this.increaseScale();
      }).setDimensions(20, 20),
    ];
  }

  getPressables() {
    return [this.removeButton, ...this.buttons];
  }

  updateButtonCoordinates() {
    super.updateButtonCoordinates();
    this.buttons.forEach((b, i) => {
      b.setCoordinates(this.x + i * 25 + 5, this.y + this.h - 30);
    });
  }

  postUpdateCoordinates() {
    this.xStart = this.x + 50;
    this.xEnd = this.x + this.w - 25;
    this.yStart = this.y + this.h - 50;
    this.yEnd = this.y + 50;
    super.postUpdateCoordinates();
  }

  increaseScale() {
    this.scale = Math.min(1, this.scale + 0.05);
  }

  decreaseScale() {
    this.scale = Math.max(0, this.scale - 0.05);
  }

  setData(data) {
    this.data = data;
  }

  adjustOffsets() {
    this.line.setOffsets(0, -60);
  }

  handleRemove() {
    this.line.from.parent.removeGraphComponent();
  }

  getShownRecords() {
    const allRecords = this.data;
    const recentRecords = allRecords.slice(-10);

    if (allRecords.length < 10) {
      return { originIndex: 0, data: recentRecords };
    }

    const totalRecordsCount = allRecords.length - 10;
    const originIndex = totalRecordsCount - totalRecordsCount * this.scale;

    const scaledRecords = allRecords.slice(originIndex, totalRecordsCount);
    return { originIndex, data: scaledRecords.concat(recentRecords) };
  }

  drawGridLines() {
    const commands = [{ func: "stroke", args: [100] }];
    for (let i = 0; i < this.gridRows; i++) {
      let x = map(i, 0, this.gridRows - 1, this.xStart, this.xEnd);
      commands.push({ func: "line", args: [x, this.yStart, x, this.yEnd] });
    }

    for (let i = 0; i <= this.gridCols; i++) {
      let y = map(i, 0, this.gridCols, this.yStart, this.yEnd);
      commands.push({ func: "line", args: [this.xStart, y, this.xEnd, y] });
    }
    executeDrawingCommands(commands);
  }

  drawYAxisLabels({ maxL, minL }) {
    const commands = [
      { func: "fill", args: [255] },
      { func: "noStroke", args: [] },
    ];
    for (let i = 0; i <= this.gridCols; i++) {
      let y = map(i, 0, this.gridCols, this.yStart, this.yEnd);
      let label = ((maxL - minL) * (i / this.gridCols) + minL).toFixed(2);
      commands.push({ func: "text", args: [label, this.x + 15, y + 5] });
    }
    executeDrawingCommands(commands);
  }

  drawLossLine({ maxL, minL }) {
    const { originIndex, data } = this.getShownRecords();

    const commands = [];
    commands.push({ func: "beginShape", args: [] });

    data.forEach((value, i) => {
      const x = this.calculateX(i, data.length);
      if (i == 0 || i > data.length - 12) {
        this.drawLabel(parseInt(originIndex + i), x, this.yStart + 15);
      }
      const y = map(value, minL, maxL, this.yStart, this.yEnd);

      commands.push(
        { func: "vertex", args: [x, y] },
        { func: "fill", args: [255, 0, 0] },
        { func: "ellipse", args: [x, y, 2] },
        { func: "stroke", args: [255, 0, 0] },
        { func: "noFill", args: [] },
      );
    });

    commands.push({ func: "endShape", args: [] });
    executeDrawingCommands(commands);
  }

  calculateX(index, totalDataCount) {
    const halfGridRows = this.gridRows / 2;
    const halfDataCount = totalDataCount - halfGridRows;
    const middleX = this.xStart + (this.xEnd - this.xStart) / 2;

    if (totalDataCount <= this.gridRows) {
      return map(index, 0, totalDataCount, this.xStart, this.xEnd + 20);
    }

    if (index < halfDataCount) {
      return map(index, 0, halfDataCount, this.xStart, middleX);
    }

    return map(index - halfDataCount, 0, 10, middleX, this.xEnd) + 20;
  }

  drawLabel(label, x, y) {
    const commands = [
      { func: "translate", args: [x, y] },
      { func: "rotate", args: [HALF_PI] },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "fill", args: [255] },
      { func: "noStroke", args: [] },
      { func: "text", args: [label, 0, 0] },
    ];
    executeDrawingCommands(commands);
  }

  drawHeader() {
    const commands = [
      { func: "textAlign", args: [CENTER] },
      { func: "textSize", args: [16] },
      { func: "fill", args: [255] },
      { func: "stroke", args: [255] },
      {
        func: "text",
        args: ["Loss Value over Steps", this.x + this.w / 2, this.y + 30],
      },
    ];
    executeDrawingCommands(commands);
  }

  showData() {
    let minL = Infinity;
    let maxL = -Infinity;

    for (const record of this.data) {
      const value = record;
      if (value < minL) minL = value;
      if (value > maxL) maxL = value;
    }

    this.drawGridLines();
    this.drawYAxisLabels({ minL, maxL });
    this.drawLossLine({ minL, maxL });
    this.drawHeader();
    this.buttons.forEach((b) => b.draw());
  }
}
