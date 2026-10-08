const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home', 'Beauty', 'Grocery']

function SearchBar({ search, setSearch, category, setCategory, sort, setSort, onReset }) {
  const hasActiveFilters = search.trim() || category !== 'All Categories' || sort

  return (
    <div className="catalog-controls">
      <label className="catalog-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products by name..." aria-label="Search products" />{search && <button type="button" className="catalog-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>}</label>
      <label className="catalog-select">Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="catalog-select">Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="">Featured</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></label>
      {hasActiveFilters && <button type="button" className="catalog-reset" onClick={onReset}>Reset filters</button>}
    </div>
  )
}

export default SearchBar
