import { useEffect, useState } from "react";
import StockSearch from "../components/StockSearch";
import StockCard from "../components/StockCard";
import PortfolioSummary from "../components/PortfolioSummary";

import {
  getMarketData,
  getPortfolioRisk,
} from "../services/api";


function Dashboard() {

  const [searchTerm, setSearchTerm] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  // Portfolio Risk
  const [portfolioRisk, setPortfolioRisk] = useState(null);


  const stockSymbols = [
    {
      symbol: "TCS",
      name: "Tata Consultancy Services",
    },
    {
      symbol: "INFY",
      name: "Infosys",
    },
    {
      symbol: "RELIANCE",
      name: "Reliance Industries",
    },
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank",
    },
  ];


  // ---------------------------------------------------------
  // Load initial stocks
  // ---------------------------------------------------------

  useEffect(() => {

    async function loadStocks() {

      try {

        const results = await Promise.all(
          stockSymbols.map(async (stock) => {

            const data = await getMarketData(
              stock.symbol
            );

            return {
              ...stock,
              price: data.current_price,
              change: data.change_percent,
            };

          })
        );

        setStocks(results);

      } catch (error) {

        console.error(
          "Failed to load stocks:",
          error
        );

      } finally {

        setLoading(false);

      }

    }

    loadStocks();

  }, []);


  // ---------------------------------------------------------
  // Load Portfolio Risk
  // ---------------------------------------------------------

  useEffect(() => {

    async function loadPortfolioRisk() {

      try {

        const risk = await getPortfolioRisk();

        console.log(
          "Portfolio Risk:",
          risk
        );

        setPortfolioRisk(risk);

      } catch (error) {

        console.error(
          "Failed to load portfolio risk:",
          error
        );

      }

    }

    loadPortfolioRisk();

  }, []);


  // ---------------------------------------------------------
  // Load search history
  // ---------------------------------------------------------

  useEffect(() => {

    const savedUser =
      localStorage.getItem(
        "mockmarket_user"
      );

    let username = "guest";

    if (savedUser) {

      try {

        const user =
          JSON.parse(savedUser);

        username =
          user.username || "guest";

      } catch (error) {

        console.error(
          "Invalid user data"
        );

      }

    }

    const savedHistory =
      localStorage.getItem(
        `mockmarket_search_history_${username}`
      );

    if (savedHistory) {

      try {

        setSearchHistory(
          JSON.parse(savedHistory)
        );

      } catch (error) {

        console.error(
          "Invalid search history"
        );

      }

    }

  }, []);


  // ---------------------------------------------------------
  // Search any stock
  // ---------------------------------------------------------

  useEffect(() => {

    const symbol =
      searchTerm.trim().toUpperCase();


    // Empty search → show default stocks

    if (!symbol) {

      setSearchError("");

      return;

    }


    // Don't search for every single character

    if (symbol.length < 2) {

      return;

    }


    const timer =
      setTimeout(async () => {

        try {

          setSearchLoading(true);

          setSearchError("");


          const data =
            await getMarketData(symbol);


          const searchedStock = {

            symbol: symbol,

            name: symbol,

            price:
              data.current_price,

            change:
              data.change_percent,

          };


          setStocks([
            searchedStock
          ]);


          // Get current username

          const savedUser =
            localStorage.getItem(
              "mockmarket_user"
            );

          let username = "guest";


          if (savedUser) {

            try {

              const user =
                JSON.parse(savedUser);

              username =
                user.username || "guest";

            } catch (error) {

              console.error(
                "Invalid user data"
              );

            }

          }


          // Save search history

          setSearchHistory(
            (prev) => {

              const updatedHistory = [

                symbol,

                ...prev.filter(
                  (item) =>
                    item !== symbol
                ),

              ].slice(0, 8);


              localStorage.setItem(

                `mockmarket_search_history_${username}`,

                JSON.stringify(
                  updatedHistory
                )

              );


              return updatedHistory;

            }
          );


        } catch (error) {

          console.error(
            "Stock search failed:",
            error
          );


          setStocks([]);


          setSearchError(
            `No market data found for "${symbol}". Try another stock symbol.`
          );


        } finally {

          setSearchLoading(false);

        }

      }, 700);


    return () =>
      clearTimeout(timer);

  }, [searchTerm]);


  // ---------------------------------------------------------
  // Search history click
  // ---------------------------------------------------------

  function handleHistoryClick(symbol) {

    setSearchTerm(symbol);

  }


  // ---------------------------------------------------------
  // Clear search
  // ---------------------------------------------------------

  function clearSearch() {

    setSearchTerm("");

    setSearchError("");


    async function reloadDefaultStocks() {

      try {

        setLoading(true);


        const results =
          await Promise.all(

            stockSymbols.map(
              async (stock) => {

                const data =
                  await getMarketData(
                    stock.symbol
                  );


                return {

                  ...stock,

                  price:
                    data.current_price,

                  change:
                    data.change_percent,

                };

              }
            )

          );


        setStocks(results);


      } catch (error) {

        console.error(
          "Failed to reload stocks:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    reloadDefaultStocks();

  }


  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (

    <div className="dashboard">


      <section className="hero-section">

        <div>

          <p className="eyebrow">
            WELCOME TO MOCKMARKET
          </p>


          <h1>

            Practice Trading.

            <br />

            <span>
              Learn the Market.
            </span>

          </h1>


          <p className="hero-text">

            Trade stocks using virtual money,
            build your portfolio, and understand
            your investment performance without
            risking real money.

          </p>

        </div>

      </section>


      <PortfolioSummary />


      {/* Portfolio Risk */}

      {portfolioRisk && (

        <section className="portfolio-risk-section">

          <div className="portfolio-risk-card">

            <div className="risk-header">

              <div>

                <p className="eyebrow">
                  PORTFOLIO ANALYSIS
                </p>

                <h2>
                  Portfolio Risk
                </h2>

                <p>
                  Risk based on volatility,
                  concentration and historical
                  drawdown.
                </p>

              </div>


              <div className="risk-score">

                <strong>
                  {portfolioRisk.risk_score}
                </strong>

                <span>
                  / 100
                </span>

              </div>

            </div>


            <div className="risk-level">

              <span>
                Risk Level
              </span>

              <strong>
                {portfolioRisk.risk_level}
              </strong>

            </div>


            <div className="risk-metrics">

              <div className="risk-metric">

                <span>
                  Volatility
                </span>

                <strong>
                  {portfolioRisk.portfolio_volatility}%
                </strong>

              </div>


              <div className="risk-metric">

                <span>
                  Concentration
                </span>

                <strong>
                  {portfolioRisk.concentration}%
                </strong>

              </div>


              <div className="risk-metric">

                <span>
                  Max Drawdown
                </span>

                <strong>
                  {portfolioRisk.max_drawdown}%
                </strong>

              </div>


              <div className="risk-metric">

                <span>
                  Holdings
                </span>

                <strong>
                  {portfolioRisk.holdings_count}
                </strong>

              </div>

            </div>


            <p className="risk-message">

              {portfolioRisk.message}

            </p>

          </div>

        </section>

      )}


      <section className="stock-section">


        <div className="section-heading">

          <div>

            <h2>
              Explore Stocks
            </h2>

            <p>
              Search and explore market
              opportunities.
            </p>

          </div>


          <StockSearch

            searchTerm={searchTerm}

            setSearchTerm={setSearchTerm}

          />

        </div>


        {/* Search History */}

        {searchHistory.length > 0 && (

          <div className="search-history">

            <span className="search-history-title">
              Recent Searches:
            </span>


            {searchHistory.map(
              (symbol) => (

                <button

                  key={symbol}

                  type="button"

                  className="history-button"

                  onClick={() =>
                    handleHistoryClick(
                      symbol
                    )
                  }

                >

                  {symbol}

                </button>

              )
            )}


            {searchTerm && (

              <button

                type="button"

                className="clear-search-button"

                onClick={clearSearch}

              >

                Clear Search

              </button>

            )}

          </div>

        )}


        {searchLoading && (

          <p>
            Searching market data...
          </p>

        )}


        {searchError && (

          <p className="negative">
            {searchError}
          </p>

        )}


        {!searchTerm && loading ? (

          <p>
            Loading market data...
          </p>

        ) : (

          <div className="stock-grid">

            {stocks.map(
              (stock) => (

                <StockCard

                  key={stock.symbol}

                  stock={stock}

                />

              )
            )}

          </div>

        )}

      </section>

    </div>

  );

}


export default Dashboard;