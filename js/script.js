document.addEventListener("contextmenu", (event) => event.preventDefault());

function createHandWritten() {
  mainOrganizer.addComponent(new DigitInput(400, 100));
  mainOrganizer.addComponent(new DigitOutput(800, 100));
}

function createFlatter() {
  mainOrganizer.addComponent(new Flatter(400, 100));
}

function createLayer() {
  return new HiddenLayer(300, 500);
}

async function importHandwrittenModel() {
  try {
    const module = await import(`../Models/HandwrittenMlp.js`);
    importMLP(module.default);
  } catch (error) {
    console.error("Error loading yData:", error);
  }
}

function openCreateDataset() {
  tableOrganizer.enable();
}

function closeCreateDataset() {
  tableOrganizer.disable();
}

function toggleDrawer() {
  getElementById("drawer").classList.toggle("active");
  getElementById("toggle-drawer").classList.toggle("active");
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

let currentPage = 0;
const totalPages = 4;

function updatePageVisibility() {
  const pages = document.querySelectorAll("[id^='page-']");
  pages.forEach((page, index) => {
    if (index === currentPage) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  });
  const pageControls = getElementById("page-controls");
  pageControls.lastElementChild.style.visibility =
    currentPage == totalPages ? "hidden" : "visible";
  pageControls.firstElementChild.style.visibility =
    currentPage == 0 ? "hidden" : "visible";
}

function incrementPage(e) {
  e.stopPropagation();
  currentPage = Math.min(currentPage + 1, totalPages);
  updatePageVisibility();
}

function decrementPage(e) {
  e.stopPropagation();
  currentPage = Math.max(currentPage - 1, 0);
  updatePageVisibility();
}

document.addEventListener("DOMContentLoaded", function () {
  const disableBg = getElementById("disable-background");
  for (let child of disableBg.children) {
    child.addEventListener("click", (e) => e.stopPropagation());
  }
  disableBg.addEventListener("click", () => closeEdit());
  disableBg.addEventListener("mouseover", () => disableCanvas());
  disableBg.addEventListener("mouseout", () => enableCanvas());

  const mlpEditContainer = getElementById("mlp-edit-container");
  mlpEditContainer.addEventListener("mouseover", () => disableCanvas());
  mlpEditContainer.addEventListener("mouseout", () => enableCanvas());
});

window.addEventListener("load", () => {
  const loader = getElementById("loading-overlay");
  loader.style.opacity = 0;

  setTimeout(() => {
    loader.style.display = "none";
  }, 300);
  updatePageVisibility();
});
