class DenseLayer {
  constructor(nin, nout) {
    this.weights = new Tensor(
      Array.from({ length: nin }, (_) =>
        Array.from({ length: nout }, (_) => Math.random() * 2 - 1),
      ),
    );
    this.biases = new Tensor(Array(nout).fill(Math.random() * 2 - 1));
    this.outputs = new Tensor([Array(nout).fill(0)]);
    this.actFunc = actFuncManager.getFunction("mse");
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
    this.outputs = inputs.dot(this.weights).add(this.biases);
    this.outputs = this.actFunc ? this.actFunc(this.outputs) : this.outputs;
    return this.outputs;
  }

  destroy() {
    this.weights = null;
    this.biases = null;
  }
}
