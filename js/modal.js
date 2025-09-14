// Add modal and emoji selection functionality to the script.js

// Get modal elements
const activityModal = document.getElementById('activity-modal');
const closeModalButtons = document.querySelectorAll('.close-modal, .close-modal-btn');
const saveActivityBtn = document.getElementById('save-activity');
const activityNameInput = document.getElementById('activity-name');
const selectedEmojiInput = document.getElementById('selected-emoji');
const emojiOptions = document.querySelectorAll('.emoji-option');

// Variables to track current operation
let currentOperation = 'add';
let currentActivityId = null;
let currentStudentId = null;
let currentSlot = null;

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

// Open activity modal for adding a new activity
function openActivityModal(operation = 'add', activityId = null, studentId = null, slot = null) {
    currentOperation = operation;
    currentActivityId = activityId;
    currentStudentId = studentId;
    currentSlot = slot;
    
    // Reset form
    activityNameInput.value = '';
    selectedEmojiInput.value = '📚';
    
    // Remove selected class from all emoji options
    emojiOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Select the first emoji by default
    document.querySelector('.emoji-option[data-emoji="📚"]').classList.add('selected');
    
    // If editing, populate form with activity data
    if (operation === 'edit' && activityId) {
        const activity = activities.find(a => a.id === activityId);
        if (activity) {
            activityNameInput.value = activity.name;
            selectedEmojiInput.value = activity.emoji || '📋';
            
            // Select the correct emoji
            const emojiOption = document.querySelector(`.emoji-option[data-emoji="${activity.emoji}"]`);
            if (emojiOption) {
                emojiOptions.forEach(opt => opt.classList.remove('selected'));
                emojiOption.classList.add('selected');
            }
        }
    }
    
    // Show modal
    activityModal.style.display = 'block';
}

// Save activity when save button is clicked
saveActivityBtn.addEventListener('click', function() {
    const activityName = activityNameInput.value.trim();
    const emoji = selectedEmojiInput.value;
    
    if (!activityName) {
        alert('Please enter an activity name');
        return;
    }
    
    if (currentOperation === 'add') {
        // Add new activity
        const newId = addActivity(activityName, emoji);
        
        // If we're adding directly to a student's slot
        if (currentStudentId && currentSlot !== null) {
            updateActivitySlot(currentStudentId, currentSlot, newId);
        }
    } else if (currentOperation === 'edit' && currentActivityId) {
        // Edit existing activity
        editActivity(currentActivityId, activityName, emoji);
    }
    
    // Close modal
    activityModal.style.display = 'none';
});

// Edit activity function
function editActivity(id, name, emoji) {
    const activity = activities.find(a => a.id === id);
    if (activity) {
        activity.name = name;
        activity.emoji = emoji;
        
        saveData();
        renderTrackingTable();
        
        // If we have a student open, refresh their view
        const currentStudentDisplay = document.getElementById('student-name-display');
        if (currentStudentDisplay.textContent) {
            const student = students.find(s => s.name === currentStudentDisplay.textContent);
            if (student) {
                renderStudentActivitiesList(student);
            }
        }
    }
}