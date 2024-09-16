class Dataset {
  constructor(name, data) {
    this.id = datasetOrganizer.getDatasetId();
    this.name = name;
    this.x = [];
    this.y = [];
    this.xLabels = [];
    this.yLabels = [];
    this.shape;
    this.setData(data);
  }

  getXLabels() {
    return this.xLabels;
  }

  getYLabels() {
    return this.yLabels;
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

  // flattenArray(arr) {
  //   return arr.reduce((acc, item) => {
  //     return acc.concat(Array.isArray(item) ? this.flattenArray(item) : item);
  //   }, []);
  // }

  getShape(arr) {
    const shape = [];
    let currentArray = arr;

    while (Array.isArray(currentArray)) {
      shape.push(currentArray.length);
      currentArray = currentArray[0];
    }

    return shape;
  }

  setData(data) {
    this.x = data.x;
    this.y = data.y.map((_y) => (_y instanceof Array ? _y : [_y]));
    this.xLabels = data.xL;
    this.yLabels = data.yL;

    this.shape = this.getShape(this.x);
    datasetOrganizer.createButtonForDataset(this.name, this.id);
  }
}
