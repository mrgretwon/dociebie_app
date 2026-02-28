import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SalonModel } from "@/models/data-models/salonModel";

interface SalonMapViewProps {
  salons: SalonModel[];
  onSalonPress?: (salon: SalonModel) => void;
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

const SalonMapView = ({ salons, onSalonPress }: SalonMapViewProps) => {
  const salonsWithCoords = salons.filter(
    (s): s is SalonModel & { latitude: number; longitude: number } =>
      s.latitude != null && s.longitude != null
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: 52.0,
          longitude: 19.5,
          latitudeDelta: 6,
          longitudeDelta: 6,
        }}
      >
        {salonsWithCoords.map((salon) => (
          <Marker
            key={salon.id}
            coordinate={{ latitude: salon.latitude, longitude: salon.longitude }}
            title={salon.name}
            description={salon.address}
            onCalloutPress={() => onSalonPress?.(salon)}
          />
        ))}
      </MapView>
    </View>
  );
};

export default SalonMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
