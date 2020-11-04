//import axios from "axios";
import { getPosts } from "../../components/apis/posts";


// Current state of tabs editing
const initialState = {
	isLoaded	: false,
	entries		: [],
	isAdmin		: false
};

export default function postsReducer(state = initialState, action) {
	switch(action.type) {
		case "posts/get":

			return {
				...state,
				isLoaded	: action.payload.isLoaded,
				entries		: action.payload.activeEntries,
				isAdmin		: action.payload.isAdmin
			}
		default:
			return state
	}
}

export async function fetchPosts(dispatch, getState) {
	const data = await getPosts();


	//dispatch({ type: 'posts/get', payload : data.isLoaded ? data.activeEntries : [] })
	dispatch({ type: 'posts/get', payload : data })

	const stateAfter = getState();

	console.log("stateAfter : ", stateAfter)
  	console.log('entries after dispatch: ', stateAfter.posts.entries.length)

}