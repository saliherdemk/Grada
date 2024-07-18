class Neuron {
  constructor(x, y, hidden, cnv) {
    this.w = [];
    // for (let i = 0; i < nin; i++) {
    //   this.w.push(new Value(Math.random() * 2 - 1));
    // }
    this.canvas = cnv;
    this.b = new Value(Math.random() * 2 - 1);
    this.act_func = ActivationFunction.TANH;
    this.output = null;
    this.lines = [];
    this.x = x;
    this.y = y;
    this.hidden = hidden;
  }

  hide() {
    this.hidden = true;
  }

  visible() {
    this.hidden = false;
  }

  isHidden() {
    return this.hidden;
  }

  call(x) {
    let act = this.b;
    for (let i = 0; i < this.w.length; i++) {
      act = act.add(this.w[i].mul(x[i]));
    }

    this.output = activation_functions[this.act_func](act);
    return this.output;
  }

  parameters() {
    return [...this.w, this.b];
  }

  change_act_func(act_func) {
    this.act_func = act_func;
  }

  setLines(lines) {
    this.lines = lines;
  }

  updateCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  show() {
    const commands = [
      { func: "circle", args: [this.x, this.y, 25, 25] },
      { func: "fill", args: [0] },
      {
        func: "text",
        args: [this.output?.data.toFixed(2), this.x + 30, this.y],
      },
      {
        func: "text",
        args: [this.output?.grad.toFixed(2), this.x + 30, this.y + 25],
      },
      { func: "fill", args: [255] },
    ];
    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    if (this.isHidden()) return;
    this.lines.forEach((line) => line.draw());
    this.show();
  }
}
