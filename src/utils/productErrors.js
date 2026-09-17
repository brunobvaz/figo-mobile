const fields = {
  title: ['title', 'O título deve ter entre 2 e 120 caracteres.'],
  description: ['description', 'A descrição deve ter entre 10 e 2000 caracteres.'],
  price: ['price', 'Indica um preço superior a zero e até 1 000 000 €.'],
  unit: ['unit', 'Seleciona uma unidade válida para o produto.'],
  category: ['category', 'Seleciona uma categoria válida para o produto.'],
  seasonality: ['seasonality', 'Seleciona quando o produto está disponível.'],
  locality: ['locality', 'Indica uma localidade com até 120 caracteres.'],
};
const locationFields = ['municipalityCode', 'parishCode', 'latitude', 'longitude', 'locationSource'];
const photoFields = ['image', 'images', 'imageOrder', 'imagesRevision'];

// The API includes field details with VALIDATION_ERROR. Show actionable feedback
// while retaining all form values and selected photographs for correction.
export function productSaveError(error) {
  const errors = {};
  if (error?.code !== 'VALIDATION_ERROR') {
    return { errors, message: error?.message || 'Não foi possível guardar o anúncio. Tenta novamente.' };
  }
  for (const detail of Array.isArray(error.details) ? error.details : []) {
    const field = typeof detail?.field === 'string' ? detail.field.split('.')[0] : '';
    if (Object.hasOwn(fields, field)) {
      const [key, message] = fields[field];
      errors[key] = message;
    } else if (locationFields.includes(field)) {
      errors.location = 'Volta a selecionar o concelho e a freguesia do produto.';
    } else if (photoFields.includes(field)) {
      errors.photos = 'Verifica as fotografias selecionadas. Podes adicionar entre 1 e 6 fotografias.';
    }
  }
  const messages = [...new Set(Object.values(errors))];
  return { errors, message: messages.length ? messages.join('\n') : 'Não foi possível validar o anúncio. Revê os dados e tenta novamente.' };
}
