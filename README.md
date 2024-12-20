Auto Filler Extension

The Auto Filler extension allows users to manage, save, and automatically fill in profile data (like name, experiences, education, and custom fields) into web forms. It supports creating and managing multiple profiles, exporting/importing profile data in JSON format, extracting data from LinkedIn, generating cover letters via the Gemma-2 API, and even sending exported data via email.

Features:
- Profile Management: Create, edit, delete, and save multiple user profiles.
- Auto-Fill: Automatically fill in form fields (such as name, experiences, education, etc.) using stored profile data.
- Custom Fields: Add custom fields to each profile to store additional user-specific data.
- Export/Import Profiles: Export all profiles to a JSON file, and import profiles from a JSON file.
- LinkedIn Data Extraction: Extract user profile data from LinkedIn pages for auto-filling.
- Email Export: Export profile data to a JSON file and automatically pre-fill an email with a message and the file attached.
- Cover Letter Generation: Automatically generate a cover letter using the Gemma-2 API (via RapidAPI) based on the user's profile data, job title, and company name.
- History Restoring: Backup and restore previous versions of your profiles, track changes over time, and easily revert to earlier data states using restore points and version control. Ensure data integrity with automatic verification checks after restoration.
  
Installation Instructions:
1. Load the Extension in Chrome:
- Open Chrome and navigate to chrome://extensions/.
- Enable Developer Mode in the top-right corner.
- Click Load Unpacked and select the folder where you downloaded or cloned the extension.
2. Verify Installation:
- After loading, the extension icon should appear in the Chrome toolbar.

Features and Usage:
1. Creating and Managing Profiles
Create a New Profile:
- Click the extension icon.
- Click the Add New Profile button.
- Enter a profile name and save it.
Edit Profile Data:
- Select a profile from the dropdown menu.
- Enter details for Name, Experience, Education, Summary, and Custom Fields.
- Click Save to store the changes.
Delete a Profile:
- Select the profile you want to delete.
- Click Delete Profile to remove it (at least one profile must exist).

2. Auto-Fill Forms
- Select a profile from the dropdown.
- Click Auto-Fill to automatically fill in fields on the current web page.
- Ensure the form fields on the page are labeled with recognizable attributes (e.g., name, experience, education).

3. Custom Fields
- You can add custom fields (e.g., phone numbers, addresses) to your profile.
- Click Add Custom Field, enter a name and value, and click Save to add the field.
- These fields are included when the profile is saved or auto-filled.

4. Export and Import Data
Export Profiles:
- Click Export Data to download a .json file containing all profiles.
- You can share this file or store it as a backup.
Import Profiles:
- Click Import Data, select a .json file, and decide whether to merge the data or replace the existing profiles.

5. Extract Data from LinkedIn
- Go to a LinkedIn profile page.
- Click Extract Data to scrape data (e.g., name, experience, education) from the LinkedIn page.
- The data will be populated into the form fields and can be saved as part of a profile.

6. Email Export
- Click Send Email to export profile data and pre-fill an email with instructions to attach the .json file for sharing.
- The extension will automatically download the .json file and open the default email client with a message pre-filled.

7. Cover Letter Generation
Generate a Cover Letter:
- After creating a profile with the necessary data (Name, Experience, Education, Skills), click the Generate Cover Letter button.
- Enter the job title and company name for the position you are applying for.
- The extension will generate a professional cover letter using the Gemma-2 API via RapidAPI based on the user's background.
- The generated cover letter will be displayed in a text area, where it can be edited or saved to the profile.

8. History Restoring
Create Backups:
- Automatically or manually create backups of your profiles to ensure your data is protected.
Restore from Backup:
- Access the History Restore section to select a backup or restore point and revert your profile data to a previous version.
Track Changes:
- Profiles are versioned, and you can track updates over time. You can easily restore to any earlier version of a profile.
Export and Import Backups:
- Export backups to .json files for external storage and import them back into the extension to recover specific profile versions.
Data Integrity Checks:
- After restoring a profile, the system automatically verifies the data to ensure accuracy and consistency.

Permissions:
The extension requests the following permissions
- storage: To store profile data locally in Chrome.
- tabs: To interact with and autofill web forms on active tabs.
- activeTab: To access the currently active tab for autofilling and data extraction.
- mailto: To pre-fill email messages with instructions for sending exported profile data.
- popup.js: Contains all the logic for managing profiles, handling form filling, custom fields, data export/import, and interactions with the content script (injected into the web pages).
- content.js: Responsible for interacting with the web pages for auto-filling form fields and extracting data (referenced in the popup.js but not provided here).
- manifest.json: Contains metadata, permissions, and other configuration settings for the extension.

How It Works:
1. Profile Data Storage: All profile data is stored in Chrome's local storage and can be accessed and modified by the extension. Profiles are stored as JavaScript objects, which include the profile name, experiences, education, summary, and custom fields.
2. Auto-Filling Forms: When the user clicks the Auto-Fill button, the extension attempts to inject the content.js script into the active tab. This script uses the stored profile data to fill in the form fields. It works best on forms with commonly recognized field names (e.g., name, email, education).
3. LinkedIn Data Extraction: When extracting data from LinkedIn, the extension uses the content.js script to scrape relevant information from the page (e.g., job titles, companies, education). This data is then pre-filled into the form fields for the user to save or auto-fill elsewhere.
4. Cover Letter Generation: The cover letter is generated by sending a request to the Gemma-2 API via RapidAPI. It combines the user's profile data (Name, Education, Experience, Skills) with the job title and company name entered by the user to create a tailored cover letter. The response is displayed in the text area, and the letter can be saved as part of the user's profile.
5. Exporting Data: Profiles can be exported to a .json file. This file can be saved, shared, or imported back into the extension. The export function generates a JSON string from the stored profiles and creates a downloadable file.
6. History Restoring: Whenever a profile is updated, the extension automatically creates a backup of the current profile data. You can also manually create backups at any time. The extension tracks the history of profile changes, allowing you to set restore points. You can easily revert profiles to a previous state by selecting a specific restore point. The profiles are versioned, and each update is logged. This allows users to view the history of changes and restore a profile to any previous version. Users can export profile backups as .json files and store them externally. Backups can be imported back into the extension at any time to recover a previous state or restore lost data. After restoring a backup, the system verifies the integrity of the restored data to ensure it is consistent and accurate.

Troubleshooting:
Auto-Fill Not Working
- Ensure the form fields on the target website use recognizable field names such as name, experience, education, and other relevant attributes.
- Check the permissions in the manifest.json to ensure they are correctly set up.
Extracting Data from LinkedIn:
- Make sure you are on a LinkedIn profile page when using the Extract Data function.
- If no data is extracted, check that the profile contains the necessary fields such as name, job title, and education.
Importing/Exporting Profiles:
- If there are issues with importing, ensure the JSON file is properly formatted.
- When exporting, check that the download completes and that the file is in the correct .json format.

Conclusion:
Thank you for using the Auto Filler Extension! We hope this tool helps streamline your workflow by automating tedious form filling and enhancing your job application process with personalized cover letters. Whether you're managing multiple profiles or extracting data from LinkedIn, our extension is designed to save you time and make the process seamless.

If you encounter any issues, have suggestions for improvement, or want to contribute to the project, feel free to open an issue or submit a pull request on our GitHub repository.

We’re continuously improving the extension, so stay tuned for future updates and new features!

Happy autofilling and good luck with your applications! 🚀








