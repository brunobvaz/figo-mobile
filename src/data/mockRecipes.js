/**
 * @typedef {Object} Recipe
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string|number|null} image Local asset, URI or placeholder when null.
 * @property {number} preparationMinutes
 * @property {'Fácil'|'Média'|'Difícil'} difficulty
 * @property {string[]} categories
 * @property {string[]} ingredients
 * @property {boolean} seasonal
 */
/** @type {Recipe[]} */
const recipes = [
  { id: 'recipe-caldo-verde', title: 'Caldo verde tradicional', description: 'Uma sopa reconfortante com os sabores da horta.', image: null, preparationMinutes: 35, difficulty: 'Fácil', categories: ['Sopas', 'Vegetarianas'], ingredients: ['Couve', 'Batata', 'Cebola'], seasonal: true },
  { id: 'recipe-abobora', title: 'Creme de abóbora', description: 'Cremoso e simples, ideal para os primeiros dias frescos.', image: null, preparationMinutes: 30, difficulty: 'Fácil', categories: ['Sopas', 'Vegetarianas'], ingredients: ['Abóbora', 'Cenoura', 'Cebola'], seasonal: true },
  { id: 'recipe-tomate', title: 'Tomate assado com ervas', description: 'Um acompanhamento cheio de cor e aroma.', image: null, preparationMinutes: 25, difficulty: 'Fácil', categories: ['Vegetarianas'], ingredients: ['Tomate', 'Alho', 'Ervas aromáticas'], seasonal: false },
  { id: 'recipe-tarte', title: 'Tarte de maçã caseira', description: 'Uma sobremesa para partilhar à mesa.', image: null, preparationMinutes: 50, difficulty: 'Média', categories: ['Doces', 'Vegetarianas'], ingredients: ['Maçã', 'Canela'], seasonal: true },
  { id: 'recipe-figos', title: 'Salada de figos e queijo', description: 'Frescura e doçura numa salada rápida.', image: null, preparationMinutes: 15, difficulty: 'Fácil', categories: ['Vegetarianas'], ingredients: ['Figos', 'Queijo', 'Nozes'], seasonal: true },
  { id: 'recipe-compota', title: 'Compota de frutos da época', description: 'Uma forma deliciosa de aproveitar a fruta madura.', image: null, preparationMinutes: 45, difficulty: 'Fácil', categories: ['Doces', 'Vegetarianas'], ingredients: ['Fruta sazonal', 'Açúcar', 'Limão'], seasonal: true },
];
export default recipes;
