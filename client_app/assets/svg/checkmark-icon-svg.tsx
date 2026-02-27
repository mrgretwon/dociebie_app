import Svg, { Path, Rect } from "react-native-svg";

export default function CheckmarkIconSvg() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <Rect x="0.5" y="0.5" width="15" height="15" rx="7.5" fill="#284B63" />
      <Rect x="0.5" y="0.5" width="15" height="15" rx="7.5" stroke="#284B63" />
      <Path
        d="M11.3332 5.5L6.74984 10.0833L4.6665 8"
        stroke="white"
        stroke-width="1.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
}
