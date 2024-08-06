class HiddenLayer extends LayerView {
  constructor(x, y, parent) {
    super(x, y, 50, 0, parent);
    this.neurons = [];
    this.yGap = 40;
    this.infoBox = { h: 70, y: 0, val: 0 };
    this.shrank = false;
    this.shownNeurons = { num: 0, indexes: [] };
    this.initializeNeurons();
    !this.isCopy() && this.initializeButton();
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
      this.neurons.push(new DrawNeuron());
    }

    this.setShownNeuronsNum(this.getNeuronNum());
  }

  postUpdateCoordinates() {
    this.updateButtonCoordinates();
    this.updateNeuronsCoordinates();
    this.updateDotsCoordinates();
    this.parent?.updateBorders();
  }

  isShrank() {
    return this.shrank || this.isCopy();
  }

  isCopy() {
    return !this.parent;
  }

  pushNeuron() {
    this.neurons.push(new DrawNeuron());
  }

  popNeuron() {
    this.neurons.pop();
  }

  getNeuronNum() {
    return this.neurons.length;
  }

  getShownNeuronsNum() {
    return this.shownNeurons.num;
  }

  setShownNeuronsNum(shownNeuronsNum) {
    this.shownNeurons.num = this.isShrank()
      ? shownNeuronsNum
      : this.getNeuronNum();
    this.setShownNeurons();
    editLayerOrganizer.isEnabled && editLayerOrganizer.setInfoText();
  }

  // GIANT MESS -> LESS GIANT MESS -> Acceptable mess
  setShownNeurons() {
    this.shownNeurons.indexes = [];
    const shownNeuronsNum = this.getShownNeuronsNum();
    const neuronsNum = this.getNeuronNum();
    this.infoBox.val = neuronsNum - shownNeuronsNum;
    const mid =
      (this.parent ? shownNeuronsNum : Math.min(shownNeuronsNum, 5)) / 2;

    this.neurons.forEach((neuron, i) => {
      if (i < mid || i >= neuronsNum - mid) {
        neuron.visible();
        this.shownNeurons.indexes.push(i);
      } else {
        neuron.hide();
      }
    });

    this.updateNeuronsCoordinates();
  }

  updateNeuronsCoordinates() {
    const isShrank = this.isShrank();
    const neurons = this.shownNeurons.indexes.map((i) => this.neurons[i]);

    const neuronNum = neurons.length;
    this.h = this.yGap * (neuronNum - 1) + this.w;
    this.infoBox.y = this.y;

    const midPoint = neuronNum / 2;
    neurons.forEach((neuron, i) => {
      const afterMid = isShrank && i > midPoint;
      if (!afterMid) {
        this.infoBox.y += this.yGap;
      }
      const x = this.x + this.w / 2;
      const y = this.y + this.h / 2 + this.yGap * (i - (neuronNum - 1) / 2);

      neuron.updateCoordinates(x, y + (afterMid ? this.infoBox.h : 0));
    });

    this.h += isShrank ? this.infoBox.h : 0;
    this.updateDotsCoordinates();
  }

  showInfoBox() {
    const infoBoxY = this.infoBox.y;
    const commands = [
      { func: "fill", args: [0] },
      { func: "textSize", args: [18] },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "textLeading", args: [4] },
      { func: "text", args: [`.\n.\n.\n`, this.x, infoBoxY, 50, 35] },
      {
        func: "text",
        args: [this.infoBox.val.toString(), this.x, infoBoxY + 25, 50, 35],
      },
      { func: "text", args: [`.\n.\n.\n`, this.x, infoBoxY + 45, 50, 35] },
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
