class InputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 300, 300);
    this.neuronAlignment = "right";
    this.batch = [];
    this.shape = this.getDataset().getShape().shapeX;
    console.log(this.shape);
    this.labels = this.getDataset().getXLabels();
    this.initialize();
  }

  initialize() {
    this.inputDot.destroy();
    this.inputDot = null;
    this.outputDot.setColor("cyan");
    super.initialize();
  }

  updateBatch() {
    const { batchX } = this.getDataset().getBatch(this.currentIndex, 6);
    this.batch = batchX;
  }

  fetchNext() {
    super.fetchNext();

    this.batch[0].forEach((value, i) => {
      const n = this.connected.neurons[i];
      n.setOutput(value);
    });
  }

  draw() {
    super.draw();
    this.showValues(this.batch, this.x + 50, this.w - 50, 0);
  }
}
