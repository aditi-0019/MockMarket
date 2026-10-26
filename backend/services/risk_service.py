import numpy as np
import pandas as pd
import yfinance as yf

from sqlalchemy.orm import Session

from db_models import Holding


def calculate_portfolio_risk(db: Session, user_id: int):

    # ---------------------------------------------------------
    # 1. Get user's holdings
    # ---------------------------------------------------------

    holdings = (
        db.query(Holding)
        .filter(Holding.user_id == user_id)
        .filter(Holding.quantity > 0)
        .all()
    )

    if not holdings:
        return {
            "risk_score": 0,
            "risk_level": "Low",
            "message": "No holdings in portfolio.",
            "volatility_score": 0,
            "concentration_score": 0,
            "drawdown_score": 0,
            "portfolio_volatility": 0,
            "concentration": 0,
            "max_drawdown": 0,
        }

    # ---------------------------------------------------------
    # 2. Download historical data
    # ---------------------------------------------------------

    portfolio_data = {}
    stock_values = {}

    for holding in holdings:

        symbol = holding.symbol.upper()

        # Indian stocks on Yahoo Finance
        ticker = f"{symbol}.NS"

        try:
            data = yf.download(
                ticker,
                period="1y",
                interval="1d",
                auto_adjust=True,
                progress=False,
            )

            if data.empty:
                continue

            # Handle MultiIndex returned by newer yfinance versions
            if isinstance(data.columns, pd.MultiIndex):
                close = data["Close"].iloc[:, 0]
            else:
                close = data["Close"]

            close = pd.to_numeric(
                close,
                errors="coerce"
            ).dropna()

            if len(close) < 30:
                continue

            # -------------------------------------------------
            # Current holding value
            # -------------------------------------------------

            current_price = float(close.iloc[-1])

            current_value = (
                current_price * holding.quantity
            )

            stock_values[symbol] = current_value

            # -------------------------------------------------
            # Daily returns
            # -------------------------------------------------

            returns = close.pct_change().dropna()

            portfolio_data[symbol] = returns

        except Exception as error:

            print(
                f"Risk calculation failed for {symbol}: {error}"
            )

    # ---------------------------------------------------------
    # No valid market data
    # ---------------------------------------------------------

    if not portfolio_data:

        return {
            "risk_score": 0,
            "risk_level": "Unknown",
            "message": "Unable to calculate portfolio risk.",
            "volatility_score": 0,
            "concentration_score": 0,
            "drawdown_score": 0,
            "portfolio_volatility": 0,
            "concentration": 0,
            "max_drawdown": 0,
        }

    # ---------------------------------------------------------
    # 3. Calculate portfolio weights
    # ---------------------------------------------------------

    total_value = sum(stock_values.values())

    if total_value <= 0:
        return {
            "risk_score": 0,
            "risk_level": "Unknown",
            "message": "Portfolio value is zero.",
            "volatility_score": 0,
            "concentration_score": 0,
            "drawdown_score": 0,
            "portfolio_volatility": 0,
            "concentration": 0,
            "max_drawdown": 0,
        }

    weights = {
        symbol: value / total_value
        for symbol, value in stock_values.items()
    }

    # ---------------------------------------------------------
    # 4. PORTFOLIO VOLATILITY
    # ---------------------------------------------------------

    individual_volatility = {}

    for symbol, returns in portfolio_data.items():

        annualized_volatility = (
            returns.std() * np.sqrt(252)
        )

        individual_volatility[symbol] = (
            annualized_volatility
        )

    portfolio_volatility = sum(
        weights[symbol] * individual_volatility[symbol]
        for symbol in individual_volatility
        if symbol in weights
    )

    # Convert volatility to 0-100 score
    #
    # 0% volatility  -> 0
    # 60% volatility  -> 100
    #

    volatility_score = min(
        portfolio_volatility / 0.60 * 100,
        100
    )

    # ---------------------------------------------------------
    # 5. CONCENTRATION RISK
    # ---------------------------------------------------------

    concentration = sum(
        weight ** 2
        for weight in weights.values()
    )

    # HHI:
    #
    # 1 stock 100% -> 1.0
    # 2 equal      -> 0.5
    # 5 equal      -> 0.2
    # 10 equal     -> 0.1
    #
    # Convert to 0-100

    concentration_score = min(
        concentration * 100,
        100
    )

    # ---------------------------------------------------------
    # 6. PORTFOLIO MAX DRAWDOWN
    # ---------------------------------------------------------

    returns_df = pd.DataFrame(portfolio_data)

    # Align weights with available stocks
    valid_weights = {
        symbol: weights[symbol]
        for symbol in returns_df.columns
        if symbol in weights
    }

    # Normalize weights
    weight_total = sum(valid_weights.values())

    if weight_total > 0:

        valid_weights = {
            symbol: weight / weight_total
            for symbol, weight in valid_weights.items()
        }

    # Calculate daily portfolio returns
    portfolio_returns = returns_df.fillna(0).copy()

    for symbol in portfolio_returns.columns:

        portfolio_returns[symbol] *= valid_weights.get(
            symbol,
            0
        )

    daily_portfolio_returns = (
        portfolio_returns.sum(axis=1)
    )

    # Build portfolio equity curve
    portfolio_curve = (
        1 + daily_portfolio_returns
    ).cumprod()

    # Running peak
    running_peak = portfolio_curve.cummax()

    # Drawdown
    drawdown = (
        portfolio_curve - running_peak
    ) / running_peak

    max_drawdown = abs(
        float(drawdown.min())
    )

    # Convert drawdown to 0-100
    #
    # 0% drawdown  -> 0
    # 50% drawdown -> 100

    drawdown_score = min(
        max_drawdown / 0.50 * 100,
        100
    )

    # ---------------------------------------------------------
    # 7. FINAL RISK SCORE
    # ---------------------------------------------------------

    risk_score = (
        0.50 * volatility_score
        + 0.30 * concentration_score
        + 0.20 * drawdown_score
    )

    risk_score = round(
        min(max(risk_score, 0), 100),
        2
    )

    # ---------------------------------------------------------
    # 8. Risk classification
    # ---------------------------------------------------------

    if risk_score <= 30:

        risk_level = "Low"

    elif risk_score <= 60:

        risk_level = "Moderate"

    elif risk_score <= 80:

        risk_level = "High"

    else:

        risk_level = "Very High"

    # ---------------------------------------------------------
    # 9. User-friendly message
    # ---------------------------------------------------------

    if risk_level == "Low":

        message = (
            "Your portfolio currently has relatively low risk."
        )

    elif risk_level == "Moderate":

        message = (
            "Your portfolio has moderate risk. "
            "Diversification could help reduce risk."
        )

    elif risk_level == "High":

        message = (
            "Your portfolio has high risk. "
            "Consider reducing concentration and volatility."
        )

    else:

        message = (
            "Your portfolio has very high risk. "
            "Consider improving diversification."
        )

    # ---------------------------------------------------------
    # 10. Return result
    # ---------------------------------------------------------

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "message": message,

        "volatility_score": round(
            volatility_score,
            2
        ),

        "concentration_score": round(
            concentration_score,
            2
        ),

        "drawdown_score": round(
            drawdown_score,
            2
        ),

        "portfolio_volatility": round(
            portfolio_volatility * 100,
            2
        ),

        "concentration": round(
            concentration * 100,
            2
        ),

        "max_drawdown": round(
            max_drawdown * 100,
            2
        ),

        "holdings_count": len(
            portfolio_data
        ),
    }