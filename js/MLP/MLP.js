class MLP {
  constructor(layers = [], lr = 0.1, batch_size = 1) {
    this.layers = layers;
    this.lr = lr;
    this.batch_size = batch_size;
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

  mse(y1, y2) {
    return y1.sub(y2).pow(new Value(2));
  }

  getParameters() {
    return this.layers.flatMap((layer) => layer.parameters());
  }

  goOneCycle(trainXData, trainYData) {
    let loss = new Value(0);
    for (let i = 0; i < trainYData.length; i++) {
      loss = loss.add(
        this.mse(this.predict(trainXData), new Value(trainYData[i])),
      );
    }
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
