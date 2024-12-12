import { getOptions } from "../../components/apis/options";

const initialState = {
    optionsStates   : null,
    apiStates       : null,
    error           : null
};

export default function categoryReducer(state = initialState, action) {

    switch(action.type) {
        case "category/added" :
            return {
                ...state,
                optionsStates   : action.payload.optionsStates,
                apiStates       : action.payload.apiStates
            };
        default:
            return state;
    }
}

export async function fetchCategories(dispatch) {
    const   data = await getOptions("Category", "Categories", "categories");

    dispatch({ type: "category/added", payload : data });
}
