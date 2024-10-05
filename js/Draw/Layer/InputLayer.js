class InputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 300, 300);
    this.neuronAlignment = "right";
    this.batch = [];
    this.shape = this.getDataset().shapeX;
    this.labels = this.getDataset().getXLabels();
    this.initialize();
  }

  initialize() {
    this.inputDot.destroy();
    this.inputDot = null;
    this.outputDot.setColor("cyan");
    super.initialize();
  }

  updateShownBatch() {
    const { batchX } = this.getDataset().getBatch(this.currentIndex, 6);
    this.batch = batchX;
  }

  draw() {
    super.draw();
    this.showValues(this.batch, this.x + 50, this.w - 50, 0);
  }
}
