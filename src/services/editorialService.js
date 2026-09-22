import { recipeService } from './recipeService';
import { eventService } from './eventService';

export const RECIPE_FILTERS = ['Todos', 'Rápidas', 'Vegetarianas', 'Doces', 'Sopas'];
export const EVENT_FILTERS = ['Todos', 'Esta semana', 'Este mês', 'Feiras', 'Mercados'];

export const editorialService = {
  getSeasonalRecipes(params) { return recipeService.page(params); },
  getLocalEvents(params) { return eventService.page(params); },
};

export function filterRecipes(items, category) {
  return items.filter(recipe => category === 'Todos' || (category === 'Rápidas'
    ? recipe.preparationMinutes <= 30 : recipe.categories.includes(category)));
}
