import BTree from "sorted-btree";
import {
  ArrayQueue,
  ConstantBackoff,
  WebsocketBuilder,
  WebsocketEvent,
} from "websocket-ts";
import { useEffect, useState } from "react";

type RawMessage = {
  b: [string, string][];
  a: [string, string][];
};

type OrderBook = {
  asks: [number, number][];
  bids: [number, number][];
};

type OrderBookState = {
  asks: BTree<number, number>;
  bids: BTree<number, number>;
};

export const PRICE_PRECISION = 100000000;
export const QTY_PRECISION = 100000000;
export const PRICE_DECIMALS = 8;
export const QTY_DECIMALS = 8;

const useOrderbook = () => {
  const [orderbook, setOrderbook] = useState<OrderBook>({
    asks: [],
    bids: [],
  });

  useEffect(() => {
    const orderBookState: OrderBookState = {
      asks: new BTree<number, number>(),
      bids: new BTree<number, number>(),
    };

    const ws = new WebsocketBuilder(
      "wss://stream.binance.com:9443/ws/btcusdt@depth"
    )
      .withBuffer(new ArrayQueue()) // buffer messages when disconnected
      .withBackoff(new ConstantBackoff(1000)) // retry every 1s
      .build();

    ws.addEventListener(WebsocketEvent.message, (instance, ev) => {
      const data: RawMessage = JSON.parse(ev.data);
      data.b.forEach(([price, quantity]) => {
        const parsedPrice = parseInt(price.replaceAll(".", ""));
        const parseQty = parseInt(quantity.replaceAll(".", ""));
        if (parseQty === 0) orderBookState.bids.delete(parsedPrice);
        else orderBookState.bids.set(parsedPrice, parseQty);
      });
      data.a.forEach(([price, quantity]) => {
        const parsedPrice = parseInt(price.replaceAll(".", ""));
        const parseQty = parseInt(quantity.replaceAll(".", ""));
        if (parseQty === 0) orderBookState.asks.delete(parsedPrice);
        else orderBookState.asks.set(parsedPrice, parseQty);
      });

      const topB: [number, number][] = [];
      for (const [price, quantity] of orderBookState.bids.entriesReversed()) {
        topB.push([price, quantity]);
        if (topB.length === 5) break;
      }

      const topA: [number, number][] = [];
      for (const [price, quantity] of orderBookState.asks.entries()) {
        topA.unshift([price, quantity]);
        if (topA.length === 5) break;
      }

      setOrderbook({
        asks: topA,
        bids: topB,
      });
    });

    return () => {
      ws.close();
    };
  }, []);

  return orderbook;
};

export default useOrderbook;
