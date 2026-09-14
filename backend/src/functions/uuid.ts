// by chatgpt
import { createHash, getRandomValues } from 'node:crypto';


export function uuidv5(input: string): string {
  const hash = createHash('sha256')
    .update(input, 'utf8')
    .digest();
  const bytes = hash.subarray(0, 16);
  // UUID version 5
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  // RFC 9562 variant
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-'); }

export function uuidv7(): string {
  const timestamp = BigInt(Date.now());

  const bytes = new Uint8Array(16);
  getRandomValues(bytes);

  // 48 Bit Unix timestamp
  bytes[0] = Number(timestamp >> 40n & 0xffn);
  bytes[1] = Number(timestamp >> 32n & 0xffn);
  bytes[2] = Number(timestamp >> 24n & 0xffn);
  bytes[3] = Number(timestamp >> 16n & 0xffn);
  bytes[4] = Number(timestamp >> 8n & 0xffn);
  bytes[5] = Number(timestamp & 0xffn);

  // UUID version 7
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // UUID variant RFC 9562
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = [...bytes]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
