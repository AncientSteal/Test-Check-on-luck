export const validateReceiptForm  = (formData) => {
  const newErrors = {};
  const digitsOnly = /^\d+$/;

  if (!formData.fn) newErrors.fn = "Поле ФН обязательно для заполнения";
  else if (!digitsOnly.test(formData.fn))
    newErrors.fn = "ФН должен состоять только из цифр";

  if (!formData.fd) newErrors.fd = "Поле ФД обязательно для заполнения";
  else if (!digitsOnly.test(formData.fd))
    newErrors.fd = "ФД должен состоять только из цифр";

  if (!formData.fp) newErrors.fp = "Поле ФП обязательно для заполнения";
  else if (!digitsOnly.test(formData.fp))
    newErrors.fp = "ФП должен состоять только из цифр";

  if (!formData.purchase_date) {
    newErrors.purchase_date = "Укажите дату и время покупки";
  }

  if (!formData.amount) {
    newErrors.amount = "Укажите сумму чека";
  } else {
    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount < 1000) {
      newErrors.amount = "Сумма в чеке должна быть не менее 1000 ₽";
    }
  }

  return newErrors;
};
