import { useEffect, useState } from "react";
import { getTrades } from "../services/api";

function TransactionTable() {
  const [trades, setTrades] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrades() {
      try {
        setLoading(true);
        setError("");

        const data = await getTrades();

        setTrades(data);
      } catch (err) {
        console.error("Transaction history error:", err);
        setError("Unable to load transaction history");
      } finally {
        setLoading(false);
      }
    }

    loadTrades();
  }, []);

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="transaction-table">

      {trades.length === 0 ? (
        <div className="empty-state">
          <h2>No Transactions Yet</h2>
          <p>
            Your BUY and SELL transactions will appear here.
          </p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Stock</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Value</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id}>

                <td>{trade.symbol}</td>

                <td>
                  <span
                    className={
                      trade.trade_type === "BUY"
                        ? "positive"
                        : "negative"
                    }
                  >
                    {trade.trade_type}
                  </span>
                </td>

                <td>{trade.quantity}</td>

                <td>
                  ₹{trade.price.toLocaleString("en-IN")}
                </td>

                <td>
                  ₹{trade.total_value.toLocaleString("en-IN")}
                </td>

                <td>
                  {new Date(
                    trade.timestamp
                  ).toLocaleString("en-IN")}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}

export default TransactionTable;