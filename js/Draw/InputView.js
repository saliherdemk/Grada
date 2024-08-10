class InputView extends LayerView {
  constructor(name, data, parent) {
    const { x, y } = iManager.getAbsoluteCoordinates(300, 300);
    super(x, y, 300, 300, parent);
    this.name = name;
    this.data = data;
    console.log(data);
    this.reInitializeNeurons();
  }

  initializeDots() {
    this.outputDot = new Dot(this);
  }

  reInitializeNeurons() {
    const varNum = this.data[0].length;
    for (let i = 0; i < varNum; i++) {
      const neuron = new DrawNeuron();
      this.neurons.push(neuron);
    }
    this.updateNeuronsCoordinates();
  }

  updateNeuronsCoordinates() {
    this.neurons.forEach((n, i) => {
      n.updateCoordinates(this.x + this.w - 25, this.y + 30 + i * 50);
    });
    this.updateBorders();
  }

  updateBorders() {
    this.h = this.neurons[this.neurons.length - 1].y - this.y + 30;
    this.outputDot.updateCoordinates();
  }

  pressed() {
    iManager.checkRollout(this);
    this.outputDot.handlePressed();
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
    this.postUpdateCoordinates();
  }

  createColCommand(text, x, y) {
    return {
      func: "text",
      args: [text, this.x + 25 + x, this.y + 25 + y, this.w, this.h],
    };
  }

  doubleClicked() {}

  dataCommands() {
    let commands = [];
    this.data.forEach((row, i) => {
      row.forEach((val, j) => {
        const a = this.createColCommand(val, i * 50, j * 50);
        commands.push(a);
      });
    });
    return commands;
  }

  outerCommands() {
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10, 10] },
      {
        func: "text",
        args: [this.name + " Input", this.x + 5, this.y - 20, this.w, this.h],
      },
      {
        func: "line",
        args: [this.x + 50, this.y + 15, this.x + 50, this.y + this.h - 15],
      },
    ];
    return commands;
  }

  draw() {
    this.outputDot.draw();
    const commands = [...this.outerCommands(), ...this.dataCommands()];
    executeDrawingCommands(commands);

    this.neurons.forEach((n) => n.draw());
  }
}
