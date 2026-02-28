import Svg, { Path } from "react-native-svg";

export default function MenuSvg({ color }: { color: string }) {
  return (
    <Svg width="28" height="19" viewBox="0 0 20 14" fill="none">
      <Path
        d="M19 5H5M19 1H1M19 9H1M19 13H5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
