import { SuccessIcon } from "./Icons";

export default function SuccessModal({ setModalOpen }) {
    return (
        <div className="modal-container">
            <div className="modal-content">
                <SuccessIcon />
                <h3>
                    Ваш чек загружен
                </h3>
                <p>
                    Мы уже начали анализировать ваши покупки. 
                    Это займет всего пару секунд
                </p>
            </div>
            <button className="registration-btn" onClick={() => setModalOpen(false)}>
                На главную
            </button>
        </div>
    );
}