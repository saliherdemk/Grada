class OutputLayer extends IOLayer {
  constructor(datasetId) {
    super(datasetId, 300, 500);
    this.currentBatchX = [];
    this.neuronAlignment = "left";
    this.w = 400;
    this.adjustNeuronNum();
  }

  initializeDots() {
    this.outputDot = new Dot(this, true);
  }

  adjustNeuronNum() {
    const diff = this.getInputSize() - this.getNeuronNum();
    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? this.pushNeuron() : this.popNeuron();
    }
    this.getNeuronNum() > 4 ? this.shrink() : this.expand();
    this.setShownNeuronsNum(Math.min(this.getNeuronNum(), 4));
    this.postUpdateCoordinates("right");
  }

  getNextBatch(batchSize = 100) {
    const dataset = datasetOrganizer.getDatasetById(this.datasetId);
    const totalLength = dataset.getTrainX().length;
    const batch = [];

    for (let i = 0; i < batchSize; i++) {
      batch.push(dataset.getTrainX()[this.currentIndex]);
      this.currentIndex = (this.currentIndex + 1) % totalLength;
    }
    this.currentBatchX = batch;
  }

  getInputSize() {
    const dataset = datasetOrganizer.getDatasetById(this.datasetId);
    return dataset.trainX[0].length;
  }
}
