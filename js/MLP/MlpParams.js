class MlpParams {
  constructor() {
    this.lr = 0;
    this.batchSize = 0;
    this.errFunc = errFuncManager.getFunction("mse");
    this.totalParams = 0;
    this.stepCounter = 0;
    this.recordNum = 0;
    this.epoch = 0;
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

  setTotalParams() {
    return;
  }

  getProps() {
    return {
      totalParams: this.totalParams,
      stepCounter: this.stepCounter,
      epoch: this.epoch,
    };
  }
}
