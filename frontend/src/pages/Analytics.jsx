import { useEffect, useState } from "react";
import { getPortfolio } from "../services/api";

function Analytics() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getPortfolio();
        setPortfolio(data);
      } catch (error) {
        console.error("Analytics error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="page-container">
        <p>Unable to load analytics.</p>
      </div>
    );
  }

  const totalReturn =
    portfolio.total_profit_loss_percent || 0;

  const totalPnL =
    portfolio.total_profit_loss || 0;

  const invested =
    portfolio.total_invested || 0;

  const currentValue =
    portfolio.current_portfolio_value || 0;

  return (
    <div className="page-container">

      {/* HEADER */}

      <div className="page-header">

        <p className="eyebrow">
          PERFORMANCE & RISK
        </p>

        <h1>Analytics</h1>

        <p>
          Analyze portfolio performance,
          allocation, and risk.
        </p>

      </div>


      {/* KEY METRICS */}

      <div className="analytics-grid">

        <div className="analytics-card">

          <p>Total Return</p>

          <h2
            className={
              totalReturn >= 0
                ? "positive"
                : "negative"
            }
          >
            {totalReturn.toFixed(2)}%
          </h2>

          <span>
            Portfolio return
          </span>

        </div>


        <div className="analytics-card">

          <p>Total P&L</p>

          <h2
            className={
              totalPnL >= 0
                ? "positive"
                : "negative"
            }
          >
            ₹{totalPnL.toLocaleString("en-IN")}
          </h2>

          <span>
            Profit / Loss
          </span>

        </div>


        <div className="analytics-card">

          <p>Invested Amount</p>

          <h2>
            ₹{invested.toLocaleString("en-IN")}
          </h2>

          <span>
            Capital invested
          </span>

        </div>


        <div className="analytics-card">

          <p>Current Value</p>

          <h2>
            ₹{currentValue.toLocaleString("en-IN")}
          </h2>

          <span>
            Current market value
          </span>

        </div>

      </div>


      {/* RISK */}

      <section className="stock-section">

        <div className="section-heading">

          <div>

            <p className="eyebrow">
              RISK OVERVIEW
            </p>

            <h2>
              Portfolio Risk
            </h2>

            <p>
              Risk metrics will be calculated
              from historical portfolio data.
            </p>

          </div>

        </div>


        <div className="analytics-grid">

          <div className="analytics-card">

            <p>Volatility</p>

            <h2>—</h2>

            <span>
              Requires portfolio history
            </span>

          </div>


          <div className="analytics-card">

            <p>Max Drawdown</p>

            <h2>—</h2>

            <span>
              Requires portfolio history
            </span>

          </div>


          <div className="analytics-card">

            <p>Sharpe Ratio</p>

            <h2>—</h2>

            <span>
              Requires portfolio history
            </span>

          </div>

        </div>

      </section>


      {/* HOLDINGS ANALYSIS */}

      <section className="stock-section">

        <div className="section-heading">

          <div>

            <p className="eyebrow">
              HOLDINGS ANALYSIS
            </p>

            <h2>
              Portfolio Holdings
            </h2>

            <p>
              Performance of your current
              investments.
            </p>

          </div>

        </div>


        {portfolio.holdings.length === 0 ? (

          <div className="empty-state">

            <h2>
              No Holdings
            </h2>

            <p>
              Buy stocks to start generating
              portfolio analytics.
            </p>

          </div>

        ) : (

          <div className="stock-grid">

            {portfolio.holdings.map((holding) => {

              const pnl =
                holding.profit_loss || 0;

              const pnlPercent =
                holding.profit_loss_percent || 0;

              return (

                <div
                  className="stock-card"
                  key={holding.symbol}
                >

                  <div className="stock-header">

                    <div>

                      <h3>
                        {holding.symbol}
                      </h3>

                      <p>
                        {holding.quantity} share
                        {holding.quantity > 1
                          ? "s"
                          : ""}
                      </p>

                    </div>

                  </div>


                  <div className="stock-price">

                    <div>

                      <p>
                        Current Value
                      </p>

                      <h2>
                        ₹
                        {holding.current_value.toLocaleString(
                          "en-IN"
                        )}
                      </h2>

                    </div>

                  </div>


                  <div className="holding-details">

                    <p>
                      Invested:
                      <strong>
                        {" "}
                        ₹
                        {holding.invested_value.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </p>


                    <p>
                      Current Price:
                      <strong>
                        {" "}
                        ₹
                        {holding.current_price.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </p>


                    <p
                      className={
                        pnl >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      P&L:
                      <strong>
                        {" "}
                        ₹
                        {pnl.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      {" "}
                      ({pnlPercent.toFixed(2)}%)
                    </p>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </section>

    </div>
  );
}

export default Analytics;

