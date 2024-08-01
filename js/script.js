document.addEventListener("contextmenu", (event) => event.preventDefault());

function executeDrawingCommands(arr, cnv = organizer.getInstance()) {
  cnv.push();
  for (let i = 0; i < arr.length; i++) {
    let { func, args } = arr[i];
    if (typeof cnv[func] === "function") {
      cnv[func](...args);
    } else {
      console.error(`Function '${func}' does not exist on canvas`);
    }
  }
  cnv.pop();
}

function getCurrentMouseCoordinates(instance) {
  return { mouseX: instance.mouseX, mouseY: instance.mouseY };
}

function getMouseButton(instance) {
  return instance.mouseButton;
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

function scaleCanvas(event, p) {
  if (editOrganizer.isEnabled()) return;

  let scaleAmount = 1.1;
  if (event.deltaY > 0) {
    scaleAmount = 0.9;
  }

  const newScaleFactor = iManager.scaleFactor * scaleAmount;

  const scaleDiff = newScaleFactor / iManager.scaleFactor;
  const { mouseX, mouseY } = getCurrentMouseCoordinates(p);

  iManager.panX = mouseX - (mouseX - iManager.panX) * scaleDiff;
  iManager.panY = mouseY - (mouseY - iManager.panY) * scaleDiff;

  iManager.scaleFactor = newScaleFactor;
}
