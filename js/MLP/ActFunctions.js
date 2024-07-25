const ActivationFunction = {
  TANH: "tanh",
  RELU: "relu",
  SIGMOID: "sigmoid",
};

function tanh(x) {
  let e = x.mul(2).exp();
  let output = e.sub(new Value(1)).div(e.add(new Value(1)));
  return output;
}

function relu(x) {
  let data = x.data;
  let output = {
    value: Math.max(0, data),
    backward: function () {
      x.grad += data > 0 ? 1 : 0;
    },
  };
  return output;
}

function sigmoid(x) {
  let output = 1 / (1 + Math.exp(-x));
  return output;
}

function softmax(x) {}

// Mapping of activation functions
const activation_functions = {
  [ActivationFunction.TANH]: tanh,
  [ActivationFunction.RELU]: relu,
  [ActivationFunction.SIGMOID]: sigmoid,
};
