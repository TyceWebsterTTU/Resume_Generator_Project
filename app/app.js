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