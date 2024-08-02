class EditMLPOrganizer {
  constructor() {
    this.selected = null;
  }

  getSelected() {
    return this.selected;
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
    getElementById("mlp-edit-container").classList.add("active");
  }

  disable() {
    getElementById("mlp-edit-container").classList.remove("active");
  }
}
