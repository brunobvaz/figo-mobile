import { scheduleLoadingReveal } from '../utils/delayedLoading';
import { useEffect, useState } from 'react';

export default function useDelayedLoading(pending, delay = 250) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    if (!pending) return;
    return scheduleLoadingReveal(() => setVisible(true), delay);
  }, [pending, delay]);
  return pending && visible;
}
