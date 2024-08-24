class HiddenLayer extends LayerView {
  constructor(x, y, isCopy = false) {
    super(x, y, 50, 0, isCopy);
    this.yGap = 50;
    this.initializeNeurons();
    !this.isCopy() && this.initializeButton();
    this.parent?.updateBorders();
  }

  initializeDots() {
    if (!this.isCopy()) {
      this.inputDot = new Dot(this);
      this.outputDot = new Dot(this);
      this.updateDotsCoordinates();
    }
  }

  initializeNeurons() {
    const numOfNeurons = parseInt(Math.random() * 7) + 1;
    for (let i = 0; i < numOfNeurons; i++) {
      this.neurons.push(new NeuronView());
    }

    this.setShownNeuronsNum(this.getNeuronNum());
  }

  isShrank() {
    return this.shrank || this.isCopy();
  }

  isCopy() {
    return !this.parent;
  }

  getNeuronXBasedOnAlignment() {
    switch (this.neuronAlignment) {
      case "right":
        return this.x + this.w - 25;
      case "left":
        return this.x + 25;
      default:
        return this.x + this.w / 2;
    }
  }

  updateNeuronsCoordinates() {
    const isShrank = this.isShrank();
    const neurons = this.shownNeurons.indexes.map((i) => this.neurons[i]);

    const neuronNum = neurons.length;
    this.h = this.yGap * (neuronNum - 1) + 75;
    this.infoBox.y = this.y;

    const midPoint = neuronNum / 2;
    neurons.forEach((neuron, i) => {
      const afterMid = isShrank && i > midPoint;
      if (!afterMid) {
        this.infoBox.y += this.yGap;
      }
      const x = this.getNeuronXBasedOnAlignment();
      const y = this.y + this.h / 2 + this.yGap * (i - (neuronNum - 1) / 2);

      neuron.updateCoordinates(x, y + (afterMid ? this.infoBox.h : 0));
    });

    this.h += isShrank ? this.infoBox.h : 0;
    this.updateDotsCoordinates();
  }

  showInfoBox() {
    const infoBoxY = this.infoBox.y;
    const infoBoxX = this.getNeuronXBasedOnAlignment() - 25;
    const commands = [
      { func: "fill", args: [0] },
      { func: "textSize", args: [18] },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "textLeading", args: [4] },
      { func: "text", args: [`.\n.\n.\n`, infoBoxX, infoBoxY, 50, 35] },
      {
        func: "text",
        args: [this.infoBox.val.toString(), infoBoxX, infoBoxY + 25, 50, 35],
      },
      { func: "text", args: [`.\n.\n.\n`, infoBoxX, infoBoxY + 45, 50, 35] },
    ];

    executeDrawingCommands(commands);
  }

  show() {
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
      { func: "text", args: [this.label, this.x, this.y - 15, this.w, 25] },
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    if (this.isEditModeOpen()) {
      this.getDots().forEach((dot) => dot?.draw());
      this.removeButton?.draw();
    }

    this.show();
    this.isShrank() && this.showInfoBox();

    this.neurons.forEach((neuron) => neuron.draw());
  }
}
