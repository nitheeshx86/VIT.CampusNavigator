# Campus Navigator

A mobile-first web application for campus navigation with real-time GPS tracking and turn-by-turn routing.

## Features

✅ **Real-time GPS Tracking** - Live location with accuracy circle  
✅ **Interactive Map** - OpenStreetMap with custom campus markers  
✅ **Turn-by-Turn Navigation** - Walking routes using OSRM  
✅ **Mobile-First Design** - Responsive layout optimized for phones  
✅ **Category-Based Markers** - Academic, Hostel, and Emergency locations  
✅ **No Build Step** - Pure HTML/CSS/JS, runs directly in browser  

## Technologies

- **Leaflet.js** - Interactive map library
- **OpenStreetMap** - Free map tiles
- **Leaflet Routing Machine** - Turn-by-turn navigation
- **OSRM** - Walking route calculations
- **Vanilla JavaScript** - No frameworks required

## File Structure

```
CampusNavigator2/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Mobile-first responsive styles
├── js/
│   ├── data.js         # Campus location data
│   ├── map.js          # Map initialization & GPS tracking
│   └── routing.js      # Navigation functionality
└── README.md           # This file
```

## How It Works

### Global Variable Architecture

To prevent variable redeclaration bugs and enable cross-file routing:

- `map` - Declared in `map.js`, used in `routing.js`
- `userMarker` - Declared in `map.js`, used in `routing.js`
- `routingControl` - Declared in `routing.js`

**Pattern**: Variables are declared with `let` once in their owning module and accessed directly in other modules (no redeclaration).

### Script Loading Order

```html
<script src="js/data.js"></script>      <!-- 1. Load data first -->
<script src="js/map.js"></script>       <!-- 2. Initialize map & GPS -->
<script src="js/routing.js"></script>   <!-- 3. Add routing functionality -->
```

This order is critical for proper functionality.

## Setup Instructions

### 1. Local Testing

Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari):

```bash
open index.html
# or on Windows/Linux
start index.html
```

**Important**: Allow location permissions when prompted for GPS tracking.

### 2. Customize Campus Data

Edit `js/data.js` to add your actual campus locations:

```javascript
const campusLocations = [
    {
        name: "Your Building Name",
        type: "academic",  // academic, hostel, or emergency
        lat: 0.000000,     // Your latitude
        lng: 0.000000,     // Your longitude
        description: "Building description"
    },
    // Add more locations...
];

const campusCenter = {
    lat: 0.000000,   // Your campus center latitude
    lng: 0.000000,   // Your campus center longitude
    zoom: 16         // Zoom level (13-19)
};
```

### 3. Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/campus-nav.git
   git push -u origin main
   ```
3. Go to repository Settings → Pages
4. Select `main` branch as source
5. Access at `https://yourusername.github.io/campus-nav/`

### 4. Deploy to Netlify

1. Drag and drop the entire `CampusNavigator2` folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

## Usage

1. **View Your Location**: Grant GPS permissions and your location appears as a blue circle
2. **Explore Campus**: Pan/zoom the map to see campus markers (colored by category)
3. **Navigate**: Click any marker → Select "Navigate Here" in the popup
4. **Follow Route**: View turn-by-turn directions and follow the blue route line
5. **Re-center**: Tap the location button to center map on your position

## Marker Categories

- 🔵 **Blue** - Academic buildings (libraries, departments, labs)
- 🟢 **Green** - Hostels and residential buildings
- 🔴 **Red** - Emergency services (health center, security)

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

**Note**: Requires HTTPS for GPS in production (GitHub Pages/Netlify provide this automatically).

## Troubleshooting

### "Location permission denied"
Enable location services in browser settings and refresh the page.

### "Unable to calculate route"
Check that:
- You have GPS location (blue circle visible)
- Destination marker is accessible by walking paths
- You have internet connection (OSRM routing requires connectivity)

### Map not loading
- Check browser console for errors
- Ensure internet connection is active
- Verify CDN links in `index.html` are accessible

### Routing not working across files
Verify script loading order in `index.html` is: `data.js` → `map.js` → `routing.js`

## Customization

### Change Map Tiles
Edit the tile layer URL in `map.js`:
```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    // Options...
}).addTo(map);
```

### Modify Colors
Update marker colors in `js/map.js`:
```javascript
const markerColors = {
    academic: '#4285f4',   // Blue
    hostel: '#34a853',     // Green
    emergency: '#ea4335'   // Red
};
```

### Add More Categories
1. Add new locations in `data.js` with custom `type`
2. Add color mapping in `map.js` → `markerColors`
3. Optionally add CSS class in `styles.css`

## License

Free to use for educational purposes. Attribution to OpenStreetMap contributors required.

## Credits

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Routing via [OSRM](http://project-osrm.org/)
- Built with [Leaflet.js](https://leafletjs.com/) and [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/)
