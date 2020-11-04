import { combineReducers } from "redux";
import postEditsReducer from "./features/postEdits/postEditsSlice";
import categoryReducer from "./features/category/categorySlice";
import seriesReducer from "./features/series/seriesSlice";
import postsReducer from "./features/posts/postsSlice";

const rootReducer = combineReducers({
	postEdits	: postEditsReducer,
	category	: categoryReducer,
	series		: seriesReducer,
	posts		: postsReducer
});

export default rootReducer;