class Playable extends Draggable {
  constructor() {
    super(0, 0);
    this.initialized = false;
    this.initButton = null;
    this.controlButtons = [];
    this.playInterval = null;
    this.playSpeed = 50;
    this.dataStatus = -1;

    this.createToggleMlpButton();
  }

  createToggleMlpButton() {
    const initButton = new TextButton("Initialize MLP", () => this.toggleMlp());
    initButton.setDimensions(100, 35).disable();
    this.initButton = initButton;
  }

  createControlButtons() {
    this.createButton("Fetch Next", "yellow", this.goOnce.bind(this));
    this.createButton("Play", "cyan", this.togglePlay.bind(this));
    this.updateButtonsCoordinates();
  }

  createButton(text, theme, action) {
    const button = new TextButton(text, action);
    button.setDimensions(75, 35).setTheme(theme);
    this.controlButtons.push(button);
  }

  updateToggleMlpButton(text, theme) {
    this.initButton.setText(text).setTheme(theme);
  }

  destroyControlButtons() {
    this.controlButtons.forEach((button) => button.destroy());
    this.controlButtons = [];
  }

  getInputLayer() {
    return this.layers[0];
  }

  getOutputLayer() {
    return this.layers[this.layers.length - 1];
  }

  getDataStatus() {
    return this.dataStatus;
  }

  isInitialized() {
    return this.initialized;
  }

  updateStatus(status) {
    this.status = status;
  }

  checkMlpCompleted() {
    const isComplete =
      this.getInputLayer() instanceof InputLayer &&
      this.getOutputLayer() instanceof OutputLayer;

    this.initButton[isComplete ? "enable" : "disable"]();
  }

  toggleMlp() {
    this.isInitialized() ? this.destroyMlp() : this.initializeMlp();
    this.toggleLockLayers();
  }

  initializeMlp() {
    const mlp = new MLP([], this.lr, this.batchSize);
    for (let i = 1; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const layerOrigin = new Layer(
        this.layers[i - 1].neurons.length,
        layer.neurons.length,
        layer.actFunc,
      );
      layer.setOrigin(layerOrigin);
      mlp.addLayer(layerOrigin);
    }
    mlp.setErrFunc(this.getOutputLayer().errFunc);
    this.setOrigin(mlp);
    this.initialized = true;
    this.updateToggleMlpButton("Terminate MLP", "red");
    this.createControlButtons();
    mainOrganizer.setActiveLine(null);
  }

  destroyMlp() {
    this.pause();
    this.origin.destroy();
    this.clearOrigin();
    this.initialized = false;
    this.updateToggleMlpButton("Initialize MLP", "blue");
    this.destroyControlButtons();
  }

  toggleLockLayers() {
    this.layers.forEach((layer) => {
      if (this.initialized === layer.isEditModeOpen()) {
        layer.toggleEditMode();
      }
    });
  }

  setPlaySpeed(ms) {
    this.playSpeed = ms;
    if (this.isInitialized()) {
      this.pause();
      this.play();
    }
  }

  play() {
    this.playInterval = setInterval(() => {
      this.fetchNext();
      this.executeOnce();
    }, this.playSpeed);

    this.controlButtons[1].setText("Pause");
    this.controlButtons[0].disable();
  }

  pause() {
    clearInterval(this.playInterval);
    this.playInterval = null;
    this.controlButtons[1].setText("Play");
    this.controlButtons[0].enable();
  }

  togglePlay() {
    this.playInterval ? this.pause() : this.play();
  }

  goOnce() {
    const btn = this.controlButtons[0];
    if (this.getDataStatus() > 0) {
      this.executeOnce();
      btn.setTheme("yellow");
      btn.setText("Fetch Next");
    } else {
      this.fetchNext();
      btn.setTheme("green");
      btn.setText("Execute");
    }
  }

  executeOnce() {
    const inputValues = this.getInputLayer().setValues();
    const outputValues = this.getOutputLayer().setValues();

    this.origin.goOneCycle(inputValues, outputValues);
    this.dataStatus = 0;
    this.controlButtons[1].enable();
  }

  fetchNext() {
    this.getInputLayer().fetchNext();
    this.getOutputLayer().fetchNext();
    this.dataStatus = 1;
    this.controlButtons[1].disable();
  }

  clearOrigin() {
    this.layers.forEach((layer) => layer.clearOrigin());
    this.origin = null;
  }
}
