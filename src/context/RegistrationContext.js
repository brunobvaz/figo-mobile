import { createContext, useCallback, useMemo, useState } from 'react';

const initialRegistration = {
  firstName: '', lastName: '', email: '', password: '', passwordConfirmation: ''
};

export const RegistrationContext = createContext(null);

export function RegistrationProvider({ children }) {
  const [registration, setRegistration] = useState(initialRegistration);
  const updateRegistration = useCallback((changes) => setRegistration((current) => ({ ...current, ...changes })), []);
  const clearRegistration = useCallback(() => setRegistration(initialRegistration), []);
  const value = useMemo(() => ({ registration, updateRegistration, clearRegistration }), [registration, updateRegistration, clearRegistration]);
  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}
