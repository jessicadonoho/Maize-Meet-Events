export function formatEventDate(startsAt) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(startsAt));
}

export function formatEventTime(startsAt, endsAt) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${formatter.format(new Date(startsAt))} - ${formatter.format(new Date(endsAt))}`;
}

export function formatFullEventDate(startsAt, endsAt) {
  return `${formatEventDate(startsAt)} · ${formatEventTime(startsAt, endsAt)}`;
}

export function formatEventMonth(startsAt) {
  return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(new Date(startsAt));
}

export function formatEventDay(startsAt) {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric' }).format(new Date(startsAt));
}
