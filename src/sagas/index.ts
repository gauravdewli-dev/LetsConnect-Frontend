import { all } from "redux-saga/effects";

import { modelSagas } from "@/models";
import { flattenPages, Pages } from "@/pages";

function getSagas(): Array<() => Generator> {
  const sagas: Array<() => Generator> = [];

  for (const page of flattenPages(Pages)) {
    if (page.importSagas) {
      sagas.push(...page.importSagas());
    }
  }

  return [...new Set([...sagas, ...modelSagas])];
}

export default function* rootSaga() {
  yield all(getSagas().map((saga) => saga()));
}
