import { useEffect, useState } from "react";
import { getPortfolio } from "../services/api";
import TransactionTable from "../components/TransactionTable";

function Portfolio() {
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
    return (
      <div className="page-container">
        <p>{error}</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="page-container">
        <p>Loading portfolio...</p>
      </div>
    );
  }

  const pnlClass =
    portfolio.total_profit_loss >= 0
      ? "positive"
      : "negative";

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <p className="eyebrow">
          YOUR INVESTMENTS
        </p>

        <h1>Portfolio</h1>

        <p>
          Track your virtual holdings and investment performance.
        </p>
      </div>


      {/* Portfolio Summary */}
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


      {/* Holdings */}
      <section className="stock-section">

        <div className="section-heading">
          <div>
            <h2>Your Holdings</h2>

            <p>
              Stocks currently held in your virtual portfolio.
            </p>
          </div>
        </div>


        {portfolio.holdings.length === 0 ? (

          <div className="empty-state">

            <h2>No Holdings Yet</h2>

            <p>
              Buy your first stock to start building your portfolio.
            </p>

          </div>

        ) : (

          <div className="stock-grid">

            {portfolio.holdings.map((holding) => {

              const holdingPnlClass =
                holding.profit_loss >= 0
                  ? "positive"
                  : "negative";

              return (

                <div
                  className="stock-card"
                  key={holding.symbol}
                >

                  <div className="stock-header">

                    <div>
                      <h3>{holding.symbol}</h3>

                      <p>
                        {holding.quantity} share
                        {holding.quantity > 1 ? "s" : ""}
                      </p>
                    </div>

                  </div>


                  <div className="stock-price">

                    <div>
                      <p>Current Price</p>

                      <h2>
                        ₹{holding.current_price.toLocaleString("en-IN")}
                      </h2>
                    </div>

                  </div>


                  <div className="holding-details">

                    <p>
                      Average Price:
                      <strong>
                        {" "}
                        ₹{holding.average_price.toLocaleString("en-IN")}
                      </strong>
                    </p>


                    <p>
                      Invested:
                      <strong>
                        {" "}
                        ₹{holding.invested_value.toLocaleString("en-IN")}
                      </strong>
                    </p>


                    <p>
                      Current Value:
                      <strong>
                        {" "}
                        ₹{holding.current_value.toLocaleString("en-IN")}
                      </strong>
                    </p>


                    <p className={holdingPnlClass}>
                      P&L:
                      <strong>
                        {" "}
                        ₹{holding.profit_loss.toLocaleString("en-IN")}
                      </strong>

                      {" "}
                      (
                      {holding.profit_loss_percent.toFixed(2)}
                      %)
                    </p>

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </section>


      {/* Transaction History */}
      <section className="stock-section">

        <div className="section-heading">

          <div>

            <h2>Transaction History</h2>

            <p>
              Your recent virtual BUY and SELL transactions.
            </p>

          </div>

        </div>

        <TransactionTable />

      </section>

    </div>
  );
}

export default Portfolio;