export function createLineFramer(onLine, maxBuffered = 65536) {
  if (typeof onLine !== 'function') throw new TypeError('onLine must be a function');
  if (!Number.isSafeInteger(maxBuffered) || maxBuffered < 1024) throw new RangeError('Invalid buffer limit');
  let pending = '';
  function push(chunk) {
    pending += String(chunk);
    while (true) {
      const newline = pending.indexOf('\n');
      if (newline === -1) break;
      const line = pending.slice(0, newline).replace(/\r$/, '');
      pending = pending.slice(newline + 1);
      onLine(line);
    }
    if (pending.length > maxBuffered) {
      onLine(pending.slice(0, maxBuffered) + ' [TRUNCATED]');
      pending = '';
    }
  }
  function flush() { if (pending) { onLine(pending); pending = ''; } }
  return { push, flush };
}
