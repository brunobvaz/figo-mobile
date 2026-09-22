export function localEventDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

// Events use local calendar days. toISOString() could move a boundary to another day.
const calendarDay = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function eventFilterParams(filter, today = new Date()) {
  if (filter === 'Feiras') return { type: 'Feira' };
  if (filter === 'Mercados') return { type: 'Mercado' };
  if (filter === 'Esta semana') {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { from: calendarDay(start), to: calendarDay(end) };
  }
  if (filter === 'Este mês') return {
    from: calendarDay(new Date(today.getFullYear(), today.getMonth(), 1, 12)),
    to: calendarDay(new Date(today.getFullYear(), today.getMonth() + 1, 0, 12))
  };
  return {};
}
