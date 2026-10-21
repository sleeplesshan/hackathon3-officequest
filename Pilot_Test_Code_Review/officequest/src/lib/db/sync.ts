export interface RevisionNotice { type: 'db'; rev: number }
export function subscribeDB(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('oq-sync') : null;
  if (channel) channel.onmessage = onChange;
  window.addEventListener('storage', onChange);
  window.addEventListener('oq:db', onChange);
  return () => { channel?.close(); window.removeEventListener('storage', onChange); window.removeEventListener('oq:db', onChange); };
}
