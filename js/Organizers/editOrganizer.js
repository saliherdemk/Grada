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

    this.resize();
    this.initialize();
    this.setupEventListeners();
  }

  initialize() {
    this.originX = (width - 500) / 2;
    this.originY = 150;
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
      this.handleNeuronChangeFocusOut.bind(this),
    );
    addEventToElement(
      "set-neuron-num",
      "input",
      this.handleNeuronNumChange.bind(this),
    );
    addEventToElement(
      "set-shown-neuron",
      "input",
      this.handleSetShownNeuron.bind(this),
    );
  }

  getCanvas() {
    return this.canvas;
  }

  setLayout() {
    this.editPanel.style.left = this.originX + "px";
    this.editPanel.style.top = this.originY + "px";
  }

  setMaxShownNeuronInput() {
    const layer = this.selectedCopy;
    const neuronNum = layer.getNeuronNum();
    const newShownNeuronNum = Math.min(layer.getShownNeuronsNum(), neuronNum);
    setElementProperties("set-shown-neuron", {
      value: newShownNeuronNum,
      max: neuronNum,
    });
    layer.setShownNeuronsNum(newShownNeuronNum);
  }

  handleNeuronNumChange(e) {
    const layer = this.selectedCopy;
    const inputVal = e.target.value;
    const val = inputVal == "" || inputVal < 1 ? 1 : inputVal;
    const diff = val - layer.getNeuronNum();

    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? layer.pushNeuron() : layer.popNeuron();
    }
    this.setMaxShownNeuronInput();
  }

  handleNeuronChangeFocusOut(e) {
    const val = e.target.value;
    if (val == "" || val < 1) {
      setElementProperties("set-neuron-num", { value: 1 });
    }
  }

  toggleShrink() {
    const btn = getElementById("toggle-shrink-btn");
    this.shrank = !this.shrank;
    btn.innerText = this.shrank ? "Shrank" : "Expanded";
  }

  handleSetShownNeuron(e) {
    const layer = this.selectedCopy;
    layer.setShownNeuronsNum(e.target.value);
  }

  setup() {
    this.setLayout();
    this.toggleShrink();
    setElementProperties("set-neuron-num", {
      value: this.selectedCopy.getNeuronNum(),
    });
    this.setMaxShownNeuronInput();
  }

  update() {
    var original = this.selectedCopy.origin;
    var copy = this.selectedCopy;
    original.replace(copy, this.shrank);
  }

  getSelected() {
    return this.selectedCopy;
  }

  setSelected(layer) {
    let x = this.originX + (this.w - layer.w) / 2;
    let y = this.originY + 100;
    const copy = new DrawLayer(layer, this.canvas, x, 0);
    copy.y = y;
    this.shrank = !layer.shrank;
    copy.setShownNeuronsNum(layer.getShownNeuronsNum());
    copy.updateNeuronsCoordinates();
    this.selectedCopy = copy;
    this.enable();
  }

  disable() {
    this.enabled = false;
    this.shrank = false;
    this.selectedCopy.destroy();
    this.selectedCopy = null;
    this.editPanel.style.display = "none";
  }

  enable() {
    this.enabled = true;
    this.editPanel.style.display = "flex";
    this.setup();
  }

  isEnabled() {
    return this.enabled;
  }

  resize() {
    this.getCanvas().resizeCanvas(windowWidth, windowHeight);
    this.originX = (width - 500) / 2;
    this.originY = 150;
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
