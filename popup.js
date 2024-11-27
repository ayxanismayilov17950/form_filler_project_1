// popup.js

let profiles = [];
let selectedProfileIndex = 0;

// Initialize an array to hold custom fields
let customFields = [];

// Load profiles when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  loadProfiles();

  // Event listeners for buttons and inputs
  document.getElementById('add-custom-field').addEventListener('click', () => {
    addCustomField();
  });

  document.getElementById('profile-select').addEventListener('change', () => {
    selectedProfileIndex = parseInt(document.getElementById('profile-select').value, 10);
    loadSelectedProfileData();
  });

  document.getElementById('new-profile').addEventListener('click', createNewProfile);
  document.getElementById('delete-profile').addEventListener('click', deleteProfile);
  document.getElementById('save').addEventListener('click', saveProfileData);

  document.getElementById('reload').addEventListener('click', loadProfiles);
  document.getElementById('auto-fill').addEventListener('click', autoFill);
  document.getElementById('export-data').addEventListener('click', exportData);
  document.getElementById('import-data').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  document.getElementById('file-input').addEventListener('change', importData);
  document.getElementById('extract-data').addEventListener('click', extractData); // Event listener
  document.getElementById('send-email').addEventListener('click', sendEmail);

// Function to add a custom field to the popup
function addCustomField(key = '', value = '') {
  const container = document.getElementById('custom-fields-container');
  const div = document.createElement('div');
  div.className = 'custom-field';

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Field Name';
  keyInput.value = key;

  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'Field Value';
  valueInput.value = value;

  const removeButton = document.createElement('button');
  removeButton.textContent = 'X';
  removeButton.className = 'remove-button';
  removeButton.addEventListener('click', () => {
    container.removeChild(div);
    customFields = customFields.filter(f => f !== div);
  });

  div.appendChild(keyInput);
  div.appendChild(valueInput);
  div.appendChild(removeButton);

  container.appendChild(div);
  customFields.push(div);
}

// Function to load profiles from storage
function loadProfiles() {
  chrome.storage.local.get(['profiles'], (result) => {
    profiles = result.profiles || [];

    // If no profiles exist, create a default one
    if (profiles.length === 0) {
      profiles.push({
        profileName: 'Default Profile',
        data: {}
      });
    }

    // Ensure the selectedProfileIndex is within bounds
    if (selectedProfileIndex >= profiles.length) {
      selectedProfileIndex = 0;
    }

    populateProfileDropdown();
    loadSelectedProfileData();
  });
}

// Function to populate the profile dropdown
function populateProfileDropdown() {
  const profileSelect = document.getElementById('profile-select');
  profileSelect.innerHTML = '';
  profiles.forEach((profile, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.text = profile.profileName;
    profileSelect.add(option);
  });
  profileSelect.selectedIndex = selectedProfileIndex;
}

// Function to load data of the selected profile into form fields
function loadSelectedProfileData() {
  if (profiles[selectedProfileIndex]) {
    const data = profiles[selectedProfileIndex].data;
    document.getElementById('name').value = data.name || '';
    document.getElementById('experiences').value = formatExperiences(data.experiences) || '';
    document.getElementById('education').value = formatEducation(data.education) || '';
    document.getElementById('skills').value = formatSkills(data.skills) || '';
    document.getElementById('summary').value = data.summary || '';

    // Clear existing custom fields
    document.getElementById('custom-fields-container').innerHTML = '';
    customFields = [];

    // Reload custom fields
    if (data.customFields) {
      data.customFields.forEach(field => {
        addCustomField(field.key, field.value);
      });
    }
  }
}

// Helper functions to format data for display
function formatExperiences(experiences) {
  if (!Array.isArray(experiences)) return '';
  return experiences.map(exp => `${exp.jobTitle || ''} at ${exp.company || ''}`).join('\n');
}

function formatEducation(education) {
  if (!Array.isArray(education)) {
    console.error("Invalid education data:", education);
    return '';
  }

  return education.map((edu, index) => {
    console.log(`Processing education entry [${index}]:`, edu);

    const university = edu.university || 'Unknown University';
    const degreeMajor = edu.degreeMajor || 'Degree/Major not specified';
    const duration = edu.duration ? `Duration: ${edu.duration}` : 'Duration not specified';
    const grade = edu.grade ? `Grade: ${edu.grade}` : 'Grade not specified';
    const activities = edu.activities ? `Activities: ${edu.activities}` : 'Activities not specified';

    const formatted = `${university}\n${degreeMajor}\n${duration}\n${grade}\n${activities}`;
    console.log(`Formatted education entry [${index}]:`, formatted);

    return formatted;
  }).join('\n\n'); // Add a blank line between entries
}


function formatSkills(skills) {
  if (!Array.isArray(skills)) return '';
  return skills.join(', ');
}

// Function to create a new profile
function createNewProfile() {
  // Get modal-related elements
  const newProfileModal = document.getElementById('new-profile-modal');
  const saveNewProfileButton = document.getElementById('save-new-profile');
  const cancelNewProfileButton = document.getElementById('cancel-new-profile');
  const newProfileNameInput = document.getElementById('new-profile-name');

  // Show modal when "New Profile" button is clicked
  newProfileModal.style.display = 'flex';

  // Event listener for saving the new profile
  const saveProfile = () => {
    const profileName = newProfileNameInput.value.trim();
    if (profileName) {
      // Add the new profile logic here
      profiles.push({
        profileName: profileName,
        data: {}
      });
      selectedProfileIndex = profiles.length - 1;
      chrome.storage.local.set({ profiles: profiles }, () => {
        populateProfileDropdown();
        loadSelectedProfileData();
        showMessage('Profile created successfully!');
      });
    }
    // Clear the input and hide the modal
    newProfileNameInput.value = '';
    newProfileModal.style.display = 'none';

    // Clean up event listeners to avoid duplicate listeners
    saveNewProfileButton.removeEventListener('click', saveProfile);
    cancelNewProfileButton.removeEventListener('click', cancelProfileCreation);
  };

  // Event listener for canceling the new profile creation
  const cancelProfileCreation = () => {
    newProfileModal.style.display = 'none';
    newProfileNameInput.value = ''; // Clear the input

    // Clean up event listeners to avoid duplicate listeners
    saveNewProfileButton.removeEventListener('click', saveProfile);
    cancelNewProfileButton.removeEventListener('click', cancelProfileCreation);
  };

  // Attach the listeners
  saveNewProfileButton.addEventListener('click', saveProfile);
  cancelNewProfileButton.addEventListener('click', cancelProfileCreation);
}

// Function to delete the selected profile
function deleteProfile() {
  if (profiles.length <= 1) {
    alert('At least one profile must exist.');
    return;
  }
  if (confirm('Are you sure you want to delete this profile?')) {
    profiles.splice(selectedProfileIndex, 1);
    selectedProfileIndex = 0;
    chrome.storage.local.set({ profiles: profiles }, () => {
      populateProfileDropdown();
      loadSelectedProfileData();
    });
  }
}

// Function to save the current profile data
function saveProfileData() {
  const name = document.getElementById('name').value.trim();
  const experiencesInput = document.getElementById('experiences').value.trim();
  const educationInput = document.getElementById('education').value.trim();
  const skillsInput = document.getElementById('skills').value.trim();
  const summary = document.getElementById('summary').value.trim();

  // Process experiences and education into structured arrays
  const experiencesArray = parseTextToArray(experiencesInput, ' at ');
  const educationArray = parseTextToArray(educationInput, ' - ');

  // Process skills into an array
  const skillsArray = skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);

  const data = {
    name: name || '',
    experiences: experiencesArray,
    education: educationArray,
    skills: skillsArray,
    summary: summary || '',
    customFields: customFields.map(div => {
      const inputs = div.getElementsByTagName('input');
      return {
        key: inputs[0].value.trim(),
        value: inputs[1].value.trim()
      };
    })
  };

  profiles[selectedProfileIndex].data = data;

  // Save profiles array to chrome.storage.local
  chrome.storage.local.set({ profiles: profiles }, () => {
    // Display a success message
    showMessage('Profile saved successfully.');
  });
}

// Helper function to parse text input into an array of objects
function parseTextToArray(input, delimiter) {
  if (!input) return [];
  return input.split('\n').map(line => {
    const [part1, part2] = line.split(delimiter);
    if (delimiter === ' at ') {
      return { jobTitle: part1 ? part1.trim() : '', company: part2 ? part2.trim() : '' };
    } else if (delimiter === ' - ') {
      return { university: part1 ? part1.trim() : '', major: part2 ? part2.trim() : '' };
    }
    return {};
  }).filter(item => Object.values(item).some(value => value));
}

// Function to display a temporary message
function showMessage(message) {
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 2000);
}

// Function to autofill the form on the current tab
function autoFill() {
  saveProfileData()
  const data = profiles[selectedProfileIndex].data;
  if (data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;

      // Inject contentScript.js into the active tab
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          files: ['content.js']
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            alert('Error injecting content script: ' + chrome.runtime.lastError.message);
          } else {
            // After injecting, send the message
            chrome.tabs.sendMessage(tabId, { action: 'autoFill', data }, function (response) {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                alert('Error: ' + chrome.runtime.lastError.message);
              } else if (response && response.status) {
                console.log(response.status);
                // Display a success message
                showMessage(response.status);
              } else {
                console.error('Unexpected response:', response);
                alert('Unexpected response from content script.');
              }
            });
          }
        }
      );
    });
  } else {
    alert('No data available for the selected profile.');
  }
}

// Function to export profile data to a JSON file
function exportData() {
  chrome.storage.local.get(['profiles'], (result) => {
    const profilesData = result.profiles || [];

    const jsonData = JSON.stringify(profilesData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'profiles.json';
    a.click();

    URL.revokeObjectURL(url);
  });
}

// Function to import profile data from a JSON file
function importData(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedData = JSON.parse(e.target.result);

        if (Array.isArray(importedData)) {
          if (confirm('Do you want to replace your existing profiles with the imported data? Click "Cancel" to merge them.')) {
            chrome.storage.local.set({ profiles: importedData }, () => {
              alert('Profiles replaced successfully.');
              loadProfiles();
            });
          } else {
            chrome.storage.local.get(['profiles'], (result) => {
              const existingProfiles = result.profiles || [];
              const mergedProfiles = existingProfiles.concat(importedData);
              chrome.storage.local.set({ profiles: mergedProfiles }, () => {
                alert('Profiles merged successfully.');
                loadProfiles();
              });
            });
          }
        } else {
          alert('Invalid data format. Please select a valid profiles JSON file.');
        }
      } catch (error) {
        console.error(error);
        alert('Error parsing the file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  }
}

// Function to extract data from the current page
function extractData() {
  const confirmExtract = confirm('Ensure you are on the LinkedIn profile page you want to extract data from. Proceed?');
  if (!confirmExtract) return;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;
    const tabUrl = tabs[0].url;

    console.log('Extracting data from tab:', tabUrl);

    // Inject contentScript.js into the active tab
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ['content.js']
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Error injecting content script:', chrome.runtime.lastError);
          alert('Error injecting content script: ' + chrome.runtime.lastError.message);
          return;
        }

        // After injecting, send the message to extract data
        chrome.tabs.sendMessage(tabId, { action: 'extractData' }, function (response) {
          if (!response) {
            console.error('No response from content script');
            alert('No response from content script');
            return;
          }
          if (response.success) {
            const data = response.data;
            console.log('Extracted Data:', data);
            populateDataFields(data);
            // Optionally save the extracted data
            // profiles[selectedProfileIndex].data = data;
            // chrome.storage.local.set({ profiles: profiles });
            // Display a success message
            showMessage('Data extracted successfully.');
          } else {
            console.error('Error extracting data:', response.error);
            alert('Error extracting data: ' + response.error);
          }
        });
      }
    );
  });
}
// Function to populate data fields with extracted data
function populateDataFields(data) {
  document.getElementById('name').value = data.name || '';

  // Format experiences array into a string
  let experiencesText = '';
  if (data.experiences && data.experiences.length > 0) {
    experiencesText = data.experiences.map(exp => {
      let expStr = '';
      if (exp.jobTitle) {
        expStr += exp.jobTitle;
      }
      if (exp.company) {
        expStr += ` \n ${exp.company}`;
      }
      return expStr;
    }).join('\n\n');
  }
  document.getElementById('experiences').value = experiencesText;

  document.getElementById('summary').value = data.summary || '';

  // Format education array into a string with all details
  let educationText = '';
  if (data.education && data.education.length > 0) {
    educationText = data.education.map(edu => {
      let eduStr = '';
      if (edu.university) {
        eduStr += ` ${edu.university}`;
      }
      if (edu.degreeMajor) {
        eduStr += `\n ${edu.degreeMajor}`;
      }
      // if (edu.duration) {
      //   eduStr += `\n ${edu.duration}`;
      // }
      // if (edu.grade) {
      //   eduStr += `\nGrade: ${edu.grade}`;
      // }
      // if (edu.activities) {
      //   eduStr += `\nActivities: ${edu.activities}`;
      // }
      return eduStr.trim(); // Trim any trailing whitespace
    }).join('\n\n'); // Add a blank line between entries
  }
  document.getElementById('education').value = educationText;

  // Format skills array into a string
  let skillsText = '';
  if (data.skills && data.skills.length > 0) {
    skillsText = data.skills.join(', ');
  }
  document.getElementById('skills').value = skillsText;

  document.getElementById('custom-fields-container').innerHTML = '';
  customFields = [];

  if (data.customFields) {
    data.customFields.forEach(field => {
      addCustomField(field.key, field.value);
    });
  }
}

function sendEmail() {
  chrome.storage.local.get(['profiles'], (result) => {
    const profilesData = result.profiles || [];
    const jsonData = JSON.stringify(profilesData, null, 2);

    // Create a Blob and file URL for the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });
    const fileUrl = URL.createObjectURL(blob);

    // Automatically download the JSON file
    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = 'profiles.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Prefill an email with instructions to attach the downloaded file
    const subject = encodeURIComponent('Exported Profile Data');
    const body = encodeURIComponent(
      `Attached is the exported profile data from the Supreme Auto Filler extension.\n\nPlease attach the downloaded file "profiles.json" to this email before sending.`
    );

    // Open the user's email client
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    // Revoke the Blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  })
}
})