class Neuron {
  constructor(inputSize) {
    this.w = Array.from(
      { length: inputSize },
      () => new Value(Math.random() * 2 - 1),
    );
    this.b = new Value(Math.random() * 2 - 1);
    this.output = new Value(0);
  }

  sanitazed() {
    const w = this.w.map((_w) => _w.sanitazed());
    return { w, b: this.b.sanitazed(), output: this.output.sanitazed() };
  }

  call(x) {
    let act = this.b;
    for (let i = 0; i < this.w.length; i++) {
      act = act.add(this.w[i].mul(x[i]));
    }
    return act;
  }

  parameters() {
    return [...this.w, this.b];
  }

  setOutput(output) {
    this.output = output;
  }

  destroy() {
    this.b = null;
    this.w = [];
  }
}
