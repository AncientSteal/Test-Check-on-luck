import { useState, useEffect } from "react";
import Header from "./components/Header";
import ReceiptForm from "./components/ReceiptForm";
import SuccessModal from "./components/SuccessModal";
import { useUserStore } from "./store/useUserStore";
import CabinetScreen from "./components/CabinetScreen";
import { useReceiptsStore } from "./store/useReceiptsStore";

function App() {
  const [activeTab, setActiveTab] = useState("cabinet");
  const [modalOpen, setModalOpen] = useState(false);
  const fetchUser = useUserStore((state) => state.fetchUser);
  const fetchReceipts = useReceiptsStore((state) => state.fetchReceipts);

  useEffect(() => {
    fetchUser();
    fetchReceipts(1);
  }, [fetchUser, fetchReceipts]);

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main>
        {activeTab === "form" ? (
          <section className="screen-form">
            <ReceiptForm
              onSuccess={() => {
                fetchReceipts(1);
                setActiveTab("cabinet");
                setModalOpen(true);
              }}
              onClose={() => setActiveTab("cabinet")}
            />
          </section>
        ) : (
          <CabinetScreen setActiveTab={setActiveTab} />
        )}
      </main>
      {modalOpen ? <SuccessModal setModalOpen={setModalOpen} /> : <></>}
    </div>
  );
}

export default App;
