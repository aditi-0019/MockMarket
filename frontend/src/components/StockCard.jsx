import { useNavigate } from "react-router-dom";
import { useState } from "react";

function StockCard({ stock }) {

  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isPositive = stock.change >= 0;

  const handleBuy = async () => {

    setLoading(true);
    setMessage("");

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/trade/buy?symbol=${stock.symbol}&quantity=1`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "BUY failed");
      }

      setMessage(
        `Bought 1 ${stock.symbol} for ₹${data.price}`
      );

    } catch (error) {

      setMessage(error.message);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="stock-card">

      <div className="stock-header">

        <div>

          <h3>{stock.symbol}</h3>

          <p>{stock.name}</p>

        </div>

        <span className="stock-icon">
          ↗
        </span>

      </div>

      <div className="stock-price">

        <h2>
          ₹{stock.price.toLocaleString("en-IN")}
        </h2>

        <span
          className={
            isPositive
              ? "positive"
              : "negative"
          }
        >
          {isPositive ? "+" : ""}
          {stock.change}%
        </span>

      </div>

      <div className="stock-actions">

        <button
          onClick={() =>
            navigate(`/stocks/${stock.symbol}`)
          }
        >
          View
        </button>

        <button
          className="buy-button"
          onClick={handleBuy}
          disabled={loading}
        >
          {loading ? "Buying..." : "Buy"}
        </button>

      </div>

      {message && (
        <p className="trade-message">
          {message}
        </p>
      )}

    </div>
  );
}

export default StockCard;