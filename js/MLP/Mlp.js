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

  forward(x_batch) {
    let inputs = new Tensor(x_batch);
    for (let i = 0; i < this.layers.length; i++) {
      inputs = this.layers[i].forward(inputs);
    }
    return inputs;
  }

  backward(mlp_output, y_batch) {
    const loss = errFuncManager.getFunction(this.errFunc)(
      mlp_output,
      new Tensor(y_batch),
    );
    if (this.mode == "eval") {
      this.addEvalLoss(loss.data[0][0]);
      return;
    }
    this.addTrainLoss(loss.data[0][0]);

    this.zeroGrad();
    loss.backward();
    this.step(this.lr);
    this.stepCounter++;
    this.seenRecordNum += parseInt(this.batchSize);
  }

  export() {
    const { weights, biases } = this.getParameters();

    return {
      weights: weights.map((w) => w.data),
      biases: biases.map((b) => b.data),
      seenRecordNum: this.seenRecordNum,
      stepCounter: this.stepCounter,
      trainLoss: this.trainLoss,
      evalLoss: this.evalLoss,
    };
  }

  import({ weights, biases, seenRecordNum, stepCounter, trainLoss, evalLoss }) {
    this.seenRecordNum = seenRecordNum;
    this.stepCounter = stepCounter;
    this.trainLoss = trainLoss;
    this.evalLoss = evalLoss;
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].setParameters(weights[i], biases[i]);
    }
  }

  destroy() {
    this.layers.forEach((layer) => layer.destroy());
  }
}
