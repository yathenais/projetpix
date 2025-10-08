document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Initialize tab functionality
    function initTabs() {
        // Add event listeners to tab buttons
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Get the tab to show from the data-tab attribute
                const tabToShow = this.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to the clicked button and corresponding content
                this.classList.add('active');
                document.getElementById(tabToShow).classList.add('active');
            });
        });
        
        // Initialize the activities table if we're on that tab
        if (document.getElementById('activities-tab')) {
            renderActivitiesTable();
        }
    }
    
    // Render the activities table in the Activities tab
    function renderActivitiesTable() {
        const activitiesTableBody = document.getElementById('activities-table-body');
        if (!activitiesTableBody) return;
        
        // Clear existing content
        activitiesTableBody.innerHTML = '';
        
        // Get activities from localStorage or fallback to global variable
        let activities = [];
        try {
            activities = JSON.parse(localStorage.getItem('activities')) || [];
        } catch (error) {
            console.error('Error loading activities from localStorage:', error);
            // Try to get activities from global scope if available
            if (typeof window.activities !== 'undefined') {
                activities = window.activities;
            }
        }
        
        // If no activities, show a message
        if (activities.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 3;
            emptyCell.textContent = 'No activities yet. Add your first activity!';
            emptyCell.style.textAlign = 'center';
            emptyCell.style.padding = '20px';
            emptyRow.appendChild(emptyCell);
            activitiesTableBody.appendChild(emptyRow);
            return;
        }
        
        // Add each activity to the table
        activities.forEach(activity => {
            const row = document.createElement('tr');
            
            // Emoji cell
            const emojiCell = document.createElement('td');
            emojiCell.textContent = activity.emoji || '📝';
            emojiCell.classList.add('emoji-cell');
            
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = activity.name;
            nameCell.classList.add('name-cell');
            
            // Actions cell
            const actionsCell = document.createElement('td');
            actionsCell.classList.add('actions-cell');
            
            // Edit button
            const editButton = document.createElement('button');
            editButton.classList.add('action-button', 'edit-button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', function() {
                openActivityModal('edit', activity);
            });
            
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('action-button', 'delete-button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', function() {
                if (confirm(`Are you sure you want to delete "${activity.name}"?`)) {
                    deleteActivity(activity.id);
                }
            });
            
            // Add buttons to actions cell
            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
            
            // Add cells to row
            row.appendChild(emojiCell);
            row.appendChild(nameCell);
            row.appendChild(actionsCell);
            
            // Add row to table
            activitiesTableBody.appendChild(row);
        });
    }
    
    // Function to delete an activity
    function deleteActivity(activityId) {
        // Get activities from localStorage
        let activities = [];
        let tracking = {};
        
        try {
            activities = JSON.parse(localStorage.getItem('activities')) || [];
            tracking = JSON.parse(localStorage.getItem('tracking')) || {};
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            return;
        }
        
        // Filter out the activity to delete
        activities = activities.filter(activity => activity.id !== activityId);
        
        // Remove this activity from tracking
        for (const studentId in tracking) {
            for (const slotId in tracking[studentId]) {
                if (tracking[studentId][slotId].activityId === activityId) {
                    delete tracking[studentId][slotId];
                }
            }
            // Reindex slots to avoid gaps
            reindexActivitySlots(studentId, tracking);
        }
        
        // Save updated data
        localStorage.setItem('activities', JSON.stringify(activities));
        localStorage.setItem('tracking', JSON.stringify(tracking));
        
        // Update the global variables if they exist
        if (typeof window.activities !== 'undefined') {
            window.activities = activities;
        }
        if (typeof window.tracking !== 'undefined') {
            window.tracking = tracking;
        }
        
        // Re-render activities table and tracking table
        renderActivitiesTable();
        if (typeof window.renderTrackingTable === 'function') {
            window.renderTrackingTable();
        }
    }
    
    // Helper function to reindex activity slots after deletion
    function reindexActivitySlots(studentId, trackingData) {
        const studentTracking = trackingData[studentId];
        if (!studentTracking) return;
        
        // Get all slots and their data
        const slots = Object.keys(studentTracking)
            .map(slot => parseInt(slot))
            .sort((a, b) => a - b);
        
        // If no slots, nothing to reindex
        if (slots.length === 0) return;
        
        // Create a new object with sequential slots
        const newStudentTracking = {};
        slots.forEach((oldSlot, index) => {
            const newSlotIndex = index + 1;
            newStudentTracking[newSlotIndex] = studentTracking[oldSlot];
        });
        
        // Replace the old tracking with the reindexed version
        trackingData[studentId] = newStudentTracking;
    }
    
    // Connect Add Activity button to modal
    const addActivityButton = document.getElementById('add-activity-button');
    if (addActivityButton) {
        addActivityButton.addEventListener('click', function() {
            openActivityModal('add');
        });
    }
    
    // Function to open the activity modal
    function openActivityModal(mode, activity = null, studentId = null, slotId = null) {
        const modal = document.getElementById('activity-modal');
        const modalTitle = modal.querySelector('h2');
        const activityNameInput = document.getElementById('activity-name');
        const saveButton = document.getElementById('save-activity');
        
        // Set modal title based on mode
        modalTitle.textContent = mode === 'add' ? 'Add Activity' : 'Edit Activity';
        
        // Clear previous values
        activityNameInput.value = '';
        
        // If editing, populate with existing values
        if (mode === 'edit' && activity) {
            activityNameInput.value = activity.name;
            document.getElementById('selected-emoji').value = activity.emoji || '📝';
            
            // Select the correct emoji in the grid
            const emojiOptions = document.querySelectorAll('.emoji-option');
            emojiOptions.forEach(option => {
                if (option.getAttribute('data-emoji') === activity.emoji) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        } else {
            // For new activities, select the first emoji by default
            const firstEmoji = document.querySelector('.emoji-option');
            if (firstEmoji) {
                firstEmoji.classList.add('selected');
                document.getElementById('selected-emoji').value = firstEmoji.getAttribute('data-emoji');
            }
        }
        
        // Show the modal
        modal.style.display = 'block';
        
        // Since we're using the openActivityModal function from modal.js now,
        // we don't need to add a separate event listener here
        /* 
        // Remove old event listeners from the save button
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        
        // Add new event listener to save button
        newSaveButton.addEventListener('click', function() {
            const activityName = activityNameInput.value.trim();
            const emojiValue = document.getElementById('selected-emoji').value;
            
            if (!activityName) {
                alert('Please enter an activity name');
                return;
            }
            
            // Save the activity
            if (mode === 'add') {
                addNewActivity(activityName, emojiValue, studentId, slotId);
            } else if (mode === 'edit') {
                updateActivity(activity.id, activityName, emojiValue);
            }
            
            // Close the modal
            modal.style.display = 'none';
        });
        */
    }
    
    // Function to add a new activity
    function addNewActivity(name, emoji, studentId = null, slotId = null) {
        // Get activities from localStorage
        let activities = [];
        
        try {
            activities = JSON.parse(localStorage.getItem('activities')) || [];
        } catch (error) {
            console.error('Error loading activities from localStorage:', error);
            return;
        }
        
        // Generate a new ID
        const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
        
        // Create new activity
        const newActivity = {
            id: newId,
            name: name,
            emoji: emoji
        };
        
        // Add to activities array
        activities.push(newActivity);
        
        // Save to localStorage
        localStorage.setItem('activities', JSON.stringify(activities));
        
        // Update the global variable if it exists
        if (typeof window.activities !== 'undefined') {
            window.activities = activities;
        }
        
        // If studentId and slotId are provided, assign this activity to that student/slot
        if (studentId !== null && slotId !== null) {
            let tracking = {};
            
            try {
                tracking = JSON.parse(localStorage.getItem('tracking')) || {};
            } catch (error) {
                console.error('Error loading tracking from localStorage:', error);
                return;
            }
            
            // Ensure student tracking exists
            if (!tracking[studentId]) {
                tracking[studentId] = {};
            }
            
            // Assign activity to the slot
            tracking[studentId][slotId] = {
                activityId: newId,
                status: 'not-started'
            };
            
            // Save tracking
            localStorage.setItem('tracking', JSON.stringify(tracking));
            
            // Update the global variable if it exists
            if (typeof window.tracking !== 'undefined') {
                window.tracking = tracking;
            }
        }
        
        // Re-render activities table and tracking table
        renderActivitiesTable();
        if (typeof window.renderTrackingTable === 'function') {
            window.renderTrackingTable();
        }
    }
    
    // Function to update an existing activity
    function updateActivity(id, name, emoji) {
        console.log(`Updating activity ${id} with name: ${name} and emoji: ${emoji}`);
        
        // Get activities from localStorage
        let activities = [];
        
        try {
            activities = JSON.parse(localStorage.getItem('activities')) || [];
        } catch (error) {
            console.error('Error loading activities from localStorage:', error);
            return;
        }
        
        // Find and update the activity
        const activityIndex = activities.findIndex(a => a.id === id);
        if (activityIndex !== -1) {
            activities[activityIndex].name = name;
            activities[activityIndex].emoji = emoji;
            
            // Save to localStorage
            localStorage.setItem('activities', JSON.stringify(activities));
            
            // Update the global variable if it exists
            if (typeof window.activities !== 'undefined') {
                window.activities = activities;
            }
            
            // Make sure the student list will be refreshed when returning to that screen
            if (typeof window.refreshStudentList === 'function') {
                // Set a flag to indicate we should refresh
                localStorage.setItem('needStudentListRefresh', 'true');
            }
        }
        
        // Re-render activities table and tracking table
        renderActivitiesTable();
        if (typeof window.renderTrackingTable === 'function') {
            window.renderTrackingTable();
        }
    }
    
    // Initialize tabs
    initTabs();
});