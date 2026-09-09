import MapView, { Marker } from 'react-native-maps';
export default function LocationMap({ point, onChange }) {
  return <MapView style={{ flex: 1 }} initialRegion={{ latitude: point?.latitude ?? 39.5, longitude: point?.longitude ?? -8, latitudeDelta: point ? 0.02 : 9, longitudeDelta: point ? 0.02 : 9 }} onPress={event => onChange(event.nativeEvent.coordinate)}>
    {point ? <Marker coordinate={point} draggable onDragEnd={event => onChange(event.nativeEvent.coordinate)} /> : null}
  </MapView>;
}
