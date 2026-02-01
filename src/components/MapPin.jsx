import React from 'react';
import pinSvg from '../assets/sprites/map-pin.svg';

const MapPin = ({ title = '', className = '', animated = true }) => {
  return (
    <div className={`${className} map-pin ${animated ? 'animate-pin-bounce' : ''}`} title={title}>
      <img src={pinSvg} alt="map pin" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapPin;
