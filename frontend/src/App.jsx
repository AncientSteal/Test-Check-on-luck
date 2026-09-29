import { useState, useEffect } from 'react'
import ReceiptsList from './components/ReceiptList';
import ReceiptForm from './components/ReceiptForm';

function App() {
  const [activeTab, setActiveTab] = useState('cabinet');
  const [receipts, setReceipts] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchReceipts = async (pageNumber = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/receipts/?page=${pageNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setReceipts(data.results)
        setCount(data.count)
        setPage(pageNumber)
      } else {
        console.error('Ошибка загрузки чеков, статус:', response.status)
      }
    } catch (error) {
      console.error('Сетевая ошибка при загрузке чеков:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceipts(page)
  }, [page])

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <span className="logo">🎰 Чек на удачу</span>
          <nav className="app-nav">
            <button 
              className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              Регистрация чека
            </button>
            <button 
              className={`nav-btn ${activeTab === 'cabinet' ? 'active' : ''}`}
              onClick={() => setActiveTab('cabinet')}
            >
              Личный кабинет
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'form' ? (
          <section className="screen-form">
            <h2>Регистрация нового чека</h2>
            <ReceiptForm onSuccess={() => fetchReceipts(1)} />
          </section>
        ) : (
          <section className="screen-cabinet">
            <div className="screen-header">
              <h2>Ваши чеки ({count})</h2>
              <button className="action-btn" onClick={() => setActiveTab('form')}>
                + Зарегистрировать чек
              </button>
            </div>
            
            <ReceiptsList receipts={receipts} loading={loading} />
          </section>
        )}
      </main>
    </div>
  )
}

export default App
