import LeafSvg from "@/assets/svg/leaf-svg";
import { IconSymbol } from "@/components/icons/icon-symbol";
import { useTranslations } from "@/hooks/use-translations";
import { fetchCategories } from "@/services/api";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CategoryProps {
  categoryName: string;
}

const Category = ({ categoryName }: CategoryProps) => {
  return (
    <TouchableOpacity style={styles.category}>
      <LeafSvg />
      <Text style={styles.categoryText}>{categoryName}</Text>
      <IconSymbol name="chevron.right" size={28} weight="medium" style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );
};

const Categories = () => {
  const translate = useTranslations();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.warn(err));
  }, []);

  if (!categories) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translate("CATEGORIES")}</Text>
      {categories.map((o) => (
        <Category key={o} categoryName={o} />
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
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Categories;
