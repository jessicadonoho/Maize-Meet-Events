import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  formatEventDate,
  formatEventDay,
  formatEventMonth,
  formatEventTime,
} from '../utils/date';
import { colors } from '../theme/theme';

export default function EventCard({
  event,
  initiallySaved,
  layout = 'standard',
  onPress,
  onToggleSaved,
}) {
  const [saving, setSaving] = useState(false);
  const compact = layout === 'compact';
  const date = formatEventDate(event.startsAt);
  const time = formatEventTime(event.startsAt, event.endsAt);

  async function handleSavedPress() {
    if (saving) {
      return;
    }

    setSaving(true);
    try {
      await onToggleSaved(event.id);
    } finally {
      setSaving(false);
    }
  }

  const heartButton = (
    <Pressable
      accessibilityLabel={initiallySaved ? 'Remove from saved events' : 'Save event'}
      accessibilityRole="button"
      accessibilityState={{ selected: initiallySaved, disabled: saving }}
      disabled={saving}
      hitSlop={8}
      onPress={handleSavedPress}
      style={styles.heartButton}
    >
      <MaterialCommunityIcons
        color={initiallySaved ? '#C6253D' : colors.muted}
        name={initiallySaved ? 'heart' : 'heart-outline'}
        size={22}
      />
    </Pressable>
  );

  return (
    <Pressable
      accessibilityHint="Opens event details"
      accessibilityLabel={`${event.title}, ${event.category}, ${date}, ${time}, ${event.location}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {compact ? (
        <Card containerStyle={[styles.card, styles.compactCard]}>
          <View style={styles.compactRow}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateMonth}>{formatEventMonth(event.startsAt).toUpperCase()}</Text>
              <Text style={styles.dateDay}>{formatEventDay(event.startsAt)}</Text>
            </View>
            <View style={styles.compactBody}>
              <Text numberOfLines={1} style={styles.compactTitle}>
                {event.title}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {time} · {event.location}
              </Text>
            </View>
            {heartButton}
          </View>
        </Card>
      ) : (
        <Card containerStyle={[styles.card, styles.standardCard]}>
          <View style={styles.topRow}>
            <Text style={styles.category}>{event.category.toUpperCase()}</Text>
            {heartButton}
          </View>
          <Text h4 h4Style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.date}>{date}</Text>
          <Text numberOfLines={1} style={styles.meta}>
            {time} · {event.location}
          </Text>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#102B44',
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  standardCard: { minHeight: 174, padding: 18 },
  compactCard: { minHeight: 72, paddingHorizontal: 12, paddingVertical: 10 },
  pressed: { opacity: 0.78 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  category: { color: colors.blueLight, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  heartButton: { alignItems: 'center', height: 28, justifyContent: 'center', width: 28 },
  title: { color: colors.ink, fontSize: 20, fontWeight: '800', marginTop: 2 },
  date: { color: colors.blue, fontSize: 14, fontWeight: '700', marginTop: 8 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 3 },
  compactRow: { alignItems: 'center', flexDirection: 'row' },
  dateBlock: {
    alignItems: 'center',
    backgroundColor: '#EDF1F4',
    borderRadius: 10,
    justifyContent: 'center',
    marginRight: 12,
    minWidth: 48,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  dateMonth: { color: colors.blueLight, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  dateDay: { color: colors.blue, fontSize: 18, fontWeight: '900' },
  compactBody: { flex: 1, marginRight: 8 },
  compactTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
});
