document.addEventListener('DOMContentLoaded', () => {
    const genderInput = document.getElementById('genderInput');
    const roleInput = document.getElementById('roleInput');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Load saved filters
    chrome.storage.sync.get(['fetFilters', 'fetRoles'], (result) => {
        if (result.fetFilters && result.fetFilters.length > 0) {
            genderInput.value = result.fetFilters.join(', ');
        } else {
            // Default genders
            genderInput.value = 'M, CD/TV';
        }

        if (result.fetRoles && result.fetRoles.length > 0) {
            roleInput.value = result.fetRoles.join(', ');
        } else {
            // Default roles (empty by default)
            roleInput.value = '';
        }
    });

    // Save on click
    saveBtn.addEventListener('click', () => {
        const rawGenders = genderInput.value;
        const rawRoles = roleInput.value;

        // Clean up arrays
        const filters = rawGenders.split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        const roles = rawRoles.split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        // Save to storage
        chrome.storage.sync.set({
            fetFilters: filters,
            fetRoles: roles
        }, () => {
            statusDiv.textContent = 'Saved successfully! Reload Fetlife to apply changes.';

            setTimeout(() => {
                statusDiv.textContent = '';
            }, 3000);
        });
    });
});
