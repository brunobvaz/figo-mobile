export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email.trim());
export const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,128}$/.test(password);
export const validateRequired = (value) => Boolean(String(value || '').trim());
export const validateProduct = (product) => { const errors = {}; ['title', 'description', 'price', 'unit', 'category', 'location'].forEach((field) => { if (!validateRequired(product[field])) errors[field] = 'Campo obrigatório'; }); if (product.price && Number(product.price) <= 0) errors.price = 'Indica um preço válido'; return errors; };
