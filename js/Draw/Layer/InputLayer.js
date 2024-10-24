class InputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 300, 300);
    this.neuronAlignment = "right";
    this.batch = [];
    this.shape = this.getDataset().shapeX;
    this.labels = this.getDataset().getXLabels();
    this.connectedLine = null;
    this.initialize();
  }

  clearConnected() {
    this.outputDot.free();
    this.connectedLine.destroy();
    this.connectedLine = null;
  }

  setConnected(component) {
    this.connectedLine = new Line(this.outputDot, component.inputDot);
    component.setSource(this);
  }

  initialize() {
    this.inputDot.destroy();
    this.inputDot = null;
    this.outputDot.setColor(this.shape.length > 3 ? "black" : "cyan");
    super.initialize();
  }

  // FIXME: probably need merge with parent class
  handleRemove() {
    const isMultiDim = this.outputDot.theme == "black";
    if (!isMultiDim) return super.handleRemove();
    if (this.connectedLine) {
      this.connectedLine.to.parent.clearSource();
      return;
    }
    this.destroy();
    mainOrganizer.removeComponent(this);
  }

  getData() {
    return this.getDataset().getBatch(
      this.currentIndex,
      this.connected.parent.batchSize,
    ).batchX;
  }

  updateShownBatch() {
    const { batchX } = this.getDataset().getBatch(this.currentIndex, 6);
    this.batch = batchX;
  }

  draw() {
    super.draw();
    this.showValues(this.batch, this.x + 50, this.w - 50, 0);
    this.connectedLine?.draw(true);
  }
}
