import { createAction } from "@reduxjs/toolkit";

export const triggerFetchStatus = createAction("connections/triggerFetchStatus");
export const triggerStartStatusPoll = createAction("connections/triggerStartStatusPoll");
export const triggerStopStatusPoll = createAction("connections/triggerStopStatusPoll");
