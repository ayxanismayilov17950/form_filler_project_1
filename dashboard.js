document.addEventListener("DOMContentLoaded", () => {
    const applicationTable = document.getElementById("application-table").querySelector("tbody");
    const modal = document.getElementById("application-modal");
    const form = document.getElementById("application-form");
    const addButton = document.getElementById("add-application-btn");
    const closeModal = document.querySelector(".close");
  
    // Fetch saved applications from Chrome storage
    function fetchApplications() {
      chrome.storage.local.get("applications", (data) => {
        const applications = data.applications || [];
        renderTable(applications);
      });
    }
  
    // Render applications in the table
    function renderTable(applications) {
      applicationTable.innerHTML = "";
      applications.forEach((app, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${app.company}</td>
          <td>${app.jobTitle}</td>
          <td>${app.dateApplied}</td>
          <td>${app.status}</td>
          <td>
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </td>
        `;
        applicationTable.appendChild(row);
      });
    }
  
    // Save applications to Chrome storage
    function saveApplications(applications) {
      chrome.storage.local.set({ applications });
    }
  
    // Open modal for adding/editing applications
    addButton.addEventListener("click", () => {
      modal.style.display = "block";
      form.reset();
      form.dataset.editIndex = "";
    });
  
    // Close modal
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newApplication = {
        company: form.company.value,
        jobTitle: form["job-title"].value,
        dateApplied: form["date-applied"].value,
        status: form.status.value,
      };
  
      chrome.storage.local.get("applications", (data) => {
        const applications = data.applications || [];
        if (form.dataset.editIndex) {
          // Edit existing application
          applications[form.dataset.editIndex] = newApplication;
        } else {
          // Add new application
          applications.push(newApplication);
        }
        saveApplications(applications);
        fetchApplications();
        modal.style.display = "none";
      });
    });
  
    // Handle edit and delete actions
    applicationTable.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-btn")) {
        const index = e.target.dataset.index;
        chrome.storage.local.get("applications", (data) => {
          const app = data.applications[index];
          form.company.value = app.company;
          form["job-title"].value = app.jobTitle;
          form["date-applied"].value = app.dateApplied;
          form.status.value = app.status;
          form.dataset.editIndex = index;
          modal.style.display = "block";
        });
      } else if (e.target.classList.contains("delete-btn")) {
        const index = e.target.dataset.index;
        chrome.storage.local.get("applications", (data) => {
          const applications = data.applications || [];
          applications.splice(index, 1);
          saveApplications(applications);
          fetchApplications();
        });
      }
    });
  
    // Initial fetch
    fetchApplications();
  });
  