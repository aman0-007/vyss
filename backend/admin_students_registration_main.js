import { registerStudent, getStudents } from './firestore-operations.js';

// --- Bridge setup for the modal ---
window.registerStudent = registerStudent;

// --- State Management ---
let allStudents = []; // This will hold all students fetched from the DB
let filteredStudents = []; // This will hold students after search/filters
let currentPage = 1;
const rowsPerPage = 10;

// --- DOM Element References ---
const tableBody = document.getElementById('student-table-body');
const countDisplay = document.getElementById('student-count-display');
const searchInput = document.getElementById('search-student');
const eventFilter = document.getElementById('event-filter');
const statusFilter = document.getElementById('status-filter');
const paginationControls = document.getElementById('pagination-controls');

// --- Core Rendering Functions ---

/**
 * Renders a single page of students into the table based on the current state.
 */
function renderTablePage() {
    if (!tableBody) return;
    tableBody.innerHTML = ''; // Clear the table

    if (filteredStudents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-gray-500">No students match the current filters.</td></tr>`;
        return;
    }

    // Calculate which "slice" of the filtered data to show
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageStudents = filteredStudents.slice(startIndex, endIndex);

    pageStudents.forEach(student => {
        const row = `
            <tr class="bg-white border-b dark:bg-secondary-dark dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${student.name}</td>
                <td class="px-6 py-4">${student.registrationId}</td>
                <td class="px-6 py-4">${student.registeredFor}</td>
                <td class="px-6 py-4 text-center">${getStatusBadge(student.status)}</td>
                <td class="px-6 py-4 text-center space-x-2">
                    <button data-id="${student.id}" class="view-btn text-secondary hover:text-secondary/80"><span class="material-symbols-outlined text-xl">visibility</span></button>
                    <button data-id="${student.id}" class="edit-btn text-blue-500 hover:text-blue-700"><span class="material-symbols-outlined text-xl">edit</span></button>
                    <button data-id="${student.id}" class="delete-btn text-red-500 hover:text-red-700"><span class="material-symbols-outlined text-xl">delete</span></button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

/**
 * Renders the pagination buttons (Previous, 1, 2, 3..., Next).
 */
function renderPagination() {
    if (!paginationControls) return;
    paginationControls.innerHTML = '';

    const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
    if (totalPages <= 1) return;

    // Previous Button
    paginationControls.innerHTML += `<li><button class="prev-btn px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === 1 ? 'disabled' : ''}>Previous</button></li>`;

    // Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        paginationControls.innerHTML += `<li><button class="page-btn px-3 py-2 leading-tight border ${isActive ? 'z-10 text-primary-DEFAULT bg-primary-DEFAULT/10 border-primary-DEFAULT' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100'}" data-page="${i}">${i}</button></li>`;
    }

    // Next Button
    paginationControls.innerHTML += `<li><button class="next-btn px-3 py-2 leading-tight text-gray-500 bg-white border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" ${currentPage === totalPages ? 'disabled' : ''}>Next</button></li>`;
}

/**
 * Updates the "Showing X-Y of Z students" display.
 */
function updateCountDisplay() {
    if (!countDisplay) return;
    const startIndex = filteredStudents.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
    const endIndex = Math.min(startIndex + rowsPerPage - 1, filteredStudents.length);
    countDisplay.textContent = `Showing ${startIndex}-${endIndex} of ${filteredStudents.length} students (Total: ${allStudents.length})`;
}

/**
 * A master function to apply filters based on user input and re-render the UI.
 */
function applyFiltersAndRender() {
    const searchTerm = searchInput.value.toLowerCase();
    const eventValue = eventFilter.value;
    const statusValue = statusFilter.value;

    // Filter the master list of students
    filteredStudents = allStudents.filter(student => {
        const matchesSearch = searchTerm === '' ||
            (student.name && student.name.toLowerCase().includes(searchTerm)) ||
            (student.email && student.email.toLowerCase().includes(searchTerm)) ||
            (student.registrationId && student.registrationId.toLowerCase().includes(searchTerm));
        const matchesEvent = eventValue === 'All Events' || student.registeredFor === eventValue;
        const matchesStatus = statusValue === 'All Statuses' || student.status === statusValue;
        return matchesSearch && matchesEvent && matchesStatus;
    });

    currentPage = 1; // Reset to first page after any filter change
    renderTablePage();
    renderPagination();
    updateCountDisplay();
}

/**
 * Main function to fetch all data and initialize the dashboard.
 */
async function initializeDashboard() {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-gray-500">Fetching student data...</td></tr>`;
    allStudents = await getStudents();
    applyFiltersAndRender(); // Perform initial filtering and render
}

// --- Event Listeners ---

// Listen for any changes on search and filter inputs
searchInput.addEventListener('input', applyFiltersAndRender);
eventFilter.addEventListener('change', applyFiltersAndRender);
statusFilter.addEventListener('change', applyFiltersAndRender);

// Listen for clicks on the pagination controls
paginationControls.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    if (target.classList.contains('prev-btn')) {
        if (currentPage > 1) currentPage--;
    } else if (target.classList.contains('next-btn')) {
        const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
        if (currentPage < totalPages) currentPage++;
    } else if (target.classList.contains('page-btn')) {
        currentPage = Number(target.dataset.page);
    }

    renderTablePage();
    renderPagination();
    updateCountDisplay();
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', initializeDashboard);

// --- Bridge for Refreshing ---
window.refreshStudentTable = initializeDashboard;

// --- Helper Functions ---
function getStatusBadge(status) {
    switch (status) {
        case 'Approved':
            return `<span class="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">Approved</span>`;
        case 'Pending':
            return `<span class="px-2 py-1 font-semibold leading-tight text-yellow-700 bg-yellow-100 rounded-full dark:bg-yellow-700 dark:text-yellow-100">Pending</span>`;
        case 'Rejected':
            return `<span class="px-2 py-1 font-semibold leading-tight text-red-700 bg-red-100 rounded-full dark:bg-red-700 dark:text-red-100">Rejected</span>`;
        default:
            return `<span class="px-2 py-1 font-semibold leading-tight text-gray-700 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-100">Unknown</span>`;
    }
}