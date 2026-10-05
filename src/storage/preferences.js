import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_KEY = 'preferences.darkTheme';
const LAYOUT_KEY = 'preferences.cardLayout';

export const DEFAULT_PREFERENCES = {
  darkTheme: false,
  cardLayout: 'standard',
};

export async function getPreferences() {
  const [[, storedTheme], [, storedLayout]] = await AsyncStorage.multiGet([DARK_KEY, LAYOUT_KEY]);

  return {
    darkTheme: storedTheme === 'true',
    cardLayout: storedLayout === 'compact' ? 'compact' : 'standard',
  };
}

export function setDarkTheme(value) {
  return AsyncStorage.setItem(DARK_KEY, String(value));
}

export function setCardLayout(value) {
  return AsyncStorage.setItem(LAYOUT_KEY, value);
}

export function resetPreferences() {
  return AsyncStorage.clear();
}
