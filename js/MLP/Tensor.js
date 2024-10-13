class Tensor {
  constructor(data) {
    this.setData(data);
    this.grad = null;
    this._backward = () => {};
    this._prev = [];
  }

  setData(data) {
    this.data = data;
    this.determineShape();
  }

  determineShape() {
    let data = this.data;
    let rows = data.length;
    let cols = data[0] instanceof Array ? data[0].length : 1;
    this.shape = [rows, cols];
  }

  dot(other) {
    const v1 = this.data;
    const v2 = other.data;

    const m = v1.length;
    const n = v2[0].length;
    const p = v2.length;

    if (v1[0].length !== p) {
      throw new Error("Incompatible dimensions for matrix multiplication.");
    }

    const result = Array.from({ length: m }, () => Array(n).fill(0));

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < p; k++) {
          result[i][j] += v1[i][k] * v2[k][j];
        }
      }
    }

    const output = new Tensor(result);

    const _backward = () => {
      if (this.grad === null) {
        this.grad = Array.from({ length: this.shape[0] }, () =>
          Array(this.shape[1]).fill(0),
        );
      }
      if (other.grad === null) {
        other.grad = Array.from({ length: other.shape[0] }, () =>
          Array(other.shape[1]).fill(0),
        );
      }

      for (let i = 0; i < m; i++) {
        for (let k = 0; k < p; k++) {
          for (let j = 0; j < n; j++) {
            this.grad[i][k] += output.grad[i][j] * other.data[k][j];
          }
        }
      }

      const self_T = this.transpose();
      for (let k = 0; k < p; k++) {
        for (let j = 0; j < n; j++) {
          for (let i = 0; i < m; i++) {
            other.grad[k][j] += output.grad[i][j] * self_T.data[k][i];
          }
        }
      }
    };

    output._backward = _backward;
    output._prev = [this, other];

    return output;
  }

  broadcasted(m) {
    const result = Array.from({ length: m }, () => this.data);
    return new Tensor(result);
  }

  add(other) {
    let compatibleOther = other;
    if (
      this.shape[0] !== other.shape[0] ||
      this.shape[1] !== other.shape[1] ||
      !Array.isArray(other.data[0])
    ) {
      compatibleOther = other.broadcasted(this.shape[0]);
    }

    const result = [];
    for (let i = 0; i < this.data.length; i++) {
      const row = [];
      for (let j = 0; j < this.data[0].length; j++) {
        row.push(this.data[i][j] + compatibleOther.data[i][j]);
      }
      result.push(row);
    }

    const output = new Tensor(result);

    const _backward = () => {
      if (this.grad === null) {
        this.grad = Array.from({ length: this.shape[0] }, () =>
          Array(this.shape[1]).fill(0),
        );
      }

      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < this.data[0].length; j++) {
          this.grad[i][j] += output.grad[i][j];
        }
      }

      if (other.grad === null) {
        other.grad = Array(other.data.length).fill(0);
      }

      for (let i = 0; i < output.data.length; i++) {
        for (let j = 0; j < output.data[0].length; j++) {
          other.grad[j] += output.grad[i][j];
        }
      }
    };

    output._backward = _backward;
    output._prev = [this, other];

    return output;
  }

  step(lr) {
    if (Array.isArray(this.data[0])) {
      for (let i = 0; i < this.data.length; i++) {
        for (let j = 0; j < this.data[0].length; j++) {
          this.data[i][j] -= this.grad[i][j] * lr;
        }
      }
    } else {
      for (let i = 0; i < this.data.length; i++) {
        this.data[i] -= this.grad[i] * lr;
      }
    }
  }

  transpose() {
    const transposedData = Array.from({ length: this.shape[1] }, (_, i) =>
      Array.from({ length: this.shape[0] }, (_, j) => this.data[j][i]),
    );
    return new Tensor(transposedData);
  }

  backward() {
    if (this.grad === null) {
      this.grad = Array.from({ length: this.shape[0] }, () =>
        Array(this.shape[1]).fill(1.0),
      );
    }
    this._backward();
    for (const prevTensor of this._prev) {
      prevTensor.backward();
    }
  }

  toString() {
    return `Tensor(data=${JSON.stringify(this.data)}, grad=${this.grad}, prev=${this._prev}, shape=${this.shape})`;
  }
}
