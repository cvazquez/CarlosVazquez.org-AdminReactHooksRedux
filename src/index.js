import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { fetchPosts } from "./features/posts/postsSlice";
import { fetchCategories } from "./features/category/categorySlice";
import { fetchSeries } from "./features/series/seriesSlice";

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
const unsubscribe = store.subscribe(() =>
  console.log('State after dispatch: ', store.getState())
)

// Now, dispatch some actions
// Todo: move this into posts
store.dispatch(fetchPosts);
store.dispatch(fetchCategories);
store.dispatch(fetchSeries);

// Stop listening to state updates
unsubscribe()

const container = document.getElementById('root');
const root = createRoot(container);
root.render(  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
