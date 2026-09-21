import config from '../config/config';
import { api } from './api';
import { recipeImageUrl } from '../utils/recipeImages';

export const recipeService = {
  async detail(id) {
    const recipe = await api.get(`/recipes/${encodeURIComponent(id)}`);
    if (!recipe || recipe.id !== id || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.categories))
      throw new Error('Não foi possível ler esta receita. Tenta novamente.');
    return { ...recipe, steps: recipe.steps || [], image: recipeImageUrl(recipe.image, config.apiBaseUrl) };
  },
  async page({ filter = 'Todos', page = 1 } = {}) {
    const params = { page: String(page), limit: '20' };
    if (filter === 'Rápidas') params.quick = 'true';
    else if (filter !== 'Todos') params.category = filter;
    const result = await api.get(`/recipes?${new URLSearchParams(params)}`);
    if (!Array.isArray(result?.items) || !Number.isInteger(result?.pagination?.page) || !Number.isInteger(result?.pagination?.pages))
      throw new Error('Não foi possível ler as receitas recebidas. Tenta novamente.');
    return { ...result, items: result.items.map(recipe => ({ ...recipe, image: recipeImageUrl(recipe.image, config.apiBaseUrl) })) };
  }
};
