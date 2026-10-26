import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getWatchlist,
  removeFromWatchlist,
} from "../services/watchlistService";

import { getMarketData } from "../services/api";


function Watchlist() {

  const [watchlist, setWatchlist] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const navigate = useNavigate();


  // =================================
  // LOAD WATCHLIST + REAL MARKET DATA
  // =================================

  useEffect(() => {

    async function loadWatchlist() {

      try {

        setLoading(true);

        const savedStocks = getWatchlist();

        if (savedStocks.length === 0) {

          setWatchlist([]);

          return;

        }


        const updatedStocks =
          await Promise.all(

            savedStocks.map(
              async (stock) => {

                try {

                  const marketData =
                    await getMarketData(
                      stock.symbol
                    );


                  return {

                    ...stock,

                    price:
                      marketData.current_price,

                    change:
                      marketData.change_percent,

                  };

                } catch (error) {

                  console.error(
                    `Failed to load ${stock.symbol}`,
                    error
                  );

                  return stock;

                }

              }
            )

          );


        setWatchlist(updatedStocks);


      } catch (error) {

        console.error(error);

        setError(
          "Unable to load watchlist"
        );

      } finally {

        setLoading(false);

      }

    }


    loadWatchlist();

  }, []);


  // =================================
  // REMOVE STOCK
  // =================================

  function handleRemove(symbol) {

    const updatedWatchlist =
      removeFromWatchlist(symbol);

    setWatchlist(updatedWatchlist);

  }


  // =================================
  // LOADING
  // =================================

  if (loading) {

    return (

      <div className="page-container">

        <p>
          Loading watchlist...
        </p>

      </div>

    );

  }


  // =================================
  // ERROR
  // =================================

  if (error) {

    return (

      <div className="page-container">

        <p>
          {error}
        </p>

      </div>

    );

  }


  // =================================
  // PAGE
  // =================================

  return (

    <div className="page-container">


      {/* HEADER */}

      <div className="page-header">

        <p className="eyebrow">
          TRACK THE MARKET
        </p>

        <h1>
          Watchlist
        </h1>

        <p>
          Keep an eye on stocks you're
          interested in.
        </p>

      </div>



      {/* EMPTY STATE */}

      {watchlist.length === 0 ? (

        <div className="empty-state">

          <h2>
            Your Watchlist is Empty
          </h2>

          <p>
            Add stocks to your watchlist
            from the stock details page.
          </p>

        </div>

      ) : (


        /* WATCHLIST */

        <div className="watchlist-container">


          {watchlist.map((stock) => {

            const isPositive =
              stock.change >= 0;


            return (

              <div
                className="watchlist-item"
                key={stock.symbol}
              >


                {/* STOCK */}

                <div className="watchlist-stock">


                  <div className="watchlist-symbol">

                    {stock.symbol}

                  </div>


                  <div>

                    <h3>
                      {stock.name ||
                        stock.symbol}
                    </h3>

                    <p>
                      {stock.symbol}
                    </p>

                  </div>


                </div>



                {/* PRICE */}

                <div className="watchlist-price">


                  <strong>

                    ₹
                    {Number(
                      stock.price
                    ).toLocaleString(
                      "en-IN"
                    )}

                  </strong>


                  <span
                    className={
                      isPositive
                        ? "positive"
                        : "negative"
                    }
                  >

                    {isPositive
                      ? "+"
                      : ""}

                    {stock.change}%

                  </span>


                </div>



                {/* ACTIONS */}

                <div className="watchlist-actions">


                  <button
                    onClick={() =>
                      navigate(
                        `/stocks/${stock.symbol}`
                      )
                    }
                  >
                    View
                  </button>


                  <button
                    className="remove-button"
                    onClick={() =>
                      handleRemove(
                        stock.symbol
                      )
                    }
                  >
                    Remove
                  </button>


                </div>


              </div>

            );

          })}


        </div>

      )}


    </div>

  );

}


export default Watchlist;