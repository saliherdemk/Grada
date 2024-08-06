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

function getFps() {
  return canvasManager.getInstance().frameRate();
}

function getFrameCount() {
  return canvasManager.getInstance().frameCount;
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
  mainOrganizer.addSchema(new Schema(x, y));
}

function createInput() {
  return canvasManager.getInstance().createInput();
}

function logMLPs() {
  console.log(mainOrganizer.schemas);
}

function openCreateDataset() {
  getElementById("disable-background").style.display = "flex";
  getElementById("create-dataset-container").style.display = "initial";
}

function closeCreateDataset() {
  getElementById("disable-background").style.display = "none";
  getElementById("create-dataset-container").style.display = "none";
}

function openEditLayer() {
  getElementById("disable-background").style.display = "flex";
  getElementById("canvas-parent").style.display = "initial";
}

function closeEditLayer() {
  getElementById("disable-background").style.display = "none";
  getElementById("canvas-parent").style.display = "none";
}

function scaleCanvas(event) {
  if (editLayerOrganizer.isEnabled()) return;

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

function addRow() {
  let table = getElementById("dynamicTable");
  let rowCount = table.rows.length;
  let colCount = table.rows[0].cells.length;
  let newRow = table.insertRow(rowCount - 1);

  for (let i = 0; i < colCount; i++) {
    let newCell = newRow.insertCell(i);
    let input = document.createElement("input");
    input.type = "text";
    if (i == 0) {
      newCell.classList.add("left-0", "z-3");
      continue;
    }

    if (i == 1) {
      newCell.classList.add("left-1", "z-2");
    }

    if (i == colCount - 1) {
      newCell.classList.add("right-0");
    }
    newCell.appendChild(input);
  }

  updateRemoveButtons();
}

function addColumn() {
  let table = document.getElementById("dynamicTable");
  let rowCount = table.rows.length;

  for (let i = 0; i < rowCount; i++) {
    let cellIndex = table.rows[i].cells.length - 1;

    let newCell = table.rows[i].insertCell(cellIndex);
    if (i == rowCount - 1) continue;
    let input = document.createElement("input");
    input.type = "text";
    if (i == 0) {
      newCell.classList.add("top-0", "z-1");
    }
    newCell.appendChild(input);
  }

  updateRemoveButtons();
}

function updateRemoveButtons() {
  let table = getElementById("dynamicTable");
  let rowCount = table.rows.length;
  let colCount = table.rows[0].cells.length;

  document
    .querySelectorAll(".remove-row-btn, .remove-col-btn")
    .forEach((btn) => btn.remove());

  for (let i = 2; i < rowCount - 1; i++) {
    let removeRowBtn = document.createElement("span");
    removeRowBtn.className = "remove-row-btn";
    removeRowBtn.innerText = "-";
    removeRowBtn.onclick = function () {
      table.deleteRow(i);
      updateRemoveButtons();
    };

    table.rows[i].cells[0].appendChild(removeRowBtn);
  }

  for (let i = 2; i < colCount - 1; i++) {
    let removeColBtn = document.createElement("span");
    removeColBtn.className = "remove-col-btn ";
    removeColBtn.innerText = "-";
    removeColBtn.onclick = function () {
      for (let j = 0; j < rowCount; j++) {
        table.rows[j].deleteCell(i);
      }
      updateRemoveButtons();
    };
    const cell = table.rows[rowCount - 1].cells[i];
    cell.classList.add("bottom-0");
    cell.appendChild(removeColBtn);
  }
}
