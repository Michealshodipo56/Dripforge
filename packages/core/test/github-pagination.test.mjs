import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNextPage, collectPages } from '../src/github-pagination.mjs';
test('extracts GitHub next link',()=>assert.equal(parseNextPage('<https://api.github.com/issues?page=2>; rel="next"'),'/issues?page=2'));
test('rejects external pagination',()=>assert.throws(()=>parseNextPage('<https://evil.example/issues>; rel="next"')));
test('collects multiple pages',async()=>{const x=await collectPages(async p=>p==='one'?{items:[1],link:'<https://api.github.com/two>; rel="next"'}:{items:[2],link:''},'one');assert.deepEqual(x.items,[1,2])});
test('limits page count',async()=>{const x=await collectPages(async()=>({items:[1],link:'<https://api.github.com/two>; rel="next"'}),'one',1);assert.equal(x.truncated,true)});
