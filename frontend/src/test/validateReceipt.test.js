import { describe, test, expect } from "vitest";
import { validateReceiptForm } from "../utils/validateReceipt";

describe("Валидация формы чека на клиенте", () => {
  test("Должна возвращать пустой объект ошибок для валидных данных", () => {
    const validData = {
      fn: "1111222233334444",
      fd: "7788",
      fp: "99887766",
      purchase_date: "2026-10-15T14:30",
      amount: "1500.00",
    };
    const errors = validateReceiptForm(validData);
    expect(Object.keys(errors).length).toBe(0);
  });

  test("Должна фиксировать ошибку, если сумма меньше 1000 рублей", () => {
    const invalidData = {
      fn: "1111222233334444",
      fd: "7788",
      fp: "99887766",
      purchase_date: "2026-10-15T14:30",
      amount: "950",
    };
    const errors = validateReceiptForm(invalidData);
    expect(errors.amount).toBe("Сумма в чеке должна быть не менее 1000 ₽");
  });

  test("Должна требовать заполнения обязательных реквизитов ФН/ФД/ФП", () => {
    const emptyData = { fn: "", fd: "", fp: "", purchase_date: "", amount: "" };
    const errors = validateReceiptForm(emptyData);
    expect(errors.fn).toContain("Поле ФН обязательно для заполнения");
    expect(errors.fd).toContain("Поле ФД обязательно для заполнения");
    expect(errors.fp).toContain("Поле ФП обязательно для заполнения");
    expect(errors.purchase_date).toContain("Укажите дату и время покупки");
    expect(errors.amount).toContain("Укажите сумму чека");
  });
});
