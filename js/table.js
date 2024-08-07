document.addEventListener("DOMContentLoaded", () => {
  initializeTable();
  updateRemoveButtons();
});

function getTableProps() {
  const table = document.getElementById("dynamicTable");
  const rowCount = table.rows.length;
  const colCount = table.rows[0].cells.length;
  return { table, rowCount, colCount };
}

function initializeTable() {
  const { table } = getTableProps();

  table.rows[0].cells[1].appendChild(createInput("X1"));
  table.rows[0].cells[2].appendChild(createInput("Y"));

  table.rows[1].cells[1].appendChild(createInput("Cell 1-1"));
  table.rows[1].cells[2].appendChild(createInput("Cell 1-2"));

  addRow();
  addRow();
  addRow();
  addColumn();
}

function createInput(value = "") {
  let input = document.createElement("input");
  input.type = "text";
  input.value = value;
  return input;
}

function addRow() {
  const { table, rowCount, colCount } = getTableProps();
  let newRow = table.insertRow(rowCount - 1);

  for (let i = 0; i < colCount; i++) {
    let newCell = newRow.insertCell(i);
    if (i > 0) {
      newCell.appendChild(createInput());
      i == 1 && newCell.classList.add("left-1");
      i == colCount - 1 && newCell.classList.add("right-0");
      continue;
    }
    newCell.classList.add("left-0");
  }

  updateRemoveButtons();
}

function addColumn() {
  const { table, rowCount } = getTableProps();

  for (let i = 0; i < rowCount; i++) {
    let cellIndex = table.rows[i].cells.length - 1;
    let newCell = table.rows[i].insertCell(cellIndex);

    if (i == 0) {
      newCell.classList.add("top-0");
    }
    if (i < rowCount - 1) {
      newCell.appendChild(createInput());
      continue;
    }
    newCell.classList.add("bottom-0");
  }

  updateRemoveButtons();
}

function clearRemoveButtons() {
  document
    .querySelectorAll(".remove-row-btn, .remove-col-btn")
    .forEach((btn) => btn.remove());
}

function updateRemoveButtons() {
  const { table, rowCount, colCount } = getTableProps();

  clearRemoveButtons();

  for (let i = 2; i < rowCount - 1; i++) {
    const removeRowBtn = createRemoveRowBtn(i);
    table.rows[i].cells[0].appendChild(removeRowBtn);
  }

  for (let i = 2; i < colCount - 1; i++) {
    const cell = table.rows[rowCount - 1].cells[i];

    const removeColBtn = createRemoveColBtn(i);
    cell.appendChild(removeColBtn);
  }
}

function createRemoveRowBtn(i) {
  const removeRowBtn = document.createElement("span");
  removeRowBtn.className = "remove-row-btn";
  removeRowBtn.innerText = "-";
  removeRowBtn.onclick = function () {
    const { table } = getTableProps();
    table.deleteRow(i);
    updateRemoveButtons();
  };
  return removeRowBtn;
}

function createRemoveColBtn(i) {
  const removeColBtn = document.createElement("span");
  removeColBtn.className = "remove-col-btn";
  removeColBtn.innerText = "-";
  removeColBtn.onclick = function () {
    const { table, rowCount } = getTableProps();
    for (let j = 0; j < rowCount; j++) {
      table.rows[j].deleteCell(i);
    }
    updateRemoveButtons();
  };

  return removeColBtn;
}
