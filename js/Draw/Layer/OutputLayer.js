class OutputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 800, 300);
    this.neuronAlignment = "left";
    this.batch = [];
    this.labels = this.getDataset().getYLabels();
    this.initialize();
  }

  initialize() {
    this.outputDot.destroy();
    this.outputDot = null;
    super.initialize();
  }

  updateBatch() {
    const { batchY } = this.getDataset().getBatch(this.currentIndex, 6);
    this.batch = batchY;
  }

  getNeuronValue() {
    return this.neurons[0].origin?.output.getFixedData(2) ?? 0;
  }

  draw() {
    super.draw();
    this.showValues(this.batch, this.x + this.w - 50, 0, this.w - 50);
  }
}
