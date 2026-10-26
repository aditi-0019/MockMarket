from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from services.risk_service import calculate_portfolio_risk

from database import get_db
from db_models import User

from services.auth_services import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

from services.news_service import get_news

from services.prediction_services import predict_stock

from services.market_service import (
    get_market_data,
    get_price_history
)

from services.trading_services import (
    buy_stock,
    sell_stock,
    get_portfolio,
    get_trades
)


app = FastAPI(
    title="MOCKMARKET API",
    description="Virtual Stock Trading and Portfolio Management Backend",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# SECURITY
# =========================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# =========================
# REQUEST MODELS
# =========================

class PredictionRequest(BaseModel):
    symbol: str


class RegisterRequest(BaseModel):
    name: str
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


# =========================
# BASIC ROUTES
# =========================

@app.get("/")
def root():
    return {
        "message": "MOCKMARKET API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# =========================
# ML PREDICTION
# =========================

@app.post("/predict")
def predict(request: PredictionRequest):

    try:
        return predict_stock(request.symbol)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================
# MARKET DATA
# =========================

@app.get("/market/{symbol}")
def market_data(symbol: str):

    try:
        return get_market_data(symbol)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/market-history/{symbol}")
def market_history(
    symbol: str,
    period: str = "1mo"
):

    try:
        return get_price_history(symbol, period)

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


# =========================
# NEWS
# =========================

@app.get("/news/{symbol}")
def news(symbol: str):

    try:
        return get_news(symbol)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================
# AUTHENTICATION
# =========================

@app.post("/auth/register")
def register_user(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing_username = (
        db.query(User)
        .filter(User.username == data.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )


    existing_email = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    new_user = User(
        name=data.name,
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        cash_balance=1000000.0
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    return {
        "message": "Registration successful",
        "username": new_user.username,
        "email": new_user.email
    }


@app.post("/auth/login")
def login_user(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.username == data.username)
        .first()
    )


    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


    token = create_access_token(
        {
            "sub": str(user.id),
            "username": user.username
        }
    )


    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "username": user.username,
            "email": user.email
        }
    }


# =========================
# VIRTUAL TRADING
# =========================

@app.post("/trade/buy")
def buy(
    symbol: str,
    quantity: int,
    current_user: User = Depends(get_current_user)
):

    try:
        return buy_stock(
            symbol,
            quantity,
            current_user.id
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@app.post("/trade/sell")
def sell(
    symbol: str,
    quantity: int,
    current_user: User = Depends(get_current_user)
):

    try:
        return sell_stock(
            symbol,
            quantity,
            current_user.id
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================
# PORTFOLIO
# =========================

@app.get("/portfolio")
def portfolio(
    current_user: User = Depends(get_current_user)
):

    try:
        return get_portfolio(
            current_user.id
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================
# TRADE HISTORY
# =========================

@app.get("/trades")
def trades(
    current_user: User = Depends(get_current_user)
):

    try:
        return get_trades(
            current_user.id
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.get("/portfolio-risk")
def get_portfolio_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return calculate_portfolio_risk(
        db,
        current_user.id
    )    