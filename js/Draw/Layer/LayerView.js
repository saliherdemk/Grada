class DrawLayer extends Draggable {
  constructor(x, y, parent, cnv) {
    super(x, y, 50, 0);
    this.parent = parent;
    this.canvas = cnv;
    this.neurons = [];
    this.yGap = 40;
    this.infoBox = { h: 70, y: 0, val: 0 };
    this.shrank = false;
    this.shownNeurons = { num: 0, indexes: [] };
    this.dots = parent ? [new Dot(this, true), new Dot(this, false)] : [];
    this.button;
    this.initializeNeurons();
    !this.isCopy() && this.initializeButton();
  }

  initializeNeurons() {
    const numOfNeurons = parseInt(Math.random() * 7) + 1;
    for (let i = 0; i < numOfNeurons; i++) {
      this.neurons.push(new DrawNeuron(this.canvas));
    }

    this.setShownNeuronsNum(this.getNeuronNum());
  }

  initializeButton() {
    this.button = new CanvasButton("delete", () => this.handleRemove());
    this.updateButtonCoordinates();
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
    this.postUpdateCoordinates();
  }

  updateButtonCoordinates() {
    const button = this.button;
    button?.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
  }

  postUpdateCoordinates() {
    this.updateButtonCoordinates();
    this.updateNeuronsCoordinates();
    this.parent?.updateBorders();
  }

  isEditable() {
    return this.parent ? this.parent.editModeOpen : false;
  }

  isShrank() {
    return this.shrank || this.isCopy();
  }

  isCopy() {
    return !this.parent;
  }

  pushNeuron() {
    this.neurons.push(new DrawNeuron(this.canvas));
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

  handleRemove() {
    if (this.isIsolated()) {
      this.parent.destroy();
      return;
    }
    this.isolate();
  }

  isIsolated() {
    return this.parent.layers.length == 1;
  }

  isolate() {
    const { prev: prevLayer, next: targetLayer } =
      this.parent.getPrevAndNext(this);

    targetLayer && this.splitMlp(targetLayer);
    prevLayer && prevLayer.splitMlp(this);
  }

  setShownNeuronsNum(shownNeuronsNum) {
    this.shownNeurons.num = this.isShrank()
      ? shownNeuronsNum
      : this.getNeuronNum();
    this.setShownNeurons();
    editOrganizer.isEnabled && editOrganizer.setInfoText();
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
    this.dots.forEach((dot) => dot.updateCoordinates());
  }

  splitMlp(targetLayer) {
    const parent = targetLayer.parent;
    const { prev, index: splitIndex } = parent.getPrevAndNext(targetLayer);
    prev.clearLines(targetLayer);

    const newLayers = parent.getLayers().splice(0, splitIndex);

    const [x, y] = [newLayers[0].x, newLayers[0].y];

    // FIXME: Don't destroy and recreate, just move -> Done but not satisfying
    const newSchema = new Schema(new MLP(), organizer.getCanvas(), x, y);

    newSchema.setLayers(newLayers);
    newSchema.updateBorders();
    parent.updateBorders();
    organizer.addSchema(newSchema);
  }

  reconnectNeurons() {
    const parent = this.parent;
    const { prev, next } = parent.getPrevAndNext(this);

    prev && prev.connectNeurons(this);
    next && this.connectNeurons(next);

    this.updateButtonCoordinates();
    this.parent.updateBorders();
  }

  connectNeurons(targetLayer) {
    this.neurons.forEach((n1) => {
      n1.setLines([]);
      targetLayer.neurons.forEach((n2) => {
        n1.addLine(new Line(n1, n2));
      });
    });
    this.dots[1].occupy();
    targetLayer.dots[0].occupy();
  }

  connectLayer(targetLayer) {
    if (this.parent === targetLayer.parent) return;
    if (this.dots[1].isOccupied()) {
      const { next } = this.parent.getPrevAndNext(this);
      this.splitMlp(next);
    }

    if (targetLayer.dots[0].isOccupied()) {
      this.splitMlp(targetLayer);
    }

    this.connectNeurons(targetLayer);
    targetLayer.parent.moveLayers(this.parent);
  }

  clearLines(targetLayer) {
    this.neurons.forEach((neuron) => neuron.removeLines());
    this.dots[1].free();
    targetLayer.dots[0].free();
  }

  destroy() {
    this.neurons.forEach((neuron) => neuron.destroy());
    this.neurons = [];
    this.dots.forEach((dot) => dot.destroy());
    this.dots = [];
    this.canvas = null;
    this.button?.destroy();
    this.button = null;
  }

  pressed() {
    this.dots.forEach((dot) => dot.handlePressed());
    this.button.handlePressed();
    return iManager.checkRollout(this);
  }

  doubleClicked() {
    if (iManager.isHovered(this) && !editOrganizer.getSelected()) {
      editOrganizer.enable(this);
    }
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

    executeDrawingCommands(commands, this.canvas);
  }

  show() {
    const commands = [{ func: "rect", args: [this.x, this.y, this.w, this.h] }];

    executeDrawingCommands(commands, this.canvas);
  }

  draw() {
    if (this.isEditable()) {
      this.dots.forEach((dot) => dot.draw());
      this.button?.draw();
    }
    this.show();
    this.isShrank() && this.showInfoBox();

    this.neurons.forEach((neuron) => neuron.draw());
  }
}
