import { createAction } from "@reduxjs/toolkit";

import type { LoginPayload, SignupPayload } from "@/types";

export const triggerLogin = createAction<LoginPayload>("auth/triggerLogin");
export const triggerSignup = createAction<SignupPayload>("auth/triggerSignup");
export const triggerFetchMe = createAction("auth/triggerFetchMe");
