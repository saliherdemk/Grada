class TableOrganizer {
  constructor() {
    this.dataset = {};
    this.initializeTable();
    this.updateRemoveButtons();
  }

  createDataset() {
    const { table, rowCount, colCount } = this.getTableProps();
    console.log(table.querySelectorAll("input"));
  }

  getTableProps() {
    const table = document.getElementById("dynamicTable");
    const rowCount = table.rows.length;
    const colCount = table.rows[0].cells.length;
    return { table, rowCount, colCount };
  }

  initializeTable() {
    const { table, rowCount } = this.getTableProps();
    const { addRowBtn, addColBtn } = this.createAddButtons();

    const firstRow = table.rows[0];

    firstRow.cells[0].appendChild(addRowBtn);
    firstRow.cells[1].appendChild(this.createInput("X1"));
    firstRow.cells[2].appendChild(this.createInput("Y"));

    table.rows[1].cells[1].appendChild(this.createInput("0"));
    table.rows[1].cells[2].appendChild(this.createInput("0"));

    table.rows[rowCount - 1].cells[1].appendChild(addColBtn);

    for (let i = 0; i < 3; i++) {
      this.addRow();
    }
    this.addColumn();

    this.setXorValues();
  }

  createAddButtons() {
    const addRowBtn = document.createElement("button");
    addRowBtn.innerText = "+";
    addRowBtn.classList.add("table-add-btn");
    addRowBtn.onclick = () => {
      this.addRow();
    };

    const addColBtn = document.createElement("button");
    addColBtn.innerText = "+";
    addColBtn.classList.add("table-add-btn");
    addColBtn.onclick = () => {
      this.addColumn();
    };

    return { addRowBtn, addColBtn };
  }

  setXorValues() {
    setElementProperties("dataset-name-inp", { value: "XOR" });
    const { table, rowCount } = this.getTableProps();

    table.rows[0].cells[2].querySelector("input").value = "X2";

    for (let i = 1; i < rowCount - 1; i++) {
      const cells = table.rows[i].cells;
      for (let j = 1; j < cells.length; j++) {
        const cellInput = cells[j].querySelector("input");

        if (
          i == 1 ||
          (j == 1 && i == 2) ||
          (j == 2 && i == 3) ||
          (j == 3 && i == 4)
        ) {
          cellInput.value = "0";
        } else {
          cellInput.value = "1";
        }
      }
    }
  }

  createInput(value = "") {
    let input = document.createElement("input");
    input.type = "text";
    input.value = value;
    return input;
  }

  addRow() {
    const { table, rowCount, colCount } = this.getTableProps();
    let newRow = table.insertRow(rowCount - 1);

    for (let i = 0; i < colCount; i++) {
      let newCell = newRow.insertCell(i);
      if (i > 0) {
        newCell.appendChild(this.createInput());
        i == 1 && newCell.classList.add("left-1");
        i == colCount - 1 && newCell.classList.add("right-0");
        continue;
      }
      newCell.classList.add("left-0");
    }

    this.updateRemoveButtons();
  }

  addColumn() {
    const { table, rowCount } = this.getTableProps();

    for (let i = 0; i < rowCount; i++) {
      let cellIndex = table.rows[i].cells.length - 1;
      let newCell = table.rows[i].insertCell(cellIndex);

      if (i == 0) {
        newCell.classList.add("top-0");
      }
      if (i < rowCount - 1) {
        newCell.appendChild(this.createInput());
        continue;
      }
      newCell.classList.add("bottom-0");
    }

    this.updateRemoveButtons();
  }

  clearRemoveButtons() {
    document
      .querySelectorAll(".remove-row-btn, .remove-col-btn")
      .forEach((btn) => btn.remove());
  }

  updateRemoveButtons() {
    const { table, rowCount, colCount } = this.getTableProps();

    this.clearRemoveButtons();

    for (let i = 2; i < rowCount - 1; i++) {
      const removeRowBtn = this.createRemoveRowBtn(i);
      table.rows[i].cells[0].appendChild(removeRowBtn);
    }

    for (let i = 2; i < colCount - 1; i++) {
      const cell = table.rows[rowCount - 1].cells[i];

      const removeColBtn = this.createRemoveColBtn(i);
      cell.appendChild(removeColBtn);
    }
  }

  createRemoveRowBtn(i) {
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

  createRemoveColBtn(i) {
    const removeColBtn = document.createElement("span");
    removeColBtn.className = "remove-col-btn";
    removeColBtn.innerText = "-";
    removeColBtn.onclick = function () {
      const { table, rowCount } = this.getTableProps();
      for (let j = 0; j < rowCount; j++) {
        table.rows[j].deleteCell(i);
      }
      updateRemoveButtons();
    };

    return removeColBtn;
  }
}
