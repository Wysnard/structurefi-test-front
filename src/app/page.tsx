"use client";

import React from "react";
import useOrderbook, { PRICE_PRECISION, QTY_PRECISION } from "./orderbook.hook";

export default function Home() {
  const orderbook = useOrderbook();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="border border-gray-300 rounded-md p-4 w-[500px]">
        <h1 className="text-2xl font-bold">Orderbook</h1>
        <h2 className="text-lg font-bold">Asks</h2>
        <div className="grid grid-cols-2">
          {orderbook.asks.map(([price, quantity], index) => (
            <React.Fragment key={`ask-${index}`}>
              <div>{(price / PRICE_PRECISION).toFixed(2)}</div>
              <div>{(quantity / QTY_PRECISION).toFixed(5)}</div>
            </React.Fragment>
          ))}
        </div>
        <h2 className="text-lg font-bold">Bids</h2>
        <div className="grid grid-cols-2">
          {orderbook.bids.map(([price, quantity], index) => (
            <React.Fragment key={`bid-${index}`}>
              <div>{(price / PRICE_PRECISION).toFixed(2)}</div>
              <div>{(quantity / QTY_PRECISION).toFixed(5)}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
