class InteractionManager {
  constructor() {
    this.offsetX;
    this.offsetY;
    this.scaleFactor = 1;
    this.panX = 0;
    this.panY = 0;
    this.selected = null;
    this.canvasDragging = false;
    this.lastMouseX;
    this.lastMouseY;
  }

  getSelected() {
    return this.selected;
  }

  isCanvasDragging() {
    return this.canvasDragging;
  }

  isBusy() {
    return !(this.selected == null);
  }

  setOffsets() {
    const selected = this.getSelected();
    const { mouseX, mouseY } = getCurrentMouseCoordinates();
    this.offsetX = mouseX - (selected.x * this.scaleFactor + this.panX);
    this.offsetY = mouseY - (selected.y * this.scaleFactor + this.panY);
  }

  setSelected(obj) {
    this.selected = obj;
  }

  enableCanvasDragging() {
    this.canvasDragging = true;
  }

  disableCanvasDragging() {
    this.canvasDragging = false;
  }

  setLastMouseCoordinates() {
    const { mouseX, mouseY } = getCurrentMouseCoordinates();
    this.lastMouseX = mouseX;
    this.lastMouseY = mouseY;
  }

  updatePanCoordinates() {
    const { mouseX, mouseY } = getCurrentMouseCoordinates();
    this.panX += mouseX - this.lastMouseX;
    this.panY += mouseY - this.lastMouseY;
    this.setLastMouseCoordinates();
  }

  updateSelectedCoordinates() {
    const { mouseX, mouseY } = getCurrentMouseCoordinates();
    const x = (mouseX - this.offsetX - this.panX) / this.scaleFactor;
    const y = (mouseY - this.offsetY - this.panY) / this.scaleFactor;
    this.selected.handleDrag(x, y);
  }

  getAbsoluteCoordinates(x, y) {
    return {
      x: (x - this.panX) / this.scaleFactor,
      y: (y - this.panY) / this.scaleFactor,
    };
  }

  handlePress() {
    if (mainOrganizer.isDisabled()) return;

    reverseArray(mainOrganizer.getAll()).forEach((el) => {
      el.handlePressed();
    });

    this.enableCanvasDragging();
    this.setLastMouseCoordinates();
  }

  handleDrag() {
    if (mainOrganizer.isDisabled()) return;
    const selected = this.getSelected();
    if (selected) {
      selected instanceof Draggable && this.updateSelectedCoordinates();
      return;
    }

    this.isCanvasDragging() && this.updatePanCoordinates();
  }

  handleRelease() {
    this.selected = null;
    this.disableCanvasDragging();
  }

  handleDoubleClicked() {
    if (mainOrganizer.isDisabled()) return;
    reverseArray(mainOrganizer.getAll()).forEach((el) =>
      el.handleDoubleClicked(),
    );
  }

  handleKeyPressed(k) {
    mainOrganizer.mlpViews.forEach((mlpView) => mlpView.handleKeyPressed(k));
    mainOrganizer.components.forEach((c) => c.handleKeyPressed(k));

    if (k == "escape") {
      editMLPOrganizer.disable();
      editLayerOrganizer.disable();
      tableOrganizer.disable();
      mainOrganizer.enable();
    }
  }

  isHovered(obj) {
    const { mouseX, mouseY } = getCurrentMouseCoordinates();
    const { x: px, y: py } = this.getAbsoluteCoordinates(mouseX, mouseY);
    if (obj.r) {
      const d = Math.sqrt((px - obj.x) ** 2 + (py - obj.y) ** 2);
      return d < obj.r / 2;
    }
    return px > obj.x && px < obj.x + obj.w && py > obj.y && py < obj.y + obj.h;
  }

  checkRollout(object) {
    if (!this.isBusy() && this.isHovered(object)) {
      this.setSelected(object);
      this.setOffsets();
      return true;
    }
    return false;
  }

  applyTransforms() {
    // executeDrawingCommands pop's the changes but we need apply to canvas before poping out
    const p = canvasManager.getInstance();
    p.translate(this.panX, this.panY);
    p.scale(this.scaleFactor);
  }
}
