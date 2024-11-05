class SGD {
  constructor(momentum = 0.9) {
    this.momentum = momentum;
    this.lr = 0.1;
    this.velocities = new Map();
  }

  setLr(lr) {
    this.lr = lr;
  }

  setMomentum(momentum) {
    this.momentum = momentum;
  }

  step(params) {
    params.forEach((param) => {
      !this.velocities.has(param) && this.initializeVelocities(param);

      const v = this.velocities.get(param);

      // v = momentum * v - lr * grad
      for (let i = 0; i < param.data.length; i++) {
        if (!Array.isArray(param.data[0])) {
          v[i] = this.momentum * v[i] - this.lr * param.grad[i];
          param.data[i] += v[i];
          continue;
        }
        for (let j = 0; j < param.data[0].length; j++) {
          v[i][j] = this.momentum * v[i][j] - this.lr * param.grad[i][j];
          param.data[i][j] += v[i][j];
        }
      }
    });
  }

  initializeVelocities(param) {
    const velocity = Array.isArray(param.data[0])
      ? Array.from({ length: param.data.length }, () =>
          Array(param.data[0].length).fill(0),
        )
      : Array(param.data.length).fill(0);
    this.velocities.set(param, velocity);
  }

  zeroGrad(params) {
    params.forEach((param) => {
      param.grad = null;
      this.velocities.has(param) && this.resetVelocities(param);
    });
  }

  resetVelocities(param) {
    const velocity = this.velocities.get(param);
    for (let i = 0; i < velocity.length; i++) {
      if (!Array.isArray(param.data[0])) {
        velocity.fill(0);
        continue;
      }
      for (let j = 0; j < velocity[0].length; j++) {
        velocity[i][j] = 0;
      }
    }
  }
}
