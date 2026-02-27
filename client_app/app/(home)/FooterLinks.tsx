import { smallFontSize } from "@/constants/style-vars";
import { Linking, StyleSheet, Text, View } from "react-native";

const links = [
  { name: "O nas", href: "https://www.google.com" },
  { name: "Kariera", href: "https://www.google.com" },
  { name: "Korzyści", href: "https://www.google.com" },
  { name: "Pomoc", href: "https://www.google.com" },
  { name: "Płatności", href: "https://www.google.com" },
  { name: "Polityka Prywatności", href: "https://www.google.com" },
];

const FooterLinks = () => {
  return (
    <View style={styles.container}>
      {links.map((o) => (
        <Text key={o.name} style={styles.item} onPress={() => Linking.openURL(o.href)}>
          {o.name}
        </Text>
      ))}
      {/*
      <Link href="/help" asChild>
        <Text style={styles.link}>Pomoc</Text>
      </Link> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    rowGap: 8,
    borderBottomColor: "white",
    borderBottomWidth: 2,
    paddingVertical: 12,
  },
  item: {
    width: "50%",
    color: "white",
    fontSize: smallFontSize,
    paddingVertical: 2,
  },
});

export default FooterLinks;
