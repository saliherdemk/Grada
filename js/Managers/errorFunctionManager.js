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

  mae(output, target) {
    const absoluteDiffs = output.data.map((outRow, i) =>
      outRow.map((o, j) => Math.abs(o - target.data[i][j])),
    );

    const totalElements = output.data.length * output.data[0].length;
    const lossValue =
      absoluteDiffs.reduce(
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
            (output.data[i][j] - target.data[i][j] >= 0 ? 1 : -1) /
            totalElements;
        }
      }
    };

    return lossTensor;
  }

  bce(output, target) {
    const eps = 1e-15;
    const clippedOutput = output.data.map((outRow) =>
      outRow.map((o) => Math.min(Math.max(o, eps), 1 - eps)),
    );

    const lossValues = clippedOutput.map((outRow, i) =>
      outRow.map(
        (o, j) =>
          -(
            target.data[i][j] * Math.log(o) +
            (1 - target.data[i][j]) * Math.log(1 - o)
          ),
      ),
    );

    const totalElements = output.data.length * output.data[0].length;
    const lossValue =
      lossValues.reduce(
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
            (clippedOutput[i][j] - target.data[i][j]) / totalElements;
        }
      }
    };

    return lossTensor;
  }
}
