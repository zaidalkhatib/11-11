import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePreviewPhone, samplePhone, canPreviewMessage, callingCodes } from '../packages/domain/signup.ts';
test('sample number validates without any service or persistence',()=>assert.equal(validatePreviewPhone(samplePhone,'US'),null));
test('blank, malformed, short and oversized numbers are rejected',()=>{for(const value of ['', 'letters', '+1 2025550111', '123', '2'.repeat(20)]) assert.ok(validatePreviewPhone(value,'US'));});
test('North American number requires ten digits',()=>{assert.ok(validatePreviewPhone('202555011','US'));assert.equal(validatePreviewPhone('(202) 555-0111','CA'),null);});
test('international format limit includes calling code',()=>{assert.equal(validatePreviewPhone('501234567','AE'),null);assert.ok(validatePreviewPhone('2'.repeat(13),'AE'));assert.ok(validatePreviewPhone('12','JO'));});
test('country codes are unique and valid',()=>{assert.equal(new Set(callingCodes.map(x=>x.id)).size,callingCodes.length);for(const code of callingCodes)assert.match(code.prefix,/^\+\d{1,3}$/);});
test('chat drafts reject blank and overlong input',()=>{assert.equal(canPreviewMessage('  '),false);assert.equal(canPreviewMessage('Hi there'),true);assert.equal(canPreviewMessage('a'.repeat(281)),false);});
