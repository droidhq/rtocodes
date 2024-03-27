let states = ["BR", "UP", "UK", "HR"];

// Function to populate dropdown with states
function populateDropdown() {
    const select = document.getElementById('selectState');

    // Add options from the 'states' array
    states.forEach(state => {
        const option = `<option value="${state}">${state}</option>`;
        select.insertAdjacentHTML('beforeend', option);
    });
}

populateDropdown(); // Call the function to populate dropdown initially

//

let sortDirection = 1; // 1 for ascending, -1 for descending
let sortColumn = 0; // Default sort column is 0 (Code)

const sortTable = (columnIndex) => {
    const tableBody = document.getElementById('rtoTableBody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));

    // Toggle sort direction if same column clicked again
    sortDirection = (sortColumn === columnIndex) ? -sortDirection : 1;
    sortColumn = columnIndex;

    // Sort rows based on the selected column
    rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();

        return isNaN(aValue) || isNaN(bValue)
            ? sortDirection * aValue.localeCompare(bValue)
            : sortDirection * (parseInt(aValue) - parseInt(bValue));
    });

    // Reorder table rows
    tableBody.innerHTML = '';
    rows.forEach(row => {
        tableBody.appendChild(row);
    });
};



let stateDataCache = {}; // Cache object to store fetched data

// Function to check if data for a state is cached
const isDataCached = (state) => stateDataCache.hasOwnProperty(state);

// Function to fetch data for selected states
async function fetchDataForSelectedStates(selectedState) {
    try {
        if (selectedState === 'all') {
            let combinedData = []; // Array to hold combined data for all states

            // Fetch and cache data for each state if not already cached
            for (const state of states) {
                if (!isDataCached(state)) {
                    const response = await fetch(`${state}.json`);
                    stateDataCache[state] = await response.json();
                }
                // Add data for the current state to the combinedData array
                combinedData = combinedData.concat(stateDataCache[state]);
            }

            return combinedData; // Return combined data for all states
        } else {
            // Fetch and cache data for the selected state if not already cached
            if (!isDataCached(selectedState)) {
                const response = await fetch(`${selectedState}.json`);
                stateDataCache[selectedState] = await response.json();
            }
            return stateDataCache[selectedState]; // Return data for the selected state
        }
    } catch (error) {
        console.error(`Error fetching data for ${selectedState}:`, error);
        return [];
    }
}

async function loadRTOData() {
    try {
        const selectedState = document.getElementById('selectState').value;
        const data = await fetchDataForSelectedStates(selectedState);
        displayRTOData(Array.isArray(data) ? data : [data]);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayRTOData(data) {
    const rtoTableBody = document.getElementById('rtoTableBody');
    rtoTableBody.innerHTML = ''; // Clear existing table data

    data.forEach(district => {
        Object.entries(district['RTO']).forEach(([rtoOffice, rtoCode]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rtoCode}</td>
                <td>${rtoOffice}</td>
                <td>${district.District}</td>
            `;
            rtoTableBody.appendChild(row);
        });
    });
}

// Event handler for the select element
document.getElementById('selectState').onchange = function() {
    document.getElementById('rtoTableBody').innerHTML = '';
    loadRTOData();
};

// Initially load data for Bihar
loadRTOData();
