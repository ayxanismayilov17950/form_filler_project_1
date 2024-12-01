// popup.js

let profiles = [];
let selectedProfileIndex = 0;

// Initialize an array to hold custom fields
let customFields = [];

// Load profiles when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  loadProfiles();
  
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
  document.getElementById('auto-fill').addEventListener('click', autoFill);
  document.getElementById('export-data').addEventListener('click', exportData);
  document.getElementById('import-data').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });
  document.getElementById('file-input').addEventListener('change', importData);
  document.getElementById('extract-data').addEventListener('click', extractData);
  document.getElementById('send-email').addEventListener('click', sendEmail);
});
  // Event listener for the "Generate Cover Letter" button
  document.getElementById('generate-letter').addEventListener('click', () => {
    const data = profiles[selectedProfileIndex].data;

    // Get company name and job title from input fields
    const companyName = document.getElementById('company-name').value.trim();
    const jobTitle = document.getElementById('job-title').value.trim();

    // Call the createCoverLetter function
    createCoverLetter(data, companyName, jobTitle);
  });

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

function loadProfiles() {
  chrome.storage.local.get(['profiles'], (result) => {
    profiles = result.profiles || [];

    if (selectedProfileIndex >= profiles.length) {
      selectedProfileIndex = 0;
    }

    populateProfileDropdown();
    loadSelectedProfileData();
  });
}

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
    document.getElementById('certificates').value = formatCertificates(data.certificates) || '';
    document.getElementById('summary').value = data.summary || '';
    document.getElementById('cover-letter').value = data.coverLetter || '';

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
  if (!Array.isArray(education)) return '';
  return education
    .filter(edu => edu.university || edu.degreeMajor)
    .map(edu => {
      const details = [
        edu.university,
        edu.degreeMajor,
        edu.duration && `Duration: ${edu.duration}`,
        edu.grade && `Grade: ${edu.grade}`,
        edu.activities && `Activities: ${edu.activities}`
      ].filter(Boolean).join('\n');
      return details;
    }).join('\n\n'); 
}
function formatCertificates(certificates) {
  if (!Array.isArray(certificates)) return '';
  return certificates.map(cert => {
    let certStr = cert.certificateName || '';
    if (cert.issuingOrganization) {
      certStr += ` from ${cert.issuingOrganization}`;
    }
    if (cert.dateText) {
      certStr += ` (${cert.dateText})`;
    }
    return certStr;
  }).join('\n');
}

function createNewProfile() {
  const newProfileModal = document.getElementById('new-profile-modal');
  const saveNewProfileButton = document.getElementById('save-new-profile');
  const cancelNewProfileButton = document.getElementById('cancel-new-profile');
  const newProfileNameInput = document.getElementById('new-profile-name');

  newProfileModal.style.display = 'flex';

  const saveProfile = () => {
    const profileName = newProfileNameInput.value.trim();
    if (profileName) {
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

function saveProfileData() {
  const name = document.getElementById('name').value.trim();
  const experiencesInput = document.getElementById('experiences').value.trim();
  const educationInput = document.getElementById('education').value.trim();
  const certificatesInput = document.getElementById('certificates').value.trim();
  const summary = document.getElementById('summary').value.trim();
  const coverLetter = document.getElementById('cover-letter').value.trim();

  const experiencesArray = parseTextToArray(experiencesInput, ' at ');
  const educationArray = parseTextToArray(educationInput, ' - ');
  
  const certificatesArray = certificatesInput.split('\n').map(line => {
    const [namePart, rest] = line.split(' from ');
    let certificateName = namePart ? namePart.trim() : '';
    let issuingOrganization = '';
    let dateText = '';
    if (rest) {
      const dateStart = rest.indexOf('(');
      if (dateStart !== -1) {
        issuingOrganization = rest.substring(0, dateStart).trim();
        dateText = rest.substring(dateStart + 1, rest.length - 1).trim();
      } else {
        issuingOrganization = rest.trim();
      }
    }

    return { certificateName, issuingOrganization, dateText };
  }).filter(cert => cert.certificateName);


  const data = {
    name: name || '',
    experiences: experiencesArray,
    education: educationArray,
    certificates: certificatesArray,
    summary: summary || '',
    coverLetter: coverLetter || '',
    customFields: customFields.map(div => {
      const inputs = div.getElementsByTagName('input');
      return {
        key: inputs[0].value.trim(),
        value: inputs[1].value.trim()
      };
    })
  };

  profiles[selectedProfileIndex].data = data;

  chrome.storage.local.set({ profiles: profiles }, () => {
    showMessage('Profile saved successfully.');
  });
}

function parseTextToArray(input, delimiter) {
  if (!input) return [];
  return input.split('\n').map(line => {
    const [part1, part2] = line.split(delimiter);
    if (delimiter === ' at ') {
      return { jobTitle: part1?.trim() || '', company: part2?.trim() || '' };
    } else if (delimiter === ' - ') {
      return { university: part1?.trim() || '', degreeMajor: part2?.trim() || '' };
    }
    return {};
  }).filter(item => Object.values(item).some(value => value));
}

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
  const confirmExtract = confirm('Please Enter Your LinkedIn page');
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
      return eduStr.trim(); // Trim any trailing whitespace
    }).join('\n\n'); // Add a blank line between entries
  }
  document.getElementById('education').value = educationText;
  let certificatesText = '';
  if (data.certificates && data.certificates.length > 0) {
    certificatesText = data.certificates.map(cert => {
      let certStr = cert.certificateName || '';
      if (cert.issuingOrganization) {
        certStr += ` from ${cert.issuingOrganization}`;
      }
      if (cert.dateText) {
        certStr += ` (${cert.dateText})`;
      }
      return certStr;
    }).join('\n');
  }
  document.getElementById('certificates').value = certificatesText;

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
    const blob = new Blob([jsonData], { type: 'application/json' });
    const fileUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = 'profiles.json';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    const subject = encodeURIComponent('Exported Profile Data');
    const body = encodeURIComponent(
      `Attach the exported file "profiles.json" to this email.`
    );
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  })
}
  document.getElementById('extract-job-details').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: extractJobDetails,
        },
        (results) => {
          if (chrome.runtime.lastError) {
            console.error('Error injecting script:', chrome.runtime.lastError);
            alert('Error extracting job details: ' + chrome.runtime.lastError.message);
            return;
          }

          if (!results || results.length === 0 || !results[0].result) {
            console.error('No results from script execution');
            alert('Unable to extract job details from the page.');
            return;
          }

          const { jobTitle, companyName } = results[0].result;
          if (!jobTitle && !companyName) {
            alert('Unable to detect job title or company name on this page.');
            return;
          }

          // Populate the input fields in the popup
          if (jobTitle) {
            document.getElementById('job-title').value = jobTitle;
          }
          if (companyName) {
            document.getElementById('company-name').value = companyName;
          }

          showMessage('Job details extracted successfully.');
        }
      );
    });
  });
  function generateCoverLetter() {
    const data = profiles[selectedProfileIndex].data;
      const companyName = document.getElementById('company-name').value.trim();
    const jobTitle = document.getElementById('job-title').value.trim();
  
    if (!companyName || !jobTitle) {
      alert('Please enter both Company Name and Job Title, or click "Extract from Page".');
      return;
    }
  
    createCoverLetter(data, companyName, jobTitle)
      .then((coverLetter) => {
        document.getElementById('cover-letter').value = coverLetter;
        data.coverLetter = coverLetter;
        profiles[selectedProfileIndex].data = data;
        chrome.storage.local.set({ profiles: profiles });
        showMessage('Cover letter generated successfully.');
      })
      .catch((error) => {
        console.error('Error generating cover letter:', error);
        alert('Error generating cover letter: ' + error.message);
      });
  }
  
  // Function to extract job details from the application page
  function extractJobDetails() {
    let jobTitle = '';
    let companyName = '';
  
    // Attempt to detect job title and company name
    const jobTitleElement = document.querySelector('h1.job-title, h1.title, .job-title, .title, h1');
    const companyNameElement = document.querySelector('.company-name, .company, .employer');
  
    if (jobTitleElement) {
      jobTitle = jobTitleElement.innerText.trim();
    }
  
    if (companyNameElement) {
      companyName = companyNameElement.innerText.trim();
    }
  
    return { jobTitle, companyName };
  }