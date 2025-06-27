import React, { useState, useEffect } from 'react';

const Clock = ({ endTime, nextNakshatraName }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const difference = end - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeRemaining({ hours: '00', minutes: '00', seconds: '00' });
        // Optionally, trigger a refresh here after a delay
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="clock-container">
      <p className="countdown-label">Time until next Nakshatra</p>
      <div className="countdown-timer">
        {timeRemaining.hours} : {timeRemaining.minutes} : {timeRemaining.seconds}
      </div>
      <p className="next-nakshatra">Next: {nextNakshatraName}</p>
    </div>
  );
};

export default Clock;