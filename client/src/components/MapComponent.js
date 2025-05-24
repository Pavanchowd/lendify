import React, { useEffect, useRef } from 'react';

const MapComponent = ({ lat, lng }) => {
  const mapRef = useRef();

  useEffect(() => {
    if (window.google && lat && lng) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 14,
      });

      new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: 'You are here',
      });
    }
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '300px', borderRadius: '10px', marginTop: '20px' }}
    />
  );
};

export default MapComponent;
