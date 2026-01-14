/**
 * Routing and Navigation
 * 
 * This file handles:
 * - Turn-by-turn navigation using Leaflet Routing Machine
 * - Route calculation from user location to destination
 * - Walking route configuration using OSRM
 * 
 * Uses global variables from map.js:
 * - map: Leaflet map instance
 * - userMarker: User location marker
 */

// Global routing control instance
let routingControl = null;

/**
 * Start navigation from user location to destination
 * 
 * @param {number} destLat - Destination latitude
 * @param {number} destLng - Destination longitude
 */
function startNavigation(destLat, destLng) {
    // Check if user location is available
    if (!userMarker) {
        alert('Waiting for your location. Please allow GPS access and try again.');
        return;
    }

    // Get user's current location
    const userLatLng = userMarker.getLatLng();

    console.log(`Starting navigation from [${userLatLng.lat}, ${userLatLng.lng}] to [${destLat}, ${destLng}]`);

    // Remove existing route if present
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
        console.log('Removed previous route');
    }

    // Create new routing control
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(userLatLng.lat, userLatLng.lng),
            L.latLng(destLat, destLng)
        ],

        // Use reliable OSM walking router
        router: L.Routing.osrmv1({
            serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1',
            profile: 'foot',
            snapTolerance: 50, // Increase snapping for campus paths
            alternatives: true  // Request multiple route options
        }),

        // Routing UI configuration
        routeWhileDragging: false,
        showAlternatives: true,
        addWaypoints: false,

        // Line style for the route (Dashed line for walking)
        lineOptions: {
            styles: [
                { color: '#ffffff', opacity: 0.9, weight: 10 }, // Outer glow
                { color: '#4285f4', opacity: 0.8, weight: 6, dashArray: '1, 12' } // Dashed blue line
            ]
        },

        // Instructions formatter
        createMarker: function (i, waypoint, n) {
            // Only show markers at start and end
            if (i === 0 || i === n - 1) {
                const markerColor = i === 0 ? '#34a853' : '#ea4335';
                const markerIcon = L.divIcon({
                    className: 'route-marker',
                    html: `<div style="
                        width: 28px;
                        height: 28px;
                        background-color: ${markerColor};
                        border: 3px solid #ffffff;
                        border-radius: 50%;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                    ">${i === 0 ? 'A' : 'B'}</div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                });

                return L.marker(waypoint.latLng, {
                    icon: markerIcon,
                    draggable: false
                });
            }
            return null;
        },

        // Container styling
        containerClassName: 'routing-container'

    }).addTo(map);

    // Handle routing events
    routingControl.on('routesfound', function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;

        // Convert distance to appropriate unit
        const distance = summary.totalDistance < 1000
            ? `${Math.round(summary.totalDistance)}m`
            : `${(summary.totalDistance / 1000).toFixed(2)}km`;

        // Convert time to minutes
        const duration = Math.ceil(summary.totalTime / 60);

        console.log(`Route found: ${distance}, ~${duration} minutes walking`);

        // Optional: Show route summary notification
        showNotification(`🚶 ${distance} · ${duration} min walk`);
    });

    routingControl.on('routingerror', function (e) {
        console.error('Routing error:', e);
        alert('Unable to calculate route. Please try again.');
    });

    // Close any open popups
    map.closePopup();

    console.log('Route calculation started');
}

/**
 * Clear current navigation route
 */
function clearNavigation() {
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
        console.log('Navigation cleared');
    }
}

/**
 * Show temporary notification to user
 * 
 * @param {string} message - Notification message
 */
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'route-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #34a853;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideDown 0.3s ease;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
    }
`;
document.head.appendChild(style);

console.log('Routing module loaded');
