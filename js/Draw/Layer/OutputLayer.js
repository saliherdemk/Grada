class OutputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 800, 300, false);
    this.batchY = [];
    this.setLabels();
    this.updateBatch();
  }

  reInitializeDots() {
    this.outputDot.destroy();
    this.outputDot = null;
  }

  updateBatch() {
    const { batchY } = this.getDataset().getBatch(this.currentIndex, 5);
    this.batchY = batchY;
  }

  setLabels() {
    this.labels = this.getDataset().getYLabels();
  }

  adjustNeuronNum() {
    const diff = this.getTrainYSize() - this.getNeuronNum();
    super.adjustNeuronNum(diff);
  }

  setValues() {
    return this.batchY[0];
  }

  getNeuronValue() {
    return this.neurons[0].origin?.output.getFixedData(2) ?? 0;
  }

  showLabels() {
    const lineX = this.x + this.w - 50;
    const lineCommand = {
      func: "line",
      args: [lineX, this.y + 10, lineX, this.y + this.h - 10],
    };

    const labelCommands = this.labels.flatMap((label, i) =>
      this.createColCommand(label, this.w - 50, i * 50),
    );

    executeDrawingCommands([lineCommand, ...labelCommands]);
  }

  showValues() {
    const commands = this.batchY.flatMap((row, i) =>
      row.flatMap((val, j) =>
        this.createColCommand(val, 50 + i * 50, j * 50, i),
      ),
    );
    executeDrawingCommands(commands);
  }
}
