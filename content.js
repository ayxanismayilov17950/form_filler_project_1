console.log('Content script loaded.');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Received request:', request);

  if (request.action === 'extractData') {
    console.log('Starting data extraction...');
    try {
      // Extract Name
      const nameElement = document.querySelector('h1.inline.t-24.v-align-middle.break-words');
      const name = nameElement ? nameElement.innerText.trim() : null;
      console.log('Extracted Name:', name);

      const experiences = [];
      const experienceContainer = document.querySelector('#experience');
      if (experienceContainer) {
        const siblingDiv = experienceContainer.nextElementSibling?.nextElementSibling;
        if (siblingDiv) {
          const experienceItems = siblingDiv.querySelectorAll('li.artdeco-list__item');
          experienceItems.forEach((item) => {
            const jobTitle = item.querySelector('span[aria-hidden="true"]')?.textContent.trim() || null;
            const company = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]')?.textContent.trim() || null;
            if (jobTitle || company) experiences.push({ jobTitle, company });
          });
        }
      }
      console.log('Extracted Experiences:', experiences);

      // Extract Summary
      let summary = '';
      const aboutSection = document.querySelector('#about');
      if (aboutSection) {
        const secondSibling = aboutSection.nextElementSibling?.nextElementSibling;
        if (secondSibling) {
          summary = secondSibling.querySelector('div.inline-show-more-text--is-collapsed span[aria-hidden="true"]')?.textContent.trim() || '';
        }
      }
      console.log('Extracted Summary:', summary);

      // Extract Education
      const education = [];
      const educationContainer = document.querySelector('#education');
      if (educationContainer) {
        const siblingDiv = educationContainer.nextElementSibling?.nextElementSibling;
        if (siblingDiv) {
          const educationItems = siblingDiv.querySelectorAll('li.artdeco-list__item');
          educationItems.forEach((item) => {
            const university = item.querySelector('div.display-flex.align-items-center span[aria-hidden="true"]')?.textContent.trim() || null;
            const degreeMajor = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]')?.textContent.trim() || null;
            const duration = item.querySelector('span.t-14.t-normal.t-black--light span[aria-hidden="true"]')?.textContent.trim() || null;
            if (university || degreeMajor || duration) {
              education.push({ university, degreeMajor, duration });
            }
          });
        }
      }
      console.log('Extracted Education:', education);


      let certificates = [];
      const certificatesContainer = document.querySelector('#licenses_and_certifications');

      if (certificatesContainer) {
        // Navigate to the sibling div containing the certificates data
        const siblingDiv = certificatesContainer.nextElementSibling?.nextElementSibling;

        if (siblingDiv) {
          // Look for the certificate items within this div
          const certificateItems = siblingDiv.querySelectorAll('li.artdeco-list__item');

          certificateItems.forEach((item) => {
            const certificateNameElement = item.querySelector('div.display-flex.align-items-center.mr1.t-bold span[aria-hidden="true"]');
            const certificateName = certificateNameElement ? certificateNameElement.textContent.trim() : null;

            const issuingOrgElement = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]');
            const issuingOrganization = issuingOrgElement ? issuingOrgElement.textContent.trim() : null;

            // Extract issued and expiration dates if available
            const dateElement = item.querySelector('span.t-14.t-normal.t-black--light span[aria-hidden="true"]');
            const dateText = dateElement ? dateElement.textContent.trim() : null;

            if (certificateName || issuingOrganization) {
              certificates.push({ certificateName, issuingOrganization, dateText });
            }
          });

          console.log('Extracted Certificates:', certificates);
        } else {
          console.log('Sibling div containing certificates data not found.');
        }
      } else {
        console.log('Certificates container with ID "licenses_and_certifications" not found.');
      }

      // Prepare and send response data
      const data = { 
          name, 
          experiences, 
          education,
         summary,
          certificates
        };
      console.log('Data Extraction Complete:', data);
      sendResponse({ success: true, data });
    } catch (error) {
      console.error('Error extracting data:', error);
      sendResponse({ success: false, error: error.message });
    }

    return true;
  }

  if (request.action === 'autoFill') {
    console.log('Starting auto-fill process...');
    try {
      fillForm(request.data);
      sendResponse({ status: 'Form filled successfully.' });
    } catch (error) {
      console.error('Error filling form:', error);
      sendResponse({ status: 'Error filling form.', error: error.message });
    }

    return true;
  }
});

// Utility Functions

function getLabelText(input) {
  const label = input.labels && input.labels[0];
  if (label) return label.innerText || label.textContent;

  const id = input.id;
  if (id) {
    const labelElement = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    return labelElement ? labelElement.innerText || labelElement.textContent : '';
  }

  return '';
}

function matchesField(fieldNames, ...attributes) {
  return fieldNames.some((fieldName) => attributes.some((attr) => attr.includes(fieldName.toLowerCase())));
}

function fillForm(data) {
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([disabled]), textarea, select');

  inputs.forEach((input) => {
    const nameAttr = (input.name || '').toLowerCase();
    const idAttr = (input.id || '').toLowerCase();
    const placeholderAttr = (input.placeholder || '').toLowerCase();
    const labelText = (getLabelText(input) || '').toLowerCase();

    if (data.name && matchesField(['name', 'full name'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.name;
    } else if (data.experiences && data.experiences.length > 0 && matchesField(['experience'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.experiences.map((exp) => `${exp.jobTitle} at ${exp.company}`).join('\n');
    } else if (data.education && data.education.length > 0 && matchesField(['education'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.education.map((edu) => `${edu.university} (${edu.degreeMajor || ''})`).join('\n');
    } else if (data.summary && matchesField(['summary', 'about me'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.summary;
    } else if (data.certificates && data.certificates.length > 0 && matchesField(['certificates', 'certification'], nameAttr, idAttr, placeholderAttr, labelText)) {
      const certificatesText = data.certificates.map(cert => {
        let certStr = cert.certificateName || '';
        if (cert.issuingOrganization) {
          certStr += ` from ${cert.issuingOrganization}`;
        }
        if (cert.dateText) {
          certStr += ` (${cert.dateText})`;
        }
        return certStr;
      }).join('\n');
      input.value = certificatesText;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    else if (data.coverLetter && matchesField(['cover letter', 'motivation letter', 'letter'], nameAttr, idAttr, placeholderAttr, labelText)) {
      input.value = data.coverLetter;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    else if (data.customFields && Array.isArray(data.customFields)) {
      data.customFields.forEach(field => {
        const key = field.key.toLowerCase();
        if (key && field.value && matchesField([key], nameAttr, idAttr, placeholderAttr, labelText)) {
          input.value = field.value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }


    // Trigger change event to ensure the input is recognized
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  console.log('Form filled successfully.');
}