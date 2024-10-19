import React from 'react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const Map = ({ lat, lng }) => {
  const containerStyle = {
    width: '100%',
    height: '400px', // Make sure this is defined and visible
  };

  const center = {
    lat: lat,
    lng: lng,
  };

  // Function to run when map is loaded (optional, for debugging or extra functionality)
  const onLoad = (map) => {
    console.log('Map Loaded:', map);
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyBFbAxhllak_ia6wXY5Nidci_cLmUQkVhc"
      onError={(e) => console.error('Error loading maps', e)}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
