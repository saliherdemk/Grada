class MlpParams {
  constructor() {
    this.lr = 0;
    this.batchSize = 0;
    this.errFunc = errFuncManager.getFunction("mse");
    this.totalParams = 0;
    this.stepCounter = 0;
    this.recordNum = 0;
    this.epoch = 0;
    this.seenRecordNum = 0;
    this.mode = "train";
  }

  setLr(lr) {
    this.lr = lr;
  }

  setBatchSize(batchSize) {
    this.batchSize = batchSize;
  }

  setErrFunc(errFunc) {
    this.errFunc = errFunc;
  }

  setMode(mode) {
    this.mode = mode;
  }

  setTotalParams() {
    let totalParams = 0;
    const { weights, biases } = this.getParameters();
    weights.forEach(
      (weight) => (totalParams += weight.shape[0] * weight.shape[1]),
    );
    biases.forEach((bias) => (totalParams += bias.shape[0]));
    this.totalParams = totalParams;
  }

  getProps() {
    return {
      totalParams: this.totalParams,
      stepCounter: this.stepCounter,
      epoch: ~~(this.seenRecordNum / this.recordNum),
    };
  }
}
