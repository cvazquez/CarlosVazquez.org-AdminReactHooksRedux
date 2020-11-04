// Current state of tabs editing
const iniialState = {
	series		: null
};

export default function seriesReducer(state = iniialState, action) {
	switch(action.type) {
		case "series/added" :
			return {
				name	: action.payload.seriesName
			}
		default:
			return state
	}
}