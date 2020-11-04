import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import { fetchPosts } from "./features/posts/postsSlice";


// Log the initial state
console.log('Initial state: ', store.getState())

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
const unsubscribe = store.subscribe(() =>
  console.log('State after dispatch: ', store.getState())
)

// Now, dispatch some actions
store.dispatch(fetchPosts);
/* store.dispatch({	type	: 'postEdits/added',
					payload	: {
						draftId			: 1,
						title			: "test",
						teaser			: "test teaser",
						metaDescription	: "test metaDescription",
						metaKeyWords	: "test metaKeyWords",
						content			: "Hello I am content. This is new content. Hello I am content. This is new content. Hello I am content. This is new content. Hello I am content. This is new content.",

						// Publish At Date
						publishAt		: "2020-11-03 15:29",
						publishYear		: 2020,
						publishMonth	: 11,
						publishDay		: 3,
						publishHour		: 15,
						publishMinute	: 29,

						//Options
						categories	: "Travel",
						series		: "Patagonia",
						flickrId	: 1,
					}
}) */

// Stop listening to state updates
unsubscribe()


ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
