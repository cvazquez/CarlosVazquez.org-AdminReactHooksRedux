import React, { useState, useRef, useEffect } from "react";
import { checkAPIResponse } from '../helpers/api'
import { showDemoMessage } from '../helpers/login';

export default function Categories(props) {
		// Solves a Jest error
		const	_isMounted			= useRef(false),
				//_isMountedAdd		= useRef(false),
				[apiResponseState, setAPIResponseState] = useState({
					// api async call results
					error				: undefined,
					isLoaded			: false,
					isAdmin				: true
				}),
				[categoryState, setCategoryState] = useState({
					// Categories list to display and edit
					categoriesByName	: {},
					categoriesById		: {},

					// new category field
					newCategory			: "",

					// Toggles update alert className of existing category
					savedCategory		: null,

					// Toggles update alert className of new category
					newCategorySaveStatus : null
				}),
				categoriesByIdGlobal = []; // use for before and after state comparisons when saving

		// Request categories to display and edit
		function getCategories() {
			return new Promise(resolve => {
				fetch(`${process.env.REACT_APP_API_URL}/getCategories`)
					.then(res => checkAPIResponse(res))
					.then(
						result => {
							if(result.categories && Array.isArray(result.categories)) {
								const 	categoriesByName	= {},
										categoriesById		= {};

								result.categories.forEach(item => {
									// Get a categories id by name
									categoriesByName[item.name] = item.id;

									// Stores initial state of category id's name value, for comparison when value updates are made
									categoriesByIdGlobal[item.id] = item.name;

									// Get a categories name by id
									categoriesById[item.id] = {
										name		: item.name,
										saveStatus	: null}; // don't change case. Displays in category search overlay results
								});

								resolve({
									apiStates : {
										isLoaded	: true,
										isAdmin		: result.isAdmin
									},
									categoryStates : {
										categoriesByName,
										categoriesById
									}
								});
							} else {
								throw(new Error("getCategories() fetch missing categories array"));
							}
						},
						error => {

							setAPIResponseState(state => ({
								...state,
								isLoaded	: false,
								error
							}));

							console.log("No Response from API getting categories", error)
						}
					)}).catch(error => {

						setAPIResponseState(state => ({
							...state,
							error
						}));

						console.error("API Request Categories Fetch Error:", error);
				})
		}

		useEffect(() => {
			if(!_isMounted.current) {

				async function getData() {
					const data = await getCategories();

					setAPIResponseState(state => ({
						...state,
						...data.apiStates
					}));

					setCategoryState(state => ({
						...state,
						...data.categoryStates
					}));
				}

				getData();

				_isMounted.current = true;
			}

			return () => _isMounted.current;
		});

		function handleTextUpdate(e) {
			const	id				= e.currentTarget.dataset.id,
					categoriesById	= categoryState.categoriesById;

			categoriesById[id].name = e.target.value;

			setCategoryState(state => ({
				...state,
				categoriesById
			}));
		}

		function updateCategory(id, name, categoriesById) {
			fetch(`${process.env.REACT_APP_API_URL}/updateCategory`, {
				method	: 'POST',
				body	: JSON.stringify({id,name}),
				headers	: {	'Content-Type': 'application/json'}
			})
			.then(res => checkAPIResponse(res))
			.then( result => {
				if(result.affectedRows && result.affectedRows > 0) {

					categoriesById[id].saveStatus = <span className='blink'>SAVED!</span>;
					categoriesByIdGlobal[id] = name;

					setCategoryState(state => ({
						...state,
						categoriesById
					}));

					setTimeout(() => {
						categoriesById[id].saveStatus = null;

						setCategoryState(state => ({
							...state,
							categoriesById
						}));
					}, 5000)
				} else {
					categoriesById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

					setCategoryState(state => ({
						...state,
						categoriesById
					}));

					throw(new Error("Failed Saving updated category."))
				}
			},
			error => {
				categoriesById[id].saveStatus = <span className='blink'>FAILED SAVING!</span>;

				setCategoryState(state => ({
					...state,
					error,
					categoriesById
				}));

				console.log("No Response from API saving categories", error)
			}).catch(error => console.error("API Request Saving Updated category Fetch Error:", error));
		}

		// If a category is updated, post update to API to save to DB
		function handleCategoryBlur(e) {
			// A blanked out category will deactivate it
			const	id		= e.currentTarget.dataset.id,
					name	= e.target.value.trim();

			// Used to reinit the category names for comparison later
			let categoriesById = categoryState.categoriesById;

			// Category name didn't update, no need to save. Exit function
			if(categoriesByIdGlobal[id] === name) return;

			updateCategory(id, name, categoriesById)
		}

		function handleNewCategory(e) {
			// Normal react text field value update
			setCategoryState(state => ({
				...state,
				newCategory : e.target.value
			}));
		}

		function addCategory(newCategory) {
			fetch(`${process.env.REACT_APP_API_URL}/addCategory`, {
				method	: 'POST',
				body	: JSON.stringify({newCategory}),
				headers	: {	'Content-Type': 'application/json'}
			})
			.then(res => checkAPIResponse(res))
			.then( result => {
				if(result.addedCategory.affectedRows && result.addedCategory.affectedRows > 0) {

					// Add a blinking Saved message next to new category
					setCategoryState(state => ({
						...state,
						newCategorySaveStatus	: <span className='blink'>SAVED "{newCategory}"!</span>,
						savedCategory			: newCategory,
						newCategory				: ""
					}));

					getCategories();

					setTimeout(() => {
						// Clear saved message
						setCategoryState(state => ({
							...state,
							newCategorySaveStatus : null
						}));
					}, 5000);

				} else {
					setCategoryState(state => ({
						...state,
						newCategorySaveStatus : <span className='blink'>FAILED SAVING! {result.addedCategory.message}</span>
					}));

					throw(new Error("Failed saving new category. No DB rows affected"));
				}
			},
			error => {
				setCategoryState(state => ({
					...state,
					error,
					newCategorySaveStatus : <span className='blink'>FAILED SAVING!</span>
				}));

			}).catch(error => console.log("Fetch Promise Error Saving New Category"));
		}

		function handleNewCategorySubmit(e) {
			e.preventDefault();

			addCategory(categoryState.newCategory);
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
							{/* Form and field to save a new category */}
							<form action="POST" onSubmit={handleNewCategorySubmit}>
								<input	className	= "category"
										type		= "text"
										value		= {categoryState.newCategory}
										onChange	= {handleNewCategory}
										placeholder	= "Add a New Category" />

								<button type="button" onClick={handleNewCategorySubmit}>Add</button>
								<span className="new-category-save-status">{categoryState.newCategorySaveStatus}</span>
							</form>

							{/* Lookp through existing list of categories to edit */}
							{Object.keys(categoryState.categoriesByName).map(key =>
								<div key		= {key}>
									<input	className	=  {categoryState.savedCategory === categoryState.categoriesById[categoryState.categoriesByName[key]].name ? "category saved" : "category"}
											type		= "text"
											value		= {categoryState.categoriesById[categoryState.categoriesByName[key]].name}
											data-id		= {categoryState.categoriesByName[key]}
											data-testid	= {categoryState.categoriesById[categoryState.categoriesByName[key]].name}
											onChange	= {handleTextUpdate}
											onBlur		= {handleCategoryBlur} />
									<span className="category-save-status">{categoryState.categoriesById[categoryState.categoriesByName[key]].saveStatus}</span>
								</div>
							)}
						</div>
					</div>
			}
	}

	return <>{form()}</>
}