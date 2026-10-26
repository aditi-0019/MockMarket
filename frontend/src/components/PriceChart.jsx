import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PriceChart({ symbol, period = "1mo" }) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadHistory() {

      try {

        setLoading(true);

        const response = await fetch(
          `http://127.0.0.1:8000/market-history/${symbol}?period=${period}`
        );

        if (!response.ok) {
          throw new Error("Failed to load price history");
        }

        const result = await response.json();

        setData(result.history || []);

      } catch (error) {

        console.error(
          "Price history error:",
          error
        );

        setData([]);

      } finally {

        setLoading(false);

      }

    }

    if (symbol) {
      loadHistory();
    }

  }, [symbol, period]);


  if (loading) {
    return (
      <div className="price-chart">
        <p>Loading price history...</p>
      </div>
    );
  }


  if (data.length === 0) {
    return (
      <div className="price-chart">
        <p>No price history available.</p>
      </div>
    );
  }


  return (
    <div className="price-chart">

      <ResponsiveContainer
        width="100%"
        height={400}
      >

        <LineChart data={data}>

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="date"
          />

          <YAxis
            domain={[
              "dataMin - 50",
              "dataMax + 50",
            ]}
          />

          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toLocaleString("en-IN")}`,
              "Price",
            ]}
          />

          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default PriceChart;