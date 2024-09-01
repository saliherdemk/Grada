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

  mse(y1, y2) {
    let loss = new Value(0);
    const n = y1.length;

    for (let i = 0; i < n; i++) {
      loss = loss.add(y1[i].sub(y2[i]).pow(2));
    }

    return loss.div(n);
  }

  mae(y1, y2) {
    let loss = new Value(0);
    const n = y1.length;

    for (let i = 0; i < n; i++) {
      loss = loss.add(y1[i].sub(y2[i]).abs());
    }

    return loss.div(n);
  }

  bce(y1, y2) {
    let loss = new Value(0);
    const n = y1.length;

    for (let i = 0; i < n; i++) {
      const [_y1, _y2] = [y1[i], new Value(y2[i])];
      loss = loss.add(
        _y1
          .mul(_y2.log())
          .add(new Value(1).sub(_y1).mul(new Value(1).sub(_y2))),
      );
    }
    return loss.div(n).neg();
  }
}
