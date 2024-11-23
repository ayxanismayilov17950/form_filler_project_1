chrome.storage.local.get(['fieldMappings', 'linkedinData'], (result) => {
    const fieldMappings = result.fieldMappings || {};
    const linkedinData = result.linkedinData || {};

    for (const [linkedinField, formField] of Object.entries(fieldMappings)) {
        const formElement = document.querySelector(`[name="${formField}"], [id="${formField}"]`);
        if (formElement && linkedinData[linkedinField]) {
            formElement.value = linkedinData[linkedinField]; // Fill the field with the LinkedIn data
        }
    }
});

// Function to extract LinkedIn profile data
function extractLinkedInData() {
    const profileData = {};

    // Get profile name (Header section)
    const name = document.querySelector('h1.text-heading-xlarge');
    if (name) profileData.name = name.textContent.trim();

    // Get profile job title (Header section)
    const jobTitle = document.querySelector('div.text-body-medium');
    if (jobTitle) profileData.jobTitle = jobTitle.textContent.trim();

    // Get location (Header section)
    const location = document.querySelector('span.text-body-small');
    if (location) profileData.location = location.textContent.trim();

    // Get work experience (Experience section)
    const experienceList = [];
    const experiences = document.querySelectorAll('.pv-position-entity');
    experiences.forEach((experience) => {
        const title = experience.querySelector('.t-16.t-black.t-bold');
        const company = experience.querySelector('.t-14.t-black.t-normal');
        const timePeriod = experience.querySelector('.t-12.t-black--light');
        
        if (title && company) {
            experienceList.push({
                title: title.textContent.trim(),
                company: company.textContent.trim(),
                timePeriod: timePeriod ? timePeriod.textContent.trim() : ''
            });
        }
    });
    if (experienceList.length > 0) profileData.experience = experienceList;

    // Get education details (Education section)
    const educationList = [];
    const educations = document.querySelectorAll('.pv-education-entity');
    educations.forEach((education) => {
        const school = education.querySelector('.pv-entity__school-name');
        const degree = education.querySelector('.pv-entity__degree-name');
        const timePeriod = education.querySelector('.pv-entity__dates');

        if (school) {
            educationList.push({
                school: school.textContent.trim(),
                degree: degree ? degree.textContent.trim() : '',
                timePeriod: timePeriod ? timePeriod.textContent.trim() : ''
            });
        }
    });
    if (educationList.length > 0) profileData.education = educationList;

    // Get skills (Skills & Endorsements section)
    const skills = [];
    const skillElements = document.querySelectorAll('.pv-skill-category-entity__name');
    skillElements.forEach((skill) => {
        skills.push(skill.textContent.trim());
    });
    if (skills.length > 0) profileData.skills = skills;

    // Store the extracted data in chrome storage
    chrome.storage.local.set({ linkedinData: profileData }, () => {
        console.log('LinkedIn data saved:', profileData);
    });
}

// Execute the extraction function when the content script is loaded
extractLinkedInData();
