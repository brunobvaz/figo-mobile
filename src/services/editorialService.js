import recipes from '../data/mockRecipes';
import events from '../data/mockEvents';

export const RECIPE_FILTERS = ['Todos', 'Rápidas', 'Vegetarianas', 'Doces', 'Sopas'];
export const EVENT_FILTERS = ['Todos', 'Esta semana', 'Este mês', 'Feiras', 'Mercados'];

// Replace only these loaders with API calls when editorial endpoints are available.
export const editorialService = {
  async getSeasonalRecipes() { return recipes.map(recipe => ({ ...recipe, ingredients: [...recipe.ingredients], categories: [...recipe.categories] })); },
  async getLocalEvents() { return events.map(event => ({ ...event })); },
};

export function filterRecipes(items, category) {
  return items.filter(recipe => category === 'Todos' || (category === 'Rápidas'
    ? recipe.preparationMinutes <= 30 : recipe.categories.includes(category)));
}

export function localEventDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function filterEvents(items, category, today = new Date()) {
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return items.filter(event => {
    const date = localEventDate(event.date);
    if (category === 'Esta semana') return date >= weekStart && date < weekEnd;
    if (category === 'Este mês') return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
    if (category === 'Feiras') return event.type === 'Feira';
    if (category === 'Mercados') return event.type === 'Mercado';
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}
