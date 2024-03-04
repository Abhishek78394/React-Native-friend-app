import Geolocation from '@react-native-community/geolocation';

export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        error => {
          if (error.code === 3) { 
            reject({ message: "Location request timed out. Please try again." });
          } else if (error.code === 1) {
            reject({ message: "Location permission denied. Please grant location access for this app in your device settings." });
          } else {
            reject({ message: "An error occurred while retrieving location." });
          }
        },
        { enableHighAccuracy: true, timeout: 50000, maximumAge: 1000 }
      );
    });
  };

 export const  calculateDistance = (lat1, lon1, lat2, lon2) =>{
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}