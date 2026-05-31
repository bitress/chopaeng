type DashboardPaginationProps = {
  page: number;
  perPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

const DashboardPagination = ({ page, perPage, totalItems, onPageChange }: DashboardPaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * perPage + 1;
  const end = Math.min(totalItems, safePage * perPage);

  if (totalPages <= 1) {
    return (
      <div className="dashboard-pagination">
        <span>Showing {start}-{end} of {totalItems}</span>
      </div>
    );
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((candidate) => candidate === 1 || candidate === totalPages || Math.abs(candidate - safePage) <= 1);

  return (
    <div className="dashboard-pagination">
      <span>Showing {start}-{end} of {totalItems}</span>
      <div className="dashboard-page-buttons">
        <button type="button" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
          <i className="fa-solid fa-chevron-left" />
        </button>
        {pages.map((candidate, index) => {
          const prev = pages[index - 1];
          return (
            <span className="dashboard-page-slot" key={candidate}>
              {prev && candidate - prev > 1 && <span className="dashboard-page-ellipsis">...</span>}
              <button type="button" className={candidate === safePage ? "active" : ""} onClick={() => onPageChange(candidate)}>
                {candidate}
              </button>
            </span>
          );
        })}
        <button type="button" disabled={safePage >= totalPages} onClick={() => onPageChange(safePage + 1)}>
          <i className="fa-solid fa-chevron-right" />
        </button>
      </div>
    </div>
  );
};

export default DashboardPagination;
