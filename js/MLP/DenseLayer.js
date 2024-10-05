class DenseLayer {
  constructor(nin, nout) {
    this.weights = new Tensor(
      Array.from({ length: nin }, (_) =>
        Array.from({ length: nout }, (_) => Math.random() * 2 - 1),
      ),
    );
    this.biases = new Tensor(Array(nout).fill(Math.random() * 2 - 1));
    this.outputs = Array(nout).fill(0);
  }

  setActFunc(actFunc) {
    this.actFunc = actFunc;
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
    return this.outputs;
  }

  destroy() {
    this.weights = null;
    this.biases = null;
  }
}
