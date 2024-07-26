class EditOrganizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.selected = null;
    this.selectedCopy = null;
    this.shrank = false;
    this.originX;
    this.originY;
    this.w = 500;
    this.h = 500;
    this.editPanel = getElementById("edit-panel");

    new EventManager(this);
  }

  isEnabled() {
    return this.enabled;
  }

  getSelected() {
    return this.selectedCopy;
  }

  adjustOrigins() {
    this.originX = (width - 500) / 2;
    this.originY = 150;
  }

  toggleShrink() {
    const btn = getElementById("toggle-shrink-btn");
    this.shrank = !this.shrank;
    btn.innerText = this.shrank ? "Shrank" : "Expanded";
    this.setInfoText();
  }

  setInfoText() {
    const layer = this.selectedCopy;
    const text = this.shrank ? layer.getShownNeuronsNum() : "all";
    getElementById("info-message").innerText = text;
  }

  placeSelected() {
    const layer = this.selectedCopy;
    const x = this.originX + (this.w - layer.w) / 2;
    const y = this.originY + 100;
    layer.setCoordinates(x, y);
    layer.updateNeuronsCoordinates();
  }

  onNeuronFocusOut(e) {
    const val = parseInt(e.target.value) || 1;
    setElementProperties("set-neuron-num", { value: val });
  }

  onNeuronNumChange(e) {
    const layer = this.selectedCopy;
    const val = this.makeInputValid(e.target.value);
    const diff = val - layer.getNeuronNum();

    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? layer.pushNeuron() : layer.popNeuron();
    }

    this.setMaxShownNeuronInput();
  }

  onSetShownNeuron(otherElId, e) {
    const layer = this.selectedCopy;
    const val = Math.min(
      this.makeInputValid(e.target.value),
      layer.getNeuronNum(),
    );

    setElementProperties(otherElId, { value: val });
    this.setShownNeuronsNum(val);
  }

  setShownNeuronsNum(shownNeuronNum) {
    this.selectedCopy.setShownNeuronsNum(shownNeuronNum);
    this.setInfoText();
  }

  setMaxShownNeuronInput() {
    const layer = this.selectedCopy;
    const neuronNum = layer.getNeuronNum();
    const newShownNeuronNum = Math.min(layer.getShownNeuronsNum(), neuronNum);

    setElementProperties("set-shown-neuron", {
      value: newShownNeuronNum,
      max: neuronNum,
    });

    setElementProperties("shown-neuron-inp", { value: newShownNeuronNum });
    this.setShownNeuronsNum(newShownNeuronNum);
  }

  onShownNeuronFocusOut(e) {
    let val = parseInt(e.target.value) || 1;
    val = Math.max(1, Math.min(val, this.selectedCopy.getNeuronNum()));
    setElementProperties("shown-neuron-inp", { value: val });
  }

  makeInputValid(val) {
    return isNaN(val) || val === "" || val < 1 ? 1 : val;
  }
  getCanvas() {
    return this.canvas;
  }

  setLayout() {
    this.adjustOrigins();
    this.editPanel.style.left = this.originX + "px";
    this.editPanel.style.top = this.originY + "px";
    this.editPanel.style.display = "flex";
    this.placeSelected();
  }

  setup() {
    this.setLayout();
    // Adjusts inputs properties based on selectedLayer
    this.toggleShrink();
    setElementProperties("set-neuron-num", {
      value: this.selectedCopy.getNeuronNum(),
    });
    this.setMaxShownNeuronInput();
  }

  update() {
    const original = this.selected;
    const copy = this.selectedCopy;
    this.copyNeurons(copy, original);
    original.shrank = this.shrank;
    original.setShownNeuronsNum(copy.getShownNeuronsNum());
    original.reconnectNeurons();
  }

  disable() {
    this.enabled = false;
    this.selectedCopy.destroy();
    this.selectedCopy = null;
    this.shrank = false;
    this.editPanel.style.display = "none";
  }

  copyNeurons(from, to) {
    const diff = from.getNeuronNum() - to.getNeuronNum();

    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? to.pushNeuron() : to.popNeuron();
    }
  }

  enable(layer) {
    this.selected = layer;
    const copy = new DrawLayer(0, 0, null, this.canvas, 0, 0);
    this.copyNeurons(layer, copy);
    this.shrank = !layer.shrank; // will call toggleShrink. I wanted to use same function
    this.selectedCopy = copy;
    this.setShownNeuronsNum(layer.getShownNeuronsNum());
    this.enabled = true;
    this.setup();
  }

  resize() {
    this.getCanvas().resizeCanvas(windowWidth, windowHeight);
    this.setLayout();
  }

  draw() {
    if (!this.enabled || !this.selectedCopy) return;

    const commands = [
      { func: "clear", args: [] },
      { func: "background", args: [0, 50] },
      { func: "fill", args: [255] },
      {
        func: "rect",
        args: [this.originX, this.originY, this.w, this.h, 10, 10],
      },
    ];
    executeDrawingCommands(this.canvas, commands);

    this.selectedCopy.draw();
    image(this.canvas, 0, 0);
  }
}
