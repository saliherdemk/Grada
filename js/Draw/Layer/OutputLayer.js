class OutputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 800, 300);
    this.neuronAlignment = "left";
    this.batch = [];
    this.shape = this.getDataset().shapeY;
    this.labels = this.getDataset().getYLabels();
    this.initialize();
  }

  initialize() {
    this.outputDot.destroy();
    this.outputDot = null;
    this.inputDot.setColor("cyan");
    super.initialize();
  }

  connectLayer(targetLayer) {
    const isEqual = this.getNeuronNum() == targetLayer.getNeuronNum();
    if (!isEqual) return;

    this.connectNeurons(targetLayer);
  }

  connectNeurons(targetLayer) {
    targetLayer.neurons.forEach((n1, i) => {
      n1.removeLines();
      n1.addLine(new Line(n1, this.neurons[i]));
    });
    this.inputDot.occupy();
    targetLayer.outputDot.occupy();
    targetLayer.parent.setOutputComponent(this);
    this.connected = targetLayer;
  }

  clearLines() {
    this.connected.clearLines(this);
    this.connected.parent.clearOutput();
    this.connected = null;
  }

  updateBatch() {
    const { batchY } = this.getDataset().getBatch(this.currentIndex, 6);
    this.batch = batchY;
  }

  draw() {
    super.draw();
    this.showValues(this.batch, this.x + this.w - 50, 0, this.w - 50);
  }
}
