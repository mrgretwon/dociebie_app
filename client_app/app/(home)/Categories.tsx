import LeafSvg from "@/assets/svg/leaf-svg";
import { IconSymbol } from "@/components/icons/icon-symbol";
import { primaryColor } from "@/constants/style-vars";
import { useCategories } from "@/contexts/CategoriesContext";
import { useSalonsSearch } from "@/contexts/SalonsSearchContext";
import { useTranslations } from "@/hooks/use-translations";
import { CategoryItem } from "@/services/api";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgUri } from "react-native-svg";

interface CategoryProps {
  category: CategoryItem;
  onPress: () => void;
}

const Category = ({ category, onPress }: CategoryProps) => {
  return (
    <TouchableOpacity style={styles.category} onPress={onPress}>
      {category.icon ? (
        <SvgUri uri={category.icon} width={32} height={32} />
      ) : (
        <LeafSvg />
      )}
      <Text style={styles.categoryText}>{category.name}</Text>
      <IconSymbol name="chevron.right" size={28} weight="medium" style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );
};

const Categories = () => {
  const translate = useTranslations();
  const router = useRouter();
  const { setSearchText } = useSalonsSearch();
  const { categories } = useCategories();

  if (!categories.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translate("CATEGORIES")}</Text>
      {categories.map((cat) => (
        <Category
          key={cat.id}
          category={cat}
          onPress={() => {
            setSearchText(cat.name);
            router.push("/(salons)");
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "white", paddingHorizontal: 24, paddingVertical: 18 },
  category: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: primaryColor,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Categories;
