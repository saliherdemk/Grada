class EditMLPOrganizer extends EditOrganizer {
  constructor() {
    super();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const events = [
      { id: "mlp-layer-close", event: "click", handler: this.disable },
      {
        id: "mlp-label",
        event: "input",
        handler: this.updateLabel,
      },
      {
        id: "mlp-lr",
        event: "input",
        handler: this.updateLr,
      },
      {
        id: "mlp-batch-size",
        event: "input",
        handler: this.updateBatchSize,
      },
      {
        id: "mlp-play-speed",
        event: "input",
        handler: this.updatePlaySpeed,
      },
      {
        id: "err-function-select",
        event: "change",
        handler: this.handleErrFuncChange,
      },
      {
        id: "toggle-mlp-props",
        event: "click",
        handler: this.togglePropVisibility,
      },
      {
        id: "mlp-reset-btn",
        event: "click",
        handler: this.handleResetCoordinates,
      },
      {
        id: "mlp-export-btn",
        event: "click",
        handler: this.handleExport,
      },
      {
        id: "mlp-delete-btn",
        event: "click",
        handler: this.handleDelete,
      },
      {
        id: "mlp-mode",
        event: "change",
        handler: this.handleModeChange,
      },
    ];

    events.forEach(({ id, event, handler }) => {
      addEventToElement(id, event, handler.bind(this));
    });
  }

  updateLabel(e) {
    this.getSelected().setLabel(e.target.value);
  }

  updateLr(e) {
    this.getSelected().setLr(e.target.value);
  }

  updateBatchSize(e) {
    this.getSelected().setBatchSize(e.target.value);
  }

  updatePlaySpeed(e) {
    this.getSelected().setPlaySpeed(e.target.value);
  }

  handleErrFuncChange(e) {
    this.getSelected().setErrFunc(e.target.value);
  }

  handleModeChange() {
    let selectedRadio = document.querySelector(
      'input[name="mlp-mode"]:checked',
    );
    this.getSelected().handleSetMode(selectedRadio.value);
  }

  togglePropVisibility() {
    this.selected.togglePropsShown();
    this.setPropsBtnText();
  }

  setPropsBtnText() {
    setElementProperties("toggle-mlp-props", {
      innerText: this.selected.isPropsShown() ? "Hide Props" : "Show Props",
    });
  }

  handleResetCoordinates() {
    this.getSelected().resetCoordinates();
  }

  handleExport() {
    this.getSelected().export();
  }

  handleDelete() {
    this.selected.destroy();
  }

  setup() {
    const selected = this.getSelected();
    setElementProperties("mlp-label", { value: selected.label });
    setElementProperties("mlp-lr", { value: selected.lr });
    setElementProperties(`mlp-batch-size`, { value: selected.batchSize });
    setElementProperties(`mlp-play-speed`, { value: selected.playSpeed });
    setElementProperties("err-function-select", { value: selected.errFunc });
    setElementProperties(`mode-${selected.mode}`, { checked: true });
    this.setPropsBtnText();
  }

  setSelected(mlp) {
    this.selected?.deSelect();
    if (this.selected == mlp) {
      this.selected = null;
      this.disable();
      return;
    }
    this.selected = mlp;
    this.selected.select();
    this.enable();
  }

  enable() {
    this.setup();
    this.enabled = true;
    getElementById("mlp-edit-container").classList.add("active");
  }

  disable() {
    this.selected?.deSelect();
    this.selected = null;
    getElementById("mlp-edit-container").classList.remove("active");
    this.enabled = false;
  }
}
