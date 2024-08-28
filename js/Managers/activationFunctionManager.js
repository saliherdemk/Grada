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
    const output = x.map((_x) => {
      const e = _x.mul(2).exp();
      return e.sub(new Value(1)).div(e.add(new Value(1)));
    });
    return output;
  }

  relu(x) {
    const output = x.map((_x) => {
      let data = _x.data;
      let out = new Value(Math.max(0, data), [_x]);
      out.backward = function () {
        _x.grad += data > 0 ? 1 : 0;
      };
      return out;
    });
    return output;
  }

  sigmoid(x) {
    return x.map((_x) => new Value(1).div(new Value(1).add(_x.neg().exp())));
  }

  softmax(x) {
    let denominator = new Value(0);
    x.forEach((_x) => {
      denominator = denominator.add(_x.exp());
    });
    return x.map((_x) => _x.exp().div(denominator));
  }
}
