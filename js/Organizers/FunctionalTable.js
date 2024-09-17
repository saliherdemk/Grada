class FunctionalTable {
  constructor() {}

  initializeTable() {
    this.createTable();
    const { table, rowCount } = this.getTableProps();
    const { addRowBtn, addColBtn } = this.createAddButtons();

    table.rows[1].cells[0].appendChild(addRowBtn);
    table.rows[rowCount - 1].cells[1].appendChild(addColBtn);

    this.setXorValues();
  }

  createTable() {
    const container = getElementById("scrollable-container");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.id = "dynamicTable";

    const tableData = [
      [
        '<label for="dataset-name-inp">Name:</label>',
        '<input id="dataset-name-inp"  type="text" name="datasetName" value="" />',
      ],
      ["", '<input type="text" name="" value="" />'],
      ["", ""],
    ];

    tableData.forEach((rowData) => {
      const row = document.createElement("tr");
      rowData.forEach((cellDataContent) => {
        const cell = document.createElement("td");
        cell.innerHTML = cellDataContent;
        row.appendChild(cell);
      });
      table.appendChild(row);
    });

    container.appendChild(table);
  }

  getTableProps() {
    const table = getElementById("dynamicTable");
    const rowCount = table.rows.length;
    const colCount = table.rows[0].cells.length;
    return { table, rowCount, colCount };
  }

  createAddButtons() {
    const addRowBtn = createButton();
    addRowBtn.innerText = "+";
    addRowBtn.classList.add("table-add-btn");
    addRowBtn.onclick = () => {
      this.addRow();
    };

    const addColBtn = createButton();
    addColBtn.innerText = "+";
    addColBtn.classList.add("table-add-btn");
    addColBtn.onclick = () => {
      this.addColumn();
    };

    return { addRowBtn, addColBtn };
  }

  addRow() {
    const { table, rowCount, colCount } = this.getTableProps();
    let newRow = table.insertRow(rowCount - 1);
    for (let i = 0; i < colCount; i++) {
      let newCell = newRow.insertCell(i);
      i !== 0 && newCell.appendChild(this.createInput());
    }

    this.updateButtons();
  }

  addColumn() {
    const { table, rowCount } = this.getTableProps();

    for (let i = 0; i < rowCount; i++) {
      let cellIndex = table.rows[i].cells.length - 1;
      let newCell = table.rows[i].insertCell(Math.max(2, cellIndex));
      if (i == 0) continue;
      if (i == rowCount - 1) continue;
      newCell.appendChild(this.createInput());
    }

    this.updateButtons();
  }

  createInput(value = "0") {
    let input = document.createElement("input");
    input.type = "text";
    input.value = value;
    return input;
  }

  updateButtons() {
    const { table, rowCount, colCount } = this.getTableProps();

    this.clearControlButtons();

    for (let i = 2; i < rowCount - 1; i++) {
      const removeRowBtn = this.createRemoveRowBtn(i);
      table.rows[i].cells[0].appendChild(removeRowBtn);
    }

    for (let i = 2; i < colCount; i++) {
      const lastRowCell = table.rows[rowCount - 1].cells[i];
      const firstRowCell = table.rows[0].cells[i];

      const removeColBtn = this.createRemoveColBtn(i);
      const selectLabelBtn = this.createSelectAsLabelBtn(i);

      firstRowCell.appendChild(selectLabelBtn);
      lastRowCell.appendChild(removeColBtn);
    }

    this.setPosition();
  }

  createRemoveRowBtn(i) {
    const removeRowBtn = this.createBtn("control-btn", "-");
    removeRowBtn.onclick = () => {
      const { table } = this.getTableProps();
      table.deleteRow(i);
    };
    return removeRowBtn;
  }

  createRemoveColBtn(i) {
    const removeColBtn = this.createBtn("control-btn", "-");
    removeColBtn.onclick = () => {
      const { table, rowCount } = this.getTableProps();
      for (let j = 0; j < rowCount; j++) {
        table.rows[j].deleteCell(i);
      }
    };

    return removeColBtn;
  }

  createBtn(className, innerText) {
    const btn = document.createElement("span");
    btn.className = className;
    btn.innerText = innerText;
    return btn;
  }

  createSelectAsLabelBtn(i) {
    const selectAsLabelBtn = this.createBtn("control-btn", "");
    const icon = document.createElement("img");
    icon.width = 32;
    selectAsLabelBtn.appendChild(icon);

    selectAsLabelBtn.onclick = () => {
      const { table } = this.getTableProps();
      const cell = table.rows[0].cells[i];

      const isSelected = cell.getAttribute("selected") === "true";
      cell.setAttribute("selected", isSelected ? "false" : "true");

      this.setLabelsIcon();
    };
    return selectAsLabelBtn;
  }

  setPosition() {
    const { table, rowCount } = this.getTableProps();
    for (let i = 0; i < rowCount; i++) {
      const row = table.rows[i];
      const firstOrSecondRow = i == 0 || i == 1;
      row.cells.forEach((cell, j) => {
        const firstOrSecondCell = j == 0 || j == 1;
        if (firstOrSecondRow) {
          addClass(cell, `top-${i}`);
          addClass(cell, firstOrSecondCell ? "z-3" : "z-2");
        }
        if (i == rowCount - 1) {
          addClass(cell, "bottom-0");
        }

        if (firstOrSecondCell) {
          addClass(cell, `left-${j}`);
          addClass(cell, "z-2");
        }

        if (j == row.cells.length - 1) {
          addClass(cell, "right-0");
        }
        this.setLabelsIcon();
      });
    }
  }

  setLabelsIcon() {
    const { table } = this.getTableProps();
    const cells = table.rows[0].cells;
    for (let i = 2; i < cells.length; i++) {
      const cell = cells[i];
      cell.querySelector("img").src =
        cell.getAttribute("selected") === "true"
          ? (cell.querySelector("img").src = "media/label-selected.png")
          : (cell.querySelector("img").src = "media/label.png");
    }
  }

  clearControlButtons() {
    document.querySelectorAll(".control-btn").forEach((btn) => btn.remove());
  }

  setXorValues() {
    Array.from({ length: 4 }).forEach(() => this.addRow());
    Array.from({ length: 2 }).forEach(() => this.addColumn());

    setElementProperties("dataset-name-inp", { value: "XOR" });

    const { table, rowCount } = this.getTableProps();
    table.rows[1].cells[1].querySelector("input").value = "X1";
    table.rows[1].cells[2].querySelector("input").value = "X2";
    table.rows[1].cells[3].querySelector("input").value = "Y";
    table.rows[0].cells[3].setAttribute("selected", "true");

    this.setLabelsIcon();
    for (let i = 2; i < rowCount - 1; i++) {
      const cells = table.rows[i].cells;
      for (let j = 1; j < cells.length; j++) {
        const cellInput = cells[j].querySelector("input");
        if (
          i == 2 ||
          (j == 1 && i == 3) ||
          (j == 2 && i == 4) ||
          (j == 3 && i == 5)
        ) {
          cellInput.value = "0";
        } else {
          cellInput.value = "1";
        }
      }
    }
  }
}
