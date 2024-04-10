const selectState = document.getElementById("selectState");
const rtoTableBody = document.getElementById("rtoTableBody");
const stateDataCache = {};
let statesarray = {};

function populateDropdown(statesarray) {
  const select = document.getElementById("selectState");
  statesarray.forEach((state) => {
    select.innerHTML += `<option value="${state.Code}">${state.State}</option>`;
  });
}

async function fetchStates(statesfile) {
  try {
    const response = await fetch(statesfile);
    const data = await response.json();
    states = data;
  } catch (error) {
    console.error("Error fetching states:", error);
  }
  statesarray = states;
  populateDropdown(states);
}

// Fetch the states data and call populateDropdown() when it's fetched
async function fetchDataForSelectedStates(selectedState) {
  try {
    if (selectedState === "All") {
      const fetchPromises = states.map(async (state) => {
        if (!stateDataCache.hasOwnProperty(state.Code)) {
          const response = await fetch(`json/${state.Code}.json`);
          stateDataCache[state.Code] = await response.json();
        }
        return stateDataCache[state.Code];
      });
      const combinedData = await Promise.all(fetchPromises);
      return combinedData.reduce((acc, curr) => acc.concat(curr), []);
    } else {
      if (!stateDataCache.hasOwnProperty(selectedState)) {
        const response = await fetch(`json/${selectedState}.json`);
        stateDataCache[selectedState] = await response.json();
      }
      return stateDataCache[selectedState];
    }
  } catch (error) {
    console.error(`Error fetching data for ${selectedState}:`, error);
    return [];
  }
}

async function printRTOData(data) {
  let tableHTML = "";
  data.forEach((district) => {
    Object.entries(district["RTO"]).forEach(([Office, rtoArray]) => {
      rtoArray.forEach((rtoData) => {
        tableHTML += `<tr>
          <td>${rtoData.Code}</td>
          <td>${Office}</td>
          <td>${district.District}</td>
          <td>${rtoData.JurisdictionArea}</td>
        </tr>`;
      });
    });
  });
  rtoTableBody.innerHTML = tableHTML;
}

// Load RTO data
async function loadRTOData(selectedState) {
  try {
    const data = await fetchDataForSelectedStates(selectedState);
    const dataArray = Array.isArray(data) ? data : [data];

    // Clear the search input value
    document.getElementById("searchInput").value = "";

    // Clear the table body before printing new data
    rtoTableBody.innerHTML = "";

    printRTOData(dataArray);
  } catch (error) {
    console.error("Error loading RTO data:", error);
  }
  sortTable(0);
}

function sortTable(columnIndex) {
  const tableBody = document.getElementById("rtoTableBody");
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim();
    const bValue = b.cells[columnIndex].textContent.trim();

    // Compare the first two characters (alphabet part)
    const compareAlphabet = aValue
      .substring(0, 2)
      .localeCompare(bValue.substring(0, 2));

    if (compareAlphabet !== 0) {
      return compareAlphabet;
    }

    // Extract and compare the numeric part
    const aNumber = parseInt(aValue.substring(2));
    const bNumber = parseInt(bValue.substring(2));
    return aNumber - bNumber;
  });

  rows.forEach((row) => tableBody.appendChild(row));
}

function searchTable(inputId) {
  const input = document.getElementById(inputId).value.toUpperCase();
  const rows = document.querySelectorAll("#rtoTableBody tr");
  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    const found = cells.some(
      (cell) => cell.textContent.toUpperCase().indexOf(input) > -1
    );
    row.style.display = found ? "" : "none";
  });
}

function downloadAsCSV(selectedState) {
  const table = document.getElementById("rtoTable");
  let csv = "";
  const visibleRows = Array.from(
    table.querySelectorAll("#rtoTableBody tr")
  ).filter((row) => row.style.display !== "none");

  for (const row of visibleRows) {
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      const cellContent = `"${cell.textContent.trim().replace(/"/g, '""')}"`;
      csv += cellContent + (j < row.cells.length - 1 ? "," : "");
    }
    csv += "\n";
  }

  if (csv.trim() === "") {
    alert("No search results to download.");
    return;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `${selectedState}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Call the fetchStates function
fetchStates("States.json");
