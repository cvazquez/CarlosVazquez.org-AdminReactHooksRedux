import React, { useState, useEffect, useRef } from "react";
import { checkAPIResponse } from '../helpers/api'
import { showDemoMessage } from '../helpers/login';
import { Link } from 'react-router-dom';
import { getOptions } from './apis/options';
import { useSelector } from 'react-redux'

export default function SelectOptions(props) {
		const	nameLower = props.name.toLowerCase(),
				namePluralLower = props.namePlural.toLowerCase(),
				//_isMounted			= useRef(false),
				[apiResponseState, setAPIResponseState] = useState({
					// api async call results
					error				: undefined,
					isLoaded			: false,
					isAdmin				: true
				}),
				[optionsState, setOptionsState] = useState({
					// Categories list to display and edit
					optionsByName	: {},
					optionsById		: {},

					// new option field
					newOption			: "",

					// Toggles update alert className of existing option
					savedOption		: null,

					// Toggles update alert className of new option
					newOptionSaveStatus : null
                }),
                unMounted    = useRef(false),
                options     = {};

            options[nameLower]     = useSelector(state => state[nameLower]);

        useEffect(() => {
			async function getData(options) {
				let data = await options;

                if(options.isLoaded) {
                    data = options;
                } else {
                    data = await getOptions(props.name, props.namePlural, namePluralLower);
                }

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

			if(!unMounted.current) {
				getData(options[nameLower]);
            }

            return () => unMounted.current = true;

			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [nameLower]);

		function handleTextUpdate(e) {
			const	id				= e.currentTarget.dataset.id,
					optionsById	= optionsState.optionsById;

			optionsById[id].name = e.target.value;

			setOptionsState(state => ({
				...state,
				optionsById
			}));
		}

		function updateOption(id, name, optionsById) {
			fetch(`${process.env.REACT_APP_API_URL}/update${props.name}`, {
				method	: 'POST',
				body	: JSON.stringify({id,name}),
				headers	: {	'Content-Type': 'application/json'}
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
					}, 5000)
				} else {
					optionsById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

					setOptionsState(state => ({
						...state,
						optionsById
					}));

					throw(new Error(`Failed Saving updated ${nameLower}.`));
				}
			},
			error => {
				optionsById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

				setOptionsState(state => ({
					...state,
					error,
					optionsById
				}));

				console.log("No Response from API saving categories", error)
			}).catch(error => console.error(`API Request Saving Updated ${props.name} Fetch Error:`, error));
		}

		// If a option is updated, post update to API to save to DB
		function handleOptionBlur(e) {
			// A blanked out option will deactivate it
			const	id		= e.currentTarget.dataset.id,
					name	= e.target.value.trim();

			// Used to reinit the option names for comparison later
			let optionsById = optionsState.optionsById;

			// Option name didn't update, no need to save. Exit function
			if(optionsState.optionsById[id].name === name) return;

			updateOption(id, name, optionsById)
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
			fetch(`${process.env.REACT_APP_API_URL}/add${props.name}`, {
				method	: 'POST',
				body	: JSON.stringify({newOption}),
				headers	: {	'Content-Type': 'application/json'}
			})
			.then(res => checkAPIResponse(res))
			.then( result => {
				const optionName = "added" + props.name;

				if(result[optionName].affectedRows && result[optionName].affectedRows > 0) {

					// Add a blinking Saved message next to new option
					setOptionsState(state => ({
						...state,
						newOptionSaveStatus	: <span className='blink'>SAVED "{newOption}"!</span>,
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
						newOptionSaveStatus : <span className='blink'>FAILED SAVING! {result.added[props.name].message}</span>
					}));

					throw(new Error(`Failed saving new ${props.name}. No DB rows affected`));
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

				console.log(`Fetch Promise Error Saving New ${props.name} : ${error.message}`)
				console.log(error)
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
										placeholder	= {`Add a New ${props.name}`} />

								<button type="button" onClick={handleNewOptionSubmit}>Add</button>
								{optionsState.newOptionSaveStatus}
							</form>

							{/* Lookp through existing list of categories to edit */}
							{Object.keys(optionsState.optionsByName).map(key =>
								<div key		= {key}>
									<input	className	=  {optionsState.savedOption === optionsState.optionsById[optionsState.optionsByName[key]].name ? props.name + "saved" : props.name}
											type		= "text"
											value		= {optionsState.optionsById[optionsState.optionsByName[key]].name}
											data-id		= {optionsState.optionsByName[key]}
											data-testid	= {optionsState.optionsById[optionsState.optionsByName[key]].name}
											onChange	= {handleTextUpdate}
											onBlur		= {handleOptionBlur} />
									{optionsState.optionsById[optionsState.optionsByName[key]].saveStatus}

									{props.name === "Series" &&
										<span className="series-manage">
											[<Link	to			=	{{
																		pathname	: `/series/${optionsState.optionsByName[key]}`,
																		state		: { name : optionsState.optionsById[optionsState.optionsByName[key]].name }
																	}}
													className	= "series-manage-click"
													data-testid	= {optionsState.optionsById[optionsState.optionsByName[key]].name + "_manage"}>
												manage
											</Link>]
										</span>
									}
								</div>
							)}
						</div>
					</div>
			}
	}

	return <>{form()}</>
}