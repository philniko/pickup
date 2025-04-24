import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

// Map our custom icon names to SF Symbols names
const SYMBOLS_MAPPING = {
  'map': 'map',
  'calendar': 'calendar',
  'add': 'plus.circle.fill',
  'people': 'person.2.fill',
  'person': 'person.circle',
  // Keep original mappings for compatibility
  'house.fill': 'house.fill',
  'paperplane.fill': 'paperplane.fill',
  'chevron.left.forwardslash.chevron.right': 'chevron.left.forwardslash.chevron.right',
  'chevron.right': 'chevron.right',
  'plus.circle.fill': 'plus.circle.fill',
  'person.2.fill': 'person.2.fill',
  'person.crop.circle': 'person.circle',
} as const;

type IconName = keyof typeof SYMBOLS_MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Map our custom name to the actual SF Symbol name
  const symbolName = SYMBOLS_MAPPING[name] as SymbolViewProps['name'];

  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={symbolName}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
