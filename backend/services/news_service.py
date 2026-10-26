import yfinance as yf
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


analyzer = SentimentIntensityAnalyzer()


def get_news(symbol: str):

    ticker_symbol = symbol.upper()

    if not ticker_symbol.endswith(".NS"):
        ticker_symbol += ".NS"

    ticker = yf.Ticker(ticker_symbol)

    news = ticker.news

    results = []

    for item in news[:10]:

        content = item.get("content", {})

        title = content.get("title", "")

        if not title:
            continue

        sentiment_score = analyzer.polarity_scores(title)["compound"]

        if sentiment_score >= 0.05:
            sentiment = "Positive"
        elif sentiment_score <= -0.05:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"

        results.append({
            "title": title,
            "sentiment": sentiment,
            "sentiment_score": round(sentiment_score, 3)
        })

    return {
        "symbol": symbol.upper(),
        "news": results
    }