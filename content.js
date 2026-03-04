let timeout = null;
let currentFilters = ['M', 'CD/TV']; // Fallback genders
let currentRoles = []; // Fallback roles

// 1. Load initial filters from storage
function loadFiltersAndStart() {
    chrome.storage.sync.get(['fetFilters', 'fetRoles'], (result) => {
        if (result.fetFilters && result.fetFilters.length > 0) {
            currentFilters = result.fetFilters;
        }
        if (result.fetRoles) {
            currentRoles = result.fetRoles;
        }
        console.log("[FetFilter] Loaded filters - Genders:", currentFilters, "Roles:", currentRoles);

        // Start initial check with slight delay for React
        setTimeout(() => {
            console.log("[FetFilter] Initial start...");
            hideSpecificDivs();
        }, 1500);
    });
}

// 2. Listen for setting changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        let changed = false;

        if (changes.fetFilters) {
            currentFilters = changes.fetFilters.newValue || [];
            changed = true;
        }

        if (changes.fetRoles) {
            currentRoles = changes.fetRoles.newValue || [];
            changed = true;
        }

        if (changed) {
            console.log("[FetFilter] Filters updated live - Genders:", currentFilters, "Roles:", currentRoles);
            hideSpecificDivs();
        }
    }
});

function hideSpecificDivs() {
    if (currentFilters.length === 0 && currentRoles.length === 0) {
        console.log("[FetFilter] No filters configured - skipping.");
        return;
    }

    const targetDivs = document.querySelectorAll('div.w-full.flex-none.px-1');
    let candidatesFound = 0;
    let hiddenCount = 0;
    let alreadyHidden = 0;

    // Build Regex for Genders
    let genderRegex = null;
    if (currentFilters.length > 0) {
        const escapedFilters = currentFilters.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        // Example: \d{1,3}(M|CD\/TV)
        genderRegex = new RegExp(`\\d{1,3}(${escapedFilters.join('|')})`);
    }

    // Build Regex for Roles
    let roleRegex = null;
    if (currentRoles.length > 0) {
        const escapedRoles = currentRoles.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        // We look for a standalone word that matches the role, e.g. "Switch"
        roleRegex = new RegExp(`\\b(${escapedRoles.join('|')})\\b`, 'i'); // 'i' for case-insensitive
    }

    targetDivs.forEach(div => {
        if (div.className && typeof div.className === 'string' && div.className.includes('md:w-1/2')) {
            candidatesFound++;

            if (div.style.display === 'none') {
                alreadyHidden++;
                return;
            }

            const text = div.textContent || "";
            let shouldHide = false;

            // Check if gender matches
            if (genderRegex && genderRegex.test(text)) {
                shouldHide = true;
            }

            // Check if role matches
            if (roleRegex && roleRegex.test(text)) {
                shouldHide = true;
            }

            if (shouldHide) {
                div.style.display = 'none';
                hiddenCount++;
                console.log(`[FetFilter] HIDE:`, text.replace(/\s+/g, ' ').substring(0, 80).trim(), div);
            }
        }
    });

    console.log(`[FetFilter] Scan Info: ${targetDivs.length} Divs | ${candidatesFound} md:w-1/2 | ${hiddenCount} hidden (New) | ${alreadyHidden} already hidden.`);
}

function debouncedHide() {
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
        hideSpecificDivs();
    }, 800);
}

// Start
loadFiltersAndStart();

const observer = new MutationObserver(() => {
    debouncedHide();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log("[FetFilter] Script injected and storage ready.");
