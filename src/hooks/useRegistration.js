import { useContext } from 'react';
import { RegistrationContext } from '../context/RegistrationContext';

export default function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) throw new Error('useRegistration deve ser usado dentro de RegistrationProvider.');
  return context;
}
