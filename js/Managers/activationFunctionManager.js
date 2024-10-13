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
    const result = x.data.map((row) => row.map((_x) => Math.tanh(_x)));
    const output = new Tensor(result);
    output._prev = [x];

    output._backward = function () {
      if (x.grad === null) {
        x.grad = x.data.map((row) => row.map(() => 0));
      }
      for (let i = 0; i < x.data.length; i++) {
        for (let j = 0; j < x.data[0].length; j++) {
          x.grad[i][j] +=
            (1 - Math.tanh(x.data[i][j]) ** 2) * output.grad[i][j];
        }
      }
    };

    return output;
  }

  relu(x) {
    const result = x.data.map((row) => row.map((_x) => Math.max(0, _x)));
    const output = new Tensor(result);
    output._prev = [x];

    output._backward = function () {
      if (x.grad === null) {
        x.grad = x.data.map((row) => row.map(() => 0));
      }
      for (let i = 0; i < x.data.length; i++) {
        for (let j = 0; j < x.data[0].length; j++) {
          x.grad[i][j] += (x.data[i][j] > 0 ? 1 : 0) * output.grad[i][j];
        }
      }
    };

    return output;
  }

  sigmoid(x) {
    const result = x.data.map((row) =>
      row.map((_x) => 1 / (1 + Math.exp(-_x))),
    );
    const output = new Tensor(result);
    output._prev = [x];

    output._backward = function () {
      if (x.grad === null) {
        x.grad = x.data.map((row) => row.map(() => 0));
      }
      for (let i = 0; i < x.data.length; i++) {
        for (let j = 0; j < x.data[0].length; j++) {
          const sig = 1 / (1 + Math.exp(-x.data[i][j]));
          x.grad[i][j] += sig * (1 - sig) * output.grad[i][j];
        }
      }
    };

    return output;
  }

  softmax(x) {
    const maxVal = x.data.map((row) => Math.max(...row));
    const exps = x.data.map((row, i) =>
      row.map((_x) => Math.exp(_x - maxVal[i])),
    );
    const sums = exps.map((row) => row.reduce((a, b) => a + b, 0));
    const softmaxResult = exps.map((row, i) => row.map((_x) => _x / sums[i]));

    const output = new Tensor(softmaxResult);
    output._prev = [x];

    output._backward = function () {
      if (x.grad === null) {
        x.grad = x.data.map((row) => row.map(() => 0));
      }

      for (let i = 0; i < output.data.length; i++) {
        for (let j = 0; j < output.data[0].length; j++) {
          for (let k = 0; k < output.data[0].length; k++) {
            const gradVal =
              output.data[i][j] * ((j === k ? 1 : 0) - output.data[i][k]);
            x.grad[i][k] += output.grad[i][j] * gradVal;
          }
        }
      }
    };

    return output;
  }
}
