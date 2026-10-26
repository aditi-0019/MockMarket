import { useEffect, useState } from "react";
import { getPortfolio } from "../services/api";

function Assistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load saved chat history for current user
  useEffect(() => {
    const savedUser = localStorage.getItem("mockmarket_user");

    let username = "guest";

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        username = user.username || "guest";
      } catch (error) {
        console.error("Invalid user data");
      }
    }

    const savedMessages = localStorage.getItem(
      `mockmarket_chat_${username}`
    );

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Invalid chat history");
      }
    }
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    const savedUser = localStorage.getItem("mockmarket_user");

    let username = "guest";

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        username = user.username || "guest";
      } catch (error) {
        console.error("Invalid user data");
      }
    }

    localStorage.setItem(
      `mockmarket_chat_${username}`,
      JSON.stringify(messages)
    );
  }, [messages]);

  async function handleAsk(e) {
    e.preventDefault();

    const currentQuestion = question.trim();

    if (!currentQuestion) return;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: currentQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const portfolio = await getPortfolio();
      const q = currentQuestion.toLowerCase();

      let response = "";

      if (
        q.includes("balance") ||
        q.includes("cash") ||
        q.includes("money")
      ) {
        response = `Your available virtual cash balance is ₹${portfolio.cash_balance.toLocaleString(
          "en-IN"
        )}.`;
      } else if (
        q.includes("holding") ||
        q.includes("holdings") ||
        q.includes("shares")
      ) {
        if (portfolio.holdings.length === 0) {
          response =
            "You currently have no stock holdings. Buy a stock to start building your portfolio.";
        } else {
          const holdings = portfolio.holdings
            .map(
              (h) =>
                `${h.symbol}: ${h.quantity} share(s), current value ₹${h.current_value.toLocaleString(
                  "en-IN"
                )}`
            )
            .join(" | ");

          response = `Your current holdings are: ${holdings}`;
        }
      } else if (
        q.includes("profit") ||
        q.includes("loss") ||
        q.includes("p&l") ||
        q.includes("pnl")
      ) {
        const pnl = portfolio.total_profit_loss;

        response =
          pnl >= 0
            ? `Your portfolio is currently in profit. Total P&L is ₹${pnl.toLocaleString(
                "en-IN"
              )} (${portfolio.total_profit_loss_percent.toFixed(2)}%).`
            : `Your portfolio is currently in loss. Total P&L is ₹${pnl.toLocaleString(
                "en-IN"
              )} (${portfolio.total_profit_loss_percent.toFixed(2)}%).`;
      } else if (
        q.includes("invested") ||
        q.includes("investment") ||
        q.includes("invest")
      ) {
        response = `Your total invested amount is ₹${portfolio.total_invested.toLocaleString(
          "en-IN"
        )}.`;
      } else if (
        q.includes("portfolio value") ||
        q.includes("current value") ||
        q.includes("portfolio worth")
      ) {
        response = `Your current portfolio value is ₹${portfolio.current_portfolio_value.toLocaleString(
          "en-IN"
        )}.`;
      } else if (
        q.includes("portfolio") ||
        q.includes("overview") ||
        q.includes("summary")
      ) {
        response = `Your portfolio is currently worth ₹${portfolio.current_portfolio_value.toLocaleString(
          "en-IN"
        )}. You have ₹${portfolio.cash_balance.toLocaleString(
          "en-IN"
        )} available cash and ₹${portfolio.total_invested.toLocaleString(
          "en-IN"
        )} invested. Your current P&L is ₹${portfolio.total_profit_loss.toLocaleString(
          "en-IN"
        )}.`;
      } else if (q.includes("risk") || q.includes("risky")) {
        response =
          "Portfolio risk depends on diversification, volatility and concentration. MockMarket currently provides holdings and P&L information, while advanced risk metrics can be added using historical portfolio values.";
      } else if (
        q.includes("trade") ||
        q.includes("buy") ||
        q.includes("sell")
      ) {
        response =
          "You can open a stock's details page and use the BUY or SELL buttons to place a virtual trade. No real money is involved.";
      } else if (
        q.includes("hello") ||
        q.includes("hi") ||
        q.includes("hey")
      ) {
        response =
          "Hello! 👋 I can help you understand your balance, holdings, investments, portfolio value, P&L, risk and virtual trading.";
      } else {
        response =
          "I can help with your balance, holdings, invested amount, portfolio value, P&L, risk and virtual trading.";
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: response,
        },
      ]);
    } catch (error) {
      console.error("Assistant error:", error);

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text:
            "Unable to fetch portfolio information. Please make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <p className="eyebrow">AI POWERED</p>

        <h1>AI Portfolio Assistant</h1>

        <p>
          Get insights about your simulated portfolio and market data.
        </p>
      </div>

      <div className="assistant-card">

        <div className="assistant-message">
          <h3>👋 Hello!</h3>

          <p>
            I'm your MockMarket portfolio assistant.
            Ask me about your portfolio, holdings, risk,
            or market trends.
          </p>
        </div>

        {messages.map((message, index) => (
          <div
            key={index}
            className="assistant-message"
          >
            <h3>
              {message.type === "user"
                ? "👤 You"
                : "🤖 Assistant"}
            </h3>

            <p>{message.text}</p>
          </div>
        ))}

        {loading && (
          <div className="assistant-message">
            <h3>🤖 Assistant</h3>
            <p>Thinking...</p>
          </div>
        )}

        <form
          className="assistant-input"
          onSubmit={handleAsk}
        >
          <input
            type="text"
            placeholder="Ask something about your portfolio..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>

        <div className="assistant-suggestions">

          <button
            type="button"
            onClick={() =>
              setQuestion("What is my balance?")
            }
          >
            💰 My Balance
          </button>

          <button
            type="button"
            onClick={() =>
              setQuestion("What are my holdings?")
            }
          >
            📊 My Holdings
          </button>

          <button
            type="button"
            onClick={() =>
              setQuestion("What is my P&L?")
            }
          >
            📈 My P&L
          </button>

          <button
            type="button"
            onClick={() =>
              setQuestion("What is my portfolio value?")
            }
          >
            💼 Portfolio Value
          </button>

        </div>

      </div>

    </div>
  );
}

export default Assistant;

//Adding something to my code 