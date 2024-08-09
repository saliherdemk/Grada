class DatasetOrganizer {
  constructor() {
    this.lastDatasetId = -1;
    this.datasets = [];
  }

  createButtonForDataset(name, id) {
    const btn = createButton("dataset-scrollable");
    btn.innerText = name;
    btn.setAttribute("id", id);
    btn.classList.add("btn", "btn-gray");
  }

  addDataset(name, data) {
    const id = this.getDatasetId();
    this.datasets.push(new Dataset(id, name, data));
    this.createButtonForDataset(name, id);
  }

  getDatasetId() {
    return ++this.lastDatasetId;
  }

  getDatasetById(id) {
    return this.datasets.filter((d) => d.id == id);
  }
}
