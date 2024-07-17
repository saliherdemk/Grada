class Organizer {
  constructor() {
    this.dragActive = false;
  }

  setDragActive(dragActive) {
    this.dragActive = dragActive;
  }

  getDragActive() {
    return this.dragActive;
  }
}
