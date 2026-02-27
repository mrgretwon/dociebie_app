import { sampleServices } from "@/constants/dummy-data";
import { greyedOutFont, smallerFontSize } from "@/constants/style-vars";
import { ServiceModel } from "@/models/data-models/serviceModel";
import ColumnFilter from "@/models/enums/columnFilter";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ServiceComponent from "./ServiceComponent";

const ServicesSection = () => {
  const router = useRouter();

  const [priceFilter, setPriceFilter] = useState(ColumnFilter.Default);
  const [services] = useState<ServiceModel[]>(sampleServices);
  const [filteredServices, setFilteredServices] = useState(sampleServices);

  useEffect(() => {
    switch (priceFilter) {
      case ColumnFilter.Ascending:
        setFilteredServices([...services].sort((s1, s2) => s1.price - s2.price));
        break;
      case ColumnFilter.Descending:
        setFilteredServices([...services].sort((s1, s2) => s2.price - s1.price));
        break;
      default:
        setFilteredServices(services);
    }
  }, [priceFilter, setFilteredServices, services]);

  const handleFilterPricePressed = useCallback(
    (filterStatus: ColumnFilter): void => {
      if (filterStatus === ColumnFilter.Ascending) {
        setPriceFilter(ColumnFilter.Descending);
      } else if (filterStatus === ColumnFilter.Descending) {
        setPriceFilter(ColumnFilter.Default);
      } else if (filterStatus === ColumnFilter.Default) {
        setPriceFilter(ColumnFilter.Ascending);
      }
    },
    [setPriceFilter]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Nazwa</Text>
        <TouchableOpacity
          style={styles.headerFilter}
          onPress={() => handleFilterPricePressed(priceFilter)}
        >
          <Text style={styles.filterText}>Cena</Text>
          {priceFilter === ColumnFilter.Ascending && (
            <AntDesign name="arrow-up" size={17} style={styles.filterIcon} />
          )}
          {priceFilter === ColumnFilter.Descending && (
            <AntDesign name="arrow-down" size={17} style={styles.filterIcon} />
          )}
        </TouchableOpacity>
      </View>
      {filteredServices.length > 0 &&
        filteredServices.map((service) => (
          <TouchableOpacity key={service.id} onPress={() => router.push("/(appointment)")}>
            <ServiceComponent service={service} />
          </TouchableOpacity>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  header: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: smallerFontSize,
    color: greyedOutFont,
    display: "flex",
    flexBasis: 0,
    flexGrow: 2,
    paddingTop: 24,
  },
  headerFilter: {
    display: "flex",
    flexDirection: "row",
    flexBasis: 0,
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 24,
  },
  filterText: {
    fontSize: smallerFontSize,
    color: greyedOutFont,
  },
  filterIcon: {
    color: greyedOutFont,
    marginLeft: 4,
  },
});

export default ServicesSection;
