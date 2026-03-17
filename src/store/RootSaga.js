import {all, fork} from 'redux-saga/effects';
import watchAuthSaga from '../screens/auth/redux/Saga';
import watchPassSaga from '../screens/passes/redux/Saga';
import watchIncidentSaga from '../screens/incidents/redux/Saga';
import watchAccountSaga from '../screens/account/redux/Saga';
import watchChatSaga from '../screens/chat/redux/Saga';
import watchMapSaga from '../screens/map/redux/Saga';

export default function* RootSaga() {
  yield all([
    fork(watchAuthSaga),
    fork(watchPassSaga),
    fork(watchIncidentSaga),
    fork(watchAccountSaga),
    fork(watchChatSaga),
    fork(watchMapSaga),
  ]);
}
