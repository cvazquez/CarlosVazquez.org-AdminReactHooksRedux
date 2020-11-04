// Current state of tabs editing
const iniialState = {
	category	: null
};

export default function categoryReducer(state = iniialState, action) {
	switch(action.type) {
		case "category/added" :
			return {
				name	: action.payload.categoryName,
			}
		default:
			return state
	}
}