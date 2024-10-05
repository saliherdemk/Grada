class MLP extends MlpParams {
  constructor() {
    super();
    this.layers = [];
  }

  addLayer(layer) {
    this.layers.push(layer);
  }

  setParameters(weights, biases) {
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].setParameters(weights[i], biases[i]);
    }
  }

  forward(inputs) {
    for (let i = 0; i < this.layers.length; i++) {
      inputs = this.layers[i].forward(inputs);

      if (this.activations[i]) {
        inputs = activationFunctions[this.activations[i]](inputs);
      }
    }
    return inputs;
  }

  getParameters() {
    const allWeights = [];
    const allBiases = [];

    this.layers.forEach((layer) => {
      const [weights, biases] = layer.getParameters();
      allWeights.push(weights);
      allBiases.push(biases);
    });

    return { weights: allWeights, biases: allBiases };
  }

  step(lr) {
    const { weights, biases } = this.getParameters();

    weights.concat(biases).forEach((param) => {
      param.step(lr);
    });
  }

  zeroGrad() {
    const { weights, biases } = this.getParameters();

    weights.concat(biases).forEach((param) => {
      param.grad = null;
    });
  }

  destroy() {
    this.layers.forEach((layer) => layer.destroy());
  }
}
