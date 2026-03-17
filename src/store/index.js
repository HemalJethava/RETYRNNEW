import {createStore, applyMiddleware} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootReducer from './RootReducer';
import RootSaga from './RootSaga';

const createSagaMiddleware = require('redux-saga').default;

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['Map', 'Chat'],
};

const persistedReducer = persistReducer(persistConfig, RootReducer);

const sagaMiddleware = createSagaMiddleware();

const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));

const persistor = persistStore(store);

sagaMiddleware.run(RootSaga);

export {store, persistor};
