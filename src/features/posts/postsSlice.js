//import axios from "axios";
import { getPosts } from "../../components/apis/posts";


// Current state of tabs editing
const iniialState = {
	posts	: []
};

export default function postsReducer(state = iniialState, action) {
	switch(action.type) {
		case "posts/get":
			return {
				...state,
				posts	: [
					...state.posts
				]
			}
		default:
			return state
	}
}

export async function fetchPosts(dispatch, getState) {
	const data = await getPosts();

	data.isLoaded ? console.log("loaded") : console.log("not loaded");

	dispatch({ type: 'posts/get', payload: data.activeEntries })

		/* setAPIResponses(state => ({
			...state,
			isLoaded		: data.isLoaded,
			activeEntries	: data.activeEntries,
			isAdmin			: data.isAdmin
		}))
		:
		setAPIResponses(state => ({
			...state,
			isLoaded	: false,
			error		: data.error
		})); */
}