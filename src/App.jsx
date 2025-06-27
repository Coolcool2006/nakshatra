// src/App.jsx (With MoonPhase and Nakshatra Integration)

import React, { useState, useEffect } from 'react';
import { MoonPhase, EclipticGeoMoon } from 'astronomy-engine';
import Loader from './components/Loader';
import NakshatraDetails from './components/NakshatraDetails';
import Clock from './components/clock';

const NAKSHATRA_LIST = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", 
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", 
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", 
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", 
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function getNakshatraInfo(eclipticLongitude) {
  // Normalize longitude to 0-360
  const lon = ((eclipticLongitude % 360) + 360) % 360;
  const nakshatraIndex = Math.floor(lon / (360 / 27));
  const pada = Math.floor((lon % (360 / 27)) / ((360 / 27) / 4)) + 1;
  return { name: NAKSHATRA_LIST[nakshatraIndex], pada, index: nakshatraIndex };
}

function App() {
  const [moonPhase, setMoonPhase] = useState(null);
  const [nakshatraData, setNakshatraData] = useState(null);
  const [location, setLocation] = useState('your location');
  const [placeName, setPlaceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculateNakshatra = async () => {
      try {
        let coords;
        if (
          typeof window !== 'undefined' &&
          window.Capacitor &&
          window.Capacitor.isNativePlatform &&
          window.Capacitor.isNativePlatform()
        ) {
          // Dynamically import Geolocation for native only at runtime using a variable path
          const geoPath = '@capacitor/geolocation';
          const GeolocationModule = await import(/* @vite-ignore */ geoPath);
          const position = await GeolocationModule.Geolocation.getCurrentPosition();
          coords = position.coords;
        } else {
          // Use browser geolocation for web
          coords = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              pos => resolve(pos.coords),
              reject,
              { timeout: 10000 }
            );
          });
        }
        const { latitude, longitude } = coords;
        setLocation(`Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`);
        // Fetch place name using Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          .then(res => res.json())
          .then(data => {
            if (data.address) {
              setPlaceName(data.address.city || data.address.town || data.address.village || data.address.hamlet || data.address.state || data.display_name || '');
            }
          });
        const now = new Date();
        setMoonPhase(MoonPhase(now));
        // Get Moon's ecliptic longitude
        const moonEcl = EclipticGeoMoon(now);
        const nakshatra = getNakshatraInfo(moonEcl.lon);
        // Find next Nakshatra start time
        let nextNakshatraTime = null;
        let nextNakshatraIndex = (nakshatra.index + 1) % 27;
        let searchTime = new Date(now.getTime());
        for (let i = 0; i < 48; i++) { // search up to 48 hours ahead
          searchTime.setMinutes(searchTime.getMinutes() + 30);
          const ecl = EclipticGeoMoon(searchTime);
          const n = getNakshatraInfo(ecl.lon);
          if (n.index === nextNakshatraIndex) {
            nextNakshatraTime = new Date(searchTime);
            break;
          }
        }
        setNakshatraData({
          current_nakshatra: {
            name: nakshatra.name,
            pada: nakshatra.pada,
            ruler: { name: 'N/A' },
            deity: { name: 'N/A' },
            end: nextNakshatraTime ? nextNakshatraTime.toISOString() : null
          },
          next_nakshatra: { name: NAKSHATRA_LIST[nextNakshatraIndex] }
        });
      } catch (err) {
        if (err.code === 1) {
          setError("Location permission was denied. Please enable it in your app settings.");
        } else {
          setError(err.message || "An unknown error occurred during calculation.");
        }
      } finally {
        setLoading(false);
      }
    };
    calculateNakshatra();
  }, []);

  return (
    <div className="app-container">
      {loading && <Loader message="Calculating celestial positions..." />}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && nakshatraData && (
        <>
          <div style={{marginBottom: '1rem'}}>
            <strong>Location:</strong> {placeName ? `${placeName} (${location})` : location}
          </div>
          <NakshatraDetails data={nakshatraData} location={location} />
          <Clock 
            endTime={nakshatraData.current_nakshatra.end} 
            nextNakshatraName={nakshatraData.next_nakshatra.name} 
          />
          <h2>Current Moon Phase</h2>
          <p>Phase angle: {moonPhase !== null ? moonPhase.toFixed(2) : '--'}°</p>
        </>
      )}
    </div>
  );
}

export default App;