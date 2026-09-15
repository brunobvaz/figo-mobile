export function profileNameFields(user = {}) {
  const name = (user.name || '').trim();
  const firstName = (user.firstName || '').trim();
  const lastName = (user.lastName || '').trim();
  if (firstName && lastName && (!name || name === `${firstName} ${lastName}`)) return { firstName, lastName };
  // Older clients only edited the full name. Keep that value for review rather
  // than guessing where a compound given name ends or restoring stale fields.
  return { firstName: name || firstName, lastName: name ? '' : lastName };
}
