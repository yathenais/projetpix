// Add modal and emoji selection functionality to the script.js

// Get modal elements
const activityModal = document.getElementById('activity-modal');
const closeModalButtons = document.querySelectorAll('.close-modal, .close-modal-btn');
const saveActivityBtn = document.getElementById('save-activity');
const activityNameInput = document.getElementById('activity-name');
const selectedEmojiInput = document.getElementById('selected-emoji');
const emojiOptions = document.querySelectorAll('.emoji-option');

// Make sure we can access the global activities array
// This ensures we're working with the same activities array across all files
let activities = [];

// Function to load activities from localStorage
function loadActivities() {
    try {
        activities = JSON.parse(localStorage.getItem('activities')) || [];
        console.log("Activities loaded in modal.js:", activities.length);
    } catch (error) {
        console.error('Error loading activities in modal.js:', error);
        activities = [];
    }
}

// Icon type tab elements
const emojiTabButton = document.getElementById('emoji-tab-button');
const imageTabButton = document.getElementById('image-tab-button');
const emojiTabContent = document.getElementById('emoji-tab-content');
const imageTabContent = document.getElementById('image-tab-content');

// Image upload elements
const imageUploadInput = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const imageDataInput = document.getElementById('image-data');
const removeImageButton = document.getElementById('remove-image');
const imagePreviewContainer = document.querySelector('.image-preview-container');

// Variables to track current operation
let currentOperation = 'add';
let currentActivityId = null;
let currentStudentId = null;
let currentSlot = null;
let currentIconType = 'emoji'; // 'emoji' or 'image'

// Setup emoji selector functionality
emojiOptions.forEach(option => {
    option.addEventListener('click', function() {
        // Remove selected class from all options
        emojiOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        this.classList.add('selected');
        
        // Update the selected emoji input
        selectedEmojiInput.value = this.getAttribute('data-emoji');
    });
});

// Setup icon type tabs
emojiTabButton.addEventListener('click', function() {
    emojiTabButton.classList.add('active');
    imageTabButton.classList.remove('active');
    emojiTabContent.classList.add('active');
    imageTabContent.classList.remove('active');
    currentIconType = 'emoji';
});

imageTabButton.addEventListener('click', function() {
    imageTabButton.classList.add('active');
    emojiTabButton.classList.remove('active');
    imageTabContent.classList.add('active');
    emojiTabContent.classList.remove('active');
    currentIconType = 'image';
});

// Handle image upload
imageUploadInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Show image preview
            imagePreview.src = e.target.result;
            // Explicitly store the data URL in the hidden input
            imageDataInput.value = e.target.result;
            console.log("Image loaded, data length:", e.target.result.length);
            
            imagePreviewContainer.classList.add('has-image');
            removeImageButton.disabled = false;
        };
        
        reader.readAsDataURL(file);
    }
});

// Handle remove image button
removeImageButton.addEventListener('click', function() {
    // Reset image preview and data
    imagePreview.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDEwIDIxIDMgMTUiPjwvcG9seWxpbmU+PC9zdmc+';
    imageDataInput.value = '';
    imagePreviewContainer.classList.remove('has-image');
    removeImageButton.disabled = true;
    imageUploadInput.value = '';
});

// Close modal when close button is clicked
closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
        activityModal.style.display = 'none';
    });
});

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target === activityModal) {
        activityModal.style.display = 'none';
    }
});

// Completely replace the save activity functionality
// Remove old event listeners by creating a new function in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the save button and remove all existing listeners by replacing it
    const saveBtn = document.getElementById('save-activity');
    if (saveBtn) {
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        // Add new event listener
        newSaveBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log("Save button clicked");
            
            // Get fresh activities data
            let activities = [];
            try {
                activities = JSON.parse(localStorage.getItem('activities')) || [];
            } catch (error) {
                console.error('Error loading activities:', error);
                activities = [];
            }
            
            const activityName = activityNameInput.value.trim();
            
            if (!activityName) {
                alert('Please enter an activity name');
                return;
            }
            
            // Get icon data based on the selected tab
            let emoji = null;
            let imageData = null;
            
            if (currentIconType === 'emoji') {
                emoji = selectedEmojiInput.value;
                console.log("Using emoji:", emoji);
            } else {
                imageData = imageDataInput.value;
                console.log("Using image, length:", imageData ? imageData.length : 0);
                
                if (!imageData) {
                    alert('Please select an image or switch to emoji');
                    return;
                }
            }
            
            if (currentOperation === 'add') {
                // Add new activity
                const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
                
                // Create new activity
                const newActivity = {
                    id: newId,
                    name: activityName
                };
                
                if (imageData) {
                    newActivity.imageData = imageData;
                } else {
                    newActivity.emoji = emoji || '📝';
                }
                
                activities.push(newActivity);
                console.log("Added new activity:", newActivity);
                
                // If we're adding directly to a student's slot
                if (currentStudentId && currentSlot !== null) {
                    let tracking = JSON.parse(localStorage.getItem('tracking')) || {};
                    
                    if (!tracking[currentStudentId]) {
                        tracking[currentStudentId] = {};
                    }
                    
                    tracking[currentStudentId][currentSlot] = {
                        activityId: newId,
                        status: 'not-started'
                    };
                    
                    localStorage.setItem('tracking', JSON.stringify(tracking));
                }
            } else if (currentOperation === 'edit' && currentActivityId) {
                // Edit existing activity
                const index = activities.findIndex(a => a.id === currentActivityId);
                
                if (index !== -1) {
                    // Update the activity
                    const updatedActivity = {
                        id: currentActivityId,
                        name: activityName
                    };
                    
                    if (imageData) {
                        updatedActivity.imageData = imageData;
                    } else {
                        updatedActivity.emoji = emoji || '📝';
                    }
                    
                    activities[index] = updatedActivity;
                    console.log("Updated activity:", updatedActivity);
                } else {
                    console.error("Activity not found with ID:", currentActivityId);
                }
            }
            
            // Save activities to localStorage
            localStorage.setItem('activities', JSON.stringify(activities));
            
            // Close modal
            activityModal.style.display = 'none';
            
            // Refresh UI
            if (typeof window.renderTrackingTable === 'function') {
                window.renderTrackingTable();
            }
            
            if (typeof window.renderActivitiesTable === 'function') {
                window.renderActivitiesTable();
            }
            
            // Force page reload to make sure everything is updated
            location.reload();
        });
    }
});

// Open activity modal for adding a new activity
function openActivityModal(operation = 'add', activityId = null, studentId = null, slot = null) {
    console.log("Opening modal:", operation, activityId);
    
    // Store the operation and activity ID on the modal itself
    activityModal.setAttribute('data-operation', operation);
    activityModal.setAttribute('data-activity-id', activityId || '');
    activityModal.setAttribute('data-student-id', studentId || '');
    activityModal.setAttribute('data-slot', slot !== null ? slot : '');
    
    currentOperation = operation;
    currentActivityId = activityId;
    currentStudentId = studentId;
    currentSlot = slot;
    
    // Reset form
    activityNameInput.value = '';
    selectedEmojiInput.value = '📚';
    
    // Reset image upload
    imagePreview.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjY2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDEwIDIxIDMgMTUiPjwvcG9seWxpbmU+PC9zdmc+';
    imageDataInput.value = '';
    imagePreviewContainer.classList.remove('has-image');
    removeImageButton.disabled = true;
    imageUploadInput.value = '';
    
    // Default to emoji tab
    emojiTabButton.classList.add('active');
    imageTabButton.classList.remove('active');
    emojiTabContent.classList.add('active');
    imageTabContent.classList.remove('active');
    currentIconType = 'emoji';
    
    // Remove selected class from all emoji options
    emojiOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Select the first emoji by default
    document.querySelector('.emoji-option[data-emoji="📚"]').classList.add('selected');

    // Make the function available globally
    window.openActivityModal = openActivityModal;
    
    // If editing, populate form with activity data
    if (operation === 'edit' && activityId) {
        const activity = activities.find(a => a.id === activityId);
        if (activity) {
            console.log("Editing activity:", activity);
            activityNameInput.value = activity.name;
            
            // Check if activity has an image or emoji
            if (activity.imageData && activity.imageData.trim() !== '') {
                console.log("Editing activity with image, data length:", activity.imageData.length);
                
                // Switch to image tab
                imageTabButton.click();
                
                // Set image preview
                imagePreview.src = activity.imageData;
                // Ensure the hidden input is populated with the image data
                imageDataInput.value = activity.imageData;
                imagePreviewContainer.classList.add('has-image');
                removeImageButton.disabled = false;
            } else {
                // Use emoji
                console.log("Editing activity with emoji:", activity.emoji);
                const emojiToUse = activity.emoji || '📋';
                selectedEmojiInput.value = emojiToUse;
                
                // First, deselect all emojis
                emojiOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Then select the correct emoji
                const emojiOption = document.querySelector(`.emoji-option[data-emoji="${emojiToUse}"]`);
                if (emojiOption) {
                    emojiOption.classList.add('selected');
                    console.log("Selected emoji option:", emojiToUse);
                } else {
                    console.warn("Could not find emoji option for:", emojiToUse);
                    // Select the first emoji as fallback
                    const firstEmoji = document.querySelector('.emoji-option');
                    if (firstEmoji) {
                        firstEmoji.classList.add('selected');
                        selectedEmojiInput.value = firstEmoji.getAttribute('data-emoji');
                    }
                }
            }
        } else {
            console.error("Activity not found with ID:", activityId);
        }
    }
    
    // Show modal
    activityModal.style.display = 'block';
}

// Save activity when save button is clicked
saveActivityBtn.addEventListener('click', function(event) {
    // Prevent default form submission behavior
    event.preventDefault();
    
    console.log("Save button clicked. Operation:", currentOperation, "Activity ID:", currentActivityId);
    
    // Ensure we have the latest activities
    loadActivities();
    
    const activityName = activityNameInput.value.trim();
    
    if (!activityName) {
        alert('Please enter an activity name');
        return;
    }
    
    // Get icon data based on the selected tab
    let emoji = null;
    let imageData = null;
    
    if (currentIconType === 'emoji') {
        emoji = selectedEmojiInput.value;
        console.log("Saving with emoji:", emoji);
    } else {
        // Make sure we get the image data from the hidden input field
        imageData = imageDataInput.value;
        console.log("Saving with image, data length:", imageData ? imageData.length : 0);
        
        if (!imageData) {
            alert('Please select an image or switch to emoji');
            return;
        }
    }
    
    if (currentOperation === 'add') {
        // Add new activity
        const newId = addActivity(activityName, emoji, imageData);
        console.log("Added new activity with ID:", newId);
        
        // If we're adding directly to a student's slot
        if (currentStudentId && currentSlot !== null) {
            updateActivitySlot(currentStudentId, currentSlot, newId);
        }
    } else if (currentOperation === 'edit' && currentActivityId) {
        // Edit existing activity
        console.log("Editing activity with ID:", currentActivityId);
        editActivity(currentActivityId, activityName, emoji, imageData);
    } else {
        console.error("Invalid operation or missing activity ID");
    }
    
    // Close modal
    activityModal.style.display = 'none';
    
    // Force a page refresh if in the activities tab to ensure everything is updated
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab && activeTab.id === 'activities-button') {
        console.log("Refreshing activities table");
        if (typeof window.renderActivitiesTable === 'function') {
            window.renderActivitiesTable();
        }
    }
});

// Add activity function
function addActivity(name, emoji = null, imageData = null) {
    // Make sure we have the latest activities
    loadActivities();
    
    // Generate a new unique ID
    const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
    
    console.log("Adding new activity:", name, "with ID:", newId, emoji ? "with emoji" : "with image");
    
    // Create new activity object
    const newActivity = {
        id: newId,
        name: name
    };
    
    // Add either emoji or imageData (not both)
    if (imageData && imageData.trim() !== '') {
        console.log("Adding activity with image, data length:", imageData.length);
        newActivity.imageData = imageData;
        // Ensure emoji is not set when using an image
        delete newActivity.emoji;
    } else {
        console.log("Adding activity with emoji:", emoji);
        newActivity.emoji = emoji || '📝';
        // Ensure imageData is not set when using an emoji
        delete newActivity.imageData;
    }
    
    // Add to activities array
    activities.push(newActivity);
    
    // Save to localStorage
    saveData();
    
    // Refresh UI
    if (typeof window.renderTrackingTable === 'function') {
        window.renderTrackingTable();
    }
    
    if (typeof window.renderActivitiesTable === 'function') {
        window.renderActivitiesTable();
    }
    
    return newId;
}

// Edit activity function
function editActivity(id, name, emoji = null, imageData = null) {
    // Make sure we have the latest activities
    loadActivities();
    
    console.log("Editing activity:", id, name, emoji ? "with emoji" : "with image");
    
    const activityIndex = activities.findIndex(a => a.id === id);
    if (activityIndex !== -1) {
        // Update the activity by creating a new object
        const updatedActivity = {
            id: id,
            name: name
        };
        
        // Update either emoji or imageData (not both)
        if (imageData && imageData.trim() !== '') {
            console.log("Setting image data, length:", imageData.length);
            updatedActivity.imageData = imageData;
            // Ensure emoji is not set
            delete updatedActivity.emoji;
        } else {
            console.log("Setting emoji:", emoji);
            updatedActivity.emoji = emoji || '📝';
            // Ensure imageData is not set
            delete updatedActivity.imageData;
        }
        
        // Replace the activity in the array
        activities[activityIndex] = updatedActivity;
        
        // Save to localStorage
        saveData();
        
        // Refresh UI
        if (typeof window.renderTrackingTable === 'function') {
            window.renderTrackingTable();
        }
        
        // If activities table exists, refresh it
        if (typeof window.renderActivitiesTable === 'function') {
            window.renderActivitiesTable();
        }
        
        // If we have a student open, refresh their view
        const currentStudentDisplay = document.getElementById('student-name-display');
        if (currentStudentDisplay && currentStudentDisplay.textContent) {
            const student = students.find(s => s.name === currentStudentDisplay.textContent);
            if (student) {
                if (typeof window.renderStudentActivitiesList === 'function') {
                    window.renderStudentActivitiesList(student);
                }
            }
        }
        
        console.log("Activity updated successfully");
        return true;
    } else {
        console.error("Activity not found with ID:", id);
        return false;
    }
}

// Make the openActivityModal function available globally
window.openActivityModal = openActivityModal;

// Function to save data properly
function saveData() {
    // If window.saveData exists (from script.js), use that
    if (typeof window.saveData === 'function') {
        window.saveData();
        console.log("Saved data using global saveData function");
    } else {
        // Otherwise save directly to localStorage
        try {
            localStorage.setItem('activities', JSON.stringify(activities));
            console.log("Saved activities directly to localStorage");
        } catch (e) {
            console.error("Error saving activities:", e);
        }
    }
}

// Load activities on script initialization
document.addEventListener('DOMContentLoaded', function() {
    loadActivities();
    console.log("Modal.js initialized, activities loaded:", activities.length);
});