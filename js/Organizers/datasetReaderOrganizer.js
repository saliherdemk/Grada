class DatasetReaderOrganizer {
  constructor() {
    this.initialize();
  }

  initialize() {
    addEventToElement("import-dataset-container", "input", async (event) => {
      const fileInput = event.target;
      const files = fileInput.files;
      if (!files.length) return;

      const file = files[0];
      if (!(file.type === "application/json")) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const jsonData = JSON.parse(e.target.result);
          datasetOrganizer.addDataset(new Dataset(file.name, jsonData, true));
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    });
  }

  formatDataset(data) {
    console.log(data);
  }
}
