import React, { createContext, useState, useContext } from "react";
interface StockInfo {
  name: string;
  ticker: string;
  logo?: string;
  currency: string;
  price: number;
  change?: number;
  changePercent?: number;
  epsTTM?: number;
  peRatioTTM?: number;
  epsGrowthTTM?: number;
  fcfPerShareTTM?: number;
  fcfYieldTTM?: number;
}

interface StockContextType {
  currentStock: StockInfo | null;
  setCurrentStock: (stock: StockInfo) => void;
}

const StockContext = createContext<StockContextType | null>(null);

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentStock, setCurrentStock] = useState<StockInfo | null>(null);

  return (
    <StockContext.Provider value={{ currentStock, setCurrentStock }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStockInfo = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStockInfo must be used within StockProvider");
  }
  return context;
};
