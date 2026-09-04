export const mockOrders = [
  { id: 'order-1', seller: 'Casa do Souto', buyer: 'Maria do Minho', products: [{ id: 'p3', title: 'Ovos caseiros', quantity: 1 }], quantity: 1, price: 3.2, status: 'ready' },
  { id: 'order-2', seller: 'Apiário do Vez', buyer: 'Maria do Minho', products: [{ id: 'p2', title: 'Mel artesanal', quantity: 2 }], quantity: 2, price: 15, status: 'completed' },
];
export const orderService = { async list() { return mockOrders; } };
