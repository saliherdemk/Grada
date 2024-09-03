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
    const { batchY } = this.getDataset().getBatch(this.currentIndex, 6);
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

  showValues() {
    const lineX = this.x + this.w - 50;
    super.showValues(this.batchY, lineX, 0, this.w - 50);
  }
}
