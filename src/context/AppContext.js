import React, { createContext, useContext, useEffect, useState } from 'react';
import { getEvents, getSavedEventIds, toggleSavedEvent } from '../db/database';
import { DEFAULT_PREFERENCES, setCardLayout } from '../storage/preferences';

const AppContext = createContext(null);

export function AppContextProvider({ children, initialPreferences, initialSession }) {
  const [session, setSession] = useState(initialSession);
  const [events, setEvents] = useState([]);
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [preferences, setPreferences] = useState(initialPreferences ?? DEFAULT_PREFERENCES);

  useEffect(() => {
    Promise.all([getEvents(), getSavedEventIds()]).then(([nextEvents, nextSavedEventIds]) => {
      setEvents(nextEvents);
      setSavedEventIds(nextSavedEventIds);
    });
  }, []);

  async function toggleSaved(eventId) {
    const isSaved = await toggleSavedEvent(eventId);
    setSavedEventIds((current) =>
      isSaved ? [...new Set([...current, eventId])] : current.filter((id) => id !== eventId)
    );
    return isSaved;
  }

  function setCardLayoutPreference(cardLayout) {
    setPreferences((current) => ({ ...current, cardLayout }));
    return setCardLayout(cardLayout);
  }

  const value = {
    session,
    setSession,
    events,
    setEvents,
    savedEventIds,
    toggleSaved,
    preferences,
    setPreferences,
    setCardLayoutPreference,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppContextProvider');
  }
  return context;
}
