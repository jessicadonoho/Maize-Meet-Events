import React from 'react';
import { act, create } from 'react-test-renderer';
import DiscoverScreen from '../DiscoverScreen';
import EventCard from '../../components/EventCard';
import { seedEvents } from '../../data/seedEvents';
import { refreshEvents } from '../../services/eventService';

global.IS_REACT_ACT_ENVIRONMENT = true;

const mockContext = {
  events: seedEvents,
  setEvents: jest.fn(),
  savedEventIds: [],
  toggleSaved: jest.fn(),
  preferences: { darkTheme: false, cardLayout: 'standard' },
  setCardLayoutPreference: jest.fn(() => Promise.resolve()),
};

jest.mock('../../context/AppContext', () => ({ useAppContext: () => mockContext }));
jest.mock('../../services/eventService', () => ({ refreshEvents: jest.fn() }));
jest.mock('../../theme/theme', () => ({ colors: {} }));
jest.mock('../../components/EventCard', () => 'EventCard');
jest.mock('../../components/EmptyState', () => 'EmptyState');
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@rneui/themed', () => ({ Text: 'Text' }));
jest.mock('@expo/vector-icons', () => ({ MaterialCommunityIcons: 'Icon' }));
jest.mock('react-native', () => {
  const React = require('react');
  return {
    FlatList: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({ scrollToOffset: jest.fn() }));
      return React.createElement('FlatList', props,
        props.refreshControl,
        props.data.length ? props.data.map((item, index) =>
          React.createElement(React.Fragment, { key: props.keyExtractor(item, index) },
            props.renderItem({ item, index }))) : props.ListEmptyComponent);
    }),
    Pressable: 'Pressable',
    RefreshControl: 'RefreshControl',
    StyleSheet: { create: (styles) => styles },
    Text: 'NativeText',
    TextInput: 'TextInput',
    View: 'View',
  };
});

let screen;
let navigation;

beforeEach(async () => {
  jest.clearAllMocks();
  mockContext.events = seedEvents;
  navigation = { navigate: jest.fn() };
  await act(async () => { screen = create(<DiscoverScreen navigation={navigation} />); });
});

afterEach(async () => { await act(async () => screen.unmount()); });

function visibleIds() {
  return screen.root.findAllByType(EventCard).map((card) => card.props.event.id);
}

async function search(query) {
  await act(async () => screen.root.findByType('TextInput').props.onChangeText(query));
}

async function category(name) {
  const chip = screen.root.findAllByType('Pressable').find((node) =>
    node.findByType('NativeText').props.children === name);
  await act(async () => chip.props.onPress());
}

test('category presses update results without changing the query', async () => {
  await category('Arts');
  expect(visibleIds()).toEqual(['evt-001', 'evt-005']);
  await category('Career');
  expect(visibleIds()).toEqual(['evt-003', 'evt-015']);
  await category('Academic');
  expect(visibleIds()).toEqual(['evt-004', 'evt-008', 'evt-009', 'evt-011']);
  await category('Community');
  expect(visibleIds()).toEqual(['evt-002', 'evt-006', 'evt-007', 'evt-012', 'evt-014']);
  await category('Workshop');
  expect(visibleIds()).toEqual(['evt-010', 'evt-013']);
  await category('All');
  expect(visibleIds()).toHaveLength(15);
});

test('search ignores accents, case and extra spaces', async () => {
  await search('  RESUME  ');
  expect(visibleIds()).toEqual(['evt-003']);
  await search('ai   panel');
  expect(visibleIds()).toEqual(['evt-008', 'evt-009']);
});

test('search and category combine; clearing restores all events', async () => {
  await search('workshop');
  await category('Career');
  expect(visibleIds()).toEqual(['evt-003']);
  await category('Arts');
  expect(visibleIds()).toEqual([]);
  await act(async () => screen.root.findByType('EmptyState').props.onAction());
  expect(visibleIds()).toHaveLength(15);
});

test('a filtered result navigates by ID, including events with the same title', async () => {
  await search('AI Ethics Panel');
  const secondResult = screen.root.findAllByType(EventCard)[1];
  await act(async () => secondResult.props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('EventDetails', { eventId: 'evt-009' });
});

test('a failed refresh keeps events available for searching and resets the spinner', async () => {
  refreshEvents.mockRejectedValueOnce(new Error('Service unavailable'));
  await act(async () => screen.root.findByType('RefreshControl').props.onRefresh());
  expect(mockContext.setEvents).not.toHaveBeenCalled();
  expect(screen.root.findByType('RefreshControl').props.refreshing).toBe(false);
  await search('campus tour');
  expect(visibleIds()).toEqual(['evt-007']);
});
