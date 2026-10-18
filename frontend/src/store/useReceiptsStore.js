import { create } from "zustand";

export const useReceiptsStore = create((set, get) => ({
  receipts: [],
  count: 0,
  page: 1,
  loading: false,
  error: null,

  // Храним активный контроллер прямо в сторе для отмены старых запросов
  abortController: null,

  setPage: (newPage) => {
    set({ page: newPage });
    get().fetchReceipts();
  },

  fetchReceipts: async (pageNumber) => {
    const targetPage = pageNumber ?? get().page;
    if (pageNumber) set({ page: pageNumber });

    // Отменяем предыдущий запрос чеков, если пользователь быстро кликает пагинацию
    if (get().abortController) {
      get().abortController.abort();
    }

    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(5000);
    const combinedSignal = AbortSignal.any([controller.signal, timeoutSignal]);

    set({ loading: true, error: null, abortController: controller });

    try {
      const response = await fetch(`/api/receipts/?page=${targetPage}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: combinedSignal,
      });

      if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

      const data = await response.json();
      set({
        receipts: data.results,
        count: data.count,
        loading: false,
        abortController: null,
      });
    } catch (error) {
      if (
        error.name === "TimeoutError" ||
        (combinedSignal && combinedSignal.aborted && combinedSignal.reason?.name === "TimeoutError")
      ) {
        console.error("Превышено время ожидания ответа от сервера!");
        alert("Сервер отвечает слишком долго. Пожалуйста, попробуйте позже.");
        set({ loading: false, abortController: null, error: "Превышено время ожидания" });
      } else if (error.name === "AbortError") {
        console.log("Запрос чеков отменен");
      } else {
        console.error("Сетевая ошибка при загрузке чеков:", error);
        set({ error: error.message, loading: false, abortController: null });
      }
    }
  },
}));
