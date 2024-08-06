class EventManager {
  constructor(context) {
    this.context = context;
    this.initEventListeners();
  }

  initEventListeners() {
    const events = [
      { id: "edit-layer-close", event: "click", handler: this.disable },
      {
        id: "toggle-shrink-btn",
        event: "click",
        handler: this.toggleShrink,
      },
      { id: "save-btn", event: "click", handler: this.update },
      {
        id: "set-neuron-num",
        event: "focusout",
        handler: this.onNeuronFocusOut,
      },
      {
        id: "set-neuron-num",
        event: "input",
        handler: this.onNeuronNumChange,
      },
      {
        id: "set-shown-neuron",
        event: "input",
        handler: this.onSetShownNeuron.bind(this, "shown-neuron-inp"),
      },
      {
        id: "shown-neuron-inp",
        event: "focusout",
        handler: this.onShownNeuronFocusOut,
      },
      {
        id: "shown-neuron-inp",
        event: "input",
        handler: this.onSetShownNeuron.bind(this, "set-shown-neuron"),
      },
      {
        id: "label-input",
        event: "input",
        handler: this.onLabelInput.bind(this),
      },
    ];

    events.forEach(({ id, event, handler }) => {
      addEventToElement(id, event, handler.bind(this));
    });
  }

  onNeuronFocusOut(e) {
    const val = parseInt(e.target.value) || 1;
    setElementProperties("set-neuron-num", { value: val });
  }

  onNeuronNumChange(e) {
    const layer = this.context.selectedCopy;
    const val = this.makeInputValid(e.target.value);
    const diff = val - layer.getNeuronNum();

    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? layer.pushNeuron() : layer.popNeuron();
    }

    this.setMaxShownNeuronInput();
  }

  onSetShownNeuron(otherElId, e) {
    const layer = this.context.selectedCopy;
    const val = Math.min(
      this.makeInputValid(e.target.value),
      layer.getNeuronNum(),
    );

    setElementProperties(otherElId, { value: val });
    this.setShownNeuronsNum(val);
  }

  setShownNeuronsNum(shownNeuronNum) {
    this.context.selectedCopy.setShownNeuronsNum(shownNeuronNum);
    this.context.setInfoText();
  }

  setMaxShownNeuronInput() {
    const layer = this.context.selectedCopy;
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
    val = Math.max(1, Math.min(val, this.context.selectedCopy.getNeuronNum()));
    setElementProperties("shown-neuron-inp", { value: val });
  }

  onLabelInput(e) {
    this.context.selectedCopy.setLabel(e.target.value);
  }

  makeInputValid(val) {
    return isNaN(val) || val === "" || val < 1 ? 1 : val;
  }

  toggleShrink() {
    this.context.toggleShrink();
  }

  update() {
    this.context.update();
  }

  disable() {
    this.context.disable();
  }
}
