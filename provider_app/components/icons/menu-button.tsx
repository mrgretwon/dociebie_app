import MenuSvg from "@/assets/svg/menu-svg";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

const MenuButton = ({ color }: { color: string }) => {
  const navigation = useNavigation();

  const handleButtonPressed = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <TouchableOpacity onPress={handleButtonPressed}>
      <MenuSvg color={color} />
    </TouchableOpacity>
  );
};

export default MenuButton;
