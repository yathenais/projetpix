document.addEventListener('DOMContentLoaded', function() {
    // Initialize data storage
    let students = [];
    let activities = [];
    let tracking = {};
    
    // Make data accessible globally for other scripts
    window.students = students;
    window.activities = activities;
    window.tracking = tracking;
    
    // Password management system
    const DEFAULT_PASSCODE = "1234";
    const MASTER_RECOVERY_CODE = "ADMIN2025"; // Master code for password recovery
    
    function getTeacherPasscode() {
        return localStorage.getItem('teacherPasscode') || DEFAULT_PASSCODE;
    }
    
    function setTeacherPasscode(newPasscode) {
        localStorage.setItem('teacherPasscode', newPasscode);
    }
    
    function resetPasscodeToDefault() {
        localStorage.removeItem('teacherPasscode');
    }
    
    // Settings tab management
    function initializeSettingsTab() {
        setupPasswordChangeHandlers();
        updatePasswordDisplay();
        initializePreferences();
    }
    
    // Preferences management
    function initializePreferences() {
        const cursiveFontToggle = document.getElementById('cursive-font-toggle');
        
        if (cursiveFontToggle) {
            // Load saved preference
            const isCursiveEnabled = localStorage.getItem('cursiveFontEnabled') === 'true';
            cursiveFontToggle.checked = isCursiveEnabled;
            applyCursiveFont(isCursiveEnabled);
            
            // Add event listener
            cursiveFontToggle.addEventListener('change', function() {
                const isEnabled = this.checked;
                localStorage.setItem('cursiveFontEnabled', isEnabled.toString());
                applyCursiveFont(isEnabled);
            });
        }
    }
    
    function applyCursiveFont(isEnabled) {
        const body = document.body;
        if (isEnabled) {
            body.classList.add('cursive-titles');
        } else {
            body.classList.remove('cursive-titles');
        }
    }
    
    function updatePasswordDisplay() {
        const passwordDisplay = document.getElementById('current-password-display');
        if (passwordDisplay) {
            passwordDisplay.textContent = '****';
            passwordDisplay.setAttribute('data-hidden', 'true');
        }
    }
    
    function setupPasswordChangeHandlers() {
        // Change password functionality
        const changePasswordBtn = document.getElementById('change-password-btn');
        const resetToDefaultBtn = document.getElementById('reset-to-default-btn');
        
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', function() {
                const currentPasswordInput = document.getElementById('current-password');
                const newPasswordInput = document.getElementById('new-password');
                const confirmPasswordInput = document.getElementById('confirm-password');
                
                const currentPassword = currentPasswordInput.value;
                const newPassword = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                // Validation
                if (!currentPassword || !newPassword || !confirmPassword) {
                    alert('Veuillez remplir tous les champs.');
                    return;
                }
                
                // Check current password
                if (currentPassword !== getTeacherPasscode() && currentPassword !== MASTER_RECOVERY_CODE) {
                    alert('Le mot de passe actuel est incorrect.');
                    return;
                }
                
                // Check password confirmation
                if (newPassword !== confirmPassword) {
                    alert('La confirmation du mot de passe ne correspond pas.');
                    return;
                }
                
                // Check password length and complexity
                if (newPassword.length < 4) {
                    alert('Le mot de passe doit contenir au moins 4 caractères.');
                    return;
                }
                
                // Prevent using the master recovery code as regular password
                if (newPassword === MASTER_RECOVERY_CODE) {
                    alert('Vous ne pouvez pas utiliser le code de récupération comme mot de passe régulier.');
                    return;
                }
                
                // Warning for very simple passwords
                if (newPassword === '1234' || newPassword === '0000' || newPassword === 'password') {
                    if (!confirm('Ce mot de passe est très simple. Êtes-vous sûr de vouloir l\'utiliser ?')) {
                        return;
                    }
                }
                
                // Save new password
                setTeacherPasscode(newPassword);
                
                // Clear form
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
                
                alert('Mot de passe modifié avec succès !');
            });
        }
        
        if (resetToDefaultBtn) {
            resetToDefaultBtn.addEventListener('click', function() {
                if (confirm('Êtes-vous sûr de vouloir remettre le mot de passe par défaut (1234) ?')) {
                    resetPasscodeToDefault();
                    updatePasswordDisplay();
                    alert('Mot de passe remis à la valeur par défaut : 1234');
                }
            });
        }
        
        // Toggle password visibility
        const togglePasswordBtn = document.getElementById('toggle-password-visibility');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', function() {
                const passwordDisplay = document.getElementById('current-password-display');
                if (passwordDisplay) {
                    const isHidden = passwordDisplay.getAttribute('data-hidden') === 'true';
                    if (isHidden) {
                        passwordDisplay.textContent = getTeacherPasscode();
                        passwordDisplay.setAttribute('data-hidden', 'false');
                    } else {
                        passwordDisplay.textContent = '****';
                        passwordDisplay.setAttribute('data-hidden', 'true');
                    }
                }
            });
        }
    }
    
    // DOM Elements
    const lockButton = document.getElementById('lock-button');
    const backToNamesButton = document.getElementById('back-to-names-button');
    const backFromPasscodeButton = document.getElementById('back-from-passcode-button');
    const backToStudentButton = document.getElementById('back-to-student-button');
    const studentNameDisplay = document.getElementById('student-name-display');
    const studentPhotoDisplay = document.getElementById('student-photo-display');
    const submitPasscodeButton = document.getElementById('submit-passcode');
    const passcodeInput = document.getElementById('passcode-input');
    
    // Screens
    const studentSelectScreen = document.getElementById('student-select-screen');
    const studentActivitiesScreen = document.getElementById('student-activities-screen');
    const passcodeScreen = document.getElementById('passcode-screen');
    const teacherScreen = document.getElementById('teacher-screen');
    
    // Tables
    const studentListElement = document.getElementById('student-list');
    const studentActivitiesList = document.getElementById('student-activities-list');
    const trackingTable = document.getElementById('tracking-table');
    const trackingHeader = document.getElementById('tracking-header');
    
    // Check if all required elements are found
    console.log('DOM Elements check:', {
        lockButton, backToNamesButton, backFromPasscodeButton, backToStudentButton,
        studentNameDisplay, submitPasscodeButton, passcodeInput,
        studentSelectScreen, studentActivitiesScreen, passcodeScreen, teacherScreen,
        studentListElement, studentActivitiesList, trackingTable, trackingHeader
    });
    
    // Initialize the app - only show student select screen
    function initApp() {
        console.log('Initializing app...');
        
        // Load data from localStorage
        loadData();
        
        // Migrate default activities to French if needed
        migrateActivitiesToFrench();
        
        // Migrate data to new format if needed
        migrateDataIfNeeded();
        
        // Initialize preferences (including cursive font)
        initializePreferences();
        
        // Check if we have a saved screen state
        const savedScreen = localStorage.getItem('currentScreen');
        
        // Hide all screens first
        hideAllScreens();
        
        // Show the appropriate screen based on saved state
        if (savedScreen === 'teacher') {
            // Directly show the teacher screen if that's where we were
            teacherScreen.style.display = 'flex';
            // Render the tracking table
            renderTrackingTable();
            
            // Initialize the tab system
            const activeTab = localStorage.getItem('activeTab') || 'tracking-tab';
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            
            // Hide all tab contents first
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activate the saved tab or default to tracking
            document.getElementById(activeTab).classList.add('active');
            
            // Update the tab buttons
            tabButtons.forEach(button => {
                if (button.getAttribute('data-tab') === activeTab) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
            // Render activities table if on the activities tab
            if (activeTab === 'activities-tab' && typeof window.renderActivitiesTable === 'function') {
                window.renderActivitiesTable();
            }
            
            // Set appropriate button visibility
            toggleLockButtonVisibility();
        } else {
            // Default to student selection screen
            studentSelectScreen.style.display = 'flex';
            // Ensure lock button is visible on startup (student screen)
            lockButton.style.display = 'flex';
            // Render the student list
            renderStudentList();
        }
        
        // Add sample data if none exists
        if (students.length === 0) {
            addSampleData();
        }
        
        // Setup the reset data button
        const resetDataButton = document.getElementById('reset-data-button');
        if (resetDataButton) {
            resetDataButton.addEventListener('click', function() {
                if (confirm('Ceci réinitialisera toutes les assignations d\'activités et leur état. Les élèves et activités seront préservés. Continuer ?')) {
                    // Only reset the tracking data (activity assignments and status)
                    resetActivityAssignments();
                    
                    alert('Les assignations d\'activités et leur état ont été réinitialisés. Vous pouvez maintenant réassigner les activités depuis le début.');
                }
            });
        }
        
        // Setup the save data button
        const saveDataButton = document.getElementById('save-data-button');
        if (saveDataButton) {
            saveDataButton.addEventListener('click', function() {
                // Force save data
                saveData();
                
                // Provide visual feedback
                const originalText = saveDataButton.innerHTML;
                const originalClass = saveDataButton.className;
                
                // Change button appearance temporarily
                saveDataButton.innerHTML = '✅ Sauvegardé !';
                saveDataButton.className = originalClass + ' save-success';
                saveDataButton.disabled = true;
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    saveDataButton.innerHTML = originalText;
                    saveDataButton.className = originalClass;
                    saveDataButton.disabled = false;
                }, 2000);
                
                console.log('Manual save completed successfully');
            });
        }
        
        console.log('App initialization complete with:', {
            students: students,
            activities: activities,
            tracking: tracking
        });
    }
    
    // Migrate data from old format to new format if needed
    function migrateDataIfNeeded() {
        // Check if we need to migrate data
        let needsMigration = false;
        
        Object.keys(tracking).forEach(studentId => {
            const studentTracking = tracking[studentId];
            // Check if any value is not an object (old format)
            if (Object.values(studentTracking).some(value => typeof value !== 'object')) {
                needsMigration = true;
            }
        });
        
        if (needsMigration) {
            console.log("Migrating data to new format...");
            const newTracking = {};
            
            // Process each student
            Object.keys(tracking).forEach(studentId => {
                const studentTracking = tracking[studentId];
                newTracking[studentId] = {};
                
                // Convert each activity status to the new format
                let slotIndex = 1;
                activities.forEach(activity => {
                    const activityId = activity.id;
                    if (studentTracking[activityId]) {
                        newTracking[studentId][slotIndex] = {
                            activityId: activityId,
                            status: studentTracking[activityId]
                        };
                        slotIndex++;
                    }
                });
            });
            
            // Replace old tracking with new format
            tracking = newTracking;
            saveData();
            console.log("Data migration complete.");
        }
    }
    
    // Reset only the tracking data (activity assignments and status)
    function resetActivityAssignments() {
        // Reset tracking to empty object
        tracking = {};
        
        // Initialize empty tracking for all existing students
        students.forEach(student => {
            const studentId = parseInt(student.id);
            tracking[studentId] = {};
        });
        
        // Save to localStorage (only tracking is updated)
        saveData();
        
        // Re-render the tracking table
        renderTrackingTable();
        
        console.log('Activity assignments reset. Students and activities preserved.');
    }
    
    // Add some sample data for testing
    function addSampleData() {
        // Add sample students
        students = [
            { id: 1, name: "Emma", photo: null },
            { id: 2, name: "Liam", photo: null },
            { id: 3, name: "Olivia", photo: null },
            { id: 4, name: "Noah", photo: null }
        ];
        
        // Add sample activities
        activities = [
            { id: 1, name: "Lecture", emoji: "📚" },
            { id: 2, name: "Mathématiques", emoji: "🧮" },
            { id: 3, name: "Expérience scientifique", emoji: "🔬" },
            { id: 4, name: "Projet artistique", emoji: "🎨" }
        ];
        
        // Initialize tracking
        tracking = {
            // Student ID as key
            1: {
                // Each slot has activity ID and status
                1: { activityId: 1, status: 'not-started' },
                2: { activityId: 2, status: 'not-started' }
            },
            2: {
                1: { activityId: 2, status: 'not-started' },
                2: { activityId: 3, status: 'not-started' }
            },
            3: {
                1: { activityId: 1, status: 'not-started' },
                2: { activityId: 4, status: 'not-started' }
            },
            4: {
                1: { activityId: 3, status: 'not-started' },
                2: { activityId: 4, status: 'not-started' }
            }
        };
        
        // Save to localStorage
        saveData();
        
        // Render everything
        renderStudentList();
        renderTrackingTable();
    }
    
    // Load data from localStorage
    function loadData() {
        try {
            if (localStorage.getItem('students')) {
                students = JSON.parse(localStorage.getItem('students'));
                console.log('Loaded students:', students);
            }
            
            if (localStorage.getItem('activities')) {
                activities = JSON.parse(localStorage.getItem('activities'));
                console.log('Loaded activities:', activities);
            }
            
            if (localStorage.getItem('tracking')) {
                tracking = JSON.parse(localStorage.getItem('tracking'));
                console.log('Loaded tracking:', tracking);
            }
            
            // Ensure tracking has entries for all students
            students.forEach(student => {
                const studentId = parseInt(student.id);
                if (!tracking[studentId]) {
                    tracking[studentId] = {};
                    // Assign first activity if available
                    if (activities.length > 0) {
                        tracking[studentId][1] = {
                            activityId: activities[0].id,
                            status: 'not-started'
                        };
                    }
                }
            });
            
            console.log('Final data after loading:', { 
                students: students,
                activities: activities,
                tracking: tracking
            });
            
            return { students, activities, tracking };
        } catch (error) {
            console.error('Error loading data:', error);
            return { students: [], activities: [], tracking: {} };
        }
    }

    // Migrate default activities to French
    function migrateActivitiesToFrench() {
        const frenchActivities = [
            { id: 1, name: "Lecture", emoji: "📚" },
            { id: 2, name: "Mathématiques", emoji: "🧮" },
            { id: 3, name: "Expérience scientifique", emoji: "🔬" },
            { id: 4, name: "Projet artistique", emoji: "🎨" }
        ];

        let updated = false;
        
        // Check if we need to update default activities
        frenchActivities.forEach(frenchActivity => {
            const existingActivity = activities.find(a => a.id === frenchActivity.id);
            if (existingActivity) {
                // Update if the name is still in English
                if (existingActivity.name === "Reading" || 
                    existingActivity.name === "Math Worksheet" || 
                    existingActivity.name === "Science Experiment" || 
                    existingActivity.name === "Art Project") {
                    existingActivity.name = frenchActivity.name;
                    existingActivity.emoji = frenchActivity.emoji;
                    updated = true;
                }
            }
        });

        if (updated) {
            console.log('Updated default activities to French');
            saveData();
        }
    }
    
    // Save data to localStorage
    function saveData() {
        try {
            localStorage.setItem('students', JSON.stringify(students));
            localStorage.setItem('activities', JSON.stringify(activities));
            localStorage.setItem('tracking', JSON.stringify(tracking));
            console.log("Data saved successfully");
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Limite de stockage dépassée. Certaines données d\'image pourraient être trop volumineuses.');
                console.error('Storage quota exceeded:', e);
            } else {
                console.error('Error saving data:', e);
            }
        }
    }
    
    // Hide all screens
    function hideAllScreens() {
        studentSelectScreen.style.display = 'none';
        studentActivitiesScreen.style.display = 'none';
        passcodeScreen.style.display = 'none';
        teacherScreen.style.display = 'none';
        
        // Show/hide lock button appropriately
        toggleLockButtonVisibility();
    }
    
    // Show/hide lock button based on current screen
    function toggleLockButtonVisibility() {
        // Only show lock button on student screens
        if (studentSelectScreen.style.display === 'flex' || 
            studentActivitiesScreen.style.display === 'flex') {
            lockButton.style.display = 'flex';
        } else {
            // Hide on teacher-related screens
            lockButton.style.display = 'none';
        }
    }
    
    // Render the student selection list
    function renderStudentList() {
        // Ensure we have the latest student data from localStorage
        const latestStudents = JSON.parse(localStorage.getItem('students') || '[]');
        if (latestStudents.length > 0) {
            students = latestStudents; // Update the in-memory array with latest data
        }
        
        studentListElement.innerHTML = '';
        
        students.forEach(student => {
            const studentElement = document.createElement('div');
            studentElement.classList.add('student-item');
            studentElement.dataset.id = student.id;
            
            // Create photo container
            const photoContainer = document.createElement('div');
            photoContainer.classList.add('student-photo-container');
            
            if (student.photo) {
                const photoImg = document.createElement('img');
                photoImg.src = student.photo;
                photoImg.alt = student.name;
                photoImg.classList.add('student-photo');
                photoContainer.appendChild(photoImg);
            } else {
                // Default avatar using first letter of name
                const defaultAvatar = document.createElement('div');
                defaultAvatar.classList.add('student-default-avatar');
                defaultAvatar.textContent = student.name.charAt(0).toUpperCase();
                photoContainer.appendChild(defaultAvatar);
            }
            
            // Create name container
            const nameContainer = document.createElement('div');
            nameContainer.classList.add('student-name-container');
            nameContainer.textContent = student.name;
            
            // Add photo and name to student element
            studentElement.appendChild(photoContainer);
            studentElement.appendChild(nameContainer);
            
            studentElement.addEventListener('click', function() {
                showStudentActivities(student);
            });
            
            studentListElement.appendChild(studentElement);
        });
    }
    
    // Show activities for a specific student
    function showStudentActivities(student) {
        hideAllScreens();
        studentActivitiesScreen.style.display = 'flex';
        toggleLockButtonVisibility();
        
        // Display student name
        studentNameDisplay.textContent = student.name;
        
        // Display student photo
        displayStudentPhoto(student);
        
        // Render activities for this student
        renderStudentActivitiesList(student);
    }
    
    // Display student photo in the profile section
    function displayStudentPhoto(student) {
        if (!studentPhotoDisplay) return;
        
        studentPhotoDisplay.innerHTML = '';
        
        if (student.photo) {
            // If student has a photo, display it
            const photoImg = document.createElement('img');
            photoImg.src = student.photo;
            photoImg.alt = `Photo de ${student.name}`;
            photoImg.classList.add('student-photo');
            studentPhotoDisplay.appendChild(photoImg);
        } else {
            // If no photo, display initials as placeholder
            const initials = student.name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('');
            
            const placeholder = document.createElement('div');
            placeholder.classList.add('student-photo-placeholder');
            placeholder.textContent = initials;
            studentPhotoDisplay.appendChild(placeholder);
        }
    }
    
    // Render activities list for a specific student
    function renderStudentActivitiesList(student) {
        studentActivitiesList.innerHTML = '';
        
        // Get the student's activities from tracking
        const studentTracking = tracking[student.id] || {};
        
        // Check if we're using the new slot-based structure
        const hasSlots = Object.values(studentTracking).some(value => typeof value === 'object');
        
        if (hasSlots) {
            // New structure - each slot has an activityId and status
            const slots = Object.keys(studentTracking);
            
            if (slots.length === 0) {
                const noActivitiesMsg = document.createElement('p');
                noActivitiesMsg.textContent = 'No activities assigned yet.';
                noActivitiesMsg.style.gridColumn = '1 / -1'; // Make it span all columns
                noActivitiesMsg.style.textAlign = 'center';
                noActivitiesMsg.style.padding = '20px';
                studentActivitiesList.appendChild(noActivitiesMsg);
                return;
            }
            
            // Process each activity slot
            slots.forEach(slot => {
                const slotInfo = studentTracking[slot];
                const activityId = slotInfo.activityId;
                const status = slotInfo.status;
                
                // Find the activity name
                const activity = activities.find(a => a.id === activityId);
                if (!activity) return; // Skip if activity doesn't exist
                
                const activityElement = document.createElement('div');
                activityElement.classList.add('activity-item');
                
                // Set data attribute for status-based styling
                activityElement.setAttribute('data-status', status);
                
                // Create activity icon element (emoji or image)
                const iconElement = document.createElement('div');
                iconElement.classList.add('activity-emoji');
                
                if (activity.imageData) {
                    // Create an image element if the activity has an image
                    const imgElement = document.createElement('img');
                    imgElement.src = activity.imageData;
                    imgElement.alt = activity.name;
                    imgElement.classList.add('activity-image');
                    iconElement.appendChild(imgElement);
                    iconElement.classList.add('activity-image-container');
                } else if (activity.emoji) {
                    // Display emoji if available
                    iconElement.textContent = activity.emoji;
                }
                
                activityElement.appendChild(iconElement);
                
                // Create activity name element
                const nameElement = document.createElement('div');
                nameElement.classList.add('activity-name');
                nameElement.textContent = activity.name;
                
                // Create status element
                const statusElement = document.createElement('div');
                statusElement.classList.add('activity-status');
                
                // Add status text
                const statusText = document.createElement('span');
                statusText.classList.add('activity-status-text');
                
                if (status === 'validated') {
                    statusText.textContent = 'Validé';
                    statusText.classList.add('validated-text');
                } else if (status === 'completed') {
                    statusText.textContent = 'Terminé';
                    statusText.classList.add('completed-text');
                } else if (status === 'in-progress') {
                    statusText.textContent = 'En cours';
                    statusText.classList.add('in-progress-text');
                } else {
                    statusText.textContent = 'Cliquez pour terminer';
                    statusText.classList.add('not-started-text');
                }
                
                // Create colored indicator based on status
                const indicator = document.createElement('div');
                indicator.classList.add('status-indicator');
                
                // Use appropriate emoji based on status
                if (status === 'completed') {
                    indicator.innerHTML = '✅'; // Green check mark emoji
                    indicator.style.backgroundColor = 'transparent'; // Remove background color
                } else if (status === 'validated') {
                    indicator.innerHTML = '⭐'; // Yellow star emoji
                    indicator.style.backgroundColor = 'transparent'; // Remove background color
                } else if (status === 'not-started') {
                    indicator.innerHTML = '⌛'; // Hourglass emoji
                    indicator.style.backgroundColor = 'transparent'; // Remove background color
                } else {
                    indicator.style.backgroundColor = getStatusColor(status);
                }
                
                // Add to activity item in vertical order: name, status text, emoji
                activityElement.appendChild(nameElement);
                activityElement.appendChild(statusText);
                activityElement.appendChild(indicator);
                
                // Make the entire card clickable if not validated or completed
                if (status !== 'validated' && status !== 'completed') {
                    activityElement.classList.add('clickable');
                    activityElement.addEventListener('click', function() {
                        updateActivityStatus(student.id, slot, 'completed');
                        renderStudentActivitiesList(student);
                    });
                }
                
                studentActivitiesList.appendChild(activityElement);
            });
        } else {
            // Old structure for backward compatibility
            const studentActivities = activities.filter(activity => studentTracking[activity.id]);
            
            if (studentActivities.length === 0) {
                const noActivitiesMsg = document.createElement('p');
                noActivitiesMsg.textContent = 'No activities assigned yet.';
                noActivitiesMsg.style.gridColumn = '1 / -1'; // Make it span all columns
                noActivitiesMsg.style.textAlign = 'center';
                noActivitiesMsg.style.padding = '20px';
                studentActivitiesList.appendChild(noActivitiesMsg);
                return;
            }
            
            studentActivities.forEach(activity => {
                const status = studentTracking[activity.id] || 'not-started';
                
                const activityElement = document.createElement('div');
                activityElement.classList.add('activity-item');
                
                // Set data attribute for status-based styling
                activityElement.setAttribute('data-status', status);
                
                // Create activity icon element (emoji or image)
                const iconElement = document.createElement('div');
                iconElement.classList.add('activity-emoji');
                
                if (activity.imageData) {
                    // Create an image element if the activity has an image
                    const imgElement = document.createElement('img');
                    imgElement.src = activity.imageData;
                    imgElement.alt = activity.name;
                    imgElement.classList.add('activity-image');
                    iconElement.appendChild(imgElement);
                    iconElement.classList.add('activity-image-container');
                } else if (activity.emoji) {
                    // Display emoji if available
                    iconElement.textContent = activity.emoji;
                }
                
                activityElement.appendChild(iconElement);
                
                // Create activity name element
                const nameElement = document.createElement('div');
                nameElement.classList.add('activity-name');
                nameElement.textContent = activity.name;
                
                // Create status element
                const statusElement = document.createElement('div');
                statusElement.classList.add('activity-status');
                
                // Add status text
                const statusText = document.createElement('span');
                statusText.classList.add('activity-status-text');
                
                if (status === 'validated') {
                    statusText.textContent = 'Validé par l\'enseignant';
                    statusText.classList.add('validated-text');
                } else if (status === 'completed') {
                    statusText.textContent = 'Complété';
                    statusText.classList.add('completed-text');
                } else if (status === 'in-progress') {
                    statusText.textContent = 'En cours';
                    statusText.classList.add('in-progress-text');
                } else {
                    statusText.textContent = 'Appuyer pour compléter';
                    statusText.classList.add('not-started-text');
                }
                
                // Create colored indicator
                const indicator = document.createElement('div');
                indicator.classList.add('status-indicator');
                
                // Use appropriate emoji based on status
                if (status === 'completed') {
                    indicator.innerHTML = '✅'; // Green check mark emoji
                    indicator.style.backgroundColor = 'transparent'; // Remove background color
                } else if (status === 'validated') {
                    indicator.innerHTML = '⭐'; // Yellow star emoji
                    indicator.style.backgroundColor = 'transparent'; // Remove background color
                } else if (status === 'not-started') {
                    indicator.innerHTML = '⌛'; // Hourglass emoji
                    indicator.style.backgroundColor = 'transparent'; // Remove background color
                } else {
                    indicator.style.backgroundColor = getStatusColor(status);
                }
                
                // Add to activity item in vertical order: name, status text, emoji
                activityElement.appendChild(nameElement);
                activityElement.appendChild(statusText);
                activityElement.appendChild(indicator);
                
                // Make the entire card clickable if not validated or completed
                if (status !== 'validated' && status !== 'completed') {
                    activityElement.classList.add('clickable');
                    activityElement.addEventListener('click', function() {
                        updateActivityStatus(student.id, activity.id, 'completed');
                        renderStudentActivitiesList(student);
                    });
                }
                
                studentActivitiesList.appendChild(activityElement);
            });
        }
    }
    
    // Format status for display
    function formatStatus(status) {
        switch(status) {
            case 'not-started': return 'Not Started';
            case 'in-progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'validated': return 'Validated';
            default: return 'Unknown';
        }
    }
    
    // Get status color
    function getStatusColor(status) {
        switch(status) {
            case 'not-started': return '#e74c3c';  // Red
            case 'in-progress': return '#f39c12';  // Orange
            case 'completed': return '#2ecc71';    // Green
            case 'validated': return '#f1c40f';    // Yellow
            default: return '#ddd';                // Gray (default)
        }
    }
    
    // Update activity status
    function updateActivityStatus(studentId, slotOrActivityId, status) {
        if (!tracking[studentId]) {
            tracking[studentId] = {};
        }
        
        // Check if we're using the new slot-based structure
        const hasSlots = Object.values(tracking[studentId]).some(value => typeof value === 'object');
        
        if (hasSlots) {
            // New structure - slot is the key, with activityId inside
            if (tracking[studentId][slotOrActivityId]) {
                tracking[studentId][slotOrActivityId].status = status;
            }
        } else {
            // Old structure - activityId is the key, status is the value
            tracking[studentId][slotOrActivityId] = status;
        }
        
        saveData();
    }
    
    // Render students table for teacher view
    function renderStudentsTable() {
        studentsTable.innerHTML = '';
        
        students.forEach(student => {
            const row = document.createElement('div');
            row.classList.add('spreadsheet-row');
            
            // ID cell
            const idCell = document.createElement('div');
            idCell.classList.add('cell', 'data-cell');
            idCell.textContent = student.id;
            
            // Name cell
            const nameCell = document.createElement('div');
            nameCell.classList.add('cell', 'data-cell');
            nameCell.textContent = student.name;
            
            // Actions cell
            const actionsCell = document.createElement('div');
            actionsCell.classList.add('cell', 'data-cell', 'action-cell');
            
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.textContent = 'Modifier';
            editBtn.addEventListener('click', function() {
                const newName = prompt('Entrez le nouveau nom :', student.name);
                if (newName && newName.trim() !== '') {
                    student.name = newName.trim();
                    saveData();
                    renderStudentsTable();
                    renderStudentList();
                    renderTrackingTable();
                }
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.addEventListener('click', function() {
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${student.name} ?`)) {
                    deleteStudent(student.id);
                }
            });
            
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(idCell);
            row.appendChild(nameCell);
            row.appendChild(actionsCell);
            
            studentsTable.appendChild(row);
        });
    }
    
    // Delete a student
    function deleteStudent(studentId) {
        // Convert to number if it's a string
        studentId = parseInt(studentId);
        console.log(`Deleting student with ID: ${studentId}`);
        
        students = students.filter(s => parseInt(s.id) !== studentId);
        delete tracking[studentId];
        
        console.log('After deletion:', {
            students: students,
            tracking: tracking
        });
        
        saveData();
        renderStudentList();
        renderTrackingTable();
    }
    
    // Render activities table for teacher view
    function renderActivitiesTable() {
        activitiesTable.innerHTML = '';
        
        activities.forEach(activity => {
            const row = document.createElement('div');
            row.classList.add('spreadsheet-row');
            
            // ID cell
            const idCell = document.createElement('div');
            idCell.classList.add('cell', 'data-cell');
            idCell.textContent = activity.id;
            
            // Name cell
            const nameCell = document.createElement('div');
            nameCell.classList.add('cell', 'data-cell');
            nameCell.textContent = activity.name;
            
            // Actions cell
            const actionsCell = document.createElement('div');
            actionsCell.classList.add('cell', 'data-cell', 'action-cell');
            
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.textContent = 'Modifier';
            editBtn.addEventListener('click', function() {
                const newName = prompt('Entrez le nouveau nom d\'activité :', activity.name);
                if (newName && newName.trim() !== '') {
                    activity.name = newName.trim();
                    saveData();
                    renderActivitiesTable();
                    renderTrackingTable();
                }
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.addEventListener('click', function() {
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${activity.name} ?`)) {
                    deleteActivity(activity.id);
                }
            });
            
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(idCell);
            row.appendChild(nameCell);
            row.appendChild(actionsCell);
            
            activitiesTable.appendChild(row);
        });
    }
    
    // Delete an activity
    function deleteActivity(activityId) {
        activities = activities.filter(a => a.id !== activityId);
        
        // Remove this activity from tracking
        Object.keys(tracking).forEach(studentId => {
            delete tracking[studentId][activityId];
        });
        
        saveData();
        renderActivitiesTable();
        renderTrackingTable();
    }
    
    // Render tracking table (Excel-like grid)
    function renderTrackingTable() {
        console.log('Starting renderTrackingTable with:', { 
            students: students,
            activities: activities,
            tracking: tracking
        });
        
        // Clear existing content
        trackingHeader.innerHTML = '';
        trackingTable.innerHTML = '';
        
        // Handle the case of no students
        if (students.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.classList.add('empty-message');
            emptyMessage.textContent = 'No students yet. Add some students to get started.';
            emptyMessage.style.padding = '20px';
            emptyMessage.style.textAlign = 'center';
            trackingTable.appendChild(emptyMessage);
            return;
        }
        
        // Calculate the maximum number of activities assigned to any student
        let maxActivities = 0;
        Object.keys(tracking).forEach(studentId => {
            const activitiesCount = Object.keys(tracking[studentId]).length;
            maxActivities = Math.max(maxActivities, activitiesCount);
        });
        
        // Ensure we always have at least one activity column
        maxActivities = Math.max(1, maxActivities);
        
        // Calculate total number of columns
        let totalColumns = 1; // Start with student name column
        
        // For each activity, we need an activity column + status column
        for (let i = 1; i <= maxActivities; i++) {
            totalColumns += 2; // Activity column + Status column
            if (i < maxActivities) {
                totalColumns += 1; // Divider column between pairs
            }
        }
        
        totalColumns += 1; // Add activity button column
        
        // Set up grid template columns - make it explicit pixel values to ensure exact alignment
        let gridTemplateColumns = "minmax(200px, 2fr) "; // Student name column (wider)
        
        for (let i = 1; i <= maxActivities; i++) {
            gridTemplateColumns += "minmax(180px, 1.5fr) minmax(150px, 1fr) "; // Activity column and Status column
            if (i < maxActivities) {
                gridTemplateColumns += "15px "; // Divider column
            }
        }
        
        gridTemplateColumns += "minmax(150px, 1fr)"; // Add column button
        
        // Apply grid template to header ONLY - this is crucial for the row-based layout
        trackingHeader.style.display = "grid";
        trackingHeader.style.gridTemplateColumns = gridTemplateColumns;
        
        // Make tracking table a vertical container for student rows
        trackingTable.style.display = "flex";
        trackingTable.style.flexDirection = "column";
        trackingTable.style.width = "100%";
        
        // Create header row
        // Empty corner cell
        const cornerCell = document.createElement('div');
        cornerCell.classList.add('cell', 'header-cell');
        cornerCell.innerHTML = '<span>Élève</span>';
        trackingHeader.appendChild(cornerCell);
        
        // Add activity column headers (pairs of Activity and Status)
        for (let i = 1; i <= maxActivities; i++) {
            // Activity column header
            const activityHeader = document.createElement('div');
            activityHeader.classList.add('cell', 'header-cell', 'activity-column-header');
            activityHeader.innerHTML = `<span>Activité ${i}</span>`;
            trackingHeader.appendChild(activityHeader);
            
            // Status column header
            const statusHeader = document.createElement('div');
            statusHeader.classList.add('cell', 'header-cell', 'status-column-header');
            statusHeader.innerHTML = `<span>État</span>`;
            trackingHeader.appendChild(statusHeader);
            
            // Add a divider after each activity-status pair (except the last one)
            if (i < maxActivities) {
                const dividerHeader = document.createElement('div');
                dividerHeader.classList.add('cell', 'header-cell', 'activity-pair-divider');
                trackingHeader.appendChild(dividerHeader);
            }
        }
        
        // Add "Add Column" header for adding more activity slots
        const addActivityHeader = document.createElement('div');
        addActivityHeader.classList.add('cell', 'header-cell', 'add-column-button');
        addActivityHeader.textContent = '+ Ajouter Colonne d\'Activité';
        addActivityHeader.addEventListener('click', function() {
            // For each student, add a new activity slot
            students.forEach(student => {
                const studentId = parseInt(student.id);
                
                // Find the next available slot
                const studentTracking = tracking[studentId] || {};
                const slots = Object.keys(studentTracking).map(Number);
                const nextSlot = slots.length > 0 ? Math.max(...slots) + 1 : 1;
                
                // Only add if there are activities to assign
                if (activities.length > 0) {
                    // Assign the first activity by default
                    if (!tracking[studentId]) {
                        tracking[studentId] = {};
                    }
                    tracking[studentId][nextSlot] = {
                        activityId: activities[0].id,
                        status: 'not-started'
                    };
                }
            });
            
            saveData();
            renderTrackingTable();
        });
        trackingHeader.appendChild(addActivityHeader);
        
        // Create one row per student
        console.log(`Creating rows for ${students.length} students`);
        
        students.forEach(student => {
            // Convert student ID to number to ensure consistent handling
            const studentId = parseInt(student.id);
            console.log(`Creating row for student ${student.name} (ID: ${studentId})`);
            
            // Create a container for this student's row
            const studentRow = document.createElement('div');
            studentRow.classList.add('student-tracking-row');
            studentRow.dataset.studentId = studentId;
            
            // Create the actual grid row that contains all cells for this student
            const row = document.createElement('div');
            row.classList.add('spreadsheet-row');
            row.style.display = "grid";
            row.style.gridTemplateColumns = gridTemplateColumns;
            
            // First cell is student name with simplified controls
            const nameCell = document.createElement('div');
            nameCell.classList.add('cell', 'header-cell', 'editable-cell');
            nameCell.innerHTML = `
                <div class="student-cell-content">
                    <div class="student-info" data-student-id="${studentId}">
                        ${student.photo ? 
                            `<img src="${student.photo}" alt="${student.name}" class="student-mini-photo" />` : 
                            `<div class="student-mini-avatar">${student.name.charAt(0).toUpperCase()}</div>`
                        }
                        <span class="student-name-editable" data-student-id="${studentId}">${student.name}</span>
                    </div>
                    <div class="student-actions">
                        <div class="action-menu-container">
                            <button class="action-menu-btn" data-student-id="${studentId}" title="Actions">⋯</button>
                            <div class="action-menu" id="action-menu-${studentId}" style="display: none;">
                                <button class="action-item photo-action" data-student-id="${studentId}">📷 Modifier photo</button>
                                <button class="action-item delete-action" data-student-id="${studentId}" data-student-name="${student.name}">🗑️ Supprimer</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            nameCell.dataset.id = studentId;
            nameCell.dataset.type = 'student';
            
            // Add event listeners for action buttons
            const actionMenuBtn = nameCell.querySelector('.action-menu-btn');
            const photoActionBtn = nameCell.querySelector('.photo-action');
            const deleteActionBtn = nameCell.querySelector('.delete-action');
            
            if (actionMenuBtn) {
                actionMenuBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleStudentActionMenu(studentId);
                });
            }
            
            if (photoActionBtn) {
                photoActionBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    editStudentPhoto(studentId);
                });
            }
            
            if (deleteActionBtn) {
                deleteActionBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    confirmDeleteStudent(studentId, student.name);
                });
            }
            
            // Make student name editable when clicking specifically on the name
            nameCell.addEventListener('click', function(e) {
                // Only trigger editing when clicking on the student name span
                if (e.target.classList.contains('student-name-editable')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const nameSpan = e.target;
                    makeEditable(nameSpan, student.name, function(newValue) {
                        if (newValue && newValue.trim() !== '') {
                            student.name = newValue.trim();
                            saveData();
                            renderTrackingTable();
                            renderStudentList(); // Update student screen too
                        }
                    });
                }
            });
            
            row.appendChild(nameCell);
            
            // Add activity assignment and status cells for each possible activity slot
            for (let slot = 1; slot <= maxActivities; slot++) {
                const slotInfo = tracking[student.id]?.[slot] || null;
                
                // 1. Create activity assignment cell
                const activityCell = document.createElement('div');
                activityCell.classList.add('cell', 'data-cell', 'activity-assignment-cell');
                
                if (slotInfo) {
                    // Find the activity name for this activity ID
                    const activity = activities.find(a => a.id === slotInfo.activityId);
                    const activityName = activity ? activity.name : 'Unknown Activity';
                    
                    // Activity dropdown - allows changing the assigned activity
                    const activitySelect = document.createElement('select');
                    activitySelect.classList.add('activity-assignment-dropdown');
                    
                    // Add a remove option
                    const removeOption = document.createElement('option');
                    removeOption.value = 'remove';
                    removeOption.textContent = '-- Supprimer Activité --';
                    activitySelect.appendChild(removeOption);
                    
                    // Add all activities as options
                    activities.forEach(act => {
                        const option = document.createElement('option');
                        option.value = act.id;
                        
                        // Include emoji or image indicator in dropdown text
                        if (act.imageData) {
                            option.textContent = `🖼️ ${act.name}`;
                        } else {
                            option.textContent = act.emoji ? `${act.emoji} ${act.name}` : act.name;
                        }
                        
                        if (act.id === slotInfo.activityId) {
                            option.selected = true;
                        }
                        activitySelect.appendChild(option);
                    });
                    
                    // Add a "New Activity" option at the bottom
                    const addNewOption = document.createElement('option');
                    addNewOption.value = 'new';
                    addNewOption.textContent = '+ Ajouter Nouvelle Activité';
                    addNewOption.classList.add('add-activity-option');
                    activitySelect.appendChild(addNewOption);
                    
                    // Handle activity change
                    activitySelect.addEventListener('change', function() {
                        if (this.value === 'remove') {
                            // Remove this activity slot
                            delete tracking[student.id][slot];
                            // Reindex the slots to avoid gaps
                            reindexActivitySlots(student.id);
                            saveData();
                            renderTrackingTable();
                        } else if (this.value === 'new') {
                            // Open the activity modal for adding a new activity
                            openActivityModal('add', null, student.id, slot);
                            
                            // Reset dropdown to previous value for now
                            this.value = slotInfo.activityId;
                        } else {
                            // Update activity assignment
                            tracking[student.id][slot].activityId = parseInt(this.value);
                            saveData();
                            renderTrackingTable();
                        }
                    });
                    
                    // Only add the select dropdown (no separate text display)
                    activityCell.appendChild(activitySelect);
                } else {
                    // Empty slot - show button to assign an activity
                    const assignButton = document.createElement('button');
                    assignButton.classList.add('assign-activity-button');
                    assignButton.textContent = '+ Assigner Activité';
                    
                    assignButton.addEventListener('click', function() {
                        // Show activity selection UI
                        if (activities.length === 0) {
                            alert('Veuillez d\'abord créer quelques activités');
                            return;
                        }
                        
                        // Create dropdown to select activity
                        const select = document.createElement('select');
                        select.classList.add('activity-selection-dropdown');
                        
                        activities.forEach(act => {
                            const option = document.createElement('option');
                            option.value = act.id;
                            option.textContent = act.name;
                            select.appendChild(option);
                        });
                        
                        // Add a "New Activity" option at the bottom
                        const addNewOption = document.createElement('option');
                        addNewOption.value = 'new';
                        addNewOption.textContent = '+ Ajouter Nouvelle Activité';
                        addNewOption.classList.add('add-activity-option');
                        select.appendChild(addNewOption);
                        
                        // Replace button with dropdown
                        this.style.display = 'none';
                        activityCell.appendChild(select);
                        select.focus();
                        
                        // Handle selection
                        select.addEventListener('change', function() {
                            const selectedValue = this.value;
                            
                            if (selectedValue === 'new') {
                                // Open the activity modal for adding a new activity
                                openActivityModal('add');
                                
                                // Reset dropdown to first activity
                                if (activities.length > 0) {
                                    this.value = activities[0].id;
                                }
                                return;
                            }
                            
                            const activityId = parseInt(selectedValue);
                            
                            // Initialize slot if needed
                            if (!tracking[student.id]) {
                                tracking[student.id] = {};
                            }
                            
                            // Assign activity to this slot
                            tracking[student.id][slot] = {
                                activityId: activityId,
                                status: 'not-started'
                            };
                            
                            saveData();
                            renderTrackingTable();
                        });
                        
                        // Handle click outside to cancel
                        setTimeout(() => {
                            const clickOutside = (e) => {
                                if (!activityCell.contains(e.target)) {
                                    select.remove();
                                    assignButton.style.display = '';
                                    document.removeEventListener('click', clickOutside);
                                }
                            };
                            document.addEventListener('click', clickOutside);
                        }, 100);
                    });
                    
                    activityCell.appendChild(assignButton);
                }
                
                row.appendChild(activityCell);
                
                // 2. Create status cell
                const statusCell = document.createElement('div');
                statusCell.classList.add('cell', 'data-cell', 'status-cell');
                
                if (slotInfo) {
                    // Status dropdown
                    const statusDropdown = document.createElement('select');
                    statusDropdown.classList.add('status-dropdown', `status-${slotInfo.status}`);
                    
                    // Add status options
                    const statuses = [
                        { value: 'not-started', text: 'Pas commencé' },
                        { value: 'in-progress', text: 'En cours' },
                        { value: 'completed', text: 'Terminé' },
                        { value: 'validated', text: 'Validé' }
                    ];
                    
                    statuses.forEach(statusOption => {
                        const option = document.createElement('option');
                        option.value = statusOption.value;
                        option.textContent = statusOption.text;
                        if (slotInfo.status === statusOption.value) {
                            option.selected = true;
                        }
                        statusDropdown.appendChild(option);
                    });
                    
                    // Handle status change
                    statusDropdown.addEventListener('change', function() {
                        tracking[student.id][slot].status = this.value;
                        saveData();
                        renderTrackingTable();
                    });
                    
                    statusCell.appendChild(statusDropdown);
                } else {
                    // Empty status cell for empty activity slot
                    statusCell.textContent = '—';
                    statusCell.classList.add('empty-status-cell');
                }
                
                row.appendChild(statusCell);
                
                // Add a divider after each activity-status pair (except the last one)
                if (slot < maxActivities) {
                    const dividerCell = document.createElement('div');
                    dividerCell.classList.add('cell', 'data-cell', 'activity-pair-divider');
                    row.appendChild(dividerCell);
                }
            }
            
            // Add empty cell to match "Add Activity Slot" column
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('cell', 'data-cell');
            row.appendChild(emptyCell);
            
            // Add the grid row to the student row container
            studentRow.appendChild(row);
            
            // Add the student row to the tracking table
            trackingTable.appendChild(studentRow);
            
            // Add a separator between student rows for visual clarity
            if (students.indexOf(student) < students.length - 1) {
                const separator = document.createElement('div');
                separator.classList.add('student-row-separator');
                separator.style.height = '10px';
                trackingTable.appendChild(separator);
            }
        });
        
        // No longer adding the "Add Student" row here as we've added a standalone button outside the grid
    }
    
    // Helper function to make a cell editable
    function makeEditable(cell, currentValue, onComplete) {
        // Don't create a new input if already editing
        if (cell.querySelector('input')) return;
        
        const span = cell.querySelector('span');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.classList.add('edit-input');
        
        // Hide the text
        span.style.display = 'none';
        
        // Add the input
        cell.appendChild(input);
        input.focus();
        input.select();
        
        // Handle completion of editing
        function completeEdit() {
            const newValue = input.value;
            input.remove();
            span.style.display = '';
            if (onComplete) onComplete(newValue);
        }
        
        // Event listeners
        input.addEventListener('blur', completeEdit);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                completeEdit();
            } else if (e.key === 'Escape') {
                input.value = currentValue; // Reset to original
                completeEdit();
            }
        });
    }
    
    // Add a new student
    function addStudent(name, photo = null) {
        if (!name || name.trim() === '') {
            alert('Veuillez entrer un nom valide');
            return;
        }
        
        // Create a new student with a numeric ID
        const newId = students.length > 0 ? Math.max(...students.map(s => parseInt(s.id))) + 1 : 1;
        const newStudent = { id: newId, name: name.trim(), photo: photo };
        
        // Add to students array
        students.push(newStudent);
        
        // Create tracking entry for this student
        if (!tracking[newId]) {
            tracking[newId] = {};
        }
        
        // Assign at least one activity to the student if activities exist
        if (activities.length > 0) {
            tracking[newId][1] = {
                activityId: activities[0].id,
                status: 'not-started'
            };
        }
        
        // Log the current state for debugging
        console.log('Added student:', newStudent);
        console.log('Current students:', students);
        console.log('Current tracking:', tracking);
        
        // Save data and update UI
        saveData();
        
        // Only render what's needed based on where the function is called from
        // Don't navigate away from current screen
        if (document.getElementById('tracking-table').style.display !== 'none') {
            // We're on the dashboard (teacher screen)
            renderTrackingTable();
        } else {
            // We're on the student list screen
            renderStudentList();
        }
        
        // Show success message
        alert(`L'élève "${name}" a été ajouté avec succès !`);
        
        // Ensure we stay on the teacher screen if that's where we started
        if (teacherScreen.style.display === 'flex') {
            // We're already on the teacher screen, do nothing
        } else {
            // If we're not on the teacher screen, render the student list
            renderStudentList();
        }
    }
    
    // Add a new activity
    function addActivity(name, emoji = "📋") {
        const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
        const newActivity = { id: newId, name: name, emoji: emoji };
        activities.push(newActivity);
        
        saveData();
        renderTrackingTable();
        
        // Return the ID of the newly created activity
        return newId;
    }
    
    // Add a new activity slot for a student
    function addActivitySlot(studentId, activityId) {
        if (!tracking[studentId]) {
            tracking[studentId] = {};
        }
        
        // Find the next available slot number
        const slots = Object.keys(tracking[studentId]).map(Number);
        const nextSlot = slots.length > 0 ? Math.max(...slots) + 1 : 1;
        
        // Assign the activity to this slot
        tracking[studentId][nextSlot] = {
            activityId: activityId,
            status: 'not-started'
        };
        
        saveData();
    }
    
    // Reindex activity slots to avoid gaps after deletion
    function reindexActivitySlots(studentId) {
        const studentSlots = tracking[studentId];
        if (!studentSlots) return;
        
        const slots = Object.keys(studentSlots).map(Number).sort((a, b) => a - b);
        const newSlots = {};
        
        // Create new object with consecutive slot numbers
        slots.forEach((oldSlot, index) => {
            const newSlotNumber = index + 1;
            newSlots[newSlotNumber] = studentSlots[oldSlot];
        });
        
        // Replace old slots with reindexed ones
        tracking[studentId] = newSlots;
    }
    
    // Event Listeners
    
    // Lock button - go to passcode screen
    lockButton.addEventListener('click', function() {
        // Save the current state - we're going to the teacher screen
        localStorage.setItem('currentScreen', 'teacher');
        
        hideAllScreens();
        passcodeScreen.style.display = 'flex';
        toggleLockButtonVisibility();
    });
    
    // Back button from activities to student selection
    backToNamesButton.addEventListener('click', function() {
        console.log("Back button clicked, returning to student selection screen");
        
        // Clear saved screen state
        localStorage.removeItem('currentScreen');
        
        // Hide all screens first
        hideAllScreens();
        
        // Show the student selection screen
        studentSelectScreen.style.display = 'flex';
        
        // Use our global refresh function if available
        if (typeof window.refreshStudentList === 'function') {
            window.refreshStudentList();
            console.log("Used global refresh function");
        } else {
            // Fallback to the original method
            // Force a complete reload of all data from localStorage
            students = JSON.parse(localStorage.getItem('students') || '[]');
            activities = JSON.parse(localStorage.getItem('activities') || '[]');
            tracking = JSON.parse(localStorage.getItem('tracking') || '{}');
            
            renderStudentList();
            console.log("Used fallback refresh method");
        }
        
        // Toggle lock button visibility
        toggleLockButtonVisibility();
        
        // Clear any refresh flags
        localStorage.removeItem('needStudentListRefresh');
    });
    
    // Back button from passcode to previous screen
    backFromPasscodeButton.addEventListener('click', function() {
        // Clear saved screen state
        localStorage.removeItem('currentScreen');
        
        hideAllScreens();
        studentSelectScreen.style.display = 'flex';
        toggleLockButtonVisibility();
    });
    
    // Show/hide recovery information
    const showRecoveryBtn = document.getElementById('show-recovery-info');
    const recoveryInfoDisplay = document.getElementById('recovery-info-display');
    
    if (showRecoveryBtn && recoveryInfoDisplay) {
        showRecoveryBtn.addEventListener('click', function() {
            if (recoveryInfoDisplay.style.display === 'none') {
                recoveryInfoDisplay.style.display = 'block';
                showRecoveryBtn.textContent = 'Masquer l\'aide';
            } else {
                recoveryInfoDisplay.style.display = 'none';
                showRecoveryBtn.textContent = 'Mot de passe oublié ?';
            }
        });
    }
    
    // Back button from teacher to student screen
    backToStudentButton.addEventListener('click', function() {
        // Clear saved screen state
        localStorage.removeItem('currentScreen');
        
        hideAllScreens();
        studentSelectScreen.style.display = 'flex';
        toggleLockButtonVisibility();
    });
    
    // Passcode submit
    submitPasscodeButton.addEventListener('click', function() {
        const enteredPasscode = passcodeInput.value;
        const currentPasscode = getTeacherPasscode();
        
        if (enteredPasscode === currentPasscode || enteredPasscode === MASTER_RECOVERY_CODE) {
            // Save the current screen state
            localStorage.setItem('currentScreen', 'teacher');
            
            hideAllScreens();
            teacherScreen.style.display = 'flex';
            toggleLockButtonVisibility();
            passcodeInput.value = '';
            
            // Initialize the tab system - default to tracking tab
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');
            
            // Hide all tab contents first
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Default to tracking tab
            document.getElementById('tracking-tab').classList.add('active');
            
            // Update tab buttons
            tabButtons.forEach(button => {
                if (button.getAttribute('data-tab') === 'tracking-tab') {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
            // Save active tab
            localStorage.setItem('activeTab', 'tracking-tab');
            
            // Render teacher dashboard
            renderTrackingTable();
            
            // Make sure Add Student button has an event listener
            if (document.getElementById('add-student-button')) {
                const addStudentBtn = document.getElementById('add-student-button');
                // Remove any existing listeners to avoid duplicates
                const newAddStudentBtn = addStudentBtn.cloneNode(true);
                addStudentBtn.parentNode.replaceChild(newAddStudentBtn, addStudentBtn);
                
                // Add a fresh event listener
                newAddStudentBtn.addEventListener('click', function() {
                    const newStudentName = prompt('Enter new student name:');
                    if (newStudentName && newStudentName.trim() !== '') {
                        addStudent(newStudentName.trim());
                    }
                });
            }
        } else {
            alert('Mot de passe incorrect !');
            passcodeInput.value = '';
            passcodeInput.focus();
        }
    });
    
    // Set up tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the tab to show
            const tabToShow = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to this button and the corresponding tab
            this.classList.add('active');
            document.getElementById(tabToShow).classList.add('active');
            
            // Save active tab to localStorage
            localStorage.setItem('activeTab', tabToShow);
            
            // If switching to activities tab, render the activities table
            if (tabToShow === 'activities-tab' && typeof window.renderActivitiesTable === 'function') {
                window.renderActivitiesTable();
            } else if (tabToShow === 'tracking-tab') {
                // Refresh tracking table when switching to tracking tab
                renderTrackingTable();
            } else if (tabToShow === 'settings-tab') {
                // Initialize settings tab if needed
                initializeSettingsTab();
            }
        });
    });
    
    // Initialize the app
    initApp();
    
    // Expose functions to the global scope for use in fallback implementations
    window.renderTrackingTable = renderTrackingTable;
    window.showStudentActivities = showStudentActivities;
    window.renderStudentList = renderStudentList;
    window.saveData = saveData;
    window.loadData = loadData;
    window.activities = activities;
    window.tracking = tracking;
    
    // Make internal functions globally accessible for action menus
    window.deleteStudent = deleteStudent;
    window.addStudent = addStudent;
    
    // No need for this event listener anymore since we're using the onclick attribute
    // on the button element directly
});

// Make addStudent globally accessible for the direct button
window.addStudentDirectly = function() {
    showAddStudentModal();
};

// Function to show modal for adding student with photo
function showAddStudentModal() {
    // Create modal HTML
    const modalHTML = `
        <div id="add-student-modal" class="photo-modal-overlay" style="display: flex;">
            <div class="photo-modal-content">
                <div class="photo-modal-header">
                    <h3>Ajouter un nouvel élève</h3>
                    <button class="photo-modal-close">&times;</button>
                </div>
                <div class="photo-modal-body">
                    <div class="form-group">
                        <label for="student-name-input">Nom de l'élève :</label>
                        <input type="text" id="student-name-input" placeholder="Entrez le nom de l'élève" />
                    </div>
                    <div class="form-group">
                        <label for="student-photo-input">Photo de l'élève :</label>
                        <div class="custom-file-input">
                            <input type="file" id="student-photo-input" accept="image/*" style="display: none;" />
                            <button type="button" class="file-input-label" onclick="document.getElementById('student-photo-input').click()">
                                📁 Parcourir les fichiers...
                            </button>
                        </div>
                        <div id="photo-preview" class="photo-preview" style="display: none;">
                            <img id="preview-image" src="" alt="Aperçu" />
                        </div>
                        <div id="add-file-name" class="file-name-display" style="display: none; margin-top: 8px; font-size: 12px; color: #666;"></div>
                    </div>
                </div>
                <div class="photo-modal-footer">
                    <button class="btn-secondary" onclick="closeAddStudentModal()">Annuler</button>
                    <button class="btn-primary" onclick="confirmAddStudent()">Ajouter l'élève</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    setupAddStudentModalEvents();
}

function setupAddStudentModalEvents() {
    // Photo input change event
    const photoInput = document.getElementById('student-photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const previewImage = document.getElementById('preview-image');
    const fileNameDisplay = document.getElementById('add-file-name');
    
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Display file name
            if (fileNameDisplay) {
                fileNameDisplay.textContent = `Fichier sélectionné: ${file.name}`;
                fileNameDisplay.style.display = 'block';
            }
            
            // Display preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            photoPreview.style.display = 'none';
            if (fileNameDisplay) {
                fileNameDisplay.style.display = 'none';
            }
        }
    });
    
    // Close modal events
    document.querySelector('.photo-modal-close').addEventListener('click', closeAddStudentModal);
    document.getElementById('add-student-modal').addEventListener('click', function(e) {
        if (e.target.id === 'add-student-modal') {
            closeAddStudentModal();
        }
    });
}

function closeAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    if (modal) {
        modal.remove();
    }
}

function confirmAddStudent() {
    const nameInput = document.getElementById('student-name-input');
    const photoInput = document.getElementById('student-photo-input');
    const previewImage = document.getElementById('preview-image');
    
    const studentName = nameInput.value.trim();
    
    if (!studentName) {
        alert('Veuillez entrer un nom pour l\'élève');
        return;
    }
    
    // Get photo data if available
    let photoData = null;
    if (photoInput.files[0]) {
        photoData = previewImage.src; // This contains the base64 data URL
    }
    
    // Use global addStudent function if available, otherwise use fallback
    if (typeof window.addStudent === 'function') {
        window.addStudent(studentName, photoData);
    } else {
        // Fallback: add student manually
        const students = window.students || [];
        const tracking = window.tracking || {};
        
        const newId = students.length > 0 ? Math.max(...students.map(s => parseInt(s.id))) + 1 : 1;
        const newStudent = { id: newId, name: studentName, photo: photoData };
        
        students.push(newStudent);
        tracking[newId] = {};
        
        // Update global arrays
        window.students = students;
        window.tracking = tracking;
        
        // Save to localStorage
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('tracking', JSON.stringify(tracking));
    }
    
    // Close modal and refresh
    closeAddStudentModal();
    location.reload();
}

// Function to edit student photo
function editStudentPhoto(studentId) {
    // Reload data from localStorage to ensure we have the latest
    const studentsFromStorage = JSON.parse(localStorage.getItem('students') || '[]');
    const students = window.students && window.students.length > 0 ? window.students : studentsFromStorage;
    
    const student = students.find(s => parseInt(s.id) === parseInt(studentId));
    
    if (!student) {
        console.error('Student not found for ID:', studentId);
        return;
    }
    
    // Create modal HTML for photo editing
    const modalHTML = `
        <div id="edit-photo-modal" class="photo-modal-overlay" style="display: flex;">
            <div class="photo-modal-content">
                <div class="photo-modal-header">
                    <h3>Modifier la photo de ${student.name}</h3>
                    <button class="photo-modal-close">&times;</button>
                </div>
                <div class="photo-modal-body">
                    <div class="form-group">
                        <label>Photo actuelle :</label>
                        <div class="current-photo-display">
                            ${student.photo ? 
                                `<img src="${student.photo}" alt="${student.name}" class="current-photo" />` : 
                                '<div class="no-photo-placeholder">Aucune photo</div>'
                            }
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-photo-input">Choisir une nouvelle photo :</label>
                        <div class="custom-file-input">
                            <input type="file" id="edit-photo-input" accept="image/*" style="display: none;" />
                            <button type="button" class="file-input-label" onclick="document.getElementById('edit-photo-input').click()">
                                📁 Parcourir les fichiers...
                            </button>
                        </div>
                        <div id="edit-photo-preview" class="photo-preview" style="display: none;">
                            <img id="edit-preview-image" src="" alt="Aperçu" />
                        </div>
                        <div id="edit-file-name" class="file-name-display" style="display: none; margin-top: 8px; font-size: 12px; color: #666;"></div>
                    </div>
                    <div class="form-group">
                        <button class="btn-secondary remove-photo-btn" data-student-id="${studentId}">Supprimer la photo</button>
                    </div>
                </div>
                <div class="photo-modal-footer">
                    <button class="btn-secondary modal-cancel-btn">Annuler</button>
                    <button class="btn-primary modal-save-btn" data-student-id="${studentId}">Sauvegarder</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup event listeners
    setupEditPhotoModalEvents();
}

function setupEditPhotoModalEvents() {
    // Photo input change event
    const photoInput = document.getElementById('edit-photo-input');
    const photoPreview = document.getElementById('edit-photo-preview');
    const previewImage = document.getElementById('edit-preview-image');
    const fileNameDisplay = document.getElementById('edit-file-name');
    
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Display file name
            if (fileNameDisplay) {
                fileNameDisplay.textContent = `Fichier sélectionné: ${file.name}`;
                fileNameDisplay.style.display = 'block';
            }
            
            // Display preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            photoPreview.style.display = 'none';
            if (fileNameDisplay) {
                fileNameDisplay.style.display = 'none';
            }
        }
    });
    
    // Close modal events
    document.querySelector('#edit-photo-modal .photo-modal-close').addEventListener('click', closeEditPhotoModal);
    document.getElementById('edit-photo-modal').addEventListener('click', function(e) {
        if (e.target.id === 'edit-photo-modal') {
            closeEditPhotoModal();
        }
    });
    
    // Modal button events
    const cancelBtn = document.querySelector('#edit-photo-modal .modal-cancel-btn');
    const saveBtn = document.querySelector('#edit-photo-modal .modal-save-btn');
    const removeBtn = document.querySelector('#edit-photo-modal .remove-photo-btn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeEditPhotoModal();
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const studentId = this.dataset.studentId;
            console.log('Save button clicked for student ID:', studentId);
            confirmEditPhoto(studentId);
        });
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const studentId = this.dataset.studentId;
            console.log('Remove button clicked for student ID:', studentId);
            removeStudentPhoto(studentId);
        });
    }
}

function closeEditPhotoModal() {
    const modal = document.getElementById('edit-photo-modal');
    if (modal) {
        modal.remove();
    }
}

function confirmEditPhoto(studentId) {
    const photoInput = document.getElementById('edit-photo-input');
    const previewImage = document.getElementById('edit-preview-image');
    
    // Update student photo if new one was selected
    if (photoInput && photoInput.files[0]) {
        // Reload data from localStorage to ensure we have the latest
        const studentsFromStorage = JSON.parse(localStorage.getItem('students') || '[]');
        const students = window.students && window.students.length > 0 ? window.students : studentsFromStorage;
        
        const student = students.find(s => parseInt(s.id) === parseInt(studentId));
        
        if (student) {
            student.photo = previewImage.src; // This contains the base64 data URL
            
            // Update global array and save
            window.students = students;
            localStorage.setItem('students', JSON.stringify(students));
            
            // Refresh displays
            if (typeof window.renderStudentList === 'function') {
                window.renderStudentList();
            }
            if (typeof window.renderTrackingTable === 'function') {
                window.renderTrackingTable();
            }
        }
    }
    
    // Close modal
    closeEditPhotoModal();
}

function removeStudentPhoto(studentId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer la photo de cet élève ?')) {
        // Use global students array
        const students = window.students || [];
        const student = students.find(s => parseInt(s.id) === parseInt(studentId));
        if (student) {
            student.photo = null;
            
            // Update global array and save
            window.students = students;
            localStorage.setItem('students', JSON.stringify(students));
            
            closeEditPhotoModal();
            
            // Refresh displays
            if (typeof window.renderStudentList === 'function') {
                window.renderStudentList();
            }
            if (typeof window.renderTrackingTable === 'function') {
                window.renderTrackingTable();
            }
        }
    }
}

// Function to toggle student action menu
function toggleStudentActionMenu(studentId) {
    // Close all other menus first
    document.querySelectorAll('.action-menu').forEach(menu => {
        if (menu.id !== `action-menu-${studentId}`) {
            menu.style.display = 'none';
        }
    });
    
    // Toggle the selected menu
    const menu = document.getElementById(`action-menu-${studentId}`);
    if (menu) {
        if (menu.style.display === 'none') {
            menu.style.display = 'block';
            
            // Check if menu would be cut off at bottom and adjust position
            const menuRect = menu.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            if (menuRect.bottom > viewportHeight - 20) {
                menu.style.top = 'auto';
                menu.style.bottom = '100%';
                menu.style.marginTop = '0';
                menu.style.marginBottom = '2px';
            } else {
                menu.style.top = '100%';
                menu.style.bottom = 'auto';
                menu.style.marginTop = '2px';
                menu.style.marginBottom = '0';
            }
        } else {
            menu.style.display = 'none';
        }
    }
}

// Function to confirm student deletion
function confirmDeleteStudent(studentId, studentName) {
    if (confirm(`Supprimer l'élève "${studentName}" ?`)) {
        // Try to call the internal deleteStudent function first
        if (typeof window.deleteStudent === 'function') {
            window.deleteStudent(studentId);
        } else {
            // Fallback: delete student manually
            studentId = parseInt(studentId);
            
            // Access global arrays
            if (window.students && window.tracking) {
                window.students = window.students.filter(s => parseInt(s.id) !== studentId);
                delete window.tracking[studentId];
                
                // Save to localStorage
                localStorage.setItem('students', JSON.stringify(window.students));
                localStorage.setItem('tracking', JSON.stringify(window.tracking));
                
                // Refresh displays
                if (typeof window.renderStudentList === 'function') {
                    window.renderStudentList();
                }
                if (typeof window.renderTrackingTable === 'function') {
                    window.renderTrackingTable();
                }
                
                // Refresh the page as last resort
                location.reload();
            }
        }
    }
    // Close the menu
    const menu = document.getElementById(`action-menu-${studentId}`);
    if (menu) {
        menu.style.display = 'none';
    }
}

// Close action menus when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.action-menu-container')) {
        document.querySelectorAll('.action-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});

// Make functions globally accessible
window.toggleStudentActionMenu = toggleStudentActionMenu;
window.confirmDeleteStudent = confirmDeleteStudent;
window.editStudentPhoto = editStudentPhoto;
window.closeEditPhotoModal = closeEditPhotoModal;
window.confirmEditPhoto = confirmEditPhoto;
window.removeStudentPhoto = removeStudentPhoto;
window.closeAddStudentModal = closeAddStudentModal;
window.confirmAddStudent = confirmAddStudent;
