class InputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 300, 300, true);
    this.batchX = [];
    this.actFunc = "";
    this.setLabels();
    this.updateBatch();
  }

  reInitializeDots() {
    this.inputDot.destroy();
    this.inputDot = null;
  }

  updateBatch() {
    const { batchX } = this.getDataset().getBatch(this.currentIndex, 6);
    this.batchX = batchX;
  }

  setLabels() {
    this.labels = this.getDataset().getXLabels();
  }

  adjustNeuronNum() {
    const diff = this.getTrainXSize() - this.getNeuronNum();
    super.adjustNeuronNum(diff);
  }

  setValues() {
    return this.batchX[0].map((v) => parseFloat(v));
  }

  showLabels() {
    const lineCommand = {
      func: "line",
      args: [this.x + 50, this.y + 10, this.x + 50, this.y + this.h - 10],
    };

    const labelCommands = this.labels.flatMap((label, i) =>
      this.createColCommand(label, 0, i * 50),
    );

    executeDrawingCommands([lineCommand, ...labelCommands]);
  }

  showValues() {
    const commands = this.batchX.flatMap((row, i) =>
      row.flatMap((val, j) =>
        this.createColCommand(val, this.w - (i + 1) * 50, j * 50, i),
      ),
    );

    executeDrawingCommands(commands);
  }
}
