// For email validation
const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

// Custom function to all me to easily call my swalFire alerts throughout my project
function showAlert(strIcon, strTitle, strText) {
    return Swal.fire({
        icon: strIcon,
        title: strTitle,
        text: strText
    })
}

// Checks if the user checks off the Currently Working button and disables the End Date function if it is checked
$(document).ready(function() {
    $('#chkCurrentlyWorking').on('change', function() {
        if ($(this).is(':checked')) {
            $('#txtEndDate').val('').prop('disabled', true);
        } else {
            $('#txtEndDate').prop('disabled', false);
        }
    });
})

// Function that records the work experience data and generates a small card showing the data has been inputted on the form
$(document).ready(function() {
    $('#btnAddJob').on('click', function() {
        // Create an object for this specific job
        const objJobData = {
            strTitle:    $('#txtJobTitle').val().trim(),
            strCompany:  $('#txtCompany').val().trim(),
            strDesc:     $('#txtJobDescription').val().trim(),
            strLocation: $('#txtJobLocation').val().trim(),
            strStart:    $('#txtStartDate').val().trim(),
            strEnd:      $('#chkCurrentlyWorking').is(':checked') ? 'Present' : $('#txtEndDate').val().trim()
        };

        if (objJobData.strTitle && objJobData.strCompany) {
            // Create a "Job Card" badge that stores the data as a JSON string
            const strJobBadge = `
                <div class="card bg-primary text-white job-badge" data-job='${JSON.stringify(objJobData)}'>
                    <div class="card-body p-2 d-flex justify-content-between align-items-center">
                        <span><strong>${objJobData.strTitle}</strong> at ${objJobData.strCompany}</span>
                        <button type="button" class="btn-close btn-close-white remove-job"></button>
                    </div>
                </div>`;

            $('#jobContainer').append(strJobBadge);
            
            // Clear inputs for the next job entry
            $('#jobInputArea input, #jobInputArea textarea').val('');
            $('#chkCurrentlyWorking').prop('checked', false);
            $('#txtEndDate').prop('disabled', false);
        }
    });
    // Removes a job if a user chooses to do so
    $(document).on('click', '.remove-job', function() {
        $(this).closest('.job-badge').remove();
    });
});

// Function that records the skills data and generates a small card showing the data has been inputted on the form
$(document).ready(function() {
    $('#btnAddSkill').on('click', function() {
        // Create an object for this specific skill
        const strSkillValue = $('#txtSkillInput').val().trim();

        // Create a "Skill Card" badge that stores the data as a JSON string
        if (strSkillValue !== "") {
            const objSkillBadge = `
                <span class="badge bg-primary d-flex align-items-center p-2 skill-badge">
                    ${strSkillValue}
                    <button type="button" class="btn-close btn-close-white ms-2 remove-skill" style="font-size: 0.5rem;"></button>
                </span>
            `;

            $('#skillsContainer').append(objSkillBadge);
            $('#txtSkillInput').val('').focus();
        }
    });

    $('#txtSkillInput').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            $('#btnAddSkill').click();
        }
    });
    // Removes a skill if a user chooses to do so
    $(document).on('click', '.remove-skill', function() {
        $(this).parent('.skill-badge').remove();
    });
});

// Function that records the certification/awards data and generates a small card showing the data has been inputted on the form
$(document).ready(function() {
    $('#btnAddCertsAwards').on('click', function() {
        // Create an object for this specific certification/award
        const strCertsAwardsValue = $('#txtCertsAwardsInput').val().trim();

        // Create a "Certification/Award Card" badge that stores the data as a JSON string
        if (strCertsAwardsValue !== "") {
            const objCertsAwardsBadge = `
                <span class="badge bg-primary d-flex align-items-center p-2 cert-badge">
                    ${strCertsAwardsValue}
                    <button type="button" class="btn-close btn-close-white ms-2 remove-certsAwards" style="font-size: 0.5rem;"></button>
                </span>
            `;

            $('#certsAwardsContainer').append(objCertsAwardsBadge);
            $('#txtCertsAwardsInput').val('').focus();
        }
    });

    $('#txtCertsAwardsInput').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            $('#btnAddCertsAwards').click();
        }
    });

    // Removes a certification/award if a user chooses to do so
    $(document).on('click', '.remove-certsAwards', function() {
        $(this).closest('span').remove(); 
    });
});

// Function that returns all the data collected in the form. This makes inputting the data into the AI prompt much easier to manage
function collectFormData() {
    return {
        strFirstName: $('#txtFirstName').val().trim(),
        strLastName: $('#txtLastName').val().trim(),
        strEmail: $('#txtEmail').val().trim(),
        strPhone: $('#txtPhone').val().trim(),
        strAddress: $('#txtAddress').val().trim(),
        strLinkedIn: $('#txtLinkedIn').val().trim(),
        strGitHub: $('#txtGitHub').val().trim(),

        // Maps all the data from the array for work experience
        arrWorkExperience: $('.job-badge').map(function() {
            return $(this).data('job'); 
        }).get(),
        // Maps all the data from the array for skills
        arrSkills: $('.skill-badge').map(function() {
            return $(this).contents().get(0).nodeValue.trim()
        }).get(),
        // Maps all the data from the array for certifications/awards
        arrCertsAwards: $('.cert-badge').map(function() {
            return $(this).contents().get(0).nodeValue.trim()
        }).get(),

        strAppliedJob: $('#txtAppliedJobDescription').val().trim()
    }
}

// Function to validate the information being sent to the AI prompt
function validateFormData(objData) {
    if(!objData.strFirstName) {
        return 'Please enter your first name.'
    } else if(!objData.strLastName) {
        return 'Please enter your last name.'
    } else if(!objData.strEmail) {
        return 'Please enter your email address.'
    } else if(!regEmail.test(objData.strEmail)) { // Validates the email address is valid
        return 'Please enter a valid email address.'
    } else if (!objData.arrWorkExperience || objData.arrWorkExperience == 0) {
        return 'Please add some work experience.'
    } else if (!objData.arrSkills || objData.arrSkills == 0) {
        return 'Please add some skills.'
    } else if (!objData.arrCertsAwards || objData.arrCertsAwards == 0) {
        return 'Please add some awards or certifications.'
    } else {
        return null // All data is valid and this needs to return nothing
    }
}

// This function will grab the resume generated from the AI and make it downloadable to the browser
// AI was used to better understand how this function will work
function downloadPdf(bufPdf, strFirst, strLast) {
    const strFileName = `${strFirst.replace(/\s+/g,'_')}_${strLast.replace(/\s+/g,'_')}_Resume.pdf`;

    // Create a Blob (binary large object) from the PDF buffer
    const objBlob = new Blob([bufPdf], { type: 'application/pdf' });
    const strBlobUrl = URL.createObjectURL(objBlob);

    // Creates tag to trigger the download
    const elLink = document.createElement('a');
    elLink.href = strBlobUrl
    elLink.download = strFileName
    elLink.style.display = 'none'
    document.body.appendChild(elLink)
    elLink.click()

    // Cleanup
    document.body.removeChild(elLink)
    URL.revokeObjectURL(strBlobUrl)
}

// Generates the resume from the API in server.js
async function generateResume() {
    // Sets this object to all the data collected from the form
    const objFormData = collectFormData()
    // Validates all the data in the form and gives the associated sweetAlert
    const strValidationErr = validateFormData(objFormData)
    if(strValidationErr) {
        showAlert('warning', 'Missing Information', strValidationErr)
        return
    }

    try {
        // Post the data to the backend API to generate the resume
        const objResponse = await fetch('http://localhost:8000/generate', {
            method: 'POST',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(objFormData)
        })
        // Error handling
        if (!objResponse.ok) {
            const strContentType = objResponse.headers.get("content-type")
            if (strContentType && strContentType.indexOf("application/json") !== -1) {
                const objErr = await objResponse.json()
                showAlert('error', 'Generation Failed', objErr.message || 'Server error.')
            } else {
                const strErrText = await objResponse.text()
                showAlert('error', 'Generation Failed', strErrText)
            }
            return
        }
        // Gets the response and initiates the download
        const bufPdf = await objResponse.arrayBuffer()
 
        downloadPdf(bufPdf, objFormData.strFirstName, objFormData.strLastName)

        showAlert('success', 'Resume Ready', `Your resume has been downloaded as ${objFormData.strFirstName}_${objFormData.strLastName}_Resume.pdf`)
    } catch (err) {
        console.error("Error:", err)
        showAlert('error', 'Generation Failed', err)
    }
}