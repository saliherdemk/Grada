class EditOrganizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.selectedCopy = null;
    this.shrank = false;
    this.originX;
    this.originY;
    this.w = 500;
    this.h = 500;
    this.editPanel = getElementById("edit-panel");

    this.setupEventListeners();
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

  placeSelected() {
    const layer = this.selectedCopy;
    const x = this.originX + (this.w - layer.w) / 2;
    const y = this.originY + 100;
    layer.setCoordinates(x, y);
    layer.updateNeuronsCoordinates();
  }

  setInfoText() {
    const layer = this.selectedCopy;
    const text = this.shrank ? layer.getShownNeuronsNum() : "all";
    getElementById("info-message").innerText = text;
  }

  setupEventListeners() {
    addEventToElement("cancel-icon", "click", this.disable.bind(this));
    addEventToElement(
      "toggle-shrink-btn",
      "click",
      this.toggleShrink.bind(this),
    );
    addEventToElement("save-btn", "click", this.update.bind(this));
    addEventToElement(
      "set-neuron-num",
      "focusout",
      this.handleNeuronFocusOut.bind(this),
    );
    addEventToElement(
      "set-neuron-num",
      "input",
      this.handleNeuronNumChange.bind(this),
    );
    addEventToElement(
      "set-shown-neuron",
      "input",
      this.handleSetShownNeuron.bind(this, "shown-neuron-inp"),
    );
    addEventToElement(
      "shown-neuron-inp",
      "focusout",
      this.handleShownNeuronFocusOut.bind(this),
    );
    addEventToElement(
      "shown-neuron-inp",
      "input",
      this.handleSetShownNeuron.bind(this, "set-shown-neuron"),
    );
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

  handleNeuronNumChange(e) {
    const layer = this.selectedCopy;
    const val = this.makeInputValid(e.target.value);
    const diff = val - layer.getNeuronNum();

    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? layer.pushNeuron() : layer.popNeuron();
    }
    this.setMaxShownNeuronInput();
  }

  handleSetShownNeuron(otherElId, e) {
    const layer = this.selectedCopy;
    const val = Math.min(
      this.makeInputValid(e.target.value),
      layer.getNeuronNum(),
    );

    setElementProperties(otherElId, { value: val });
    this.setShownNeuronsNum(val);
  }

  handleNeuronFocusOut(e) {
    const val = parseInt(e.target.value) || 1;
    setElementProperties("set-neuron-num", { value: val });
  }

  handleShownNeuronFocusOut(e) {
    let val = parseInt(e.target.value) || 1;
    val = Math.max(1, Math.min(val, this.selectedCopy.getNeuronNum()));
    setElementProperties("shown-neuron-inp", { value: val });
  }

  toggleShrink() {
    const btn = getElementById("toggle-shrink-btn");
    this.shrank = !this.shrank;
    btn.innerText = this.shrank ? "Shrank" : "Expanded";
    this.setInfoText();
  }

  makeInputValid(val) {
    return isNaN(val) || val == "" || val < 1 ? 1 : val;
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
    const original = this.selectedCopy.origin;
    const copy = this.selectedCopy;
    original.replace(copy, this.shrank);
  }

  disable() {
    this.enabled = false;
    this.selectedCopy.destroy();
    this.selectedCopy = null;
    this.shrank = false;
    this.editPanel.style.display = "none";
  }

  enable(layer) {
    const copy = new DrawLayer(layer, this.canvas, 0, 0);
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
