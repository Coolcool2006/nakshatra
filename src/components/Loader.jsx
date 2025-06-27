import React from 'react';

const Loader = ({ message }) => (
  <div>
    <div className="loader"></div>
    <p className="loading-text">{message || 'Fetching celestial data...'}</p>
  </div>
);

export default Loader;