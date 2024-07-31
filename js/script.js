document.addEventListener("contextmenu", (event) => event.preventDefault());

function executeDrawingCommands(arr, cnv = organizer.getCanvas()) {
  const parent = cnv instanceof p5.Graphics ? cnv : window;

  push();
  for (let i = 0; i < arr.length; i++) {
    let { func, args } = arr[i];
    if (typeof parent[func] === "function") {
      parent[func](...args);
    } else {
      console.error(`Function '${func}' does not exist on canvas`);
    }
  }
  pop();
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

function addLayer() {
  const { x, y } = iManager.getAbsoluteCoordinates(300, 500);
  organizer.addSchema(new Schema(x, y));
}

function logMLPs() {
  console.log(organizer.schemas);
}

function scaleCanvas(event) {
  if (editOrganizer.isEnabled()) return;

  let scaleAmount = 1.1;
  if (event.deltaY > 0) {
    scaleAmount = 0.9;
  }

  const newScaleFactor = iManager.scaleFactor * scaleAmount;

  const scaleDiff = newScaleFactor / iManager.scaleFactor;

  iManager.panX = mouseX - (mouseX - iManager.panX) * scaleDiff;
  iManager.panY = mouseY - (mouseY - iManager.panY) * scaleDiff;

  iManager.scaleFactor = newScaleFactor;
}
