class Dataset {
  constructor(id, name, data) {
    this.id = id;
    this.name = name;
    this.trainX = [];
    this.trainY = [];
    this.trainXLabels = [];
    this.trainYLabels = [];
    this.setData(data);
  }

  getXLabels() {
    return this.trainXLabels;
  }

  getYLabels() {
    return this.trainYLabels;
  }

  getBatch(index, batchSize = 100) {
    const trainX = this.getTrainX();
    const trainY = this.getTrainY();
    const batchX = [];
    const batchY = [];
    index = Math.max(-1, index);

    for (let _ = 0; _ < batchSize; _++) {
      index = (index + 1) % trainX.length;
      batchX.push(trainX[index]);
      batchY.push(trainY[index]);
    }

    return { batchX, batchY };
  }

  getTrainX() {
    return this.trainX;
  }

  getTrainY() {
    return this.trainY;
  }

  setName(name) {
    this.name = name;
  }

  setData(data) {
    const labelIndexes = data.pop();
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const xValues = [];
      const yValues = [];

      for (let j = 0; j < row.length; j++) {
        const value = row[j];
        if (i == 0) {
          if (labelIndexes.includes(j)) {
            this.trainYLabels.push(value);
            continue;
          }
          this.trainXLabels.push(value);
          continue;
        }

        if (labelIndexes.includes(j)) {
          yValues.push(value);
          continue;
        }
        xValues.push(value);
      }
      xValues.length && this.trainX.push(xValues);
      yValues.length && this.trainY.push(yValues);
    }
  }
}
