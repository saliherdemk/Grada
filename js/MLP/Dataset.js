class Dataset {
  constructor(name, data) {
    this.id = datasetOrganizer.getDatasetId();
    this.name = name;
    this.x = [];
    this.y = [];
    this.xLabels = [];
    this.yLabels = [];
    this.shapeX = [];
    this.shapeY = [];
    this.setData(data);
  }

  getXLabels() {
    return this.xLabels;
  }

  getYLabels() {
    return this.yLabels;
  }

  getShape() {
    return {
      shapeX: this.shapeX,
      shapeY: this.shapeY,
      recordNum: this.shapeY[0],
    };
  }

  getBatch(index, batchSize = 100) {
    const trainX = this.x;
    const batchX = [];
    const batchY = [];
    index = Math.max(-1, index);

    for (let _ = 0; _ < batchSize; _++) {
      index = (index + 1) % trainX.length;
      batchX.push(trainX[index]);
      batchY.push(this.y[index]);
    }

    return { batchX, batchY };
  }

  setName(name) {
    this.name = name;
  }

  setData(data) {
    this.x = data.x;
    this.y = data.y.map((_y) => (_y instanceof Array ? _y : [_y]));
    this.xLabels = data.xL;
    this.yLabels = data.yL;

    this.shapeX = getShape(this.x);
    this.shapeY = getShape(this.y);
    datasetOrganizer.createButtonForDataset(this.name, this.id);
  }
}
