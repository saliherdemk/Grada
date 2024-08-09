class DatasetView {
  constructor(dataset) {
    this.dataset = dataset;
  }

  getTrainX() {
    return this.dataset.trainX;
  }

  getTrainY() {
    this.dataset.trainY;
  }

  getLabels() {
    return this.dataset.labels;
  }
}
