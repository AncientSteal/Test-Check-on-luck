/* eslint-disable no-unused-vars */
import React, { useState, useRef } from "react";
import "./ReceiptForm.css";
import { CloseIcon, DangerIcon } from "./Icons";
import { getCookie } from "../utils/getCoockie";
import { validateReceiptForm } from "../utils/validateReceipt";
import { parseQrString } from "../utils/parseQrString";

export default function ReceiptForm({ onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    fn: "",
    fd: "",
    fp: "",
    purchase_date: "",
    amount: "",
  });

  // Стейт для поля быстрой вставки строки QR-кода
  const [qrRawString, setQrRawString] = useState("");
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    success: null,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleQrChange = (e) => {
    const value = e.target.value;
    setQrRawString(value);

    // запускаем  утилиту парсинга
    const parsedData = parseQrString(value);

    if (parsedData) {
      setFormData(parsedData); // наполняем инпуты
      setErrors({}); // чистим ошибки
    }
  };

  const submitController = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitController.current) {
        submitController.current.abort();
    }
    setSubmitStatus({ success: null, message: "" });

    const validationErrors = validateReceiptForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    submitController.current = new AbortController();
    const timeoutSignal = AbortSignal.timeout(5000);
    const combinedSignal = AbortSignal.any([submitController.current.signal, timeoutSignal]);

    try {
      const response = await fetch("/api/receipts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        signal: combinedSignal,
        body: JSON.stringify({
          fn: formData.fn,
          fd: formData.fd,
          fp: formData.fp,
          purchase_date: new Date(formData.purchase_date).toISOString(), // сразу к ISO для бэкенда
          amount: formData.amount,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: "Чек успешно зарегистрирован и отправлен на модерацию!",
        });
        setFormData({ fn: "", fd: "", fp: "", purchase_date: "", amount: "" });
        if (onSuccess) onSuccess();
      } else {
        if (result.purchase_date) {
          setErrors((prev) => ({
            ...prev,
            purchase_date: result.purchase_date,
          }));
        }
        if (result.non_field_errors) {
          setSubmitStatus({ success: false, message: result.non_field_errors });
        } else {
          setSubmitStatus({
            success: false,
            message: "Ошибка валидации данных на сервере.",
          });
        }
      }
    } catch (error) {
      if (error.name === "TimeoutError" || (combinedSignal && combinedSignal.aborted && combinedSignal.reason?.name === "TimeoutError")) {
        console.error("Превышено время ожидания ответа от сервера!");
        setSubmitStatus({
            success: false,
            message: "Сервер отвечает слишком долго. Проверьте соединение и попробуйте позже.",
        });
      } else if (error.name === "AbortError") {
        console.log("Запрос отменен из-за двойного клика");
      } else {
        console.error("Сетевая ошибка при загрузке формы:", error);
        setSubmitStatus({
            success: false,
            message: "Сетевая ошибка сервера. Попробуйте позже.",
        });
      }
    } finally {
      submitController.current = null;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h3>Регистрация чека</h3>
        <p>Введите необходимые данные с чека</p>
      </div>
      <button
        type="button"
        className="close-form-btn"
        onClick={onClose}
        aria-label="Закрыть форму"
      >
        <CloseIcon />
      </button>
      <div className="qr-autofill-group">
        <label>Автозаполнение по строке QR-кода:</label>
        <input
          type="text"
          value={qrRawString}
          onChange={handleQrChange}
          placeholder="Вставьте строку (пример: t=datetime&s=1500&fn=...)"
        />
      </div>
      <form onSubmit={handleSubmit} noValidate>
        {submitStatus.message && (
          <div
            className={`form-alert ${submitStatus.success ? "alert-success" : "alert-error"}`}
          >
            {submitStatus.success === false && <DangerIcon />}
            {submitStatus.message}
          </div>
        )}

        <div className="form-group">
          <label>ФН</label>
          <input
            type="text"
            name="fn"
            value={formData.fn}
            onChange={handleChange}
            className={errors.fn ? "input-error" : ""}
            placeholder="Введите ФН"
          />
          {errors.fn && (
            <span className="error-text">
              <DangerIcon />
              {errors.fn}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>Номер чека</label>
          <input
            type="text"
            name="fd"
            value={formData.fd}
            onChange={handleChange}
            className={errors.fd ? "input-error" : ""}
            placeholder="Введите номер чека (ФД)"
          />
          {errors.fd && (
            <span className="error-text">
              <DangerIcon />
              {errors.fd}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>ФП</label>
          <input
            type="text"
            name="fp"
            value={formData.fp}
            onChange={handleChange}
            className={errors.fp ? "input-error" : ""}
            placeholder="Введите ФП"
          />
          {errors.fp && (
            <span className="error-text">
              <DangerIcon />
              {errors.fp}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>Дата покупки</label>
          <input
            type="datetime-local"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            className={errors.purchase_date ? "input-error" : ""}
          />
          {errors.purchase_date && (
            <span className="error-text">
              <DangerIcon />
              {errors.purchase_date}
            </span>
          )}
        </div>

        <div className="form-group">
          <label>Сумма</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={errors.amount ? "input-error" : ""}
            placeholder="Минимум 1000"
          />
          {errors.amount && (
            <span className="error-text">
              <DangerIcon />
              {errors.amount}
            </span>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Отправка..." : "Загрузить"}
        </button>
      </form>
    </div>
  );
}
