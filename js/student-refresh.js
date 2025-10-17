// Global initialization function to ensure synchronized data
window.refreshStudentList = function() {
    console.log("Globally refreshing student list");
    
    // Get the latest data directly from localStorage
    const latestStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Update the global students array if it exists
    if (typeof window.students !== 'undefined') {
        window.students = latestStudents;
    }
    
    // Get the DOM element
    const studentListElement = document.getElementById('student-list');
    if (!studentListElement) {
        console.error("Student list element not found");
        return;
    }
    
    // Clear existing content
    studentListElement.innerHTML = '';
    
    // Populate with latest data
    latestStudents.forEach(student => {
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
        
        // Get showStudentActivities function from global scope if available
        if (typeof window.showStudentActivities === 'function') {
            studentElement.addEventListener('click', function() {
                window.showStudentActivities(student);
            });
        } else {
            // Fallback - try to recreate the navigation behavior
            studentElement.addEventListener('click', function() {
                // Hide all screens
                document.querySelectorAll('.screen').forEach(screen => {
                    screen.style.display = 'none';
                });
                
                // Show student activities screen
                const activitiesScreen = document.getElementById('student-activities-screen');
                if (activitiesScreen) {
                    activitiesScreen.style.display = 'flex';
                }
                
                // Display student name
                const nameDisplay = document.getElementById('student-name-display');
                if (nameDisplay) {
                    nameDisplay.textContent = student.name;
                }
            });
        }
        
        studentListElement.appendChild(studentElement);
    });
    
    console.log(`Refreshed student list with ${latestStudents.length} students`);
};