/*
	Form to edit and add blog posts
*/

import React, { useState, useEffect, useRef } from "react";
import Form from "./form";
import { checkAPIResponse, setSavedPostStatuses } from '../helpers/api'
import { getlistItemDisplay } from '../helpers/form'

export default function Edit(props) {
	let _isMounted			= useRef(false);
	const	intervalCountDown	= 5,
			date				= new Date(),

			// A new post will have a null value
			id					= props.match ? props.match.params.id : null,

			[apiResponsesState, setAPIResponsesState] = useState({
				// Loading Async Init
				id,
				error							: null,
				isLoaded						: false,
				isAdmin							: true,
				redirectCountDown				: intervalCountDown
			}),
			[categoriesState, setCategoriesState] = useState({
				// Category
				postCategories					: [],
				categories						: null,
				categoriesByName				: {},
				categoriesById					: [],
				categoryNamesSelectedDisplay	: [],
				categoriesSelectedLowerCased	: [],
				categoryOverlay					: null
			}),
			[series, setSeries] = useState({
				// Series
				series							: [],
				seriesByName					: {},
				seriesById						: [],
				seriesSelectedDisplay			: []
			}),
			/* [flickr, setFlickr] = useState({
				// Flickr Photos
				flickrSets						: []
			}), */
			[formState, setFormState] = useState({
				entryId					: null,
				title					: "",
				teaser					: "",
				metaDescription			: "",
				metaKeyWords			: "",
				content					: "",

				// Publish At Date
				publishAt				: "",
				publishYear				: date.getFullYear(),
				publishMonth			: date.getMonth()+1,
				publishDay				: date.getDate(),
				publishHour				: date.getHours(),
				publishMinute			: date.getMinutes(),

				// Categories
				categoryName			: "",
				categoryNamesSelected 	: [],

				// Series
				seriesNameSelected		: [],
				postSeriesSelected		: [],

				// Flickr photos
				flickrSets				: [],
				flickrSetId				: ""
			}),
			[apiStatuses, setAPIStatuses] = useState({
				// API Post (Save) Statuses
				savedPostFlickrSet				: false,
				savedPostFlickrSetStatus		: null,

				deletedPostCategories			: false,
				deletedPostCategoriesStatus		: null,
				savedPostCategories				: false,
				savedPostCategoriesStatus		: null,

				savedPostSeries					: false,
				savedPostSeriesStatus			: null,
				deletedPostSeries				: false,
				deletedPostSeriesStatus			: null,

				updatePosted 					: false,
				saveStatus						: null,

				saveDraftStatus					: null
			});


		useEffect(() => {
			if(!_isMounted.current) {
				if(id) {
					const getData = async () => {
						const data = await getPost();

						setAPIResponsesState(data.apiResponse);
						setCategoriesState(data.categories);
						setSeries(data.series);
						setFormState(data.form);
						setIndexedStates(data.results.series, data.results.categories);
					}

					getData();
				}

				_isMounted.current = true;
			}

			//return () => _isMounted = false;
		}, []);

		useEffect(() => {
			if(!_isMounted.current) {
				if(!id) {
					// New Page refresh
					getNewPost();
					setPublishAtDate();
				}

				_isMounted.current = true;
			}
			//return () => _isMounted = false;
		}, []);


	// Common indexed states
	function setIndexedStates(series, categories) {
		const	seriesByName		= {},
				seriesById			= [],
				categoriesByName	= {},
				categoriesById		= [];

				// Access all series by name and id (reverse lookup)
		series.forEach(item => {
			seriesByName[item.name.toLowerCase()] = item.id;
			seriesById[item.id] = item.name; // don't change case. Displays in series search overlay results
		});

		// Access all categories by name and id (reverse lookup)
		categories.forEach(item => {
			categoriesByName[item.name.toLowerCase()] = item.id;
			categoriesById[item.id] = item.name; // don't change case. Displays in category search overlay results
		});

		//if(_isMounted) {
			setSeries(state => ({
				...state,
				seriesByName,
				seriesById
			}));

			setCategoriesState({
				...categoriesState,
				categoriesByName : categoriesByName,
				categoriesById : categoriesById
			});
		//}
	}

	// Retrieve existing post to edit
	// eslint-disable-next-line react-hooks/exhaustive-deps
	function getPost() {
		return new Promise(resolve => {
			fetch(`${process.env.REACT_APP_API_URL}/getPost/` + id)
			.then(res => checkAPIResponse(res))
			.then(
				result => {
					if(result && result.post && Array.isArray(result.post) && result.post.length === 1) {
						const 	post 							= result.post[0],
								publishDate 					= new Date(post.publishAt),

								// Manage Category Selection
								categoryNamesSelected 			= [],
								categoryNamesSelectedLowerCased = [],
								categoryNamesSelectedDisplay	= [],

								// Manage Series Selection
								seriesNameSelected				= [],
								seriesSelectedDisplay			= [];

						// ******* Populate Category Objects *******
							// Loop through categories already attached to a post
							result.postCategories.forEach(postCategory => {
								// Create arrays of normal and lowercased category names, for auto-complete use
								categoryNamesSelected.push(postCategory.name);
								categoryNamesSelectedLowerCased.push(postCategory.name.toLowerCase());

								// Create an array of html list elements to display categories
								categoryNamesSelectedDisplay.push(getlistItemDisplay(postCategory.name, postCategory.name, handleCategoryClickRemove));
							});


						// ******** Populate Series Objects *********
							// Loop through series already attached to a post
							result.postSeries.forEach(series => {
								// Add series to an array, to add/remove series, and post to save
								seriesNameSelected.push(series.name);

								// Create an array of html list elements to display series
								seriesSelectedDisplay.push(getlistItemDisplay(series.id, series.name, handleSeriesClickRemove));
							});

							resolve({
								results : {
									series		: result.series,
									categories	: result.categories
								},
								apiResponse : {
									...apiResponsesState,
									isLoaded			: true,
									isAdmin				: result.isAdmin
								},
								categories : {
									...categoriesState,
									categoryNamesSelectedDisplay,
									categoriesSelectedLowerCased	: categoryNamesSelectedLowerCased,
									postCategories					: result.postCategories,
									categories						: result.categories,
									categoryOverlay					: null
								},
								series : {
									...series,
									series							: result.series,
									seriesSelectedDisplay
								},
								form : {
									...formState,
									title					: post.title,
									teaser					: post.teaser,
									content					: post.content,
									metaDescription			: post.metaDescription,
									metaKeyWords			: post.metaKeyWords,
									publishAt				: post.publishAt,
									publishYear				: publishDate.getFullYear(),
									publishMonth			: publishDate.getMonth()+1,
									publishDay				: publishDate.getDate(),
									publishHour				: publishDate.getHours(),
									publishMinute			: publishDate.getMinutes(),
									entryId					: post.id,
									categoryNamesSelected	: categoryNamesSelected,
									seriesNameSelected,
									postSeriesSelected		: result.postSeries,
									flickrSets				: result.flickrSets || [],
									flickrSetId				: typeof(post.flickrSetId) === "undefined" || post.flickrSetId === null ? "" : post.flickrSetId
								}
							});

					} else {
						throw new Error("Result post response is invalid. Check API response")
					}
				},
				error => {
					//_isMounted &&
					setAPIResponsesState(state => ({
						...state,
						isLoaded	: false,
						error
					}));

					console.log("No Response from API to retrieve post", error)
				}
			).catch(error => {
				//_isMounted &&
				setAPIResponsesState(state => ({
					...state,
					isLoaded	: false,
					error
				}));

				console.error("API Request Fetch Error:", error)
			})
		});
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	function getNewPost() {
		fetch(`${process.env.REACT_APP_API_URL}/getNewPost`)
			.then(res => checkAPIResponse(res))
			.then(
				result => {
					if(result.series && result.categories && result.flickrSets) {
						const	tempForm = formState;

						setIndexedStates(result.series, result.categories);

						tempForm.flickrSets = result.flickrSets;

						//if(_isMounted) {
							setAPIResponsesState(state => ({
								...state,
								isLoaded	: true,
								isAdmin		: result.isAdmin}));


							setSeries(state => ({
								...state,
								series	: result.series
							}));

							setCategoriesState(_state => ({
								categories			: result.categories,
								categoryOverlay		: null
							}));

							setFormState(state => ({
								...state,
								form	: tempForm
							}));

						//}
					} else {
						throw new Error("Result new post response is invalid. Check API response")
					}
				},
				error => {
					//_isMounted &&
					setAPIResponsesState(state => ({
						...state,
						isLoaded	: false,
						error
					}));

					console.log("No Response from API to retrieve new post", error)
				}
			).catch(error => {
				//_isMounted &&
				setAPIResponsesState(state => ({
					...state,
					isLoaded	: false,
					error
				}));

				console.error("API Request Fetch Error for new post:", error)
			})
	}

	 // TinyMCE content field update
	function handleEditorChange(content) {
		setFormState(state => ({
			...state,
			content
			/* formState	: {
				...formState,
				content
			} */
		}));
	}

	// Format the publish date form fields into a valid date format
	// eslint-disable-next-line react-hooks/exhaustive-deps
	function setPublishAtDate() {
		const publishAt =	formState.publishYear +
							"-" +
							(formState.publishMonth < 10 ? "0" : "") +
							+
							formState.publishMonth +
							"-" +
							(formState.publishDay < 10 ? "0" : "") +
							formState.publishDay +
							" " +
							(formState.publishHour < 10 ? "0" : "") +
							formState.publishHour +
							":" +
							(formState.publishMinute < 10 ? "0" : "") +
							formState.publishMinute +
							":00";

		setFormState(state => ({
			...state,
			publishAt
			/* form	: {
				...formState,
				publishAt
			} */
		}));
	}

	// Set form fields state
	function handleTextUpdate(event) {
		const	fieldName	= event.target.name;

		setFormState({
			...formState,
			[fieldName] : event.target.value
		});

		// Separate function for publish at field, to format a proper date
		if(["publishYear", "publishMonth", "publishDay", "publishHour", "publishMinute"].indexOf(fieldName) > -1) {
			setPublishAtDate();
		}
	}

	// Trigger when the user clicks to remove existing Categories applied to the post
	function handleCategoryClickRemove(event) {
		const	categoryNamesSelectedDisplay = [],
				// Remove the clicked on category from the existing list of categories selected
				categoryNamesSelected = formState.categoryNamesSelected.filter(categoryName => categoryName !== event.currentTarget.dataset.name);

		let 	categoriesSelectedLowerCased = [];
				//categoriesSelectedLowerCased = categories.categoriesSelectedLowerCased.slice(),

		// Then lowercase them for use in category search
		categoriesSelectedLowerCased = formState.categoryNamesSelected.map(category => category.toLowerCase());

		// Update the displayed list of categories selected
		for(let index in categoryNamesSelected) {
			categoryNamesSelectedDisplay.push(getlistItemDisplay(index, categoryNamesSelected[index], handleCategoryClickRemove));
		}

		// Replace displayed and searchable list of categories, and category form field, san removed category
		setCategoriesState({
			...categoriesState,
			categoryNamesSelectedDisplay,
			categoriesSelectedLowerCased
		});

		setFormState({
			...formState,
			categoryNamesSelected
		});
	}

	// User clicks to remove a series
	function handleSeriesClickRemove(event) {
		const	seriesSelectedDisplay = [], // temp variable to update series selected displayed to user
				// Update series submitted in form, without the removed series
				seriesNameSelected = formState.seriesNameSelected.filter(series => series !== event.currentTarget.dataset.name);

		// if series selected still exists, after removing one, then update the display list, san removed series.
		// Otherwise, the series selected/displayed is now empty.
		if(seriesNameSelected.length) {
			for(let index in seriesNameSelected) {
				// recreate the list of series selected
				seriesSelectedDisplay.push(getlistItemDisplay(index, seriesNameSelected[index], handleSeriesClickRemove));
			}
		}

		// Update state of series displayed to user and submitted in form
		setSeries({
			...series,
			seriesSelectedDisplay
		});

		setFormState({
			...formState,
			seriesNameSelected
		});
	}

	// From the category search modal results, add a category clicked, to the selected category list
	function handleCategoryClick(event) {
		const	categoryName					= event.currentTarget.dataset.value,
				categoryNamesSelected			= formState.categoryNamesSelected,
				categoryNamesSelectedDisplay	= categoriesState.categoryNamesSelectedDisplay,
				categoriesSelectedLowerCased 	= categoriesState.categoriesSelectedLowerCased;

		// If the category name is not already selected, then add to list of categories selected
		// Note: categories should't appear in search overlay, to select, if already selected
		if(categoryNamesSelected.indexOf(categoryName) === -1) {
			// Update the categories selected form key and lowercased comparison key
			categoryNamesSelected.push(categoryName);
			categoriesSelectedLowerCased.push(categoryName.toLowerCase());

			// Add selected category to the top of the categories selected display
			categoryNamesSelectedDisplay.unshift(getlistItemDisplay(categoryName, categoryName, handleCategoryClickRemove));

			// Update state of categories selected and clear the category overlay results
			setFormState(state => ({
				...state,
				categoryNamesSelected
			}));

			setCategoriesState(state => ({
				...state,
				categoryNamesSelectedDisplay,
				categoriesSelectedLowerCased,
				categoryOverlay	: ''
			}));
		}
	}

	function handleSearchResultsClose() {
		setCategoriesState(state => ({
			...state,
			categoryOverlay	: ''
		}));
	}

	const buildResultsOverlay = results =>
				<div className="search-results-container">
					<div className="close" onClick={handleSearchResultsClose}>x</div>
					<ul className="search-results-overlay">
						{
							results.length ?
								results.map((result, index) => (
									<li key			= {index}
										data-value	= {result}
										data-id		= {index}
										onClick		= {handleCategoryClick}>
										{result}
									</li>
								)) : "No Results Founds"
						}
					</ul>
				</div>

	const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	function handleCategoryInput(event) {
		const 	searchTerms	= event.target.value.toLowerCase().trim(),
				results 	= searchTerms.length ? categoriesState.categoriesById.filter(term => {
								const regex = RegExp(escapeRegExp(searchTerms), "gi");

								// Found by regular expression and not in current categories list
							return (regex.test(term) && categoriesState.categoriesSelectedLowerCased.indexOf(term.toLowerCase()) === -1);
						}) : '';

		setCategoriesState({
			...categoriesState,
			categoryOverlay	: searchTerms.length ? buildResultsOverlay(results, searchTerms) : ''
		});

		setFormState({
			...formState,
			categoryName : event.target.value
		})
	}

	function handleSeriesSelection(e) {
		let seriesSelectedDisplay 	= series.seriesSelectedDisplay,
			postSeriesSelected		= formState.postSeriesSelected,
			seriesNameSelected		= formState.seriesNameSelected,
			id						= e.target.value,
			name					= series.seriesById[id];

		seriesSelectedDisplay.push(getlistItemDisplay(id, name, handleSeriesClickRemove));

		postSeriesSelected.push({
			id, name
		})

		seriesNameSelected.push(name);

		setSeries(state => ({
			...state,
			seriesSelectedDisplay
		}));

		setFormState(state => ({
			...state,
			postSeriesSelected,
			seriesNameSelected
		}));
	}

	const getAlertSaveStatus = postAdded =>
		<div className="alert alert-success">
			Post Successfully Saved{postAdded ? `...Redirecting in ${apiResponsesState.redirectCountDown} Seconds` : ""}
		</div>

	function handleSubmit(event) {
		let action = apiResponsesState.id ? "updatePost" : "addPost";

		event.preventDefault();

		// Save post to database
		fetch(`${process.env.REACT_APP_API_URL}/${action}`, {
				method	: 'POST',
				body	: JSON.stringify(formState),
				headers	: {	'Content-Type': 'application/json'}
			})
			.then(res => checkAPIResponse(res))
			.then(json => {
				let savedPostStatuses = new Set();

				// Display alert messages for components of form
				savedPostStatuses.add(setSavedPostStatuses("Deleted Post Categories", "deletedPostCategories", json, this));
				savedPostStatuses.add(setSavedPostStatuses("Saved Post Categories", "savedPostCategories", json, this));
				savedPostStatuses.add(setSavedPostStatuses("Saved Flickr Set", "savedPostFlickrSet", json, this));
				savedPostStatuses.add(setSavedPostStatuses("Saved Post Series", "savedPostSeries", json, this));
				savedPostStatuses.add(setSavedPostStatuses("Deleted Post Series", "deletedPostSeries", json, this));
				savedPostStatuses.delete(null);

				// Check status of main elements of form (no including components above)
				if(json.savePost && json.savePost.affectedRows && json.savePost.affectedRows > 0) {
					// Main form saved successfully

					// Check if adding a new post or editing an existing one
					let  postAdded = action === "addPost" && json.savePost.insertId > 0 ? true : false;

					// Depending on edit or add, set state to display correct message
					setAPIResponsesState(state => ({
						...state,
						id		: postAdded ? json.savePost.insertId : apiResponsesState.id,
					}));

					setAPIStatuses(state => ({
						...state,
						updatePosted	: true,
						saveStatus		: getAlertSaveStatus(postAdded)
					}));

					if(postAdded) {
						// A new post was added. Set a countdown for a redirect to the edit form
						setInterval(() => {
							setAPIResponsesState(state => ({
								...state,
								redirectCountDown : apiResponsesState.redirectCountDown - 1
							}));

							setAPIStatuses(state => ({
								...state,
								saveStatus : getAlertSaveStatus(true)
							}));
						}, 1000);

						// Redirect to Edit form
						setTimeout(() => {
							document.location.href = `/posts/edit/${json.savePost.insertId}`;
						}, 5000);
					} else {
						// Edit saved, clear out success message in 5 seconds
						setTimeout(() => this.setState({
							saveStatus	: null
						}), 5000);
					}

				} else {
					// Post was not saved successfully. Display error return or unknown for none
					this.setState({
						updatePosted	: false,
						saveStatus		: 	<div className="alert alert-danger">Error Saving Post.
												{	json.savePost && json.savePost.message && json.savePost.message.length ?
														" " + json.savePost.message : " Unknown Error."
												}
											</div>
					});
				}


			},
			error => console.log("No Response from API saving post", error)
		).catch(error => console.error("API Request Fetch Error saving post:", error));
	}

	function handleSaveDraft() {

		this.setState({
			saveDraftStatus	: <div className="alert alert-success">Saving draft...</div>
		})

		// Save draft to database
		fetch(`${process.env.REACT_APP_API_URL}/saveDraft`, {
			method	: 'POST',
			body	: JSON.stringify(formState),
			headers	: {	'Content-Type': 'application/json'}
		})
		.then(res => checkAPIResponse(res))
		.then(json => {
			(json.status && json.status.affectedRows && json.status.affectedRows > 0) &&
				setAPIStatuses(state => ({
					...state,
					updatePosted	: true,
					saveDraftStatus	: <div className="alert alert-success">Draft Saved!!!</div>
				}));

				setTimeout(() => setAPIStatuses(state => ({
					...state,
					saveDraftStatus : null
				})), 5000);
			}, error => console.log("No Response from API saving draft", error)
		).catch(error => console.error("API Request Fetch Error saving draft:", error));
	}

	function post() {
		const	demoMessage = !apiResponsesState.isAdmin && <div className="alert alert-danger">Demo Mode</div>;

		if (apiResponsesState.error) {
			return <div>Error: {apiResponsesState.error.message}</div>;
		  } else if (!apiResponsesState.isLoaded) {
			return <div>Loading...</div>;
		  } else {
			return <>{demoMessage}
					<Form	form							= {formState}

							// Handlers
							handleCategoryInput				= {handleCategoryInput}
							handleTextUpdate				= {handleTextUpdate}
							handleSubmit					= {handleSubmit}
							handleEditorChange				= {handleEditorChange}
							handleSaveDraft					= {handleSaveDraft}
							handleSeriesSelection			= {handleSeriesSelection}

							// Category Selection
							categoryOverlay					= {categoriesState.categoryOverlay}
							categoryNamesSelectedDisplay	= {categoriesState.categoryNamesSelectedDisplay}

							// Series Selection
							series							= {series.series}
							seriesSelectedDisplay			= {series.seriesSelectedDisplay}

							// Save Statuses
							saveStatus						= {apiStatuses.saveStatus}
							saveDraftStatus					= {apiStatuses.saveDraftStatus}

							deletedPostCategoriesStatus		= {apiStatuses.deletedPostCategoriesStatus}
							savedPostCategoriesStatus		= {apiStatuses.savedPostCategoriesStatus}
							savedPostFlickrSetStatus		= {apiStatuses.savedPostFlickrSetStatus}
							savedPostSeriesStatus			= {apiStatuses.savedPostSeriesStatus}
							deletedPostSeriesStatus			= {apiStatuses.deletedPostSeriesStatus}
					/>
			</>
		}
	}

	return <div>{post()}</div>
}