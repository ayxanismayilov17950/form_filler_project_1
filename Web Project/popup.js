let currentProfile = null;
const DEFAULT_PROFILE = "Default";

document.addEventListener('DOMContentLoaded', () => {
    loadProfiles();
    loadMappings();
});

// Load profiles from storage and populate dropdown
function loadProfiles() {
    chrome.storage.local.get(['profiles'], (result) => {
        const profiles = result.profiles || [DEFAULT_PROFILE];
        populateProfileSelector(profiles);
    });
}

function populateProfileSelector(profiles) {
    const profileSelector = document.getElementById('profileSelector');
    profileSelector.innerHTML = '';

    profiles.forEach((profile) => {
        const option = document.createElement('option');
        option.value = profile;
        option.textContent = profile;
        profileSelector.appendChild(option);
    });

    currentProfile = profiles[0];
    profileSelector.value = currentProfile;

    profileSelector.addEventListener('change', () => {
        currentProfile = profileSelector.value;
        loadExistingData();
        loadMappings();
    });

    loadExistingData();
    loadMappings();
}

document.getElementById('addProfileButton').addEventListener('click', addProfile);
document.getElementById('deleteProfileButton').addEventListener('click', deleteProfile);

function addProfile() {
    const profileName = prompt("Enter a new profile name:");
    if (!profileName) return;

    chrome.storage.local.get(['profiles'], (result) => {
        const profiles = result.profiles || [];
        if (profiles.includes(profileName)) {
            alert("Profile already exists!");
            return;
        }

        profiles.push(profileName);
        chrome.storage.local.set({ profiles }, () => {
            chrome.storage.local.set({ [profileName]: {} }, () => {
                populateProfileSelector(profiles);
                currentProfile = profileName;
                document.getElementById('profileSelector').value = currentProfile;
                alert("Profile added successfully!");
                loadExistingData();
                loadMappings();
            });
        });
    });
}

function deleteProfile() {
    if (currentProfile === DEFAULT_PROFILE) {
        alert("Default profile cannot be deleted!");
        return;
    }

    if (!confirm(`Are you sure you want to delete the profile "${currentProfile}"?`)) return;

    chrome.storage.local.get(['profiles'], (result) => {
        let profiles = result.profiles || [];
        profiles = profiles.filter((profile) => profile !== currentProfile);

        chrome.storage.local.remove([currentProfile], () => {
            chrome.storage.local.set({ profiles }, () => {
                populateProfileSelector(profiles);
                currentProfile = profiles[0] || DEFAULT_PROFILE;
                document.getElementById('profileSelector').value = currentProfile;
                loadExistingData();
                alert("Profile deleted successfully!");
            });
        });
    });
}

function loadExistingData() {
    if (!currentProfile) return;

    chrome.storage.local.get([currentProfile], (result) => {
        const data = result[currentProfile] || {};
        displayFields(data);
    });
}

function displayFields(data) {
    const container = document.getElementById('dataFields');
    container.innerHTML = '';
    for (const [key, value] of Object.entries(data)) {
        const fieldDiv = document.createElement('div');
        fieldDiv.innerHTML = `
            <input type="text" value="${key}" class="fieldKey" />
            <input type="text" value="${value}" class="fieldValue" />
            <button class="deleteField">Delete</button>
        `;
        container.appendChild(fieldDiv);
    }
}

document.getElementById('addFieldButton').addEventListener('click', addNewField);
document.getElementById('saveFieldsButton').addEventListener('click', saveAllData);

function addNewField() {
    const container = document.getElementById('dataFields');
    const fieldDiv = document.createElement('div');
    fieldDiv.innerHTML = `
        <input type="text" placeholder="Field Name" class="fieldKey" />
        <input type="text" placeholder="Field Value" class="fieldValue" />
        <button class="deleteField">Delete</button>
    `;
    container.appendChild(fieldDiv);
}

document.getElementById('dataFields').addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteField')) {
        event.target.parentElement.remove();
    }
});

function saveAllData() {
    if (!currentProfile) return;

    const data = {};
    let hasError = false;

    document.querySelectorAll('#dataFields div').forEach((fieldDiv) => {
        const key = fieldDiv.querySelector('.fieldKey').value.trim();
        const value = fieldDiv.querySelector('.fieldValue').value.trim();

        if (!key || !value) {
            hasError = true;
            fieldDiv.style.border = '1px solid red'; // Highlight empty fields
        } else {
            fieldDiv.style.border = ''; // Reset border
            data[key] = value;
        }
    });

    if (hasError) {
        alert("Please fill out all fields before saving.");
        return;
    }

    chrome.storage.local.set({ [currentProfile]: data }, () => {
        alert("Data saved successfully!");
    });
}

// Mapping functionality
function loadMappings() {
    chrome.storage.local.get(['fieldMappings'], (result) => {
        const fieldMappings = result.fieldMappings || {};
        displayMappings(fieldMappings);
    });
}

function displayMappings(fieldMappings) {
    const container = document.getElementById('mappingContainer');
    container.innerHTML = '';

    for (const [linkedinField, formField] of Object.entries(fieldMappings)) {
        const mappingDiv = document.createElement('div');
        mappingDiv.innerHTML = `
            <input type="text" value="${linkedinField}" class="linkedinField" placeholder="LinkedIn Field" />
            <input type="text" value="${formField}" class="formFieldMapping" placeholder="Form Field" />
            <button class="saveMapping">Save</button>
            <button class="deleteMapping">Delete</button>
        `;
        container.appendChild(mappingDiv);
    }
}

document.getElementById('mappingContainer').addEventListener('click', (event) => {
    if (event.target.classList.contains('saveMapping')) {
        saveMapping(event);
    } else if (event.target.classList.contains('deleteMapping')) {
        deleteMapping(event);
    }
});

function saveMapping(event) {
    const mappingDiv = event.target.closest('div');
    const linkedinField = mappingDiv.querySelector('.linkedinField').value.trim();
    const formField = mappingDiv.querySelector('.formFieldMapping').value.trim();

    if (!linkedinField || !formField) {
        alert("Both LinkedIn Field and Form Field are required!");
        return;
    }

    chrome.storage.local.get(['fieldMappings'], (result) => {
        const fieldMappings = result.fieldMappings || {};
        fieldMappings[linkedinField] = formField;

        chrome.storage.local.set({ fieldMappings }, () => {
            alert("Mapping saved!");
            loadMappings();
        });
    });
}

function deleteMapping(event) {
    const mappingDiv = event.target.closest('div');
    const linkedinField = mappingDiv.querySelector('.linkedinField').value.trim();

    chrome.storage.local.get(['fieldMappings'], (result) => {
        const fieldMappings = result.fieldMappings || {};
        delete fieldMappings[linkedinField];

        chrome.storage.local.set({ fieldMappings }, () => {
            alert("Mapping deleted!");
            loadMappings();
        });
    });
}
