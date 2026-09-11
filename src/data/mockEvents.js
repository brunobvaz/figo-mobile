/**
 * Fictitious development fixtures; these are not real event listings.
 * @typedef {Object} LocalEvent
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {'Feira'|'Mercado'|'Evento'} type
 * @property {string} date Local calendar date (YYYY-MM-DD), not a UTC timestamp.
 * @property {string} startTime
 * @property {string} [endTime]
 * @property {string} location
 * @property {number} [distanceKm]
 * @property {string|number} [image]
 * @property {boolean} [free]
 */
/** @type {LocalEvent[]} */
const events = [
  { id: 'event-feira-local', title: 'Feira de Produtos Locais', type: 'Feira', date: '2026-09-14', startTime: '09:00', endTime: '18:00', location: 'Chaves', distanceKm: 1.4, free: true },
  { id: 'event-mercado-produtores', title: 'Mercado de Produtores', type: 'Mercado', date: '2026-09-20', startTime: '08:30', endTime: '13:00', location: 'Vidago', distanceKm: 12, free: true },
  { id: 'event-outono', title: 'Feira de Outono', type: 'Feira', date: '2026-09-27', startTime: '10:00', endTime: '19:00', location: 'Chaves', distanceKm: 2.2, free: true },
  { id: 'event-encontro', title: 'Encontro de Produtores Locais', type: 'Evento', date: '2026-10-04', startTime: '10:00', endTime: '17:00', location: 'Boticas', distanceKm: 25 },
  { id: 'event-rural', title: 'Mercado Rural', type: 'Mercado', date: '2026-10-11', startTime: '08:00', endTime: '14:00', location: 'Valpaços', free: true },
  { id: 'event-festival', title: 'Festival dos Sabores da Terra', type: 'Evento', date: '2026-10-18', startTime: '10:00', endTime: '22:00', location: 'Chaves' },
];
export default events;
