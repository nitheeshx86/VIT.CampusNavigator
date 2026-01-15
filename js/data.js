/**
 * Campus Navigation Data – VIT Chennai
 * 
 * This file contains:
 * - campusNodes: GPS coordinates mapped to SVG element IDs
 * - predefinedRoutes: Sequences of road IDs for navigation
 * - campusCenter: Default map view center
 */

// ========================================
// CAMPUS NODES (GPS → SVG Mapping)
// ========================================
const campusNodes = {
    // Entrances
    main_gate: {
        name: "D Hostel",
        lat: 12.840440,
        lng: 80.152999,
        svgId: "block_main_gate", // Current Label: main entrance
        type: "hostel"
    },

    // Administrative
    admin: {
        name: "Admin Block",
        lat: 12.841989,
        lng: 80.157212,
        svgId: "block_b_hostel", // Current Label: bblock hostel
        type: "admin"
    },
    reception: {
        name: "Reception",
        lat: 12.843537,
        lng: 80.151615,
        svgId: "block_d2_hostel", // Current Label: d2 hostel
        type: "admin"
    },

    // Academic Buildings
    ab1: {
        name: "Academic Block 1",
        lat: 12.843294,
        lng: 80.153573,
        svgId: "block_library",  // Swapped from block_ab1
        type: "academic"
    },
    ab2: {
        name: "Academic Block 2",
        lat: 12.840685,
        lng: 80.154006,
        svgId: "block_ab1", // Swapped from block_library
        type: "academic"
    },
    ab3: {
        name: "Academic Block 3",
        lat: 12.839507,
        lng: 80.155204,
        svgId: "block_mg_auditorium", // Current Label: mg auditorium
        type: "academic"
    },
    ab4: {
        name: "Academic Block 4",
        lat: 12.843158,
        lng: 80.154688,
        svgId: "block_ab3", // Current Label: ab3
        type: "academic"
    },
    ab5: {
        name: "Academic Block 5",
        lat: 12.844667,
        lng: 80.158219,
        svgId: "block_e_hostel", // Current Label: eblock hostel
        type: "academic"
    },
    library: {
        name: "Central Library",
        lat: 12.842928,
        lng: 80.157714,
        svgId: "block_c_hostel", // Current Label: cblock hostel
        type: "academic"
    },
    sigma: {
        name: "Sigma Block",
        lat: 12.844578,
        lng: 80.153872,
        svgId: "block_vmart", // Current Label: vmart supermarket
        type: "academic"
    },

    // Facilities
    mg_auditorium: {
        name: "MG Auditorium",
        lat: 12.841488,
        lng: 80.156404,
        svgId: "block_health_centre", // Current Label: health center
        type: "facility"
    },
    gazebo: {
        name: "Gazebo",
        lat: 12.843893,
        lng: 80.154199,
        svgId: "block_north_square", // Current Label: north square
        type: "food"
    },
    north_square: {
        name: "North Square Food Court",
        lat: 12.841478,
        lng: 80.154783,
        svgId: "block_gazebo", // Current Label: gazebo
        type: "food"
    },
    health_centre: {
        name: "Health Centre",
        lat: 12.841100,
        lng: 80.156060,
        svgId: "block_ab5", // Current Label: ab5
        type: "emergency"
    },
    gymkhana: {
        name: "Gymkhana",
        lat: 12.840889,
        lng: 80.154006,
        svgId: "block_admin", // Current Label: adminstrative block
        type: "facility"
    },

    // Services
    guest_house: {
        name: "Guest House",
        lat: 12.843741,
        lng: 80.152263,
        svgId: "block_d1_hostel", // Current Label: d1 hostel
        type: "services"
    },
    vmart: {
        name: "VMart Supermarket",
        lat: 12.844479,
        lng: 80.153582,
        svgId: "block_sigma", // Current Label: sigma block
        type: "services"
    },
    aavin: {
        name: "Aavin",
        lat: 12.843790,
        lng: 80.152727,
        svgId: "block_dominos", // Current Label: domino's pizza
        type: "food"
    },

    // Hostels
    a_hostel: {
        name: "A Block Hostel",
        lat: 12.842423,
        lng: 80.152510,
        svgId: "block_guest_house", // Current Label: guesthouse
        type: "hostel"
    },
    b_hostel: {
        name: "B Block Hostel",
        lat: 12.842919,
        lng: 80.156242,
        svgId: "block_ab2_north", // Current Label: ab2(north)
        type: "hostel"
    },
    c_hostel: {
        name: "C Block Hostel",
        lat: 12.842500,
        lng: 80.156000,
        svgId: "block_ab2_south", // Current Label: ab2(south)
        type: "hostel"
    }
};

// ========================================
// PREDEFINED ROUTES
// Each route is defined as an array of road SVG IDs
// Routes are bidirectional - reverse lookup is generated automatically
// ========================================
const predefinedRoutes = {
    // From Main Gate
    "main_gate->admin": [
        "road_gate_to_admin"
    ],
    "main_gate->library": [
        "road_gate_to_admin",
        "road_admin_to_library"
    ],
    "main_gate->gazebo": [
        "road_gate_to_admin",
        "road_admin_to_library",
        "road_library_to_gazebo"
    ],
    "main_gate->ab3": [
        "road_gate_to_admin",
        "road_admin_to_library",
        "road_library_to_gazebo",
        "road_gazebo_to_ab3"
    ],
    "main_gate->guest_house": [
        "road_gate_to_admin",
        "road_to_guest_house"
    ],

    // From Library
    "library->gazebo": [
        "road_library_to_gazebo"
    ],
    "library->ab3": [
        "road_library_to_gazebo",
        "road_gazebo_to_ab3"
    ],
    "library->north_square": [
        "road_library_to_gazebo",
        "road_gazebo_to_ab3",
        "road_ab3_curve"
    ],

    // From Gazebo
    "gazebo->ab3": [
        "road_gazebo_to_ab3"
    ],
    "gazebo->north_square": [
        "road_gazebo_to_ab3",
        "road_ab3_curve"
    ],

    // From AB3
    "ab3->north_square": [
        "road_ab3_curve"
    ],
    "ab3->ab1": [
        "road_ab3_to_north_square",
        "road_to_ab1"
    ],
    "ab3->ab5": [
        "road_ab3_to_north_square",
        "road_to_ab5"
    ],

    // From AB1
    "ab1->ab2_north": [
        "road_to_ab1",
        "road_ab2_connector_north"
    ],
    "ab1->ab2_south": [
        "road_to_ab1",
        "road_ab2_connector_north",
        "road_ab2_connector_south"
    ],
    "ab1->ab5": [
        "road_to_ab1",
        "road_to_ab5"
    ],

    // From North Square
    "north_square->ab1": [
        "road_ab3_to_north_square",
        "road_to_ab1"
    ],
    "north_square->ab5": [
        "road_ab3_to_north_square",
        "road_to_ab5"
    ],
    "north_square->e_hostel": [
        "road_east_diagonal"
    ],
    "north_square->health_centre": [
        "road_to_health_centre"
    ],

    // From AB2
    "ab2_north->ab5": [
        "road_ab2_connector_south",
        "road_to_ab5"
    ],

    // Hostel Routes
    "north_square->b_hostel": [
        "road_to_health_centre",
        "road_central_junction"
    ],
    "north_square->c_hostel": [
        "road_to_health_centre",
        "road_central_junction"
    ],

    // Full campus traversal examples
    "main_gate->ab1": [
        "road_gate_to_admin",
        "road_admin_to_library",
        "road_library_to_gazebo",
        "road_gazebo_to_ab3",
        "road_ab3_curve",
        "road_ab3_to_north_square",
        "road_to_ab1"
    ],
    "main_gate->health_centre": [
        "road_entrance_to_library",
        "road_library_junction_east",
        "road_central_junction",
        "road_to_health_centre"
    ]
};

// ========================================
// HELPER: Generate reverse routes
// ========================================
function generateReverseRoutes() {
    const reverseRoutes = {};
    for (const [key, roads] of Object.entries(predefinedRoutes)) {
        const [from, to] = key.split("->");
        const reverseKey = `${to}->${from}`;
        // Roads are the same, just traversed in opposite direction
        if (!predefinedRoutes[reverseKey]) {
            reverseRoutes[reverseKey] = [...roads].reverse();
        }
    }
    Object.assign(predefinedRoutes, reverseRoutes);
}

// Generate reverse routes on load
generateReverseRoutes();

// ========================================
// CAMPUS CENTER (Default View)
// ========================================
const campusCenter = {
    lat: 12.8429,
    lng: 80.1545
};

// ========================================
// TYPE COLORS (for UI)
// ========================================
const typeColors = {
    entrance: '#607D8B',
    academic: '#4285f4',
    facility: '#9C27B0',
    food: '#FF9800',
    emergency: '#ea4335',
    services: '#00BCD4',
    hostel: '#34a853'
};

console.log('Campus data loaded:', Object.keys(campusNodes).length, 'nodes,', Object.keys(predefinedRoutes).length, 'routes');

// ========================================
// CAMPUS CONNECTIVITY GRAPH (Physical Layout)
// Nodes: SVG IDs of blocks
// Edges: Array of road SVG IDs connecting them
// ========================================
const campusGraph = {
    // --- Main Spine ---
    "block_main_gate": {
        "block_admin": ["road_gate_to_admin"]
    },
    "block_admin": {
        "block_main_gate": ["road_gate_to_admin"],
        "block_library": ["road_admin_to_library"],
        "block_guest_house": ["road_to_guest_house"]
    },
    "block_guest_house": {
        "block_admin": ["road_to_guest_house"]
    },
    // Library (now AB1) -> Admin, Gazebo
    "block_library": {
        "block_admin": ["road_admin_to_library"],
        "block_gazebo": ["road_library_to_gazebo"]
    },
    // Gazebo (now North Square) -> Library, AB3
    "block_gazebo": {
        "block_library": ["road_library_to_gazebo"],
        "block_ab3": ["road_gazebo_to_ab3"]
    },

    // --- Central Hub (AB3 / North Square Area) ---
    // AB3 (now AB4)
    "block_ab3": {
        "block_gazebo": ["road_gazebo_to_ab3"],
        "block_north_square": ["road_ab3_curve"]
    },
    // North Square (now Gazebo) -> Critical Hub
    "block_north_square": {
        "block_ab3": ["road_ab3_curve"],
        "block_ab1": ["road_ab3_to_north_square", "road_aavin_to_ab2"], // to AB2
        "block_health_centre": ["road_health_to_bblock"], // to MGAudi area
        "block_e_hostel": ["road_aavin"], // to AB5 (E Hostel shape)

        // Aavin / Sigma / VMART
        // Aavin is near road_aavin
        "block_dominos": ["road_aavin"],
        "block_vmart": ["road_aavin_to_ab2"],
        "block_sigma": ["road_aavin_to_ab2"]
    },

    // --- AB2 Area ---
    // AB2 (now block_ab1 shape)
    "block_ab1": {
        "block_north_square": ["road_aavin_to_ab2", "road_ab3_to_north_square"],
        "block_dominos": ["road_aavin_to_ab2", "road_aavin"], // Connect to Aavin directly
        "block_ab2_north": ["road_ab2_connector_north"] // to B Hostel
    },

    // --- Aavin (Dominos shape) ---
    "block_dominos": {
        "block_north_square": ["road_aavin"],
        "block_ab1": ["road_aavin", "road_aavin_to_ab2"], // "from middle of aavin road"
        "block_e_hostel": ["road_aavin", "road_gazebo_to_ab5"], // to AB5
        "block_health_centre": ["road_aavin", "road_health_to_bblock"] // to Health Centre
    },

    // --- AB5 Area (E Hostel shape) ---
    "block_e_hostel": {
        "block_dominos": ["road_gazebo_to_ab5", "road_aavin"],
        "block_north_square": ["road_aavin", "road_ab3_to_north_square"]
    },

    // --- Health Centre Area (AB5 shape) ---
    "block_ab5": {
        "block_health_centre": ["road_health_to_bblock"]
    },
    // Health Centre (MGAudi shape)
    "block_health_centre": {
        "block_north_square": ["road_health_to_bblock"],
        "block_dominos": ["road_health_to_bblock", "road_aavin"],
        "block_b_hostel": ["road_central_junction", "road_health_to_bblock"],
        "block_ab5": ["road_health_to_bblock"]
    },

    // --- Hostels ---
    // B Hostel (AB2 North shape)
    "block_ab2_north": {
        "block_ab1": ["road_ab2_connector_north"],
        "block_ab2_south": ["road_bblock_to_cblock"] // to C Block
    },
    // C Hostel (AB2 South shape)
    "block_ab2_south": {
        "block_ab2_north": ["road_bblock_to_cblock"],
        "block_e_hostel": ["road_to_ab5"] // Tentative if connected
    },

    // --- Other Hostels ---
    "block_b_hostel": { "block_health_centre": ["road_central_junction"] },
    "block_c_hostel": { "block_health_centre": ["road_central_junction"] },
    "block_d1_hostel": { "block_health_centre": ["road_central_junction"] },
    "block_d2_hostel": { "block_health_centre": ["road_central_junction"] },

    // --- Outlying ---
    "block_vmart": { "block_north_square": ["road_aavin_to_ab2"] },
    "block_sigma": { "block_north_square": ["road_aavin_to_ab2"] }
};
