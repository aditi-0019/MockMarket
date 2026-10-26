from database import SessionLocal
from db_models import User, Holding, Trade
from services.market_service import get_market_data


def buy_stock(symbol: str, quantity: int, user_id: int):

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise ValueError("User not found")

        if quantity <= 0:
            raise ValueError("Quantity must be greater than 0")

        market = get_market_data(symbol)

        price = market["current_price"]
        total_value = price * quantity

        if user.cash_balance < total_value:
            raise ValueError("Insufficient virtual balance")

        user.cash_balance -= total_value

        holding = (
            db.query(Holding)
            .filter(
                Holding.user_id == user.id,
                Holding.symbol == symbol.upper()
            )
            .first()
        )

        if holding:
            old_quantity = holding.quantity
            old_value = holding.average_price * old_quantity

            holding.quantity += quantity

            holding.average_price = (
                (old_value + total_value) /
                holding.quantity
            )

        else:
            holding = Holding(
                user_id=user.id,
                symbol=symbol.upper(),
                quantity=quantity,
                average_price=price
            )

            db.add(holding)

        trade = Trade(
            user_id=user.id,
            symbol=symbol.upper(),
            trade_type="BUY",
            quantity=quantity,
            price=price,
            total_value=total_value
        )

        db.add(trade)

        db.commit()

        return {
            "message": "BUY order executed",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": price,
            "total_value": round(total_value, 2),
            "remaining_balance": round(user.cash_balance, 2)
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def sell_stock(symbol: str, quantity: int, user_id: int):

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise ValueError("User not found")

        if quantity <= 0:
            raise ValueError("Quantity must be greater than 0")

        holding = (
            db.query(Holding)
            .filter(
                Holding.user_id == user.id,
                Holding.symbol == symbol.upper()
            )
            .first()
        )

        if not holding or holding.quantity < quantity:
            raise ValueError("Insufficient shares")

        market = get_market_data(symbol)

        price = market["current_price"]
        total_value = price * quantity

        holding.quantity -= quantity

        if holding.quantity == 0:
            db.delete(holding)

        user.cash_balance += total_value

        trade = Trade(
            user_id=user.id,
            symbol=symbol.upper(),
            trade_type="SELL",
            quantity=quantity,
            price=price,
            total_value=total_value
        )

        db.add(trade)

        db.commit()

        return {
            "message": "SELL order executed",
            "symbol": symbol.upper(),
            "quantity": quantity,
            "price": price,
            "total_value": round(total_value, 2),
            "remaining_balance": round(user.cash_balance, 2)
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def get_portfolio(user_id: int):

    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise ValueError("User not found")

        holdings = (
            db.query(Holding)
            .filter(Holding.user_id == user.id)
            .all()
        )

        portfolio = []

        total_invested = 0
        total_current_value = 0

        for holding in holdings:

            market = get_market_data(holding.symbol)

            current_price = market["current_price"]

            invested_value = holding.average_price * holding.quantity
            current_value = current_price * holding.quantity

            profit_loss = current_value - invested_value

            profit_loss_percent = (
                (profit_loss / invested_value) * 100
                if invested_value > 0
                else 0
            )

            portfolio.append({
                "symbol": holding.symbol,
                "quantity": holding.quantity,
                "average_price": round(holding.average_price, 2),
                "current_price": round(current_price, 2),
                "invested_value": round(invested_value, 2),
                "current_value": round(current_value, 2),
                "profit_loss": round(profit_loss, 2),
                "profit_loss_percent": round(
                    profit_loss_percent, 2
                )
            })

            total_invested += invested_value
            total_current_value += current_value

        total_profit_loss = (
            total_current_value - total_invested
        )

        total_profit_loss_percent = (
            (total_profit_loss / total_invested) * 100
            if total_invested > 0
            else 0
        )

        return {
            "cash_balance": round(user.cash_balance, 2),
            "total_invested": round(total_invested, 2),
            "current_portfolio_value": round(
                total_current_value, 2
            ),
            "total_profit_loss": round(
                total_profit_loss, 2
            ),
            "total_profit_loss_percent": round(
                total_profit_loss_percent, 2
            ),
            "holdings": portfolio
        }

    finally:
        db.close()


def get_trades(user_id: int):

    db = SessionLocal()

    try:
        trades = (
            db.query(Trade)
            .filter(Trade.user_id == user_id)
            .order_by(Trade.timestamp.desc())
            .all()
        )

        return [
            {
                "id": trade.id,
                "symbol": trade.symbol,
                "trade_type": trade.trade_type,
                "quantity": trade.quantity,
                "price": round(trade.price, 2),
                "total_value": round(
                    trade.total_value, 2
                ),
                "timestamp": trade.timestamp
            }
            for trade in trades
        ]

    finally:
        db.close()