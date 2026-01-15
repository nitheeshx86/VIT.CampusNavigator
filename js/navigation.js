/**
 * Campus Navigation Logic
 * 
 * Core functionality:
 * - Find nearest campus node from GPS coordinates
 * - Highlight buildings and roads in SVG
 * - Manage navigation state
 * 
 * Uses global variables from data.js:
 * - campusNodes: GPS coordinates mapped to SVG IDs
 * - predefinedRoutes: Road sequences between nodes
 */

// ========================================
// STATE MANAGEMENT
// ========================================
let currentLocationNode = null;  // Nearest node to user's GPS
let selectedDestination = null;  // User's selected destination
let activeRoute = [];            // Currently highlighted road IDs

// ========================================
// HAVERSINE DISTANCE CALCULATION
// ========================================
/**
 * Calculate distance between two GPS coordinates in meters
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ========================================
// NEAREST NODE DETECTION
// ========================================
/**
 * Find the nearest campus node to given GPS coordinates
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @returns {object} { nodeId, node, distance }
 */
function findNearestNode(lat, lng) {
    let nearest = null;
    let minDistance = Infinity;
    let nearestId = null;

    for (const [nodeId, node] of Object.entries(campusNodes)) {
        const distance = haversineDistance(lat, lng, node.lat, node.lng);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = node;
            nearestId = nodeId;
        }
    }

    return {
        nodeId: nearestId,
        node: nearest,
        distance: minDistance
    };
}

// ========================================
// SVG HIGHLIGHTING
// ========================================
/**
 * Highlight a building in the SVG
 * @param {string} svgId - SVG element ID (e.g., "block_ab3")
 * @param {string} highlightType - "current" or "destination"
 */
function highlightBlock(svgId, highlightType = 'current') {
    const element = document.getElementById(svgId);
    if (element) {
        // Remove existing highlight classes
        element.classList.remove('current', 'destination');
        // Add new highlight
        element.classList.add('active', highlightType);
        console.log(`Highlighted ${svgId} as ${highlightType}`);
    } else {
        console.warn(`SVG element not found: ${svgId}`);
    }
}

/**
 * Remove highlight from a building
 * @param {string} svgId - SVG element ID
 */
function unhighlightBlock(svgId) {
    const element = document.getElementById(svgId);
    if (element) {
        element.classList.remove('active', 'current', 'destination');
    }
}

/**
 * Highlight a sequence of roads
 * @param {string[]} roadIds - Array of road SVG IDs
 */
function highlightRoads(roadIds) {
    roadIds.forEach(roadId => {
        const element = document.getElementById(roadId);
        if (element) {
            element.classList.add('active');
        } else {
            console.warn(`Road element not found: ${roadId}`);
        }
    });
    console.log(`Highlighted ${roadIds.length} road segments`);
}

/**
 * Clear all road highlights
 */
function clearRoadHighlights() {
    document.querySelectorAll('.road.active').forEach(road => {
        road.classList.remove('active');
    });
}

/**
 * Clear all highlights (buildings and roads)
 */
function clearAllHighlights() {
    document.querySelectorAll('.block.active, .road.active').forEach(el => {
        el.classList.remove('active', 'current', 'destination');
    });
    activeRoute = [];
}

// ========================================
// ROUTE MANAGEMENT
// ========================================

/**
 * Find path between two SVG blocks using BFS
 * @param {string} startSvgId - SVG ID of starting block
 * @param {string} endSvgId - SVG ID of destination block
 * @returns {object|null} { roads: string[], nodes: string[] } or null
 */
function findPath(startSvgId, endSvgId) {
    if (startSvgId === endSvgId) return { roads: [], nodes: [startSvgId] };

    // Check if nodes exist in graph
    if (!campusGraph[startSvgId]) {
        console.warn(`Node not in graph: ${startSvgId}`);
        return null;
    }

    // Queue: [ [current_node_id, [list_of_road_segments], [list_of_nodes_visited]] ]
    const queue = [[startSvgId, [], [startSvgId]]];
    const visited = new Set();
    visited.add(startSvgId);

    while (queue.length > 0) {
        const [currentNode, path, visitedNodes] = queue.shift();

        if (currentNode === endSvgId) {
            return { roads: path, nodes: visitedNodes };
        }

        // Get neighbors
        const neighbors = campusGraph[currentNode];
        if (!neighbors) continue;

        for (const [neighborId, roads] of Object.entries(neighbors)) {
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                // Extend path with the roads connecting these two nodes
                const newPath = [...path, ...roads];
                const newVisitedNodes = [...visitedNodes, neighborId];
                queue.push([neighborId, newPath, newVisitedNodes]);
            }
        }
    }
    return null; // No path found
}

/**
 * Get display name for an SVG ID
 * @param {string} svgId 
 */
function getBuildingName(svgId) {
    // Search in campusNodes
    for (const node of Object.values(campusNodes)) {
        if (node.svgId === svgId) return node.name;
    }
    // Fallback formatting
    return svgId.replace('block_', '').replace(/_/g, ' ').toUpperCase();
}

/**
 * Update the directions panel UI
 * @param {string[]} nodeSvgIds - Sequence of visited nodes
 */
function updateDirectionsPanel(nodeSvgIds) {
    const panel = document.getElementById('directions-panel');
    const list = document.getElementById('directions-list');

    if (!panel || !list) return;

    list.innerHTML = '';

    if (!nodeSvgIds || nodeSvgIds.length === 0) {
        panel.classList.add('hidden');
        return;
    }

    panel.classList.remove('hidden');

    nodeSvgIds.forEach((svgId, index) => {
        const li = document.createElement('li');
        const name = getBuildingName(svgId);

        // Determine action text
        let action = "";
        if (index === 0) action = "Start at";
        else if (index === nodeSvgIds.length - 1) action = "Arrive at";
        else action = "Go past";

        li.innerHTML = `<strong>${action} ${name}</strong>`;

        // Add road info if available (simplified)
        if (index < nodeSvgIds.length - 1) {
            // We could add road names here if we had them mapped
            // <div class="road-info">Follow path</div>
        }

        list.appendChild(li);
    });
}

/**
 * Show route between two nodes
 * @param {string} fromNodeId - Starting node ID
 * @param {string} toNodeId - Destination node ID
 * @returns {boolean} Success
 */
function showRoute(fromNodeId, toNodeId) {
    const fromNode = campusNodes[fromNodeId];
    const toNode = campusNodes[toNodeId];

    if (!fromNode || !toNode) {
        console.error("Invalid nodes for routing");
        return false;
    }

    const result = findPath(fromNode.svgId, toNode.svgId);

    if (!result) {
        console.warn(`No path found from ${fromNode.name} to ${toNode.name}`);
        showNotification(`No route found to ${toNode.name}`, 'warning');
        return false;
    }

    const { roads, nodes } = result;

    // Clear previous route
    clearRoadHighlights();

    // Highlight new route
    highlightRoads(roads);
    activeRoute = roads;

    // Highlight destination
    if (selectedDestination) {
        unhighlightBlock(campusNodes[selectedDestination].svgId);
    }
    selectedDestination = toNodeId;
    highlightBlock(toNode.svgId, 'destination');

    // Show notification
    showNotification(`🚶 Route: ${fromNode.name} → ${toNode.name}`, 'success');

    // Show Directions Panel
    updateDirectionsPanel(nodes);

    return true;
}

/**
 * Clear current navigation
 */
function clearNavigation() {
    clearAllHighlights();
    selectedDestination = null;

    // Clear directions panel
    updateDirectionsPanel([]);

    // Re-highlight current location if known
    if (currentLocationNode) {
        highlightBlock(campusNodes[currentLocationNode].svgId, 'current');
    }

    console.log('Navigation cleared');
}

// ========================================
// LOCATION UPDATE HANDLER
// ========================================
/**
 * Update user's location and find nearest node
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 */
function updateUserLocation(lat, lng) {
    const { nodeId, node, distance } = findNearestNode(lat, lng);

    // Only update if changed or significantly closer
    if (nodeId !== currentLocationNode) {
        // Remove old highlight
        if (currentLocationNode) {
            unhighlightBlock(campusNodes[currentLocationNode].svgId);
        }

        currentLocationNode = nodeId;

        // Highlight new current location (unless it's the destination)
        if (nodeId !== selectedDestination) {
            highlightBlock(node.svgId, 'current');
        }

        // Update UI
        updateLocationDisplay(node.name, distance);
        console.log(`Nearest node: ${node.name} (${Math.round(distance)}m away)`);

        // If we have a destination, recalculate route
        if (selectedDestination && selectedDestination !== nodeId) {
            showRoute(nodeId, selectedDestination);
        }
    }
}

/**
 * Update the location display in the UI
 * @param {string} nodeName - Name of nearest node
 * @param {number} distance - Distance in meters
 */
function updateLocationDisplay(nodeName, distance) {
    const locationDisplay = document.getElementById('current-location');
    if (locationDisplay) {
        const distanceText = distance < 1000
            ? `${Math.round(distance)}m away`
            : `${(distance / 1000).toFixed(1)}km away`;
        locationDisplay.textContent = `Near: ${nodeName} (${distanceText})`;
    }
}

// ========================================
// DESTINATION SELECTION HANDLER
// ========================================
/**
 * Handle user selecting a destination
 * @param {string} nodeId - Destination node ID
 */
function selectDestination(nodeId) {
    if (!campusNodes[nodeId]) {
        console.error(`Unknown destination: ${nodeId}`);
        return;
    }

    // If no current location, just highlight the destination
    if (!currentLocationNode) {
        if (selectedDestination) {
            unhighlightBlock(campusNodes[selectedDestination].svgId);
        }
        selectedDestination = nodeId;
        highlightBlock(campusNodes[nodeId].svgId, 'destination');
        showNotification(`Selected: ${campusNodes[nodeId].name}. Waiting for GPS...`, 'info');
        return;
    }

    // Same as current location
    if (nodeId === currentLocationNode) {
        showNotification(`You're already at ${campusNodes[nodeId].name}!`, 'info');
        return;
    }

    // Show route
    showRoute(currentLocationNode, nodeId);
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================
/**
 * Show a notification to the user
 * @param {string} message - Notification text
 * @param {string} type - 'success', 'warning', 'info', 'error'
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.nav-notification');
    if (existing) existing.remove();

    const colors = {
        success: '#34a853',
        warning: '#ff9800',
        info: '#4285f4',
        error: '#ea4335'
    };

    const notification = document.createElement('div');
    notification.className = 'nav-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type]};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        max-width: 90vw;
        text-align: center;
        animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ========================================
// BUILDING CLICK HANDLER
// ========================================
/**
 * Setup click handlers for all buildings
 */
function setupBuildingClickHandlers() {
    document.querySelectorAll('.block').forEach(block => {
        block.style.cursor = 'pointer';

        block.addEventListener('click', (e) => {
            e.stopPropagation();

            // Find node by SVG ID
            const svgId = block.id;
            const nodeId = Object.keys(campusNodes).find(
                key => campusNodes[key].svgId === svgId
            );

            if (nodeId) {
                selectDestination(nodeId);

                // Close any open popup
                const popup = document.getElementById('location-popup');
                if (popup) popup.classList.remove('visible');
            }
        });
    });

    console.log('Building click handlers initialized');
}

console.log('Navigation module loaded');
