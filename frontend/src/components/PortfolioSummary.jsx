import { useEffect, useState } from "react";
import { getPortfolio } from "../services/api";

function PortfolioSummary() {
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await getPortfolio();
        setPortfolio(data);
      } catch (err) {
        setError("Unable to load portfolio data");
      }
    }

    loadPortfolio();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!portfolio) {
    return <p>Loading portfolio...</p>;
  }

  const pnlClass =
    portfolio.total_profit_loss >= 0
      ? "positive"
      : "negative";

  return (
    <section className="summary-grid">

      <div className="summary-card">
        <p>Available Cash</p>
        <h2>
          ₹{portfolio.cash_balance.toLocaleString("en-IN")}
        </h2>
        <span className="positive">
          Virtual Balance
        </span>
      </div>

      <div className="summary-card">
        <p>Invested Amount</p>
        <h2>
          ₹{portfolio.total_invested.toLocaleString("en-IN")}
        </h2>
        <span>
          Current Investments
        </span>
      </div>

      <div className="summary-card">
        <p>Portfolio Value</p>
        <h2>
          ₹{portfolio.current_portfolio_value.toLocaleString("en-IN")}
        </h2>
        <span>
          Current Market Value
        </span>
      </div>

      <div className="summary-card">
        <p>Total P&L</p>
        <h2 className={pnlClass}>
          ₹{portfolio.total_profit_loss.toLocaleString("en-IN")}
        </h2>
        <span className={pnlClass}>
          {portfolio.total_profit_loss_percent.toFixed(2)}%
        </span>
      </div>

    </section>
  );
}

export default PortfolioSummary;