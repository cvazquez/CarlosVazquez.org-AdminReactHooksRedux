import { getOptions } from '../../components/apis/options';

const initialState = {
    isLoaded        : false,
    optionsById     : null,
    optionsByName   : null,
    isAdmin         : false
};

export default function seriesReducer(state = initialState, action) {

	switch(action.type) {
		case "series/added" :
			return {
                ...state,
                optionsStates   : action.payload.optionsStates,
                apiStates       : action.payload.apiStates
			}
		default:
			return state
	}
}

export async function fetchSeries(dispatch, getState) {
    const   data = await getOptions("Series", "Series", "series");

	dispatch({ type: 'series/added', payload : data });
}
