import React, { useState, useEffect } from "react";
import { checkAPIResponse } from "../helpers/api";
import { showDemoMessage } from "../helpers/login";
import { Link } from "react-router-dom";
import { getOptions } from "./apis/options";
import { useSelector } from "react-redux";

// eslint-disable-next-line
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

export default function SelectOptions({ name, namePlural }) {
    const [apiResponseState, setAPIResponseState] = useState({
    // api async call results
        error				: undefined,
        isLoaded			: false,
        isAdmin				: true
    });

    const [optionsState, setOptionsState] = useState({
        label: {
            name,
            nameLower: name.toLowerCase(),
        },

        // Categories list to display and edit
        optionsByName	: {},
        optionsById		: {},

        // new option field
        newOption			: "",

        // Toggles update alert className of existing option
        savedOption		: null,

        // Toggles update alert className of new option
        newOptionSaveStatus : null
    });

    const options = useSelector(state => state.optionsStates);

    useEffect(() => {
        async function getData() {
            const data = await getOptions(
                name,
                namePlural,
                namePlural.toLowerCase(),
            );

            if(data.apiStates && data.apiStates.isLoaded) {
                setAPIResponseState(state => ({
                    ...state,
                    ...data.apiStates
                }));

                setOptionsState(state => ({
                    ...state,
                    ...data.optionsStates
                }));
            } else {
                setAPIResponseState(state => ({
                    ...state,
                    apiStates   : {
                        ...state.apiStates,
                        isLoaded    : false
                    },
                    error : data.error
                }));
            }
        }

        getData();

    }, [options, name, namePlural]);

    function handleTextUpdate(e) {
        const	id				= e.currentTarget.dataset.id,
            optionsById	= optionsState.optionsById;

        optionsById[id].name = e.target.value;

        setOptionsState(state => ({
            ...state,
            optionsById
        }));
    }

    function updateOption(id, nameArg, optionsById) {
        fetch(`${REACT_APP_API_URL}/update${nameArg}`, {
            method	: "POST",
            body	: JSON.stringify({id, name: nameArg}),
            headers	: {	"Content-Type": "application/json"}
        })
            .then(res => checkAPIResponse(res))
            .then( result => {
                if(result.affectedRows && result.affectedRows > 0) {

                    optionsById[id].saveStatus = <span className='blink'>SAVED!</span>;
                    setOptionsState(state => ({
                        ...state,
                        optionsById
                    }));

                    setTimeout(() => {
                        optionsById[id].saveStatus = null;

                        setOptionsState(state => ({
                            ...state,
                            optionsById
                        }));
                    }, 5000);
                } else {
                    optionsById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

                    setOptionsState(state => ({
                        ...state,
                        optionsById
                    }));

                    throw(new Error(`Failed Saving updated ${optionsState.label.nameLower}.`));
                }
            },
            error => {
                optionsById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

                setOptionsState(state => ({
                    ...state,
                    error,
                    optionsById
                }));

                // eslint-disable-next-line no-console
                console.log("No Response from API saving categories", error);

                // eslint-disable-next-line
            }).catch(error => console.error(`API Request Saving Updated ${nameArg} Fetch Error:`, error));
    }

    // If a option is updated, post update to API to save to DB
    function handleOptionBlur(e) {
    // A blanked out option will deactivate it
        const	id		= e.currentTarget.dataset.id,
            optionName	= e.target.value.trim();

        // Used to reinit the option names for comparison later
        let optionsById = optionsState.optionsById;

        // Option name didn't update, no need to save. Exit function
        if(optionsState.optionsById[id].name === optionName) return;

        updateOption(id, optionName, optionsById);
    }

    function handleNewOption(e) {
        const optionValue = e.target.value;
        // Normal react text field value update
        setOptionsState(state => ({
            ...state,
            newOption : optionValue
        }));
    }

    function addOption(newOption) {
        fetch(`${REACT_APP_API_URL}/add${optionsState.label.name}`, {
            method	: "POST",
            body	: JSON.stringify({newOption}),
            headers	: {	"Content-Type": "application/json"}
        })
            .then(res => checkAPIResponse(res))
            .then( result => {
                const optionName = "added" + optionsState.label.name;

                if(result[optionName].affectedRows && result[optionName].affectedRows > 0) {

                    // Add a blinking Saved message next to new option
                    setOptionsState(state => ({
                        ...state,
                        newOptionSaveStatus	: <span className='blink'>SAVED &quot;{newOption}&quot;!</span>,
                        savedOption			: newOption,
                        newOption				: ""
                    }));

                    //	getOptions();

                    setTimeout(() => {
                        // Clear saved message
                        setOptionsState(state => ({
                            ...state,
                            newOptionSaveStatus : null
                        }));
                    }, 5000);

                } else {
                    setOptionsState(state => ({
                        ...state,
                        newOptionSaveStatus :
    <span className='blink'>
        FAILED SAVING! {result.added[optionsState.label.name].message}
    </span>,
                    }));

                    throw(new Error(`Failed saving new ${optionsState.label.name}. No DB rows affected`));
                }
            },
            error => {
                setOptionsState(state => ({
                    ...state,
                    error,
                    newOptionSaveStatus : <span className='blink'>FAILED SAVING!</span>
                }));

            }).catch(error => {
                setOptionsState(state => ({
                    ...state,
                    error,
                    newOptionSaveStatus : <span className='blink'>FAILED SAVING!</span>
                }));
                // eslint-disable-next-line no-console
                console.log(`Fetch Promise Error Saving New ${optionsState.label.name} : ${error.message}`);
                // eslint-disable-next-line no-console
                console.log(error);
            });
    }

    function handleNewOptionSubmit(e) {
        e.preventDefault();

        addOption(optionsState.newOption);
    }

    function form() {
        if (apiResponseState.error) {
            return <div>Error: {apiResponseState.error.message}</div>;
        } else if (!apiResponseState.isLoaded) {
            return <div>Loading...</div>;
        } else {
            return <div>
                {showDemoMessage(!apiResponseState.isAdmin)}

                <div className="lists">
                    {/* Form and field to save a new option */}
                    <form action="POST" onSubmit={handleNewOptionSubmit}>
                        <input	type		= "text"
                            value		= {optionsState.newOption}
                            onChange	= {handleNewOption}
                            placeholder	= {`Add a New ${optionsState.label.name}`} />

                        <button type="button" onClick={handleNewOptionSubmit}>Add</button>
                        {optionsState.newOptionSaveStatus}
                    </form>

                    {/* Lookp through existing list of categories to edit */}
                    {Object.keys(optionsState.optionsByName).map(key =>
                        <div key		= {key}>
                            <input	className	=  {optionsState.savedOption === optionsState.optionsById[optionsState.optionsByName[key]].name ? name + "saved" : name}
                                type		= "text"
                                value		= {optionsState.optionsById[optionsState.optionsByName[key]].name}
                                data-id		= {optionsState.optionsByName[key]}
                                data-testid	= {optionsState.optionsById[optionsState.optionsByName[key]].name}
                                onChange	= {handleTextUpdate}
                                onBlur		= {handleOptionBlur} />
                            {optionsState.optionsById[optionsState.optionsByName[key]].saveStatus}

                            {optionsState.label.name === "Series" &&
                            <span className="series-manage">
                                [<Link to =
                                    {
                                        {
                                            pathname    : `/series/${optionsState.optionsByName[key]}`,
                                            state   : {
                                                name : optionsState.optionsById[optionsState.optionsByName[key]].name
                                            }
                                        }
                                    }
                                className	= "series-manage-click"
                                data-testid	= {optionsState.optionsById[optionsState.optionsByName[key]].name + "_manage"}>
                                    manage
                                </Link>]
                            </span>
                            }
                        </div>
                    )}
                </div>
            </div>;
        }
    }

    return <>{form()}</>;
}