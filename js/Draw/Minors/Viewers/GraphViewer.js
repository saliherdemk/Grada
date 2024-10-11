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

  showData() {
    let xAxisStart = this.x + 50;
    let xAxisEnd = this.x + this.w - 50;
    let yAxisStart = this.y + this.h - 50;
    let yAxisEnd = this.y + 50;

    const xLabelsCount = 20;
    const yLabelsCount = 10;

    const commands = [];

    let minLoss = Math.min(...this.data.map((record) => record.data));
    let maxLoss = Math.max(...this.data.map((record) => record.data));

    const drawGridLines = () => {
      for (let i = 0; i < xLabelsCount; i++) {
        let x = map(i, 0, xLabelsCount - 1, xAxisStart, xAxisEnd);
        commands.push({ func: "line", args: [x, yAxisStart, x, yAxisEnd] });
      }

      for (let i = 0; i <= yLabelsCount; i++) {
        let y = map(i, 0, yLabelsCount, yAxisStart, yAxisEnd);
        commands.push({ func: "line", args: [xAxisStart, y, xAxisEnd, y] });
      }
    };

    const drawXAxisLabels = () => {
      for (let i = 0; i < xLabelsCount; i++) {
        let x = map(i, 0, xLabelsCount - 1, xAxisStart, xAxisEnd);
        let label = i < this.data.length ? i : "";
        commands.push({ func: "text", args: [label, x, yAxisStart + 15] });
      }
    };

    const drawYAxisLabels = () => {
      for (let i = 0; i <= yLabelsCount; i++) {
        let y = map(i, 0, yLabelsCount, yAxisStart, yAxisEnd);
        let label = (
          (maxLoss - minLoss) * (i / yLabelsCount) +
          minLoss
        ).toFixed(2);
        commands.push({ func: "text", args: [label, xAxisStart - 35, y + 5] });
      }
    };

    const drawLossLine = () => {
      commands.push({ func: "stroke", args: [0, 153, 255] });
      commands.push({ func: "beginShape", args: [] });

      for (let i = 0; i < this.data.length; i++) {
        let x = map(i, 0, xLabelsCount - 1, xAxisStart, xAxisEnd);
        let y = map(this.data[i].data, minLoss, maxLoss, yAxisStart, yAxisEnd);

        commands.push({ func: "vertex", args: [x, y] });

        commands.push(
          { func: "noFill", args: [] },
          { func: "stroke", args: [255, 0, 0] },

          { func: "fill", args: [255, 0, 0] },
          { func: "ellipse", args: [x, y, 4] },
          { func: "noFill", args: [] },
        );
      }

      commands.push({ func: "endShape", args: [] });
    };

    const drawHeader = () => {
      commands.push(
        { func: "textAlign", args: [CENTER] },
        { func: "textSize", args: [16] },
        { func: "fill", args: [255] },
        { func: "stroke", args: [255] },
        {
          func: "text",
          args: ["Loss Value over Steps", this.x + this.w / 2, this.y + 30],
        },
      );
    };

    commands.push({ func: "stroke", args: [100] });
    drawGridLines();
    commands.push({ func: "stroke", args: [255] });
    commands.push({ func: "fill", args: [255] });
    drawXAxisLabels();
    drawYAxisLabels();
    drawLossLine();
    drawHeader();

    executeDrawingCommands(commands);
  }
}
