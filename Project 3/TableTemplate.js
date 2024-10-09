"use strict";
class TableTemplate {
  static fillIn(id, dict, columnName) {
    const table = document.getElementById(id);
    const headerRow = table.querySelector("tr"); // Assume first row is the header
    let columnIdx = null;

    // Create a TemplateProcessor for the header
    const headerProcessor = new TemplateProcessor(headerRow.innerHTML);
    headerRow.innerHTML = headerProcessor.fillIn(dict);

    // find column name
    if (columnName) {
      const headers = headerRow.children;
      for (let i = 0; i < headers.length; i++) {
        if (headers[i].textContent.replaceAll(/{|}/g, "") === columnName) {
          columnIdx = i;
          break;
        }
      }
    }

    // Process each row's template
    for (const row of table.rows) {
      if (columnIdx === null) {
        const rowProcessor = new TemplateProcessor(row.innerHTML);
        row.innerHTML = rowProcessor.fillIn(dict);
      }
      if (row.children[columnIdx]) {
        const cellProcessor = new TemplateProcessor(
          row.children[columnIdx].innerHTML
        );
        row.children[columnIdx].innerHTML = cellProcessor.fillIn(dict);
      }
    }

    // Make the table visible if hidden
    table.style.visibility = "visible";
  }
}
