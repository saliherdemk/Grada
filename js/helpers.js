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
  const { mouseX, mouseY, pmouseX, pmouseY } = canvasManager.getInstance();
  return { mouseX, mouseY, pmouseX, pmouseY };
}

function getElementById(el) {
  return document.getElementById(el);
}

function setElementProperties(elId, properties) {
  const el = getElementById(elId);
  for (let prop in properties) {
    el.setAttribute(prop, properties[prop]);
    el[prop] = properties[prop];
  }
}

function addEventToElement(elId, eventName, func) {
  getElementById(elId).addEventListener(eventName, func);
}

function createButton(parentId = null) {
  const btn = document.createElement("button");
  const parent = getElementById(parentId);
  if (parent) {
    parent.appendChild(btn);
  }
  return btn;
}

function addClass(el, classList) {
  el.classList.add(classList);
}

function removeClass(el, classList) {
  el.classList.remove(classList);
}

function reverseArray(array) {
  return array.slice().reverse();
}

function getShape(arr) {
  const shape = [];
  let currentArray = arr;

  while (Array.isArray(currentArray)) {
    shape.push(currentArray.length);
    currentArray = currentArray[0];
  }
  shape.push(1);

  return shape;
}

function convertSetsToArrays(obj) {
  if (obj instanceof Set) {
    return Array.from(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(convertSetsToArrays);
  }

  if (typeof obj === "object" && obj !== null) {
    if (obj.children && typeof obj.children === "object") {
      obj.children = convertSetsToArrays(obj.children);
    }

    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = convertSetsToArrays(obj[key]);
      return acc;
    }, {});
  }

  return obj;
}

function downloadJSON(obj, filename) {
  try {
    const jsonStr = JSON.stringify(obj, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = `${filename}.json`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    alert(e);
  }
}
