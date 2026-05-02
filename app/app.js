const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

function showAlert(strIcon, strTitle, strText) {
    return showAlert.fire({
        icon: strIcon,
        title: strTitle,
        text: strText
    })
}

$(document).ready(function() {
    $('#chkCurrentlyWorking').on('change', function() {
        if ($(this).is(':checked')) {
            $('#txtEndDate').val('').prop('disabled', true);
        } else {
            $('#txtEndDate').prop('disabled', false);
        }
    });
})

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
                <div class="card bg-secondary text-white job-badge" data-job='${JSON.stringify(objJobData)}'>
                    <div class="card-body p-2 d-flex justify-content-between align-items-center">
                        <span><strong>${objJobData.strTitle}</strong> at ${objJobData.strCompany}</span>
                        <button type="button" class="btn-close btn-close-white remove-job"></button>
                    </div>
                </div>`;

            $('#jobsContainer').append(strJobBadge);
            
            // Clear inputs for the next job entry
            $('#jobInputArea input, #jobInputArea textarea').val('');
            $('#chkCurrentlyWorking').prop('checked', false);
            $('#txtEndDate').prop('disabled', false);
        }
    });

    $(document).on('click', '.remove-job', function() {
        $(this).closest('.job-badge').remove();
    });
});

$(document).ready(function() {
    $('#btnAddSkill').on('click', function() {
        const strSkillValue = $('#txtSkillInput').val().trim();

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

    $(document).on('click', '.remove-skill', function() {
        $(this).parent('.skill-badge').remove();
    });
});

$(document).ready(function() {
    $('#btnAddCertsAwards').on('click', function() {
        const strCertsAwardsValue = $('#txtCertsAwardsInput').val().trim();

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

    $(document).on('click', '.remove-certsAwards', function() {
        $(this).closest('span').remove(); 
    });
});

function collectFormData() {
    return {
        strFirstName: $('#txtFirstName').val().trim(),
        strLastName: $('#txtLastName').val().trim(),
        strEmail: $('#txtEmail').val().trim(),
        strPhone: $('#txtPhone').val().trim(),
        strAddress: $('#txtAddress').val().trim(),
        strLinkedIn: $('#txtLinkedIn').val().trim(),
        strGitHub: $('#txtGitHub').val().trim(),

        arrWorkExperience: $('.job-badge').map(function() {
            return $(this).contents().get(0).nodeValue.trim()
        }).get(),

        arrSkills: $('.skill-badge').map(function() {
            return $(this).contents().get(0).nodeValue.trim()
        }).get(),

        arrCertsAwards: $('.cert-badge').map(function() {
            return $(this).contents().get(0).nodeValue.trim()
        }).get(),

        strAppliedJob: $('#txtAppliedJobDescription').val().trim()
    }
}

function validateFormData(objData) {
    if(!objData.strFirstName) {
        return 'Please enter your first name.'
    } else if(!objData.strLastName) {
        return 'Please enter your last name.'
    } else if(!objData.strEmail) {
        return 'Please enter your email address.'
    } else if(!regEmail.test(objData.strEmail)) {
        return 'Please enter a valid email address.'
    } else {
        return null
    }
}