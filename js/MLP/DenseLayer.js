class DenseLayer {
  constructor() {
    this.weights = null;
    this.biases = null;
    this.z = null;
    this.outputs = null;
    this.actFunc = actFuncManager.getFunction("mse");
  }

  initialize(weights, biases, outputs, actFunc) {
    this.weights = new Tensor(weights);
    this.biases = new Tensor(biases);
    this.outputs = new Tensor(outputs);
    this.setActFunc(actFunc);
  }

  setActFunc(actFunc) {
    this.actFunc = actFuncManager.getFunction(actFunc);
  }

  setParameters(weights, biases) {
    this.weights = new Tensor(weights);
    this.biases = new Tensor(biases);
  }

  getParameters() {
    return [this.weights, this.biases];
  }

  forward(inputs) {
    this.z = inputs.dot(this.weights).add(this.biases);
    this.outputs = this.actFunc ? this.actFunc(this.z) : this.z;
    return this.outputs;
  }

  destroy() {
    this.weights = null;
    this.biases = null;
  }
}
