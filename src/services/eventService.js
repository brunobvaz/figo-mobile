import config from '../config/config';
import { api } from './api';
import { eventFilterParams } from '../utils/eventDates';
import { eventImageUrl } from '../utils/eventImages';

const normalize = event => ({ ...event, image: eventImageUrl(event.image, config.apiBaseUrl) });
export const eventService = {
  async page({ filter = 'Todos', page = 1 } = {}) {
    const params = { page: String(page), limit: '20', ...eventFilterParams(filter) };
    const result = await api.get(`/events?${new URLSearchParams(params)}`);
    if (!Array.isArray(result?.items) || !Number.isInteger(result?.pagination?.page) || !Number.isInteger(result?.pagination?.pages))
      throw new Error('Não foi possível ler os eventos recebidos. Tenta novamente.');
    return { ...result, items: result.items.map(normalize) };
  },
  async detail(id) {
    const event = await api.get(`/events/${encodeURIComponent(id)}`);
    if (!event || event.id !== id || typeof event.title !== 'string' || typeof event.date !== 'string' || typeof event.startTime !== 'string')
      throw new Error('Não foi possível ler este evento. Tenta novamente.');
    return normalize(event);
  }
};
