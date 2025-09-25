import { addEvent, getEvents } from './firestore-operations.js';

// --- Bridge setup for the modal in the HTML file ---
window.addEvent = addEvent;

/**
 * Formats a YYYY-MM-DD date string into a more readable format.
 * @param {string} dateString - The date string from Firestore.
 * @returns {string} - Formatted date (e.g., September 25, 2025).
 */

function formatEventDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

/**
 * Formats a 24-hour time string (HH:MM) into a 12-hour AM/PM format.
 * @param {string} timeString - The time string from Firestore (e.g., "14:30").
 * @returns {string} - Formatted time (e.g., "2:30 PM").
 */

function formatEventTime(timeString) {
    if (!timeString) return ''; // Return empty if no time is provided
    
    // Split the time string into hours and minutes
    const [hours24, minutes] = timeString.split(':');
    
    // Convert hours to a number
    let hours = parseInt(hours24, 10);
    
    // Determine AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    
    return `${hours}:${minutes} ${ampm}`;
}

/**
 * Fetches event data and renders it into the HTML table.
 */
async function loadAndDisplayEvents() {
    const tableBody = document.getElementById('events-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-gray-500">Loading events...</td></tr>`;

    const events = await getEvents();
    tableBody.innerHTML = ''; // Clear loading message

    if (events.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-6 text-gray-500">No events found. Add one to get started!</td></tr>`;
        return;
    }

    events.forEach(event => {
        const row = `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light dark:text-white">${event.eventName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${formatEventDate(event.eventDate)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${formatEventTime(event.eventTime)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${event.eventLocation}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-4">
                        <button class="text-secondary hover:text-secondary/80"><span class="material-symbols-outlined">edit</span></button>
                        <button class="text-primary-DEFAULT hover:text-primary-hover"><span class="material-symbols-outlined">delete</span></button>
                    </div>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', loadAndDisplayEvents);

// --- Bridge for Refreshing ---
window.refreshEventsTable = loadAndDisplayEvents;