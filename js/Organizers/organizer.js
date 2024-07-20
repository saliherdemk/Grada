class Organizer {
  constructor() {
    this.dragActive = false;
    this.lastUsedId = 0;
  }

  getNextId() {
    return ++this.lastUsedId;
  }

  setDragActive(dragActive) {
    this.dragActive = dragActive;
  }

  getDragActive() {
    return this.dragActive;
  }
}
