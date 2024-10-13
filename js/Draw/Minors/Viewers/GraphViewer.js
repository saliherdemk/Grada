class GraphViewer extends Viewer {
  constructor(x, y) {
    super(x, y, 500, 300);
    this.dot = new GraphDot(this, true);
    this.dark = true;
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

  drawGridLines({ xCount, yCount, xStart, xEnd, yStart, yEnd }) {
    const commands = [{ func: "stroke", args: [100] }];
    for (let i = 0; i < xCount; i++) {
      let x = map(i, 0, xCount - 1, xStart, xEnd);
      commands.push({ func: "line", args: [x, yStart, x, yEnd] });
    }

    for (let i = 0; i <= yCount; i++) {
      let y = map(i, 0, yCount, yStart, yEnd);
      commands.push({ func: "line", args: [xStart, y, xEnd, y] });
    }
    executeDrawingCommands(commands);
  }

  drawYAxisLabels({ xStart, yCount, yStart, yEnd, maxL, minL }) {
    const commands = [
      { func: "fill", args: [255] },
      { func: "noStroke", args: [] },
    ];
    for (let i = 0; i <= yCount; i++) {
      let y = map(i, 0, yCount, yStart, yEnd);
      let label = ((maxL - minL) * (i / yCount) + minL).toFixed(2);
      commands.push({ func: "text", args: [label, xStart - 35, y + 5] });
    }
    executeDrawingCommands(commands);
  }

  drawLossLine({ xCount, xStart, xEnd, yStart, yEnd, maxL, minL }) {
    const commands = [];
    const data = this.data;
    const half = xCount / 2;
    const totalData = data.length;

    commands.push({ func: "beginShape", args: [] });

    for (let i = 0; i < totalData; i++) {
      let x = this.calculateX(i, totalData, xCount, xStart, xEnd, half);
      const y = map(data[i], minL, maxL, yStart, yEnd);
      const { label, rotate } = this.getLabelAndRotation(
        i,
        totalData,
        xCount,
        half,
      );

      this.drawLabel(label, x, yStart + 15, rotate);

      commands.push(
        { func: "vertex", args: [x, y] },
        { func: "fill", args: [255, 0, 0] },
        { func: "ellipse", args: [x, y, 2] },
        { func: "stroke", args: [255, 0, 0] },
        { func: "noFill", args: [] },
      );
    }

    commands.push({ func: "endShape", args: [] });
    executeDrawingCommands(commands);
  }

  calculateX(i, totalData, xCount, xStart, xEnd, half) {
    if (totalData <= xCount) {
      return map(i, 0, totalData, xStart, xEnd);
    } else if (i < totalData - half) {
      return map(i, 0, totalData - half, xStart, xStart + (xEnd - xStart) / 2);
    } else {
      return (
        map(i - totalData + half, 0, 10, xStart + (xEnd - xStart) / 2, xEnd) +
        20
      );
    }
  }

  getLabelAndRotation(i, totalData, xCount, half) {
    let label = "";
    let rotate = false;

    if (totalData <= xCount) {
      label = i + 1;
    } else if (
      i === 0 ||
      i === totalData - half - 1 ||
      i === ~~((totalData - half) / 2)
    ) {
      label = i + 1;
      rotate = i === totalData - half - 1;
    } else if (i >= totalData - half) {
      label = i - (totalData - half) + 1;
    }

    return { label, rotate };
  }

  drawLabel(label, x, y, rotate) {
    const commands = [
      { func: "translate", args: [x, y] },
      { func: "rotate", args: [rotate ? HALF_PI : 0] },
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

    const parameters = {
      xCount: 20,
      yCount: 10,
      xStart: this.x + 50,
      xEnd: this.x + this.w - 25,
      yStart: this.y + this.h - 50,
      yEnd: this.y + 50,
      maxL,
      minL,
    };

    this.drawGridLines(parameters);
    this.drawYAxisLabels(parameters);
    this.drawLossLine(parameters);
    this.drawHeader();
  }
}
