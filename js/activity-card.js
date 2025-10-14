// Update the student activity list rendering to include emoji
function renderActivityCard(activityElement, activity, status) {
    // Create activity emoji element
    const emojiElement = document.createElement('div');
    emojiElement.classList.add('activity-emoji');
    emojiElement.textContent = activity.emoji || '📋'; // Default emoji if none is set
    
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
    
    statusElement.appendChild(statusText);
    statusElement.appendChild(indicator);
    
    // Add to activity item
    activityElement.appendChild(emojiElement);
    activityElement.appendChild(nameElement);
    activityElement.appendChild(statusElement);
    
    return activityElement;
}