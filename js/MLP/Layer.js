class Layer {
  constructor(nin, nout, actFunction) {
    this.nin = nin;
    this.neurons = Array.from({ length: nout }, () => new Neuron(nin));
    this.actFunc = actFunction;
    this.setActFunction(actFunction);
  }

  setActFunction(actFunc) {
    this.actFunc = actFuncManager.getFunction(actFunc);
  }

  call(x) {
    let outs = this.neurons.map((neuron) => {
      let output = neuron.call(x);
      if (this.actFunc) {
        output = this.actFunc(output);
      }
      neuron.setOutput(output);
      return output;
    });
    return outs;
  }

  parameters() {
    return this.neurons.flatMap((neuron) => neuron.parameters());
  }

  destroy() {
    this.neurons.forEach((neuron) => neuron.destroy());
  }
}
