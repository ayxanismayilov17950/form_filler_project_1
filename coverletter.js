// Function to generate the cover letter using the Gemma-2 API via RapidAPI
async function createCoverLetter(data, companyName, jobTitle) {
    // Simple validation
    // if (!jobTitle || !companyName) {
    //     alert("Please enter both job title and company name.");
    //     return;
    // }
  
    // Show loading message in the textarea
    document.getElementById('cover-letter').value = "Generating cover letter... Please wait.";
  
    // Create the prompt for the API request, including applicant's background
    const prompt = `Write a professional cover letter for the position of ${jobTitle} at ${companyName}.
  
  Applicant's Background:
  - Name: ${data.name || 'Your Name'}
  - Education: ${data.education && data.education.length > 0 ? data.education[0].degreeMajor : 'Your Degree/Major'}
  - Experience: ${data.experiences && data.experiences.length > 0 ? data.experiences[0].jobTitle + ' at ' + data.experiences[0].company : 'Your Experience'}
  - Skills: ${data.skills ? data.skills.join(', ') : 'Your Skills'}
  
  Include why you are interested in the position and how your background makes you a suitable candidate. The letter should be concise and tailored to the job.`;
  
    // Prepare the data for the API request
    const dataToSend = JSON.stringify({
        model: 'gemma-2-27b',  // Model you are using
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    });
  
    try {
      // Make the API call using fetch
      const response = await fetch('https://google-gemma-2.p.rapidapi.com/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'x-rapidapi-key': 'cada3f0d9fmsh04cf30ad783478ap177b03jsn3c88274e5c0f',
              'x-rapidapi-host': 'google-gemma-2.p.rapidapi.com',
          },
          body: dataToSend,
      });
  
        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = 'API request failed';
            if (errorData && errorData.message) {
                errorMessage += ': ' + errorData.message;
            }
            throw new Error(errorMessage);
        }
  
        const json = await response.json();
        if (json && json.choices && json.choices.length > 0) {
            const coverLetter = json.choices[0].message.content.trim();
            document.getElementById('cover-letter').value = coverLetter;
  
            // Save the cover letter to the profile data
            data.coverLetter = coverLetter;
            profiles[selectedProfileIndex].data = data;
            chrome.storage.local.set({ profiles: profiles });
            showMessage('Cover letter generated successfully.');
        } else {
            throw new Error('No response from the API');
        }
    } catch (error) {
        console.error('Error generating cover letter:', error);
        alert('Error generating cover letter: ' + error.message);
        document.getElementById('cover-letter').value = 'Sorry, there was an issue generating the cover letter.';
    }
  }