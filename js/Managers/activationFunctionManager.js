class ActivationFunctionManager {
  constructor() {
    this.functions = {
      tanh: this.tanh,
      relu: this.relu,
      sigmoid: this.sigmoid,
      softmax: this.softmax,
    };
    const selectElement = getElementById("act-function-select");

    for (const key of Object.keys(this.functions)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      selectElement.appendChild(option);
    }
  }

  getFunction(name) {
    return this.functions[name] ?? null;
  }

  tanh(x) {
    let e = x.mul(2).exp();
    let output = e.sub(new Value(1)).div(e.add(new Value(1)));
    return output;
  }

  relu(x) {
    let data = x.data;
    let output = new Value(Math.max(0, data), x);
    output.backward = function () {
      x.grad += data > 0 ? 1 : 0;
    };
    return output;
  }

  sigmoid(x) {
    let output = new Value(1).div(new Value(1).add(x.neg().exp()));
    return output;
  }

  softmax(x) {}
}
