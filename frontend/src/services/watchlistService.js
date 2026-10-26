const WATCHLIST_KEY = "mockmarket_watchlist";

export function getWatchlist() {
  const saved = localStorage.getItem(WATCHLIST_KEY);

  return saved ? JSON.parse(saved) : [];
}

export function addToWatchlist(stock) {
  const watchlist = getWatchlist();

  const alreadyExists = watchlist.some(
    (item) => item.symbol === stock.symbol
  );

  if (alreadyExists) {
    return watchlist;
  }

  const updatedWatchlist = [...watchlist, stock];

  localStorage.setItem(
    WATCHLIST_KEY,
    JSON.stringify(updatedWatchlist)
  );

  return updatedWatchlist;
}

export function removeFromWatchlist(symbol) {
  const watchlist = getWatchlist();

  const updatedWatchlist = watchlist.filter(
    (item) => item.symbol !== symbol
  );

  localStorage.setItem(
    WATCHLIST_KEY,
    JSON.stringify(updatedWatchlist)
  );

  return updatedWatchlist;
}

export function isInWatchlist(symbol) {
  const watchlist = getWatchlist();

  return watchlist.some(
    (item) => item.symbol === symbol
  );
}