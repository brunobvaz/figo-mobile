// A saved receipt lets the client recover when the delete response is lost.
export async function requestAccountClosure(api, storage, mode, credentials) {
  const input = { ...credentials, confirm: true };
  let prepared;
  if (mode === 'delete') {
    prepared = await api.post('/auth/account/deletion-receipt', input);
    await storage.save({ ...prepared, status: 'requesting' });
  }
  try {
    const result = await api.post(`/auth/account/${mode}`, input);
    if (mode === 'delete') await storage.save(result);
    return result;
  } catch (error) {
    if (!prepared) throw error;
    try {
      const result = { ...prepared, ...(await api.post('/auth/account/deletion-status', { receipt: prepared.receipt })) };
      await storage.save(result);
      return result;
    } catch (statusError) {
      if (statusError.status === 404) { await storage.clear(); throw error; }
      return { ...prepared, status: 'requesting' };
    }
  }
}
