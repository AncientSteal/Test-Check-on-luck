import { useState, useEffect } from 'react'
import Header from './components/Header';
import ReceiptsList from './components/ReceiptList';
import ReceiptForm from './components/ReceiptForm';
import Pagination from './components/Pagination'
import ListFooter from './components/ListFooter';
import SuccessModal from './components/SuccessModal';
import useWindowWidth from './hooks/useWindowWidth';

function App() {
  const [activeTab, setActiveTab] = useState('cabinet');
  const [receipts, setReceipts] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const windowWidth = useWindowWidth()

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
      <Header activeTab={activeTab} setActiveTab={setActiveTab} windowWidth={windowWidth} />

      <main>
        {activeTab === 'form' ? (
          <section className="screen-form">
            <ReceiptForm 
              onSuccess={() => {fetchReceipts(1); setActiveTab('cabinet'); setModalOpen(true)}} 
              onClose={() => setActiveTab('cabinet')}
            />
          </section>
        ) : (
          <section className="screen-cabinet">
            <div className="list-header">
              <h3>История чеков</h3>
              <div className='list-count'>
                <p>Чеков внесено: 
                  <span>{count} шт.</span>
                </p>
              </div>
            </div>
            
            <ReceiptsList receipts={receipts} loading={loading} />

            {!loading && (
              <Pagination 
                count={count} 
                currentPage={page} 
                onPageChange={(newPage) => fetchReceipts(newPage)} 
              />
            )}

            <ListFooter setActiveTab={setActiveTab} count={count}/>
          </section>
        )}
      </main>
      {modalOpen ? (
        <SuccessModal setModalOpen={setModalOpen}/>
      ) : <></>}

    </div>
  )
}

export default App
