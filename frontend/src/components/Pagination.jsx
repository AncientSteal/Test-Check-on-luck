import { PaginationIcon } from "./Icons";
import "./Pagination.css";

export default function Pagination({ count, currentPage, onPageChange }) {

  if (count <= 0) return <></>;
  const pageSize = 10;
  const totalPages = Math.ceil(count / pageSize);

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container">
      <button 
        className="pag-btn pag-prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <PaginationIcon />
      </button>

      <div className="pag-numbers">
        {pages.map(num => (
          <button
            key={num}
            className={`pag-btn num-btn ${currentPage === num ? 'active' : ''}`}
            onClick={() => onPageChange(num)}
          >
            {num}
          </button>
        ))}
      </div>

      <button 
        className="pag-btn pag-next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <PaginationIcon />
      </button>
    </div>
  );
}