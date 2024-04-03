const states = [
  "AS",
  "AR",
  "BR",
  "CG",
  "CH",
  "DL",
  "GA",
  "GJ",
  "UP",
  "UK",
].sort();

const selectState = document.getElementById("selectState");
const rtoTableBody = document.getElementById("rtoTableBody");
const stateDataCache = {};

// Populate dropdown with states
function populateDropdown() {
  const select = document.getElementById("selectState");
  states.forEach((state) => {
    select.innerHTML += `<option value="${state}">${state}</option>`;
  });
}

// Check if data for a state is cached
const isDataCached = (state) => stateDataCache.hasOwnProperty(state);

// Fetch data for selected states
async function fetchDataForSelectedStates(selectedState) {
  try {
    if (selectedState === "All") {
      let combinedData = []; // Array to hold combined data for all states

      // Fetch and cache data for each state if not already cached
      for (const state of states.filter((state) => state !== "All")) {
        if (!isDataCached(state)) {
          const response = await fetch(`json/${state}.json`);
          stateDataCache[state] = await response.json();
        }
        // Add data for the current state to the combinedData array
        combinedData = combinedData.concat(stateDataCache[state]);
      }

      return combinedData; // Return combined data for all states
    } else {
      // Fetch and cache data for the selected state if not already cached
      if (!isDataCached(selectedState)) {
        const response = await fetch(`json/${selectedState}.json`);
        stateDataCache[selectedState] = await response.json();
      }
      return stateDataCache[selectedState]; // Return data for the selected state
    }
  } catch (error) {
    console.error(`Error fetching data for ${selectedState}:`, error);
    return [];
  }
}

// Load RTO data
async function loadRTOData() {
  try {
    const selectedState = selectState.value;
    const data = await fetchDataForSelectedStates(selectedState);
    const dataArray = Array.isArray(data) ? data : [data];

    // Clear the table body before printing new data
    rtoTableBody.innerHTML = "";

    printdata(dataArray);
  } catch (error) {
    console.error("Error loading RTO data:", error);
  }
  sortTable(0);
}

// Print data to table
async function printdata(data) {
  let tableHTML = "";
  data.forEach((district) => {
    Object.entries(district["RTO"]).forEach(([rtoOffice, rtoData]) => {
      tableHTML += `
        <tr>
          <td>${rtoData.Code}</td>
          <td>${rtoOffice}</td>
          <td>${rtoData.JurisdictionArea}</td>
          <td>${district.District}</td>
        </tr>`;
    });
  });
  rtoTableBody.innerHTML = tableHTML;
}

// Function to sort the table based on the provided column index
function sortTable(columnIndex) {
  const tableBody = document.getElementById("rtoTableBody");
  const rows = Array.from(tableBody.querySelectorAll("tr"));

  rows.sort((a, b) => {
    const aValue = a.cells[columnIndex].textContent.trim();
    const bValue = b.cells[columnIndex].textContent.trim();

    return isNaN(aValue) || isNaN(bValue)
      ? aValue.localeCompare(bValue)
      : parseInt(aValue) - parseInt(bValue);
  });

  rows.forEach((row) => tableBody.appendChild(row));
}

//
function searchTable() {
  const input = document.getElementById("searchInput").value.toUpperCase();
  const rows = document.querySelectorAll("#rtoTableBody tr");

  rows.forEach((row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    const found = cells.some(
      (cell) => cell.textContent.toUpperCase().indexOf(input) > -1
    );
    row.style.display = found ? "" : "none";
  });
}

// Initially load data
window.onload = function () {
  document.getElementById("searchInput").focus();
};

populateDropdown();
loadRTOData();
