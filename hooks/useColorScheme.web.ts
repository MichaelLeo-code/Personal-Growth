import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const colorScheme = useRNColorScheme();

  // Return the actual color scheme for consistency
  // This prevents theme flashing on web
  return colorScheme ?? 'light';
}
