import yfinance as yf
import math


def get_market_data(symbol):

    ticker_symbol = symbol.upper()

    if not ticker_symbol.endswith(".NS"):
        ticker_symbol += ".NS"

    df = yf.download(
        ticker_symbol,
        period="5d",
        interval="1d",
        auto_adjust=False,
        progress=False
    )

    if df.empty:
        raise ValueError(f"No market data found for {symbol}")

    # Handle yfinance MultiIndex
    if hasattr(df.columns, "levels"):
        df.columns = df.columns.get_level_values(0)

    df.columns = [str(col).lower() for col in df.columns]

    # Remove invalid rows
    df = df.dropna(
        subset=["open", "high", "low", "close", "volume"]
    )

    if df.empty:
        raise ValueError(f"No valid market data found for {symbol}")

    latest = df.iloc[-1]

    current_price = float(latest["close"])

    # Prevent NaN / Infinity from entering trading/database
    if not math.isfinite(current_price) or current_price <= 0:
        raise ValueError(f"Invalid market price for {symbol}")

    if len(df) >= 2:
        previous_close = float(df.iloc[-2]["close"])
    else:
        previous_close = current_price

    if not math.isfinite(previous_close) or previous_close <= 0:
        previous_close = current_price

    change = current_price - previous_close

    change_percent = (
        (change / previous_close) * 100
        if previous_close != 0
        else 0
    )

    return {
        "symbol": symbol.upper(),
        "current_price": round(current_price, 2),
        "previous_close": round(previous_close, 2),
        "change": round(change, 2),
        "change_percent": round(change_percent, 2),
        "open": round(float(latest["open"]), 2),
        "high": round(float(latest["high"]), 2),
        "low": round(float(latest["low"]), 2),
        "volume": int(latest["volume"])
    }

def get_price_history(symbol, period="1mo"):
    ticker_symbol = symbol.upper()

    if not ticker_symbol.endswith(".NS"):
        ticker_symbol += ".NS"

    df = yf.download(
        ticker_symbol,
        period=period,
        interval="1d",
        auto_adjust=False,
        progress=False
    )

    if df.empty:
        raise ValueError(f"No price history found for {symbol}")

    if hasattr(df.columns, "levels"):
        df.columns = df.columns.get_level_values(0)

    df.columns = [str(col).lower() for col in df.columns]

    df = df.dropna(subset=["close"])

    history = []

    for _, row in df.iterrows():
        history.append({
            "date": row.name.strftime("%b %d"),
            "price": round(float(row["close"]), 2)
        })

    return {
        "symbol": symbol.upper(),
        "period": period,
        "history": history
    }