class MLP {
  constructor(layers = [], lr = 0.1, batchSize = 1) {
    this.layers = layers;
    this.lr = lr;
    this.batchSize = batchSize;
    this.errFunc = errFuncManager.getFunction("mse");
  }

  sanitazed() {
    const layers = this.layers.map((l) => l.sanitazed());
    return {
      layers,
      lr: this.lr,
      batchSize: this.batchSize,
      errFunc: this.errFunc,
    };
  }

  setErrFunc(errFunc) {
    this.errFunc = errFuncManager.getFunction(errFunc);
  }

  setLr(lr) {
    this.lr = lr;
  }

  addLayer(layer) {
    this.layers.push(layer);
  }

  predict(x) {
    let output = x;
    this.layers.forEach((layer) => {
      output = layer.call(output);
    });
    return output;
  }

  getParameters() {
    return this.layers.flatMap((layer) => layer.parameters());
  }

  goOneCycle(trainXData, trainYData) {
    const predict = this.predict(trainXData);

    const loss = this.errFunc(predict, trainYData);

    this.getParameters().forEach((p) => (p.grad = 0.0));
    loss.backprop();
    this.getParameters().forEach((p) => (p.data += -this.lr * p.grad));
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
