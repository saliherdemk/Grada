class EditMLPOrganizer extends EditOrganizer {
  constructor() {
    super();
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const events = [
      {
        id: "mlp-edit-container",
        event: "mousemove",
        handler: this.preventCanvasDragging,
      },
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
        id: "toggle-layers-locks",
        event: "click",
        handler: this.toggleLayersLocks,
      },
      {
        id: "mlp-delete-btn",
        event: "click",
        handler: this.handleDelete,
      },
    ];

    events.forEach(({ id, event, handler }) => {
      addEventToElement(id, event, handler.bind(this));
    });
  }

  preventCanvasDragging() {
    iManager.handleRelease();
  }

  updateLabel(e) {
    this.getSelected().setLabel(e.target.value);
  }

  updateLr(e) {
    this.getSelected().setLr(e.target.value);
  }

  updateBatchSize() {
    let selectedRadio = document.querySelector(
      'input[name="mlp-batch-size"]:checked',
    );
    this.getSelected().setBatchSize(selectedRadio.value);
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

  setLayersBtnText() {
    setElementProperties("toggle-layers-locks", {
      innerText: this.selected.areLayersLocked()
        ? "Unlock Layers"
        : "Lock Layers",
    });
  }

  handleResetCoordinates() {
    this.getSelected().resetCoordinates();
  }

  toggleLayersLocks() {
    this.selected.toggleLayersLocks();
    this.setLayersBtnText();
  }

  handleDelete() {
    this.selected.destroy();
  }

  setup() {
    const selected = this.getSelected();
    setElementProperties("mlp-label", { value: selected.label });
    setElementProperties("mlp-lr", { value: selected.lr });
    setElementProperties(`batch${selected.batchSize}`, { checked: true });
    this.setPropsBtnText();
    this.setLayersBtnText();
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
