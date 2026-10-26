# MockMarket

MockMarket is a learning-focused virtual stock trading and portfolio management
application. It combines a React dashboard with a FastAPI backend and uses
virtual funds to explore market data, portfolio performance, risk, and
machine-learning predictions. It does not place real trades.

## Features

- Account registration and login with bearer-token authentication.
- Dashboard with stock market data and price history.
- Virtual buy and sell transactions, cash balance, holdings, and trade history.
- Portfolio analytics, including performance and allocation visualizations.
- Watchlist and individual stock detail pages.
- Portfolio risk analysis based on historical prices.
- Stock direction predictions from a locally supplied scikit-learn model.
- News headlines with sentiment scores.
- In-app assistant interface.

Market prices, history, and news are fetched through Yahoo Finance via
`yfinance`; availability and accuracy depend on that external data source.
Predictions and risk analysis are informational and should not be treated as
financial advice.

## Project layout

```text
backend/      FastAPI API, authentication, trading, analytics, and ML services
frontend/     React + Vite web application
database/     Reserved for database scripts
dataset/      Local data files; ignored by Git
```

## Requirements

- Python 3.10 or newer (the backend dependencies and local model must also
  support the Python version you use).
- Node.js and npm.
- A trusted local model artifact at
  `backend/models/mockmarket_global_rf_model.pkl`.

The model and datasets are not committed. The prediction service loads the
model with `joblib`; only use a model from a trusted source because loading an
untrusted pickle/joblib artifact can execute code.

## Local development

### 1. Configure and start the backend

In PowerShell, from the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Generate a private signing key, then set it in the current PowerShell session:

```powershell
$env:JWT_SECRET_KEY = python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Alternatively, create `backend/.env` with a `JWT_SECRET_KEY` value at least
32 characters long. `.env` files are ignored by Git; never commit or reuse a
production secret. The application fails to start if the key is missing or
too short.

With the model artifact in place, start the API from the `backend` directory:

```powershell
uvicorn main:app --reload
```

The API is available at `http://127.0.0.1:8000`. Interactive API
documentation is at `http://127.0.0.1:8000/docs`, and the health endpoint is
`http://127.0.0.1:8000/health`.

The SQLite database is created locally as `backend/mockmarket.db` when the
backend initializes. It is ignored by Git. Do not use real personal data in
the development database.

### 2. Start the frontend

In another PowerShell window, from the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The
frontend currently calls the API at `http://127.0.0.1:8000`; configure this
for your deployment environment before hosting the frontend elsewhere.

### Frontend checks

Run these commands from `frontend/`:

```powershell
npm run lint
npm run build
```

## API overview

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Check API health |
| `POST` | `/auth/register` | Register an account |
| `POST` | `/auth/login` | Sign in |
| `GET` | `/market/{symbol}` | Get current market data |
| `GET` | `/market-history/{symbol}` | Get price history |
| `GET` | `/news/{symbol}` | Get news and sentiment |
| `POST` | `/predict` | Get a model prediction |
| `POST` | `/trade/buy` | Buy with virtual funds (authentication required) |
| `POST` | `/trade/sell` | Sell holdings (authentication required) |
| `GET` | `/portfolio` | View the authenticated user's portfolio |
| `GET` | `/trades` | View the authenticated user's trade history |
| `GET` | `/portfolio-risk` | Calculate portfolio risk |

See `/docs` while the backend is running for request and response schemas.

## Deployment checklist

This repository is configured for local development, not a turnkey production
deployment. Before deploying:

- Set a unique, randomly generated `JWT_SECRET_KEY` in your secret manager and
  rotate any key that may have been deployed previously.
- Configure the frontend API URL and backend CORS allowlist for your actual
  domains and HTTPS endpoints.
- Use a production database with backups and appropriate access controls
  instead of the local SQLite database.
- Obtain and validate the ML model artifact through a trusted distribution
  channel; do not expose model or dataset artifacts in the public repository.
- Review authentication, rate limits, logging, monitoring, and data-retention
  policies for your hosting environment.
- Run dependency audits and the project's checks as part of deployment.

Do not commit `.env` files, database files, credentials, datasets, or model
artifacts. The root `.gitignore` excludes these local files.
