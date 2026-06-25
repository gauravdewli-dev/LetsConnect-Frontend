import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import createSagaMiddleware from "redux-saga";

import { createAppStore } from "@/reducers";
import rootSaga from "@/sagas";
import AppRouter from "@/routing/routes";

const sagaMiddleware = createSagaMiddleware();
const store = createAppStore(sagaMiddleware);
sagaMiddleware.run(rootSaga);

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Provider>
  );
}
