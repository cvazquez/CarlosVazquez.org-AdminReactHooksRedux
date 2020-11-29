import { checkAPIResponse } from '../../helpers/api'

// Request categories to display and edit
export function getOptions(name, namePlural, namePluralLower) {
    console.log("getting options")
    return new Promise(resolve => {
        fetch(`${process.env.REACT_APP_API_URL}/get${namePlural}`)
            .then(res => checkAPIResponse(res))
            .then(
                result => {
                    if(result[namePluralLower] && Array.isArray(result[namePluralLower])) {
                        const 	optionsByName	= {},
                                optionsById		= {};

                        result[namePluralLower].forEach(item => {
                            // Get a categories id by name
                            optionsByName[item.name] = item.id;

                            // Get a categories name by id
                            optionsById[item.id] = {
                                name		: item.name,
                                saveStatus	: null}; // don't change case. Displays in option search overlay results
                        });

                        resolve({
                            apiStates : {
                                isLoaded	: true,
                                isAdmin		: result.isAdmin
                            },
                            optionsStates : {
                                optionsByName,
                                optionsById
                            }
                        });
                    } else {
                        throw(new Error(`getOptions() fetch missing ${name} array`));
                    }
                },
                error => {

                    resolve({
                        isLoaded	: false,
                        error
                    });

                    /* setAPIResponseState(state => ({
                        ...state,
                        isLoaded	: false,
                        error
                    })); */

                    console.log(`No Response from API getting ${name}`, error)
                }
            )}).catch(error => {

                /* setAPIResponseState(state => ({
                    ...state,
                    error
                })); */

                console.error("API Request Categories Fetch Error:", error);
        })
}