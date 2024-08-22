class IOLayer extends HiddenLayer {
  constructor(datasetId, _x, _y, isInput = true) {
    super(_x, _y);
    this.neuronAlignment = isInput ? "right" : "left";
    this.w = 350;
    this.datasetId = datasetId;
    this.currentIndex = 0;
    this.labels = [];
    this.adjustNeuronNum();
  }

  getDataset() {
    return datasetOrganizer.getDatasetById(this.datasetId);
  }

  // we need to return data based on layer type
  updateBatch() {
    const { batchX, batchY } = this.getDataset().getBatch(this.currentIndex, 5);
    this.batchX = batchX;
    this.batchY = batchY;
  }

  createColCommand(text, x, y) {
    return {
      func: "text",
      args: [text, this.x + 21 + x, this.y + 32 + y, this.w, this.h],
    };
  }

  getTrainXSize() {
    return this.getDataset().getTrainX()[0].length;
  }

  getTrainYSize() {
    return this.getDataset().getTrainY()[0].length;
  }

  adjustNeuronNum(diff) {
    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? this.pushNeuron() : this.popNeuron();
    }
    this.getNeuronNum() > 4 ? this.shrink() : this.expand();
    this.setShownNeuronsNum(Math.min(this.getNeuronNum(), 4));
    this.postUpdateCoordinates();
  }

  showValues() {}
  showLabels() {}

  draw() {
    super.draw();
    this.showValues();
    this.showLabels();
  }
}
