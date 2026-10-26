import { useState } from "react";
import { buyStock, sellStock } from "../services/api";

function BuySellModal({
  symbol,
  price,
  mode = "BUY",
  onClose,
  onSuccess,
}) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const totalValue = price * quantity;

  async function handleTrade() {
    if (!quantity || quantity <= 0) {
      setMessage("Enter a valid quantity.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      let data;

      if (mode === "BUY") {
        data = await buyStock(symbol, quantity);
      } else {
        data = await sellStock(symbol, quantity);
      }

      setMessage(
        `${mode} successful: ${quantity} ${symbol} @ ₹${data.price}`
      );

      if (onSuccess) {
        onSuccess(data);
      }

      // Refresh Navbar balance
      window.dispatchEvent(
        new Event("mockmarket-balance-update")
      );

    } catch (error) {
      setMessage(error.message);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">

      <div className="trade-modal">

        <div className="modal-header">

          <div>
            <p className="eyebrow">
              VIRTUAL TRADING
            </p>

            <h2>
              {mode} {symbol}
            </h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        <div className="trade-info">

          <div>
            <p>Current Price</p>

            <h3>
              ₹{price.toLocaleString("en-IN")}
            </h3>
          </div>


          <div>
            <p>Quantity</p>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
            />
          </div>

        </div>


        <div className="trade-total">

          <span>Total Value</span>

          <strong>
            ₹{totalValue.toLocaleString("en-IN")}
          </strong>

        </div>


        {message && (
          <p className="trade-message">
            {message}
          </p>
        )}


        <div className="modal-actions">

          <button onClick={onClose}>
            Cancel
          </button>

          <button
            className={
              mode === "BUY"
                ? "buy-button"
                : "sell-button"
            }
            onClick={handleTrade}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : `${mode} ${symbol}`}
          </button>

        </div>

      </div>

    </div>
  );
}

export default BuySellModal;