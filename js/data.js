/**
 * Campus Location Data – VIT Chennai
 *
 * Categories:
 * - academic  : Academic & administrative buildings
 * - hostel    : Student hostels
 * - emergency : Medical & safety facilities
 * - food      : Food courts & eateries
 * - services  : Guest house, supermarket, gym, etc.
 */

const campusLocations = [

    /* =========================
       Entrances & Administration
    ========================= */

    {
        name: "Main Entrance",
        type: "services",
        lat: 12.840440,
        lng: 80.152999,
        description: "Primary campus entry point"
    },
    {
        name: "Administrative Block",
        type: "academic",
        lat: 12.840889,
        lng: 80.154006,
        description: "University administration offices"
    },
    {
        name: "Secondary Entrance",
        type: "services",
        lat: 12.838865,
        lng: 80.154424,
        description: "Secondary campus entry point"
    },

    /* =========================
       Academic Buildings
    ========================= */

    {
        name: "Central Library",
        type: "academic",
        lat: 12.840685,
        lng: 80.154006,
        description: "Main campus library"
    },
    {
        name: "Academic Block 1",
        type: "academic",
        lat: 12.843294,
        lng: 80.153573,
        description: "Lecture halls and faculty offices"
    },
    {
        name: "Academic Block 2",
        type: "academic",
        lat: 12.842919,
        lng: 80.156242,
        description: "Academic departments and classrooms"
    },
    {
        name: "Academic Block 3",
        type: "academic",
        lat: 12.843158,
        lng: 80.154688,
        description: "Classrooms and labs"
    },
    {
        name: "Academic Block 4 (Front Entrance)",
        type: "academic",
        lat: 12.843773,
        lng: 80.155233,
        description: "Main entrance of AB4"
    },
    {
        name: "Academic Block 4 (Back Entrance)",
        type: "academic",
        lat: 12.843375,
        lng: 80.156488,
        description: "Rear entrance of AB4"
    },
    {
        name: "Academic Block 5",
        type: "academic",
        lat: 12.841100,
        lng: 80.156060,
        description: "Advanced academic facilities"
    },

    /* =========================
       Auditoriums & Facilities
    ========================= */

    {
        name: "Mahatma Gandhi Auditorium",
        type: "academic",
        lat: 12.839507,
        lng: 80.155204,
        description: "Main auditorium for events and conferences"
    },
    {
        name: "Gymnasium",
        type: "services",
        lat: 12.843504,
        lng: 80.152674,
        description: "Indoor sports and fitness facility"
    },

    /* =========================
       Health & Emergency
    ========================= */

    {
        name: "Health Centre",
        type: "emergency",
        lat: 12.841488,
        lng: 80.156404,
        description: "On-campus medical services"
    },


    /* =========================
       Hostels
    ========================= */

    {
        name: "A Block Hostel",
        type: "hostel",
        lat: 12.844149,
        lng: 80.152500,
        description: "Student hostel – A Block"
    },
    {
        name: "B Block Hostel",
        type: "hostel",
        lat: 12.841989,
        lng: 80.157212,
        description: "Student hostel – B Block"
    },
    {
        name: "C Block Hostel",
        type: "hostel",
        lat: 12.842928,
        lng: 80.157714,
        description: "Student hostel – C Block"
    },
    {
        name: "D1 Hostel",
        type: "hostel",
        lat: 12.843741,
        lng: 80.152263,
        description: "Student hostel – D1"
    },
    {
        name: "D2 Hostel",
        type: "hostel",
        lat: 12.843537,
        lng: 80.151615,
        description: "Student hostel – D2"
    },
    {
        name: "E Block Hostel",
        type: "hostel",
        lat: 12.844667,
        lng: 80.158219,
        description: "Student hostel – E Block"
    },

    /* =========================
       Food & Amenities
    ========================= */

    {
        name: "North Square Food Court",
        type: "food",
        lat: 12.843893,
        lng: 80.154199,
        description: "Main food court"
    },
    {
        name: "Domino's Pizza",
        type: "food",
        lat: 12.843790,
        lng: 80.152727,
        description: "Pizza outlet"
    },
    {
        name: "Gazebo",
        type: "food",
        lat: 12.841478,
        lng: 80.154783,
        description: "Outdoor food and seating area"
    },
    {
        name: "VMart Supermarket",
        type: "services",
        lat: 12.844578,
        lng: 80.153872,
        description: "Daily essentials and groceries"
    },

    /* =========================
       Guest Facilities
    ========================= */

    {
        name: "Guest House",
        type: "services",
        lat: 12.842423,
        lng: 80.152510,
        description: "Accommodation for visitors and parents"
    },

    /* =========================
       Academic / Research Blocks
    ========================= */

    {
        name: "Sigma Block",
        type: "academic",
        lat: 12.844479,
        lng: 80.153582,
        description: "Research and innovation block"
    },

    {
        name: "SEDAXIS Special Workshop",
        type: "academic",
        lat: 12.844134,
        lng: 80.158356,
        description: "Specialized design and advanced engineering workshop"
    }


];

/* =========================
   Campus Center (Map Default)
========================= */

const campusCenter = {
    lat: 12.8429,
    lng: 80.1545,
    zoom: 17
};
