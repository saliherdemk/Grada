class Matrix {
  constructor(inputSize, outputSize) {
    this.data = Array.from({ length: inputSize }, () =>
      Array(outputSize).fill(0),
    );
  }

  randomize() {
    this.data = this.data.map((row) => row.map(() => Math.random() * 2 - 1));
    return this;
  }

  static multiply(a, b) {
    if (a.cols !== b.rows) {
      throw new Error("Incompatible matrix dimensions for multiplication");
    }

    const result = new Matrix(a.rows, b.cols);
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < b.cols; j++) {
        result.data[i][j] = 0;
        for (let k = 0; k < a.cols; k++) {
          result.data[i][j] += a.data[i][k] * b.data[k][j];
        }
      }
    }
    return result;
  }

  // Transpose the matrix
  transpose() {
    const result = new Matrix(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[j][i] = this.data[i][j];
      }
    }
    return result;
  }

  // Add another matrix
  add(other) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error("Matrix dimensions must match for addition");
    }

    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] + other.data[i][j];
      }
    }
    return result;
  }

  // Scalar multiplication
  mul(scalar) {
    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] * scalar;
      }
    }
    return result;
  }

  // Sum the matrix along a given axis (0 for rows, 1 for columns)
  sum(axis) {
    if (axis === 0) {
      // Sum over rows
      const result = new Matrix(1, this.cols);
      for (let j = 0; j < this.cols; j++) {
        result.data[0][j] = this.data.reduce((sum, row) => sum + row[j], 0);
      }
      return result;
    } else if (axis === 1) {
      // Sum over columns
      const result = new Matrix(this.rows, 1);
      for (let i = 0; i < this.rows; i++) {
        result.data[i][0] = this.data[i].reduce((sum, val) => sum + val, 0);
      }
      return result;
    }
    throw new Error("Invalid axis for sum operation");
  }
}
