class OutputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 800, 300, false);
    this.batchY = [];
    this.setLabels();
    this.setValues();
  }

  setLabels() {
    this.labels = this.getDataset().getYLabels();
  }

  adjustNeuronNum() {
    const diff = this.getTrainYSize() - this.getNeuronNum();
    super.adjustNeuronNum(diff);
  }

  setValues() {
    this.updateBatch();
    return [parseFloat(this.batchY[0])];
  }

  initializeDots() {
    this.inputDot = new Dot(this, true);
  }

  showValues() {
    let commands = [];

    this.labels.forEach((label, i) => {
      commands.push(this.createColCommand(label, this.w - 50, i * 50));
    });

    const lineX = this.x + this.w - 50;

    commands.push({
      func: "line",
      args: [lineX, this.y + 10, lineX, this.y + this.h - 10],
    });

    this.batchY.forEach((row, i) => {
      row.forEach((val, j) => {
        const a = this.createColCommand(val, 50 + i * 50, j * 50);
        commands.push(a);
      });
    });
    executeDrawingCommands(commands);
  }
}
