// @vitest-environment jsdom

/* eslint-disable no-unused-vars */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ReceiptForm from '../components/ReceiptForm';

// Делаем заглушку (mock) для функции getCookie, чтобы она не падала в среде тестирования
vi.mock('../utils/getCookie', () => ({
  getCookie: () => 'fake-csrf-token'
}));

describe('Компонент формы ReceiptForm', () => {
  test('Автозаполнение должно работать при вставке корректной строки QR-кода', () => {
    // Рендерим форму в виртуальный DOM библиотеки jsdom
    render(<ReceiptForm onSuccess={vi.fn()} onClose={vi.fn()} />);

    // 1. Находим инпут автозаполнения по его плейсхолдеру
    const qrInput = screen.getByPlaceholderText(/Вставьте строку \(пример: t=/i);
    
    // Имитируем вставку строки пользователем
    const testQrString = 't=20260930T145500&s=1850.20&fn=9999456789123456&i=7788&fp=33445566';
    fireEvent.change(qrInput, { target: { value: testQrString } });

    // 2. Находим инпуты реквизитов формы по плейсхолдерам или значениям
    const fnInput = screen.getByPlaceholderText('Введите ФН');
    const fdInput = screen.getByPlaceholderText('Введите номер чека (ФД)');
    const fpInput = screen.getByPlaceholderText('Введите ФП');
    const amountInput = screen.getByPlaceholderText('Минимум 1000');

    // ПРОВЕРКА МАГИИ АВТОЗАПОЛНЕНИЯ: 
    // Значения инпутов должны мгновенно стать равными распарсенным данным!
    expect(fnInput.value).toBe('9999456789123456');
    expect(fdInput.value).toBe('7788');
    expect(fpInput.value).toBe('33445566');
    expect(amountInput.value).toBe('1850.20');
  });
});