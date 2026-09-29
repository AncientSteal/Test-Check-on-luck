import React, { useState } from 'react';

export default function ReceiptForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        fn: '',
        fd: '',
        fp: '',
        purchase_date: '',
        amount: ''
    });

    const [errors, setErrors] = useState({});

    const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value}));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: ''}));
        }
    };

    const validationForm = () => {
        const newErrors = {};
        const digitsOnly = /^\d+$/;

        if (!formData.fn) newErrors.fn = 'Поле ФН обязательно для заполнения';
        else if (!digitsOnly.test(formData.fn)) newErrors.fn = 'ФН должен состоять только из цифр';

        if (!formData.fd) newErrors.fd = 'Поле ФД обязательно для заполнения';
        else if (!digitsOnly.test(formData.fd)) newErrors.fd = 'ФД должен состоять только из цифр';

        if (!formData.fp) newErrors.fp = 'Поле ФП обязательно для заполнения';
        else if (!digitsOnly.test(formData.fp)) newErrors.fp = 'ФП должен состоять только из цифр';

        if (!formData.purchase_date) {
            newErrors.purchase_date = 'Укажите дату и время покупки';
        }

        if (!formData.amount) {
            newErrors.amount = 'Укажите сумму чека';
        } else {
            const numAmount = parseFloat(formData.amount);
            if (isNaN(numAmount) || numAmount < 1000) {
                newErrors.amount = 'Сумма в чеке должна быть не менее 1000 ₽';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ success: null, message: '' });

        if (!validationForm()) return;
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/receipts/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({
                    fn: formData.fn,
                    fd: formData.fd,
                    fp: formData.fp,
                    purchase_date: new Date(formData.purchase_date).toISOString(), // сразу к ISO для бэкенда
                    amount: formData.amount
                })
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitStatus({ 
                    success: true, 
                    message: 'Чек успешно зарегистрирован и отправлен на модерацию!' 
                });
                setFormData({ fn: '', fd: '', fp: '', purchase_date: '', amount: '' });
                if (onSuccess) onSuccess();
            } else {
                if (result.purchase_date) {
                    setErrors(prev => ({ ...prev, purchase_date: result.purchase_date }));
                }
                if (result.non_field_errors) {
                    setSubmitStatus({ success: false, message: result.non_field_errors });
                } else {
                    setSubmitStatus({ success: false, message: 'Ошибка валидации данных на сервере.' });
                }
            }
        } catch (error) {
            setSubmitStatus({ success: false, message: 'Сетевая ошибка сервера. Попробуйте позже.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} noValidate>
                {submitStatus.message && (
                    <div className={`form-alert ${submitStatus.success ? 'alert-success' : 'alert-error'}`}>
                        {submitStatus.message}
                    </div>
                )}

                <div className="form-group">
                    <label>ФН (Фискальный накопитель):</label>
                    <input 
                        type="text" name="fn" value={formData.fn} onChange={handleChange} 
                        className={errors.fn ? 'input-error' : ''} placeholder="16 цифр"
                    />
                    {errors.fn && <span className="error-text">{errors.fn}</span>}
                </div>

                <div className="form-group">
                    <label>ФД (Фискальный документ):</label>
                    <input 
                        type="text" name="fd" value={formData.fd} onChange={handleChange} 
                        className={errors.fd ? 'input-error' : ''}
                    />
                    {errors.fd && <span className="error-text">{errors.fd}</span>}
                </div>

                <div className="form-group">
                    <label>ФП (Фискальный признак):</label>
                    <input 
                        type="text" name="fp" value={formData.fp} onChange={handleChange} 
                        className={errors.fp ? 'input-error' : ''}
                    />
                    {errors.fp && <span className="error-text">{errors.fp}</span>}
                </div>

                <div className="form-group">
                    <label>Дата и время покупки:</label>
                    <input 
                        type="datetime-local" name="purchase_date" value={formData.purchase_date} onChange={handleChange} 
                        className={errors.purchase_date ? 'input-error' : ''}
                    />
                    {errors.purchase_date && <span className="error-text">{errors.purchase_date}</span>}
                </div>

                <div className="form-group">
                    <label>Сумма чека (₽):</label>
                    <input 
                        type="number" name="amount" value={formData.amount} onChange={handleChange} 
                        className={errors.amount ? 'input-error' : ''} placeholder="Минимум 1000"
                    />
                    {errors.amount && <span className="error-text">{errors.amount}</span>}
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Отправка...' : 'Зарегистрировать чек'}
                </button>
            </form>
        </div>
    );

}