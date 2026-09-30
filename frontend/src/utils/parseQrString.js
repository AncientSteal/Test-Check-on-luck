export const parseQrString = (rawString) => {
  if (!rawString) return null;

  try {
    const params = new URLSearchParams(rawString);
    const amount = params.get("s") || "";
    const rawDate = params.get("t") || ""; // (формат: 20260928T103500)
    const fn = params.get("fn") || "";
    const fd = params.get("i") || ""; // fd
    const fp = params.get("fp") || "";

    let formattedDate = "";
    if (rawDate && rawDate.length >= 13) {
      // перевод системной строки "20260928T103000" в понятный для инпута формат типа "2026-09-28T10:30"
      const year = rawDate.substring(0, 4);
      const month = rawDate.substring(4, 6);
      const day = rawDate.substring(6, 8);
      const hour = rawDate.substring(9, 11);
      const minute = rawDate.substring(11, 13);
      formattedDate = `${year}-${month}-${day}T${hour}:${minute}`;
    }

    if (fn || fd || fp || amount || formattedDate) {
      return { fn, fd, fp, purchase_date: formattedDate, amount };
    }
  } catch (err) {
    console.error("Ошибка при разборе строки QR-кода:", err);
  }

  return null;
};
