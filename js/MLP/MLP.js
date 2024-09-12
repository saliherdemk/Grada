class MLP {
  constructor(layers = [], lr = 0.1, batchSize = 1) {
    this.layers = layers;
    this.lr = lr;
    this.batchSize = batchSize;
    this.errFunc = errFuncManager.getFunction("mse");
    this.totalParams = 0;
  }

  export() {
    const layerSizes = [
      this.layers[0].nin,
      ...this.layers.map((l) => l.neurons.length),
    ];

    return {
      layerSizes: layerSizes,
      parameters: this.getParameters(),
      lr: this.lr,
      batchSize: this.batchSize,
      errFunc: this.errFunc.name,
    };
  }

  import(parameters) {
    const currentParams = this.getParameters();
    for (let i = 0; i < currentParams.length; i++) {
      const current = currentParams[i];
      const saved = parameters[i];
      current.setData(saved.data);
      current.setGrad(saved.grad);
    }
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

  setTotalParams() {
    this.totalParams = this.getParameters().length;
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
