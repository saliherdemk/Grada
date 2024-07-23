class EditOrganizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.selected = null;
    this.selectedCopy = null;
    this.originX;
    this.originY;
    this.w = 500;
    this.h = 500;
    this.editPanel = getElementById("edit-panel");
    this.resize();
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
    setElementProperties("set-shown-neuron", {
      value: neuronNum,
      max: neuronNum,
    });
  }

  handleNeuronNumChange(layer, e) {
    layer.expand();
    const inputVal = e.target.value;
    const val = inputVal == "" || inputVal < 1 ? 1 : inputVal;
    const diff = val - layer.getNeuronNum();

    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? layer.pushNeuron() : layer.popNeuron();
    }

    layer.updateNeuronsCoordinates();
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
    const shrinked = this.selectedCopy.isShrinked();
    if (shrinked) {
      this.selectedCopy.expand();
      btn.innerText = "Shrink";
    } else {
      this.selectedCopy.shrink();
      btn.innerText = "Expand";
    }
  }

  setup() {
    this.setLayout();
    const layer = this.selectedCopy;

    addEventToElement("cancel-icon", "click", this.disable.bind(this));

    setElementProperties("set-neuron-num", { value: layer.getNeuronNum() });

    addEventToElement(
      "set-neuron-num",
      "input",
      this.handleNeuronNumChange.bind(this, layer),
    );

    addEventToElement(
      "set-neuron-num",
      "focusout",
      this.handleNeuronChangeFocusOut.bind(this),
    );

    this.setMaxShownNeuronInput();

    addEventToElement("set-shown-neuron", "input", layer.shrink.bind(layer));

    addEventToElement(
      "toggle-shrink-btn",
      "click",
      this.toggleShrink.bind(this),
    );

    addEventToElement("save-btn", "click", this.update.bind(this));
  }

  update() {
    var original = this.getSelected();
    var copy = this.selectedCopy;

    original.replace(copy);
  }

  getSelected() {
    return this.selected;
  }

  setSelected(layer) {
    let x = this.originX + (this.w - layer.w) / 2;
    let y = this.originY + 100;

    this.selected = layer;
    this.selectedCopy = new DrawLayer(layer, this.canvas, x, 0);
    this.selectedCopy.y = y;
    this.selectedCopy.updateNeuronsCoordinates();
  }

  disable() {
    this.enabled = false;
    this.selected = null;
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
