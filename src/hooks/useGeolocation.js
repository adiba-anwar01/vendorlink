import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    coords: null, // { lat, lng }
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ loading: false, error: 'Geolocation is not supported by your browser.', coords: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          loading: false,
          error: null,
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
      },
      (err) => {
        setState({ loading: false, error: err.message, coords: null });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return state;
}
