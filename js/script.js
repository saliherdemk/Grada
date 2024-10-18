document.addEventListener("contextmenu", (event) => event.preventDefault());

function createHandWrittenInput() {
  mainOrganizer.addComponent(new DigitComponent(100, 100));
}

function createLayer() {
  return new HiddenLayer(300, 500);
}

function logMLPs() {
  console.log(mainOrganizer.mlpViews);
}

function openCreateDataset() {
  tableOrganizer.enable();
}

function closeCreateDataset() {
  tableOrganizer.disable();
}

function toggleDatasetsContainer() {
  getElementById("datasets-container").classList.toggle("active");
  getElementById("toggle-dataset-btn").classList.toggle("active");
}

function toggleWelcome() {
  getElementById("welcome-container").classList.toggle("hidden");
}

function closeEdit() {
  editLayerOrganizer.disable();
  closeCreateDataset();
}

function toggleDatasetMode() {
  tableOrganizer.toggleMode();
}

function disableCanvas() {
  mainOrganizer.setMainDisabled(true);
}

function enableCanvas() {
  mainOrganizer.setMainDisabled(false);
}

function triggerImportMlpInput() {
  getElementById("import-mlp-input").click();
}

async function importMLP(jsonData) {
  let prevLayer = null;

  for (const layerData of jsonData.layers) {
    const newLayer = new HiddenLayer(
      (jsonData.layers.indexOf(layerData) + 1) * 100,
      300,
    );
    newLayer.import(layerData);

    if (prevLayer) {
      await prevLayer.connectLayer(newLayer);
    }

    prevLayer = newLayer;
  }

  await prevLayer.parent.import(jsonData);
}

function readMLPFile(event) {
  const fileInput = event.target;
  const files = fileInput.files;
  if (!files.length) return;

  const file = files[0];
  if (!(file.type === "application/json")) return;

  setElementProperties("import-mlp-btn", { loading: true });
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      importMLP(jsonData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    } finally {
      setElementProperties("import-mlp-btn", { loading: false });
    }
  };
  reader.readAsText(file);
}

function scaleCanvas(event) {
  if (mainOrganizer.isDisabled()) return;

  let scaleAmount = 1.1;
  if (event.deltaY > 0) {
    scaleAmount = 0.9;
  }

  const newScaleFactor = iManager.scaleFactor * scaleAmount;

  const scaleDiff = newScaleFactor / iManager.scaleFactor;
  const { mouseX, mouseY } = getCurrentMouseCoordinates();

  iManager.panX = mouseX - (mouseX - iManager.panX) * scaleDiff;
  iManager.panY = mouseY - (mouseY - iManager.panY) * scaleDiff;

  iManager.scaleFactor = newScaleFactor;
}

const children = getElementById("disable-background").children;

for (let child of children) {
  child.addEventListener("click", (e) => e.stopPropagation());
}
