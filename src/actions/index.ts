import balanceAction from "./balance";
import transferAction from "./transfer";
import deployTokenAction from "./deploy_token";

export const ACTIONS = {
  BALANCE_ACTION: balanceAction,
  TRANSFER_ACTION: transferAction,
  DEPLOY_TOKEN_ACTION: deployTokenAction,
} as const;

export type { Action, ActionExample, Handler } from "../types/action";
