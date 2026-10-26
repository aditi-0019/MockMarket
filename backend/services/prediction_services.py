import joblib
import pandas as pd
import numpy as np
import yfinance as yf


MODEL_PATH = "models/mockmarket_global_rf_model.pkl"

model_data = joblib.load(MODEL_PATH)

model = model_data["model"]
feature_cols = model_data["features"]


def create_features(df):

    df = df.copy()

    df.columns = [col.lower().strip() for col in df.columns]

    # Returns
    df["return_1d"] = df["close"].pct_change(1)
    df["return_3d"] = df["close"].pct_change(3)
    df["return_5d"] = df["close"].pct_change(5)
    df["return_10d"] = df["close"].pct_change(10)
    df["return_20d"] = df["close"].pct_change(20)

    # Moving averages
    df["sma_10"] = df["close"].rolling(10).mean()
    df["sma_20"] = df["close"].rolling(20).mean()
    df["sma_50"] = df["close"].rolling(50).mean()

    df["ema_10"] = df["close"].ewm(span=10, adjust=False).mean()
    df["ema_20"] = df["close"].ewm(span=20, adjust=False).mean()
    df["ema_50"] = df["close"].ewm(span=50, adjust=False).mean()

    # Price ratios
    df["close_sma20_ratio"] = df["close"] / df["sma_20"]
    df["close_sma50_ratio"] = df["close"] / df["sma_50"]
    df["sma20_sma50_ratio"] = df["sma_20"] / df["sma_50"]

    # RSI
    delta = df["close"].diff()

    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(14).mean()
    avg_loss = loss.rolling(14).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)

    df["rsi_14"] = 100 - (100 / (1 + rs))

    # MACD
    ema12 = df["close"].ewm(span=12, adjust=False).mean()
    ema26 = df["close"].ewm(span=26, adjust=False).mean()

    df["macd"] = ema12 - ema26

    df["macd_signal"] = (
        df["macd"]
        .ewm(span=9, adjust=False)
        .mean()
    )

    df["macd_hist"] = (
        df["macd"] - df["macd_signal"]
    )

    # Volatility
    df["volatility_10"] = (
        df["return_1d"].rolling(10).std()
    )

    df["volatility_20"] = (
        df["return_1d"].rolling(20).std()
    )

    # ATR
    high_low = df["high"] - df["low"]
    high_close = abs(
        df["high"] - df["close"].shift()
    )
    low_close = abs(
        df["low"] - df["close"].shift()
    )

    true_range = pd.concat(
        [high_low, high_close, low_close],
        axis=1
    ).max(axis=1)

    df["atr_14"] = true_range.rolling(14).mean()

    # Bollinger Bands
    rolling_mean = df["close"].rolling(20).mean()
    rolling_std = df["close"].rolling(20).std()

    upper_band = rolling_mean + 2 * rolling_std
    lower_band = rolling_mean - 2 * rolling_std

    df["bb_width"] = (
        (upper_band - lower_band) / rolling_mean
    )

    df["bb_position"] = (
        (df["close"] - lower_band)
        / (upper_band - lower_band)
    )

    # Volume
    df["volume_change"] = df["volume"].pct_change()

    df["volume_ratio"] = (
        df["volume"]
        / df["volume"].rolling(20).mean()
    )

    # Candle features
    df["range_pct"] = (
        (df["high"] - df["low"]) / df["close"]
    )

    df["body_ratio"] = (
        abs(df["close"] - df["open"])
        / (df["high"] - df["low"]).replace(0, np.nan)
    )

    df["upper_wick"] = (
        df["high"]
        - df[["open", "close"]].max(axis=1)
    ) / df["close"]

    df["lower_wick"] = (
        df[["open", "close"]].min(axis=1)
        - df["low"]
    ) / df["close"]

    # Lagged returns
    df["return_lag1"] = df["return_1d"].shift(1)
    df["return_lag2"] = df["return_1d"].shift(2)
    df["return_lag3"] = df["return_1d"].shift(3)

    # Distance from recent high/low
    rolling_high = df["close"].rolling(20).max()
    rolling_low = df["close"].rolling(20).min()

    df["distance_from_high20"] = (
        df["close"] / rolling_high - 1
    )

    df["distance_from_low20"] = (
        df["close"] / rolling_low - 1
    )

    # Clean
    df.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True
    )

    return df


def predict_stock(symbol):

    # Indian NSE ticker
    ticker = symbol.upper()

    if not ticker.endswith(".NS"):
        ticker += ".NS"

    # Get enough historical data for indicators
    df = yf.download(
        ticker,
        period="1y",
        interval="1d",
        auto_adjust=False,
        progress=False
    )

    if df.empty:
        raise ValueError(
            f"No market data found for {symbol}"
        )

    # Handle yfinance multi-index columns
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df.columns = [
        col.lower()
        for col in df.columns
    ]

    required = [
        "open",
        "high",
        "low",
        "close",
        "volume"
    ]

    missing = [
        col
        for col in required
        if col not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Missing market columns: {missing}"
        )

    df = create_features(df)

    latest = df.dropna(
        subset=feature_cols
    ).iloc[-1]

    X = latest[
        feature_cols
    ].to_frame().T

    prediction = int(
        model.predict(X)[0]
    )

    probabilities = (
        model.predict_proba(X)[0]
    )

    down_probability = float(
        probabilities[0]
    )

    up_probability = float(
        probabilities[1]
    )

    return {
        "symbol": symbol.upper(),

        "prediction": (
            "UP"
            if prediction == 1
            else "DOWN"
        ),

        "up_probability": round(
            up_probability * 100,
            2
        ),

        "down_probability": round(
            down_probability * 100,
            2
        ),

        "current_price": round(
            float(latest["close"]),
            2
        )
    }