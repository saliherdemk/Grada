class InputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 300, 300, true);
    this.batchX = [];
    this.actFunc = "";
    this.setLabels();
    this.updateBatch();
  }

  fetchNext() {
    super.fetchNext();
    const { next } = this.parent.getPrevAndNext(this);

    this.batchX[0].forEach((value, i) => {
      const n = next.neurons[i];
      n.setOutput(value);
    });
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
    super.adjustNeuronNum(this.getTrainXSize());
  }

  setValues() {
    return this.batchX[0].map((v) => parseFloat(v));
  }

  showValues() {
    super.showValues(this.batchX, this.x + 50, this.w - 50, 0);
  }
}
