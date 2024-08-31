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

  showValues() {
    super.showValues(this.batchX, this.x + 50, this.w, 0);
  }
}
