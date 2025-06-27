// src/components/NakshatraDetails.jsx

import React from 'react';

const NakshatraDetails = ({ data, location }) => {
  if (!data) return null;

  const { current_nakshatra } = data;

  return (
    <div className="nakshatra-details">
      <p className="location">📍 Showing for: {location}</p>
      <h1 className="nakshatra-name">{current_nakshatra.name}</h1>
      <p className="nakshatra-pada">Pada {current_nakshatra.pada}</p>
      <div className="ruler-info">
        <div>
          <span>Ruler</span>
          {/* The new library provides the ruler as a simple string */}
          {current_nakshatra.ruler.name}
        </div>
        <div>
          <span>Deity</span>
          {/* The library doesn't provide the deity, so we show N/A */}
          {current_nakshatra.deity.name}
        </div>
      </div>
    </div>
  );
};

export default NakshatraDetails;