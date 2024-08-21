class IOLayer extends LayerView {
  constructor(name, data, _x, _y) {
    const { x, y } = iManager.getAbsoluteCoordinates(_x, _y);
    super(x, y, 300, 300);
    this.name = name;
    this.data = data;
  }

  isInput() {
    return this.outputDot !== null;
  }

  getDot() {
    return this.inputDot ?? this.outputDot;
  }

  updateNeuronsCoordinates() {
    this.neurons.forEach((n, i) => {
      const x = this.x - 25 + (this.isInput() ? this.w : 50);
      n.updateCoordinates(x, this.y + 30 + i * 50);
    });
    this.updateBorders();
  }

  updateBorders() {
    this.h = this.neurons[this.neurons.length - 1].y - this.y + 30;
    this.getDot().updateCoordinates();
  }

  reInitializeNeurons() {
    const varNum = this.data[0].length;
    for (let i = 0; i < varNum; i++) {
      const neuron = new NeuronView();
      this.neurons.push(neuron);
    }
    this.updateNeuronsCoordinates();
  }

  pressed() {
    iManager.checkRollout(this);
    this.getDot().handlePressed();
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
  }

  createColCommand(text, x, y) {
    return {
      func: "text",
      args: [text, this.x + 25 + x, this.y + 25 + y, this.w, this.h],
    };
  }

  doubleClicked() {}

  draw() {
    this.isEditModeOpen() && this.getDot().draw();
    const commands = [...this.outerCommands(), ...this.dataCommands()];
    executeDrawingCommands(commands);

    this.neurons.forEach((n) => n.draw());
  }
}
