import balanceAction from "./balance";
import transferAction from "./transfer";
import deployTokenAction from "./deploy_token";
import priceAction from "./price";
import tradeAction from "./trade";

export const ACTIONS = {
  BALANCE_ACTION: balanceAction,
  TRANSFER_ACTION: transferAction,
  DEPLOY_TOKEN_ACTION: deployTokenAction,
  PRICE_ACTION: priceAction,
  TRADE_ACTION: tradeAction,
} as const;

export type { Action, ActionExample, Handler } from "../types/action";
