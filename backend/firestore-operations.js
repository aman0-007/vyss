import { db } from './firebase-init.js';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";


// --- STUDENT FUNCTIONS ---

/**
 * Adds a new student document to the 'students' collection in Firestore.
 * @param {object} studentData - An object containing all the student's details from the form.
 */

export async function registerStudent(studentData) {
    try {
        const docRef = await addDoc(collection(db, "students"), {
            ...studentData,
            status: 'Pending',
            registeredAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        return false;
    }
};

export async function getStudents() {
    const students = [];

    const q = query(collection(db, "students"), orderBy("registeredAt", "desc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data()});
    });

    console.log("Fetched students:", students);
    return students;
}


// --- EVENT FUNCTIONS ---

/**
 * Adds a new event document to the 'events' collection.
 * @param {object} eventData - An object with the event's details.
 */
export async function addEvent(eventData) {
    try {
        const docRef = await addDoc(collection(db, "events"), {
            ...eventData,
            createdAt: serverTimestamp()
        });
        console.log("Event document written with ID: ", docRef.id);
        return true;
    } catch (e) {
        console.error("Error adding event document: ", e);
        return false;
    }
}

/**
 * Fetches all events from the database, ordered by the event date.
 */
export async function getEvents() {
    const events = [];
    const q = query(collection(db, "events"), orderBy("eventDate", "desc"));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
    });
    
    console.log("Fetched events:", events);
    return events;
}