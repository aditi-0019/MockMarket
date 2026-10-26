function StockSearch({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-box">
      <span>⌕</span>

      <input
        type="text"
        placeholder="Search stocks..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
    </div>
  );
}

export default StockSearch;