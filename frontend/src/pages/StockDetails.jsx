import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PriceChart from "../components/PriceChart";
import BuySellModal from "../components/BuySellModal";

import {
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "../services/watchlistService";

import {
  getMarketData,
  getPrediction,
  getNews,
} from "../services/api";


function StockDetails() {

  const { symbol } = useParams();

  // ==============================
  // STATES
  // ==============================

  const [market, setMarket] = useState(null);

  const [prediction, setPrediction] = useState(null);

  const [news, setNews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [chartPeriod, setChartPeriod] = useState("1mo");

  const [watchlisted, setWatchlisted] = useState(
    isInWatchlist(symbol)
  );

  // BUY / SELL modal
  const [tradeMode, setTradeMode] = useState(null);


  // ==============================
  // LOAD STOCK DATA
  // ==============================

  useEffect(() => {

    async function loadStockData() {

      try {

        setLoading(true);
        setMessage("");

        const [
          marketData,
          predictionData,
          newsData,
        ] = await Promise.all([

          getMarketData(symbol),

          getPrediction(symbol),

          getNews(symbol),

        ]);

        setMarket(marketData);

        setPrediction(predictionData);

        setNews(newsData.news || []);

      } catch (error) {

        console.error(
          "Stock data error:",
          error
        );

        setMessage(
          "Unable to load stock data."
        );

      } finally {

        setLoading(false);

      }

    }


    if (symbol) {
      loadStockData();
    }

  }, [symbol]);


  // ==============================
  // LOADING
  // ==============================

  if (loading) {

    return (
      <div className="page-container">
        <p>Loading stock data...</p>
      </div>
    );

  }


  // ==============================
  // ERROR
  // ==============================

  if (!market) {

    return (
      <div className="page-container">

        <h1>
          Stock Not Found
        </h1>

        <p>
          Unable to fetch data for {symbol}.
        </p>

      </div>
    );

  }


  // ==============================
  // VALUES
  // ==============================

  const isPositive =
    market.change_percent >= 0;

  const predictionPositive =
    prediction?.prediction === "UP";


  // ==============================
  // WATCHLIST
  // ==============================

  function handleWatchlist() {

    const stockData = {

      symbol: market.symbol,

      name: market.symbol,

      price: market.current_price,

      change: market.change_percent,

    };


    if (watchlisted) {

      removeFromWatchlist(
        market.symbol
      );

      setWatchlisted(false);

    } else {

      addToWatchlist(
        stockData
      );

      setWatchlisted(true);

    }

  }


  // ==============================
  // UI
  // ==============================

  return (

    <div className="stock-details-page">


      {/* ================================= */}
      {/* STOCK HEADER */}
      {/* ================================= */}

      <div className="stock-details-header">

        <div>

          <p className="eyebrow">
            STOCK DETAILS
          </p>

          <h1>
            {market.symbol}
          </h1>

          <p className="stock-full-name">
            {market.symbol}
          </p>

        </div>


        <div className="stock-current-price">

          <h2>
            ₹
            {market.current_price.toLocaleString(
              "en-IN"
            )}
          </h2>

          <span
            className={
              isPositive
                ? "positive"
                : "negative"
            }
          >

            {isPositive ? "+" : ""}

            {market.change_percent}%

          </span>

        </div>

      </div>


      {/* ================================= */}
      {/* PRICE HISTORY */}
      {/* ================================= */}

      <div className="chart-card">

        <div className="chart-header">

          <div>

            <h2>
              Price History
            </h2>

            <p>
              Historical market price movement
            </p>

          </div>


          <div className="chart-periods">

            <button
              className={
                chartPeriod === "5d"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setChartPeriod("5d")
              }
            >
              1W
            </button>


            <button
              className={
                chartPeriod === "1mo"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setChartPeriod("1mo")
              }
            >
              1M
            </button>


            <button
              className={
                chartPeriod === "3mo"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setChartPeriod("3mo")
              }
            >
              3M
            </button>


            <button
              className={
                chartPeriod === "6mo"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setChartPeriod("6mo")
              }
            >
              6M
            </button>


            <button
              className={
                chartPeriod === "1y"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setChartPeriod("1y")
              }
            >
              1Y
            </button>


            <button
              className={
                chartPeriod === "2y"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setChartPeriod("2y")
              }
            >
              2Y
            </button>

          </div>

        </div>


        <PriceChart
          symbol={symbol}
          period={chartPeriod}
        />

      </div>


      {/* ================================= */}
      {/* MARKET INFORMATION */}
      {/* ================================= */}

      <div className="stock-info-grid">

        <div className="info-card">

          <p>Open</p>

          <h3>
            ₹
            {market.open.toLocaleString(
              "en-IN"
            )}
          </h3>

        </div>


        <div className="info-card">

          <p>Day High</p>

          <h3>
            ₹
            {market.high.toLocaleString(
              "en-IN"
            )}
          </h3>

        </div>


        <div className="info-card">

          <p>Day Low</p>

          <h3>
            ₹
            {market.low.toLocaleString(
              "en-IN"
            )}
          </h3>

        </div>


        <div className="info-card">

          <p>Volume</p>

          <h3>
            {market.volume.toLocaleString(
              "en-IN"
            )}
          </h3>

        </div>

      </div>


      {/* ================================= */}
      {/* ML PREDICTION */}
      {/* ================================= */}

      {prediction && (

        <section className="chart-card">

          <div className="chart-header">

            <div>

              <p className="eyebrow">
                AI / ML ANALYSIS
              </p>

              <h2>
                Next-Day Market Prediction
              </h2>

              <p>
                Random Forest prediction based
                on historical price, volume and
                technical features.
              </p>

            </div>

          </div>


          <div className="stock-info-grid">

            <div className="info-card">

              <p>
                Prediction
              </p>

              <h3
                className={
                  predictionPositive
                    ? "positive"
                    : "negative"
                }
              >
                {predictionPositive
                  ? "↑ UP"
                  : "↓ DOWN"}
              </h3>

            </div>


            <div className="info-card">

              <p>
                UP Probability
              </p>

              <h3 className="positive">
                {prediction.up_probability}%
              </h3>

            </div>


            <div className="info-card">

              <p>
                DOWN Probability
              </p>

              <h3 className="negative">
                {prediction.down_probability}%
              </h3>

            </div>

          </div>


          <div style={{ marginTop: "20px" }}>

            <p>
              <strong>Model:</strong>{" "}
              Random Forest
            </p>

            <p>
              <strong>
                Prediction Target:
              </strong>{" "}
              Next-day price direction
            </p>

            <p>
              <strong>Input:</strong>{" "}
              Historical price, volume and
              technical indicators
            </p>

          </div>


          <p style={{ marginTop: "20px" }}>

            ⚠ Prediction represents a
            probability learned from historical
            market patterns. It does not
            guarantee future price movement
            and is not financial advice.

          </p>

        </section>

      )}


      {/* ================================= */}
      {/* NEWS & SENTIMENT */}
      {/* ================================= */}

      <section className="stock-section">

        <div className="section-heading">

          <div>

            <p className="eyebrow">
              MARKET NEWS
            </p>

            <h2>
              Latest News & Sentiment
            </h2>

            <p>
              Recent market news analyzed
              using sentiment analysis.
            </p>

          </div>

        </div>


        {news.length === 0 ? (

          <div className="empty-state">

            <h2>
              No News Available
            </h2>

            <p>
              No recent news was found
              for this stock.
            </p>

          </div>

        ) : (

          <div className="stock-grid">

            {news
              .slice(0, 6)
              .map((item, index) => (

                <div
                  className="stock-card"
                  key={index}
                >

                  <h3>
                    {item.title}
                  </h3>

                  <p
                    className={
                      item.sentiment ===
                      "Positive"
                        ? "positive"
                        : item.sentiment ===
                          "Negative"
                        ? "negative"
                        : ""
                    }
                  >

                    {item.sentiment}{" "}
                    ({item.sentiment_score})

                  </p>

                </div>

              ))}

          </div>

        )}

      </section>


      {/* ================================= */}
      {/* ACTION BUTTONS */}
      {/* ================================= */}

      <div className="stock-action-section">


        <button
          className="watchlist-button"
          onClick={handleWatchlist}
        >

          {watchlisted
            ? "★ Remove from Watchlist"
            : "☆ Add to Watchlist"}

        </button>


        <button
          className="buy-button large"
          onClick={() =>
            setTradeMode("BUY")
          }
        >
          Buy {market.symbol}
        </button>


        
         <button
          className="buy-button large"
           onClick={() => setTradeMode("SELL")}
          >
       Sell {market.symbol}
      </button> 
      </div>


      {/* ================================= */}
      {/* TRADE MESSAGE */}
      {/* ================================= */}

      {message && (

        <p className="trade-message">
          {message}
        </p>

      )}


      {/* ================================= */}
      {/* BUY / SELL MODAL */}
      {/* ================================= */}

      {tradeMode && (

        <BuySellModal

          symbol={market.symbol}

          price={market.current_price}

          mode={tradeMode}

          onClose={() =>
            setTradeMode(null)
          }

          onSuccess={() => {

            setTradeMode(null);

            setMessage(
              `${tradeMode} order completed successfully.`
            );

          }}

        />

      )}


    </div>

  );

}


export default StockDetails;