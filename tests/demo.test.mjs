import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBooking, createDemoStore, isDemoSessionValid } from '../site/assets/demo-store.mjs';

const valid = { name: '  Мария  ', contact: ' demo@example.com ', format: 'online', service: 'individual', time: '', consent: true };
const memory = () => {
  const map = new Map();
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) };
};

test('booking rejects absent consent, blank and oversized fields', () => {
  for (const input of [{ ...valid, consent: false }, { ...valid, name: ' ' }, { ...valid, contact: '' }, { ...valid, contact: 'x'.repeat(121) }, { ...valid, format: 'bad' }, { ...valid, service: 'bad' }]) {
    assert.throws(() => validateBooking(input));
  }
});
test('booking normalizes contact and name without discarding unicode', () => {
  assert.deepEqual(validateBooking(valid), { name: 'Мария', contact: 'demo@example.com', format: 'online', service: 'individual', time: '' });
});
test('synthetic records initialize once, persist booking and keep newest first', () => {
  const storage = memory();
  const store = createDemoStore(storage);
  assert.equal(store.list().length, 3);
  assert.ok(store.list().every(r => r.contact.endsWith('@example.com')));
  const added = store.add(valid);
  assert.equal(added.status, 'new');
  assert.equal(createDemoStore(storage).list()[0].name, 'Мария');
  assert.equal(store.list().length, 4);
});
test('status change and delete persist across store instances', () => {
  const storage = memory();
  const store = createDemoStore(storage);
  const added = store.add(valid);
  store.update(added.id, 'booked');
  assert.equal(createDemoStore(storage).list().find(r => r.id === added.id).status, 'booked');
  assert.throws(() => store.update(added.id, 'invalid'));
  store.remove(added.id);
  assert.equal(createDemoStore(storage).list().some(r => r.id === added.id), false);
  store.reset();
  assert.equal(store.list().length, 3);
});
test('corrupted and wrong-shaped storage recovers to synthetic records', () => {
  for (const bad of ['{broken', '{"version":1,"records":[null]}', '{"version":1,"records":"bad"}']) {
    const storage = memory();
    storage.setItem('burashova-demo-v1', bad);
    assert.equal(createDemoStore(storage).list().length, 3);
  }
});
test('denied storage never reports a successful saved booking', () => {
  const storage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.throws(() => createDemoStore(storage).add(valid), /хранилищ/i);
});
test('demo session rejects missing, malformed, future and expired timestamps', () => {
  const now = 1800000000000;
  for (const value of [null, '', 'bad', String(now + 1000), String(now - 14400001)]) assert.equal(isDemoSessionValid(value, now), false);
  assert.equal(isDemoSessionValid(String(now - 1000), now), true);
});
