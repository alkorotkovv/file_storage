import React from 'react';
import App from '../../../app/App';
import Main from "./components/Main/Main";
import {Provider} from "react-redux";
import {useAppSelector} from "../../../shared/store";
import {useTitle} from "../../../utils/hooks/useTitle";
import store from "./store";

function Report() {

  useTitle('Библиотека')
  const user = useAppSelector((state) => state.user)

  return (
    <App>
      <Provider store={store}>
        <Main globalUser={user}/>
      </Provider>
    </App>
  );
};

export default Report;
