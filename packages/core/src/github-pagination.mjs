export function parseNextPage(linkHeader) {
  if (typeof linkHeader !== 'string') return null;
  for (const part of linkHeader.split(',')) {
    const match = part.trim().match(/^<([^>]+)>;\s*rel="next"$/);
    if (!match) continue;
    const url = new URL(match[1]);
    if (url.protocol !== 'https:' || url.hostname !== 'api.github.com') throw Error('Untrusted pagination URL');
    return url.pathname + url.search;
  }
  return null;
}
export async function collectPages(fetchPage, firstPath, maxPages = 5) {
  if (!Number.isSafeInteger(maxPages) || maxPages < 1 || maxPages > 20) throw Error('Invalid page budget');
  const items = [], seen = new Set();
  let path = firstPath;
  while (path && seen.size < maxPages) {
    if (seen.has(path)) throw Error('GitHub pagination cycle');
    seen.add(path);
    const page = await fetchPage(path);
    if (!Array.isArray(page.items)) throw Error('Expected GitHub list response');
    items.push(...page.items);
    path = parseNextPage(page.link);
  }
  return { items, truncated: Boolean(path), pages: seen.size };
}
