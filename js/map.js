/**
 * Map Initialization and GPS Tracking
 * 
 * This file handles:
 * - Leaflet map initialization with OpenStreetMap
 * - Real-time GPS tracking with accuracy circle
 * - Custom campus location markers
 * - Popup creation with navigation buttons
 * 
 * Global variables declared here:
 * - map: Leaflet map instance (used in routing.js)
 * - userMarker: User location marker (used in routing.js)
 */

// Global variables (declared once, used across files)
let map;
let userMarker;
let accuracyCircle;
let watchId;
let isMapCentered = false;

// Campus restriction constants
const CAMPUS_CENTER = [12.843054, 80.155178]; // Updated VIT Chennai Center
const CAMPUS_RADIUS_KM = 1; // adjust (1–3km is ideal)

// Category marker colors
const markerColors = {
    academic: '#4285f4',
    hostel: '#34a853',
    emergency: '#ea4335'
};

/**
 * Initialize the Leaflet map
 */
function initMap() {
    // Create a Bounding Box
    const campusBounds = L.latLng(CAMPUS_CENTER).toBounds(CAMPUS_RADIUS_KM * 1000);

    // Create map instance locked to campus area
    map = L.map('map', {
        maxBounds: campusBounds,
        maxBoundsViscosity: 1.0, // hard lock
        minZoom: 16,
        maxZoom: 20,
        zoomControl: true,
        attributionControl: true
    }).setView(CAMPUS_CENTER, 17);

    // Add Tile Layer (CartoDB Voyager No Labels - used as base for navy theme)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        minZoom: 16
    }).addTo(map);

    // Add campus location markers
    addCampusMarkers();

    // Start GPS tracking
    startLocationTracking();

    // Setup location button
    setupLocationButton();

    console.log('Map initialized successfully');
}

/**
 * Add markers for all campus locations
 */
function addCampusMarkers() {
    campusLocations.forEach(location => {
        const markerColor = markerColors[location.type] || '#666666';

        // Create custom marker icon
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width: 24px;
                height: 24px;
                background-color: ${markerColor};
                border: 3px solid #ffffff;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });

        // Create marker
        const marker = L.marker([location.lat, location.lng], {
            icon: markerIcon,
            title: location.name
        }).addTo(map);

        // Create popup content with navigation button
        const popupContent = `
            <div class="popup-content">
                <div class="popup-title">${location.name}</div>
                <div class="popup-category">${location.type}</div>
                <div class="popup-description">${location.description}</div>
                <button class="navigate-btn" onclick="startNavigation(${location.lat}, ${location.lng})">
                    Navigate Here
                </button>
            </div>
        `;

        marker.bindPopup(popupContent, {
            closeButton: true,
            maxWidth: 250
        });
    });

    console.log(`Added ${campusLocations.length} campus markers`);
}

/**
 * Start real-time GPS tracking
 */
function startLocationTracking() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        hideLoading();
        return;
    }

    // Watch user position continuously
    watchId = navigator.geolocation.watchPosition(
        onLocationSuccess,
        onLocationError,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );

    console.log('GPS tracking started');
}

/**
 * Handle successful location update
 */
function onLocationSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    console.log(`Location updated: ${lat}, ${lng} (±${accuracy}m)`);

    // Create or update user marker
    if (!userMarker) {
        // Create user marker with custom icon
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: '<div style="width:16px; height:16px; background:#4285f4; border:3px solid #fff; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
        userMarker.bindPopup('You are here');

        // Create accuracy circle
        accuracyCircle = L.circle([lat, lng], {
            radius: accuracy,
            color: '#4285f4',
            fillColor: '#4285f4',
            fillOpacity: 0.1,
            weight: 1
        }).addTo(map);

        // Center map on first location fix
        if (!isMapCentered) {
            map.setView([lat, lng], 17);
            isMapCentered = true;
        }
    } else {
        // Update existing marker and circle
        userMarker.setLatLng([lat, lng]);
        accuracyCircle.setLatLng([lat, lng]);
        accuracyCircle.setRadius(accuracy);
    }

    // Hide loading indicator
    hideLoading();
}

/**
 * Handle location error
 */
function onLocationError(error) {
    console.error('Location error:', error);

    let errorMessage = 'Unable to get your location';

    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
    }

    alert(errorMessage);
    hideLoading();
}

/**
 * Setup "My Location" button functionality
 */
function setupLocationButton() {
    const locateBtn = document.getElementById('locate-btn');

    locateBtn.addEventListener('click', () => {
        if (userMarker) {
            const userLatLng = userMarker.getLatLng();
            map.setView(userLatLng, 17, { animate: true });
            userMarker.openPopup();
        } else {
            alert('Waiting for GPS location...');
        }
    });
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

/**
 * Stop GPS tracking when page unloads
 */
window.addEventListener('beforeunload', () => {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
});

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', initMap);
