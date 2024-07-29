function executeDrawingCommands(cnv, arr) {
  const parent = cnv instanceof p5.Graphics ? cnv : window;

  for (let i = 0; i < arr.length; i++) {
    let { func, args } = arr[i];
    if (typeof parent[func] === "function") {
      parent[func](...args);
    } else {
      console.error(`Function '${func}' does not exist on canvas`);
    }
  }
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
  organizer.addSchema(new Schema(300, 500));
}

function logMLPs() {
  console.log(organizer.schemas);
}

function scaleCanvas(event) {
  let scaleAmount = 1.1;
  if (event.deltaY > 0) {
    scaleAmount = 0.9;
  }
  iManager.scaleFactor *= scaleAmount;
}
