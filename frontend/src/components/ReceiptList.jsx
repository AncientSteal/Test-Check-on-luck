import React from 'react';

export default function ReceiptsList({ receipts, loading }) {
  if (loading) return <div className="loading">Загрузка данных...</div>;
  if (receipts.length === 0) return <div className="empty-state">У вас пока нет зарегистрированных чеков.</div>;

  // Функция для подбора CSS-класса под статус чека
  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return 'status-checking';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="table-container">
      <table className="receipts-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Дата покупки</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Комментарий / Причина отказа</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt) => (
            <tr key={receipt.id}>
              <td>{receipt.id}</td>
              <td>{formatDate(receipt.purchase_date)}</td>
              <td className="amount-cell">{parseFloat(receipt.amount).toLocaleString('ru-RU')} ₽</td>
              <td>
                <span className={`status-badge ${getStatusClass(receipt.status)}`}>
                  {receipt.status_display}
                </span>
              </td>
              <td className="reason-cell">
                {receipt.status === 'rejected' ? receipt.reject_reason : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}