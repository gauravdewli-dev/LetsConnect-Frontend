import { createAction } from "@reduxjs/toolkit";

export const triggerInitializeConnections = createAction("connections/triggerInitializeConnections");
export const triggerFetchStatus = createAction("connections/triggerFetchStatus");
