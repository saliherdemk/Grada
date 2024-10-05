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

  trainOneStep(x_batch, y_batch) {
    const mlp_output = this.forward(new Tensor(x_batch));

    const loss = errFuncManager.getFunction(this.errFunc)(
      mlp_output,
      new Tensor(y_batch),
    );

    this.zeroGrad();
    loss.backward();
    this.step(this.lr);
    if (++this.stepCounter % this.recordNum === 0) this.epoch++;
  }

  destroy() {
    this.layers.forEach((layer) => layer.destroy());
  }
}
