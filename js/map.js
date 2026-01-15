/**
 * SVG Map Controller
 * 
 * This file handles:
 * - Loading and displaying the SVG map
 * - Pan and zoom with touch/mouse support
 * - Real-time GPS tracking
 * - User location indicator
 * 
 * Uses navigation.js for:
 * - Finding nearest node
 * - Route highlighting
 */

// ========================================
// STATE
// ========================================
let svg = null;
let svgContainer = null;
let watchId = null;
let userLocation = null;

// Transform state for pan/zoom
let transform = {
    x: 0,
    y: 0,
    scale: 1
};

// Gesture state
let isDragging = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;

// Zoom limits
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

// ========================================
// INITIALIZATION
// ========================================
/**
 * Initialize the SVG map application
 */
async function initMap() {
    console.log('Initializing SVG map...');

    svgContainer = document.getElementById('map-container');

    // Select the already inlined SVG
    const svgWrapper = document.getElementById('svg-wrapper');
    if (svgWrapper) {
        svg = svgWrapper.querySelector('svg');
        console.log('SVG map found in DOM');
    } else {
        console.error('SVG map not found in DOM');
        showNotification('Map element missing', 'error');
        return;
    }

    // Setup pan/zoom handlers
    setupPanZoom();

    // Setup building click handlers (from navigation.js)
    setupBuildingClickHandlers();

    // Populate destination dropdown
    populateDestinationDropdown();

    // Start GPS tracking
    startLocationTracking();

    // Setup UI controls
    setupControls();

    // Center the map initially
    centerMap();

    console.log('SVG map initialized successfully');
}

// ========================================
// PAN & ZOOM
// ========================================
/**
 * Setup pan and zoom event handlers
 */
function setupPanZoom() {
    // Mouse events
    svgContainer.addEventListener('mousedown', onPointerDown);
    svgContainer.addEventListener('mousemove', onPointerMove);
    svgContainer.addEventListener('mouseup', onPointerUp);
    svgContainer.addEventListener('mouseleave', onPointerUp);

    // Touch events
    svgContainer.addEventListener('touchstart', onTouchStart, { passive: false });
    svgContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    svgContainer.addEventListener('touchend', onTouchEnd);

    // Wheel zoom
    svgContainer.addEventListener('wheel', onWheel, { passive: false });

    console.log('Pan/zoom handlers initialized');
}

function onPointerDown(e) {
    if (e.target.closest('.block')) return; // Don't drag when clicking buildings

    isDragging = true;
    startX = e.clientX - transform.x;
    startY = e.clientY - transform.y;
    svgContainer.style.cursor = 'grabbing';
}

function onPointerMove(e) {
    if (!isDragging) return;

    transform.x = e.clientX - startX;
    transform.y = e.clientY - startY;
    applyTransform();
}

function onPointerUp() {
    isDragging = false;
    svgContainer.style.cursor = 'grab';
}

// Touch handling with pinch-to-zoom
let initialPinchDistance = 0;
let initialScale = 1;

function onTouchStart(e) {
    if (e.touches.length === 1) {
        if (e.target.closest('.block')) return;

        isDragging = true;
        startX = e.touches[0].clientX - transform.x;
        startY = e.touches[0].clientY - transform.y;
    } else if (e.touches.length === 2) {
        // Pinch gesture
        isDragging = false;
        initialPinchDistance = getPinchDistance(e.touches);
        initialScale = transform.scale;
    }
}

function onTouchMove(e) {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
        transform.x = e.touches[0].clientX - startX;
        transform.y = e.touches[0].clientY - startY;
        applyTransform();
    } else if (e.touches.length === 2) {
        // Pinch zoom
        const currentDistance = getPinchDistance(e.touches);
        const scaleChange = currentDistance / initialPinchDistance;

        transform.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, initialScale * scaleChange));
        applyTransform();
    }
}

function onTouchEnd() {
    isDragging = false;
    initialPinchDistance = 0;
}

function getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function onWheel(e) {
    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = transform.scale * delta;

    if (newScale >= MIN_SCALE && newScale <= MAX_SCALE) {
        // Zoom towards mouse position
        const rect = svgContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        transform.x = mouseX - (mouseX - transform.x) * delta;
        transform.y = mouseY - (mouseY - transform.y) * delta;
        transform.scale = newScale;

        applyTransform();
    }
}

function applyTransform() {
    const wrapper = document.getElementById('svg-wrapper');
    if (wrapper) {
        wrapper.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
    }
}

function centerMap() {
    const containerRect = svgContainer.getBoundingClientRect();

    // Center the map in the container
    transform.x = containerRect.width / 2 - 350; // Half of SVG width (700/2)
    transform.y = containerRect.height / 2 - 420; // Half of SVG height (840/2)
    transform.scale = 0.8;

    applyTransform();
}

// ========================================
// GPS TRACKING
// ========================================
function startLocationTracking() {
    if (!navigator.geolocation) {
        showNotification('Geolocation not supported', 'error');
        hideLoading();
        return;
    }

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

function onLocationSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    console.log(`Location: ${lat}, ${lng} (±${accuracy}m)`);

    userLocation = { lat, lng, accuracy };

    // Update navigation module with new location
    updateUserLocation(lat, lng);

    // Hide loading indicator
    hideLoading();
}

function onLocationError(error) {
    console.error('Location error:', error);

    let errorMessage = 'Unable to get your location';
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
        case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
    }

    showNotification(errorMessage, 'warning');
    hideLoading();
}

// ========================================
// UI CONTROLS
// ========================================
function setupControls() {
    // Location button
    const locateBtn = document.getElementById('locate-btn');
    if (locateBtn) {
        locateBtn.addEventListener('click', () => {
            if (userLocation) {
                centerOnUser();
            } else {
                showNotification('Waiting for GPS location...', 'info');
            }
        });
    }

    // Zoom controls
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            transform.scale = Math.min(MAX_SCALE, transform.scale * 1.3);
            applyTransform();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            transform.scale = Math.max(MIN_SCALE, transform.scale * 0.7);
            applyTransform();
        });
    }

    // Clear navigation button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearNavigation);
    }

    // Destination dropdown
    const destinationSelect = document.getElementById('destination-select');
    if (destinationSelect) {
        destinationSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                selectDestination(e.target.value);
            }
        });
    }
}

function centerOnUser() {
    // For now, just re-center the map
    // In a more advanced version, we could position based on nearest node
    centerMap();
    showNotification('Centered on your location', 'info');
}

function populateDestinationDropdown() {
    const select = document.getElementById('destination-select');
    if (!select) return;

    // Group nodes by type
    const groups = {};
    for (const [nodeId, node] of Object.entries(campusNodes)) {
        const type = node.type || 'other';
        if (!groups[type]) groups[type] = [];
        groups[type].push({ id: nodeId, name: node.name });
    }

    // Create optgroups
    const typeLabels = {
        entrance: '🚪 Entrances',
        academic: '🏛️ Academic Buildings',
        facility: '🏢 Facilities',
        food: '🍽️ Food & Dining',
        emergency: '🏥 Emergency',
        services: '🛒 Services',
        hostel: '🏠 Hostels'
    };

    for (const [type, nodes] of Object.entries(groups)) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = typeLabels[type] || type;

        nodes.sort((a, b) => a.name.localeCompare(b.name));
        nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node.id;
            option.textContent = node.name;
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    }

    console.log('Destination dropdown populated');
}

// ========================================
// UTILITIES
// ========================================
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

// Stop GPS on page unload
window.addEventListener('beforeunload', () => {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initMap);
