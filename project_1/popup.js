const profileSelect = document.getElementById('profile-select');
const addProfileButton = document.getElementById('add-profile');
const addFieldButton = document.getElementById('add-field');
const saveProfileButton = document.getElementById('save-profile');
const savedDataDiv = document.getElementById('saved-data');

const STORAGE_KEY = 'autoFormFillerProfiles';


function loadProfiles() {
  const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  profileSelect.innerHTML = '';

  for (const profileName in profiles) {
    const option = document.createElement('option');
    option.value = profileName;
    option.textContent = profileName;
    profileSelect.appendChild(option);
  }
}


function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}


addProfileButton.addEventListener('click', () => {
  const profileName = prompt('Enter new profile name:');
  if (profileName) {
    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    profiles[profileName] = {};
    saveProfiles(profiles);
    loadProfiles();
  }
});


addFieldButton.addEventListener('click', () => {
  const fieldName = document.getElementById('field-name').value;
  const fieldValue = document.getElementById('field-value').value;

  if (fieldName && fieldValue) {
    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const currentProfile = profileSelect.value;

    if (!profiles[currentProfile]) {
      profiles[currentProfile] = {};
    }

    profiles[currentProfile][fieldName] = fieldValue;
    saveProfiles(profiles);
    displaySavedData();
  }
});


function displaySavedData() {
  const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const currentProfile = profileSelect.value;
  const data = profiles[currentProfile] || {};

  savedDataDiv.innerHTML = '<h4>Saved Data:</h4>';
  for (const [field, value] of Object.entries(data)) {
    savedDataDiv.innerHTML += `<p><strong>${field}:</strong> ${value}</p>`;
  }
}


loadProfiles();
displaySavedData();

saveProfileButton.addEventListener('click', () => {
  const currentProfile = profileSelect.value;
  if (currentProfile) {
    displaySavedData();
    alert(`Profile "${currentProfile}" saved!`);
  }
});