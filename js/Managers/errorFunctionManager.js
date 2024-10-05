class ErrorFunctionManager {
  constructor() {
    this.functions = {
      mse: this.mse,
      mae: this.mae,
      bce: this.bce,
    };
    const selectElement = getElementById("err-function-select");

    for (const key of Object.keys(this.functions)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      selectElement.appendChild(option);
    }
  }

  getFunction(name) {
    return this.functions[name];
  }

  mse(output, target) {
    const squaredDiffs = output.data.map((outRow, i) =>
      outRow.map((o, j) => (o - target.data[i][j]) ** 2),
    );

    const totalElements = output.data.length * output.data[0].length;
    const lossValue =
      squaredDiffs.reduce(
        (sumRow, row) => sumRow + row.reduce((sum, val) => sum + val, 0),
        0,
      ) / totalElements;

    const lossTensor = new Tensor([[lossValue]]);
    lossTensor._prev = [output];

    lossTensor._backward = function () {
      if (output.grad === null) {
        output.grad = output.data.map((row) => row.map(() => 0.0));
      }
      for (let i = 0; i < output.data.length; i++) {
        for (let j = 0; j < output.data[0].length; j++) {
          output.grad[i][j] +=
            (2 * (output.data[i][j] - target.data[i][j])) / totalElements;
        }
      }
    };

    return lossTensor;
  }

  mae(y1, y2) {}

  bce(y1, y2) {}
}
