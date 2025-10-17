// Add the event listener for the edit activities button
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure script.js has loaded data first
    setTimeout(() => {
        initializeActivityList();
    }, 200);
});

function initializeActivityList() {
    // Get activities from localStorage first
    let activities = [];
    try {
        activities = JSON.parse(localStorage.getItem('activities')) || [];
        console.log("Activities loaded in activity-list.js:", activities.length);
    } catch (error) {
        console.error('Error loading activities in activity-list.js:', error);
        activities = [];
    }
    
    const editActivitiesBtn = document.getElementById('edit-activities-button');
    if (editActivitiesBtn) {
        editActivitiesBtn.addEventListener('click', function() {
            // Create a dialog showing all activities with edit buttons
            const activityList = document.createElement('div');
            activityList.classList.add('activity-list-modal');
            
            // Create the modal content
            let modalContent = `
                <div class="modal-content activity-list-content">
                    <span class="close-modal">&times;</span>
                    <h2>Manage Activities</h2>
                    <div class="activity-list">`;
            
            // Add activities
            activities.forEach(activity => {
                modalContent += `
                    <div class="activity-list-item">
                        <span class="activity-emoji">${activity.emoji || '📋'}</span>
                        <span class="activity-name">${activity.name}</span>
                        <button class="edit-activity-button" data-id="${activity.id}">✏️</button>
                    </div>`;
            });
            
            // Add button to create new activity
            modalContent += `
                    </div>
                    <div class="form-actions">
                        <button id="add-new-activity-btn" class="btn-primary">+ Add New Activity</button>
                    </div>
                </div>
            `;
            
            // Create modal dynamically
            const activityListModal = document.createElement('div');
            activityListModal.classList.add('modal', 'activity-list-modal');
            activityListModal.innerHTML = modalContent;
            document.body.appendChild(activityListModal);
            
            // Show the modal
            activityListModal.style.display = 'block';
            
            // Add event listeners for close button
            const closeBtn = activityListModal.querySelector('.close-modal');
            closeBtn.addEventListener('click', function() {
                activityListModal.style.display = 'none';
                // Remove modal after closing to avoid duplicates
                setTimeout(() => {
                    document.body.removeChild(activityListModal);
                }, 300);
            });
            
            // Handle click outside modal
            activityListModal.addEventListener('click', function(event) {
                if (event.target === activityListModal) {
                    activityListModal.style.display = 'none';
                    // Remove modal after closing to avoid duplicates
                    setTimeout(() => {
                        document.body.removeChild(activityListModal);
                    }, 300);
                }
            });
            
            // Add event listeners for edit buttons
            const editButtons = activityListModal.querySelectorAll('.edit-activity-button');
            editButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const activityId = parseInt(this.getAttribute('data-id'));
                    openActivityModal('edit', activityId);
                });
            });
            
            // Add event listener for add new activity button
            const addNewBtn = activityListModal.querySelector('#add-new-activity-btn');
            addNewBtn.addEventListener('click', function() {
                openActivityModal('add');
            });
        });
    }
    
    // Add event listener for the add activity button in the Activities tab
    const addActivityButton = document.getElementById('add-activity-button');
    if (addActivityButton) {
        addActivityButton.addEventListener('click', function() {
            openActivityModal('add');
        });
    }
    
    // Render the activities table for the Activities tab
    renderActivitiesTable();
}

// Render the activities table
function renderActivitiesTable() {
    const activitiesTableBody = document.getElementById('activities-table-body');
    if (!activitiesTableBody) return;
    
    // Clear existing content
    activitiesTableBody.innerHTML = '';
    
    // Get activities from localStorage and ensure we have the latest data
    let activities = [];
    try {
        const storageActivities = JSON.parse(localStorage.getItem('activities') || '[]');
        const globalActivities = window.activities || [];
        
        // Use the most recent data (prefer global if it has more items or is more recent)
        activities = storageActivities.length >= globalActivities.length ? storageActivities : globalActivities;
        
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
        
        // Icon cell (emoji or image)
        const iconCell = document.createElement('td');
        iconCell.classList.add('emoji-cell');
        
        if (activity.imageData && activity.imageData.trim() !== '') {
            // Create an image element if the activity has an image
            const imgElement = document.createElement('img');
            imgElement.src = activity.imageData;
            imgElement.alt = activity.name;
            imgElement.classList.add('table-activity-image');
            
            // Add error handling for image loading
            imgElement.onerror = function() {
                console.error('Failed to load image for activity:', activity.name);
                // Fallback to emoji if image fails to load
                iconCell.textContent = activity.emoji || '📝';
            };
            
            iconCell.appendChild(imgElement);
        } else {
            // Display emoji if available
            iconCell.textContent = activity.emoji || '📝';
        }
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = activity.name;
        nameCell.classList.add('name-cell');
        
        // Actions cell
        const actionsCell = document.createElement('td');
        actionsCell.classList.add('actions-cell');
        
        // Edit button with pencil icon
        const editButton = document.createElement('button');
        editButton.classList.add('action-button', 'edit-button');
        editButton.textContent = '✏️'; // Use textContent for emoji
        editButton.title = 'Modifier l\'activité';
        editButton.addEventListener('click', function() {
            openActivityModal('edit', activity.id);
        });
        
        // Delete button with red cross icon
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('action-button', 'delete-button');
        deleteButton.textContent = '🗑️'; // Use textContent for emoji
        deleteButton.title = 'Supprimer l\'activité';
        deleteButton.addEventListener('click', function() {
            if (confirm(`Êtes-vous sûr de vouloir supprimer "${activity.name}" ?`)) {
                deleteActivity(activity.id);
            }
        });
        
        // Add buttons to actions cell
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        
        // Add cells to row
        row.appendChild(iconCell);
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

// Make functions available globally
window.renderActivitiesTable = renderActivitiesTable;
window.deleteActivity = deleteActivity;