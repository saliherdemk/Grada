class MLP {
  constructor(layers) {
    this.id = organizer.getNextId();

    this.layers = layers.map((layer) => {
      layer.setParentId(this.id);
      return layer;
    });
  }

  removeLayer(layer) {
    let indexToRemove = this.layers.findIndex((l) => l === layer);
    this.layers.splice(indexToRemove, 1);
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

  train(x_train, y_train, epochs, learning_rate = 0.01) {
    for (let i = 0; i < epochs; i++) {
      let loss = new Value(0);
      for (let i = 0; i < y_train.length; i++) {
        loss = loss.add(
          this.mse(this.predict(x_train[i]), new Value(y_train[i])),
        );
      }
      this.getParameters().forEach((p) => (p.grad = 0.0));
      loss.backprop();
      this.getParameters().forEach((p) => (p.data += -learning_rate * p.grad));
    }
  }
}
