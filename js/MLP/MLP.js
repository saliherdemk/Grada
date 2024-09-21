class MLP {
  constructor(layers, lr, batchSize) {
    this.layers = layers;
    this.lr = lr;
    this.batchSize = batchSize;
    this.errFunc = errFuncManager.getFunction("mse");
    this.totalParams = 0;
    this.stepCounter = 0;
    this.recordNum = 0;
    this.epoch = 0;
    this.mode = "train";
    this.currentLoss = new Value(0);
  }

  getProps() {
    return {
      totalParams: this.totalParams,
      stepCounter: this.stepCounter,
      epoch: this.epoch,
    };
  }

  setTotalParams() {
    this.totalParams = this.getParameters().length;
  }

  // FIXME maybe we can export parameters layer by layer
  export() {
    return {
      parameters: this.getParameters(),
      stepCounter: this.stepCounter,
      epoch: this.epoch,
    };
  }

  import(parameters, stepCounter, epoch) {
    const currentParams = this.getParameters();
    for (let i = 0; i < currentParams.length; i++) {
      const current = currentParams[i];
      const saved = parameters[i];
      current.setData(saved.data);
      current.setGrad(saved.grad);
    }
    this.mode = "eval";
    this.stepCounter = stepCounter;
    this.epoch = epoch;
  }

  setErrFunc(errFunc) {
    this.errFunc = errFuncManager.getFunction(errFunc);
  }

  setLr(lr) {
    this.lr = lr;
  }

  setBatchSize(batchSize) {
    this.batchSize = batchSize;
  }

  setMode(mode) {
    this.mode = mode;
  }

  addLayer(layer) {
    this.layers.push(layer);
  }

  async predict(x) {
    let output = x;

    for (let i = 0; i < this.layers.length; i++) {
      output = await this.layers[i].call(output, i == this.layers.length - 1);
    }

    return output;
  }

  getParameters() {
    return this.layers.flatMap((layer) => layer.parameters());
  }

  goOneEval(xData, yData) {
    const predict = this.predict(xData);
    if (yData !== null) {
      // this is for eval loss graph
    }
  }

  async goOneTrain(xData, yData) {
    const predict = await this.predict(xData);
    if (++this.stepCounter % this.recordNum === 0) this.epoch++;

    this.currentLoss = this.currentLoss.add(this.errFunc(predict, yData));

    if (this.stepCounter % this.batchSize !== 0) return;

    this.currentLoss = this.currentLoss.div(this.batchSize);
    this.getParameters().forEach((p) => (p.grad = 0.0));
    this.currentLoss.backprop();
    this.getParameters().forEach((p) => (p.data += -this.lr * p.grad));
    this.currentLoss = new Value(0);
  }

  async goOneCycle(xData, yData) {
    this.mode == "eval"
      ? this.goOneEval(xData, yData)
      : await this.goOneTrain(xData, yData);
  }

  train(x_train, y_train, epochs) {
    for (let i = 0; i < epochs; i++) {
      let loss = new Value(0);
      for (let i = 0; i < y_train.length; i++) {
        loss = loss.add(
          this.mse(this.predict(x_train[i]), new Value(y_train[i])),
        );
      }
      this.getParameters().forEach((p) => (p.grad = 0.0));
      loss.backprop();
      this.getParameters().forEach((p) => (p.data += -this.lr * p.grad));
    }
  }

  destroy() {
    this.layers.forEach((layer) => layer.destroy());
  }
}
