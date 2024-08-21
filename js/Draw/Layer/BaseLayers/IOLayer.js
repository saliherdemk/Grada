class IOLayer extends HiddenLayer {
  constructor(datasetId, _x, _y) {
    super(_x, _y);
    this.datasetId = datasetId;
    this.currentIndex = 0;
  }
}
