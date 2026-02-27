import MenuSvg from "@/assets/svg/menu-svg";
import { usePathname, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

const MenuButton = ({ color }: { color: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleButtonPressed = () => {
    if (pathname !== "/(profile)") {
      router.push("/(profile)");
    }
  };

  return (
    <TouchableOpacity onPress={handleButtonPressed}>
      <MenuSvg color={color} />
    </TouchableOpacity>
  );
};

export default MenuButton;
