import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducer'

const	composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware)),
		store = createStore(rootReducer, composedEnhancer);

export default store