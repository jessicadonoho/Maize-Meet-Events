import { getDatabase, getEvents, getSavedEvents, initializeDatabase } from '../database';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => {
    const db = new (require('node:sqlite').DatabaseSync)(':memory:');
    return {
      db,
      execAsync: async (sql) => db.exec(sql),
      getAllAsync: async (sql, ...params) => db.prepare(sql).all(...params),
      getFirstAsync: async (sql, ...params) => db.prepare(sql).get(...params) || null,
      runAsync: async (sql, ...params) => db.prepare(sql).run(...params),
    };
  }),
}));

afterAll(async () => (await getDatabase()).db.close());

test('relaunching keeps event keys unique and preserves existing data', async () => {
  await initializeDatabase();
  const connection = await getDatabase();
  await connection.runAsync('INSERT INTO saved_events (eventId) VALUES (?)', 'evt-001');
  await connection.runAsync('INSERT INTO notes (eventId, body, updatedAt) VALUES (?, ?, ?)',
    'evt-001', 'Bring a friend', '2026-10-05');
  await connection.runAsync('UPDATE events SET registeredCount = 117 WHERE id = ?', 'evt-001');
  // Simulate duplicate rows left by previous app launches.
  await connection.execAsync(`
    INSERT INTO events (id, title, description, startsAt, endsAt, category, location,
      room, capacity, registeredCount, tags)
      SELECT id, title, description, startsAt, endsAt, category, location,
        room, capacity, 116, tags FROM events WHERE id = 'evt-001';
  `);
  await initializeDatabase();
  await initializeDatabase();
  const events = await getEvents();
  expect(events).toHaveLength(15);
  expect(new Set(events.map((event) => event.id)).size).toBe(15);
  expect(events.find((event) => event.id === 'evt-001').registeredCount).toBe(117);
  expect(await connection.getFirstAsync('SELECT COUNT(*) AS count FROM events'))
    .toEqual(expect.objectContaining({ count: 16 }));
  expect(await connection.getFirstAsync('SELECT body FROM notes WHERE eventId = ?', 'evt-001'))
    .toEqual(expect.objectContaining({ body: 'Bring a friend' }));
  expect(await connection.getFirstAsync('SELECT eventId FROM saved_events'))
    .toEqual(expect.objectContaining({ eventId: 'evt-001' }));
  expect((await getSavedEvents()).map((event) => event.id)).toEqual(['evt-001']);
});
