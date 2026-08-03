function normalizePrefix(prefix) {
  if (!prefix) return '';
  const firstPrefix = String(prefix).split(',')[0].trim();
  if (!firstPrefix || firstPrefix === '/') return '';
  return `/${firstPrefix.replace(/^\/+|\/+$/g, '')}`;
}

function getExternalBaseUrl(req) {
  const proto = String(req.get('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim();
  const host = String(req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
  const prefix = normalizePrefix(req.get('x-forwarded-prefix'));
  return `${proto}://${host}${prefix}`;
}

module.exports = {
  getExternalBaseUrl,
  normalizePrefix,
};
