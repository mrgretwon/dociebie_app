import { SalonModel } from "@/models/data-models/salonModel";
import { Dimensions, FlatList, StyleSheet } from "react-native";
import SalonPreview from "./SalonPreview";

interface SalonListProps {
  salons: SalonModel[];
  onClick: (data: SalonModel) => void;
}

const SalonList = ({ salons, onClick }: SalonListProps) => {
  const renderItem = (salon: SalonModel, index: number) => (
    <SalonPreview
      salon={salon}
      onClick={() => onClick(salon)}
      style={index !== 0 ? { marginLeft: 16 } : {}}
    />
  );

  return (
    <FlatList
      horizontal
      style={styles.container}
      data={salons}
      renderItem={(listItem) => renderItem(listItem.item, listItem.index)}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width - 32,
    flexGrow: 0,
  },
});

export default SalonList;
