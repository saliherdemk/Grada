class InputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 300, 300, true);
    this.batchX = [];
    this.setLabels();
    this.setValues();
  }

  setLabels() {
    this.labels = this.getDataset().getXLabels();
  }

  adjustNeuronNum() {
    const diff = this.getTrainXSize() - this.getNeuronNum();
    super.adjustNeuronNum(diff);
  }

  setValues() {
    this.updateBatch();
    const values = this.batchX[0].map((v) => parseFloat(v));
    return values;
  }

  incrementIndex() {
    this.currentIndex++;
  }

  initializeDots() {
    this.outputDot = new Dot(this, true);
  }

  getColorByIndex(i) {
    const { defaultColor: sky } = themeManager.getTheme("cyan");
    const { defaultColor: blue } = themeManager.getTheme("blue");
    const { defaultColor: gray } = themeManager.getTheme("gray");
    if (i == 0) {
      return blue;
    }
    if (i == 1) {
      return sky;
    }
    return gray;
  }

  showValues() {
    let commands = [];

    this.labels.forEach((label, i) => {
      commands.push(this.createColCommand(label, 0, i * 50));
    });

    commands.push({
      func: "line",
      args: [this.x + 50, this.y + 10, this.x + 50, this.y + this.h - 10],
    });

    this.batchX.forEach((row, i) => {
      row.forEach((val, j) => {
        commands.push({ func: "fill", args: this.getColorByIndex(i) });

        const a = this.createColCommand(val, this.w + (i + 1) * -50, j * 50);
        commands.push(a);
      });
    });

    executeDrawingCommands(commands);
  }
}
