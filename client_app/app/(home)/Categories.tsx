import LeafSvg from "@/assets/svg/leaf-svg";
import { IconSymbol } from "@/components/icons/icon-symbol";
import { blackFont, greyFont, primaryColor } from "@/constants/style-vars";
import { Fonts } from "@/constants/theme";
import { useCategories } from "@/contexts/CategoriesContext";
import { useSalonsSearch } from "@/contexts/SalonsSearchContext";
import { useTranslations } from "@/hooks/use-translations";
import { CategoryItem, SubCategoryItem } from "@/services/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgUri } from "react-native-svg";

const Categories = () => {
  const translate = useTranslations();
  const router = useRouter();
  const { setSearchText, setCategoryId, setSubcategoryId } = useSalonsSearch();
  const { categories } = useCategories();

  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);

  if (!categories.length) {
    return null;
  }

  const handleCategoryPress = (category: CategoryItem) => {
    setExpandedCategoryId(expandedCategoryId === category.id ? null : category.id);
  };

  const handleSubcategoryPress = (category: CategoryItem, subcategory: SubCategoryItem) => {
    setCategoryId(category.id);
    setSubcategoryId(subcategory.id);
    setSearchText("");
    router.push("/(salons)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>dupa</Text>
      {categories.map((cat) => {
        const isExpanded = expandedCategoryId === cat.id;
        return (
          <View key={cat.id}>
            <TouchableOpacity style={styles.category} onPress={() => handleCategoryPress(cat)}>
              {cat.icon ? (
                <SvgUri uri={cat.icon} width={32} height={32} />
              ) : (
                <LeafSvg />
              )}
              <Text style={styles.categoryText}>{cat.name}</Text>
              <IconSymbol
                name={isExpanded ? "chevron.down" : "chevron.right"}
                size={28}
                weight="medium"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.subcategoriesContainer}>
                {cat.subcategories.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={styles.subcategoryItem}
                    onPress={() => handleSubcategoryPress(cat, sub)}
                  >
                    <Text style={styles.bullet}>{"\u2022"}</Text>
                    <Text style={styles.subcategoryText}>{sub.name}</Text>
                  </TouchableOpacity>
                ))}
                {cat.subcategories.length === 0 && (
                  <Text style={styles.noSubcategoriesText}>{translate("NO_SUBCATEGORIES")}</Text>
                )}
              </View>
            )}
          </View>
        );
      })}
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
  subcategoriesContainer: {
    paddingLeft: 52,
    paddingTop: 2,
    paddingBottom: 4,
  },
  subcategoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  bullet: {
    fontSize: 14,
    color: greyFont,
    marginRight: 10,
  },
  subcategoryText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: blackFont,
  },
  noSubcategoriesText: {
    fontSize: 14,
    color: greyFont,
    fontFamily: Fonts.regular,
    paddingVertical: 8,
  },
});

export default Categories;
