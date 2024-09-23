class DenseLayer {
  constructor(inputSize, outputSize) {
    this.weights = new Matrix(inputSize, outputSize).randomize();
    this.bias = new Matrix(1, outputSize).randomize();
  }

  forward(input) {
    this.input = input;
    this.output = input.dot(this.weights).add(this.bias);
    return this.output;
  }

  backward(gradOutput, learningRate) {
    const gradWeights = this.input.T().dot(gradOutput);
    const gradBias = gradOutput.sum(0);

    const gradInput = gradOutput.dot(this.weights.T());

    this.weights = this.weights.sub(gradWeights.mul(learningRate));
    this.bias = this.bias.sub(gradBias.mul(learningRate));

    return gradInput;
  }
}
