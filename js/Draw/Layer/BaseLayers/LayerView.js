class LayerView extends Draggable {
  constructor(_x, _y, w, h) {
    const { x, y } = iManager.getAbsoluteCoordinates(_x, _y);
    super(x, y, w, h);
    this.neurons = [];
    this.yGap = 50;
    this.label = "";
    this.shrank = false;
    this.shownNeurons = { num: 0, indexes: [] };
    this.infoBox = { h: 70, y: 0, val: 0 };
    this.neuronAlignment = "middle";
  }

  setLabel(label) {
    this.label = label;
  }

  shrink() {
    this.shrank = true;
  }

  expand() {
    this.shrank = false;
  }

  isShrank() {
    return this.shrank;
  }

  pushNeuron() {
    this.neurons.push(new NeuronView());
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

  updateNeuronsCoordinates(isShrank = this.isShrank()) {
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

  setShownNeuronsNum(shownNeuronsNum, max = -1) {
    this.shownNeurons.num = shownNeuronsNum;

    this.setShownNeurons(max);
  }

  // GIANT MESS -> LESS GIANT MESS -> Acceptable mess
  setShownNeurons(max) {
    this.shownNeurons.indexes = [];
    const shownNeuronsNum = this.getShownNeuronsNum();
    const neuronsNum = this.getNeuronNum();
    this.infoBox.val = neuronsNum - shownNeuronsNum;
    const mid =
      (max > 0 ? Math.min(shownNeuronsNum, max) : shownNeuronsNum) / 2;

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

  show() {
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
      { func: "text", args: [this.label, this.x, this.y - 15, this.w, 25] },
    ];

    executeDrawingCommands(commands);
  }

  destroy() {
    this.neurons.forEach((n) => n.destroy());
    this.neurons = [];
  }
}
