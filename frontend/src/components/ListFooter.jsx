import { ReceiptIcon, WarningIcon } from "./Icons";

export default function ListFooter({ count, setActiveTab }) {
    return (
        <div className={`list-footer ${count === 0 ? 'one' : ''}`}>
            { count === 0 ? <></> : <div className='list-footer_info'>
                <WarningIcon />
                <p>Иногда проверка вашего чека может занять до 5 рабочих дней</p>
            </div>}
            <button className="registration-btn" onClick={() => setActiveTab('form')}>
                <ReceiptIcon /> Зарегистрировать чек
            </button>
        </div>
    );
}