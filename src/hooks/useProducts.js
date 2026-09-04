import { useContext } from 'react'; import { ProductsContext } from '../context/ProductsContext';
export default function useProducts() { const context = useContext(ProductsContext); if (!context) throw new Error('useProducts deve ser usado dentro de ProductsProvider'); return context; }
