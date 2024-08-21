class LayerView extends Draggable {
  constructor(x, y, w, h, parent) {
    super(x, y, w, h);
    this.parent = parent;
    this.origin = null;
    this.neurons = [];
    this.inputDot = null;
    this.outputDot = null;
    this.label = "";
    this.removeButton;
    this.editMode = true;
    this.shrank = false;
    this.shownNeurons = { num: 0, indexes: [] };

    this.initializeDots();
  }

  initializeDots() {}

  initializeButton() {
    this.removeButton = new ImageButton("delete", () => this.handleRemove());
    this.updateButtonCoordinates();
  }

  updateDotsCoordinates() {
    this.getDots().forEach((dot) => dot?.updateCoordinates());
  }

  updateButtonCoordinates() {
    const button = this.removeButton;
    button?.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
  }

  handleRemove() {
    if (this.isIsolated()) {
      this.parent.destroy();
      return;
    }
    this.isolate();
  }

  getDots() {
    return [this.inputDot, this.outputDot];
  }

  postUpdateCoordinates() {
    this.updateButtonCoordinates();
    this.updateNeuronsCoordinates();
    this.parent?.updateBorders();
  }

  clearOrigin() {
    this.neurons.forEach((n) => n.clearOrigin());
    this.origin = null;
  }

  setOrigin(obj) {
    // Thanks to MLP class, we can't get rid of this mess. There is no input layer in original MLP class and all weights belongs to target neurons. Too much work to change. Maybe later.
    const { prev } = this.parent.getPrevAndNext(this);
    for (let i = 0; i < this.neurons.length; i++) {
      for (let j = 0; j < prev.neurons.length; j++) {
        this.neurons[i].setOrigin(obj.neurons[i]);
        prev.neurons[j].lines[i].setOrigin(obj.neurons[i].w[j]);
      }
    }
    this.origin = obj;
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  setLabel(label) {
    this.label = label;
  }

  setParent(parent) {
    this.parent = parent;
  }

  isEditModeOpen() {
    return this.editMode;
  }

  isShrank() {
    return this.shrank;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
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

  isIsolated() {
    return this.parent.layers.length == 1;
  }

  isolate() {
    const { prev: prevLayer, next: targetLayer } =
      this.parent.getPrevAndNext(this);

    targetLayer && this.splitMlp(targetLayer);
    prevLayer && prevLayer.splitMlp(this);
  }

  clearLines(targetLayer) {
    this.neurons.forEach((neuron) => neuron.removeLines());
    this.outputDot.free();
    targetLayer.inputDot.free();
  }

  splitMlp(targetLayer) {
    const parent = targetLayer.parent;
    const { prev, index: splitIndex } = parent.getPrevAndNext(targetLayer);
    prev.clearLines(targetLayer);

    const newLayers = parent.getLayers().splice(0, splitIndex);

    const [x, y] = [newLayers[0].x, newLayers[0].y];

    // FIXME: Don't destroy and recreate, just move -> Done but not satisfying
    const newMlpView = new MlpView(x, y);

    newMlpView.setLayers(newLayers);
    newMlpView.updateBorders();
    parent.updateBorders();
    parent.checkMlpCompleted();
    mainOrganizer.addMlpView(newMlpView);
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
      n1.removeLines();
      targetLayer.neurons.forEach((n2) => {
        n1.addLine(new Line(n1, n2));
      });
    });
    this.outputDot.occupy();
    targetLayer.inputDot.occupy();
  }

  connectLayer(targetLayer) {
    if (this.parent === targetLayer.parent) return;
    if (this.outputDot.isOccupied()) {
      const { next } = this.parent.getPrevAndNext(this);
      this.splitMlp(next);
    }

    if (targetLayer.inputDot.isOccupied()) {
      this.splitMlp(targetLayer);
    }

    this.connectNeurons(targetLayer);
    targetLayer.parent.moveLayers(this.parent);
  }

  pressed() {
    if (iManager.checkRollout(this) && getMouseButton() == "right") {
      this.toggleEditMode();
    }
    if (!this.isEditModeOpen()) return;
    this.getDots().forEach((dot) => dot?.handlePressed());
    this.removeButton?.handlePressed();
  }

  doubleClicked() {
    const allowed =
      iManager.checkRollout(this) &&
      this.isEditModeOpen() &&
      !editLayerOrganizer.getSelected();

    allowed && editLayerOrganizer.enable(this);
  }

  destroy() {
    this.neurons.forEach((neuron) => neuron.destroy());
    this.neurons = [];
    this.getDots().forEach((dot) => dot?.destroy());
    this.inputDot = null;
    this.outputDot = null;
    this.instance = null;
    this.button?.destroy();
    this.button = null;
  }
}
