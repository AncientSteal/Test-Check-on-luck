import { describe, test, expect } from 'vitest';
import { parseQrString } from '../utils/parseQrString';

describe('Парсер сырой строки QR-кода чека', () => {
  test('Должен корректно разбирать валидную строку и форматировать дату', () => {
    const rawString = 't=20260930T145500&s=1850.20&fn=9999456789123456&i=7788&fp=33445566';
    const result = parseQrString(rawString);

    expect(result).not.toBeNull();
    expect(result.fn).toBe('9999456789123456');
    expect(result.fd).toBe('7788');
    expect(result.fp).toBe('33445566');
    expect(result.amount).toBe('1850.20');
    expect(result.purchase_date).toBe('2026-09-30T14:55'); // Проверка конвертации даты
  });

  test('Должен возвращать null, если строка пустая или не содержит реквизитов', () => {
    expect(parseQrString('')).toBeNull();
    expect(parseQrString('random-text-without-params')).toBeNull();
  });
});