document.addEventListener("contextmenu", (event) => event.preventDefault());

function executeDrawingCommands(arr) {
  const instance = canvasManager.getInstance();
  instance.push();
  for (let i = 0; i < arr.length; i++) {
    let { func, args } = arr[i];
    if (typeof instance[func] === "function") {
      instance[func](...args);
    } else {
      console.error(`Function '${func}' does not exist on canvas`);
    }
  }
  instance.pop();
}

function getCurrentMouseCoordinates() {
  const instance = canvasManager.getInstance();
  return { mouseX: instance.mouseX, mouseY: instance.mouseY };
}

function getMouseButton() {
  return canvasManager.getInstance().mouseButton;
}

function getElementById(el) {
  return document.getElementById(el);
}

function setElementProperties(elId, properties) {
  const el = getElementById(elId);
  for (let prop in properties) {
    el[prop] = properties[prop];
  }
}

function addEventToElement(elId, eventName, func) {
  getElementById(elId).addEventListener(eventName, func);
}

function removeEvents(elId) {
  getElementById(elId).removeEventListeners();
}

function createLayer() {
  new HiddenLayer(300, 500);
  // new DigitInputGrid(100, 100);
}

function createInput() {
  return canvasManager.getInstance().createInput();
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

function handleCreateDataset() {
  tableOrganizer.createDataset();
}

function createButton(parentId = null) {
  const btn = document.createElement("button");
  const parent = getElementById(parentId);
  if (parent) {
    parent.appendChild(btn);
  }
  return btn;
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

function addClass(el, classList) {
  el.classList.add(classList);
}

function removeClass(el, classList) {
  el.classList.remove(classList);
}
