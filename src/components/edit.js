/*
	Form to edit and add blog posts
*/

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import Form from "./form";
import { checkAPIResponse, setSavedPostStatuses } from "../helpers/api";
import { getlistItemDisplay } from "../helpers/form";
import { showDemoMessage } from "../helpers/login";

// eslint-disable-next-line
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

export default function Edit() {
    const	intervalCountDown	= 5,
        date				= new Date(),
        { id } 				= useParams(),
        [apiResponsesState, setAPIResponsesState] = useState({
            // Loading Async Init
            id								: id ? id : null, // A new post will have a null value
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
        [seriesState, setSeriesState] = useState({
            // Series
            series							: [],
            seriesByName					: {},
            seriesById						: [],
            seriesSelectedDisplay			: []
        }),

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

    const [initialContent, setInitialContent] = useState('');

    let _isMounted			= useRef(false),
        _isMountedAdd		= useRef(false);

    // Common indexed states
    const updateIndexedStates = useCallback(
        (series, categories) => {
            const	seriesByName		= {},
                seriesById			= [],
                categoriesByName	= {},
                categoriesById		= [];

            // Access all series by name and id (reverse lookup)
            series.series.forEach(item => {
                seriesByName[item.name.toLowerCase()] = item.id;
                seriesById[item.id] = item.name; // don't change case. Displays in series search overlay results
            });

            // Access all categories by name and id (reverse lookup)
            categories.categories.forEach(item => {
                categoriesByName[item.name.toLowerCase()] = item.id;
                categoriesById[item.id] = item.name; // don't change case. Displays in category search overlay results
            });

            setSeriesState(state => ({
                ...state,
                seriesByName,
                seriesById
            }));

            setCategoriesState(state => ({
                ...state,
                categoriesByName,
                categoriesById
            }));
        }, []
    );

    // Edit existing Post
    useEffect(() => {
        if(!_isMounted.current) {
            if(id) {
                const getData = async () => {
                    const data = await getPost(id);

                    setAPIResponsesState(data.apiResponse);
                    setFormState(data.form);
                    setInitialContent(data.form.content);
                    setCategoriesState(state => ({
                        ...state,
                        ...data.categories
                    }));
                    setSeriesState(state => ({
                        ...state,
                        ...data.series
                    }));
                    updateIndexedStates(data.series, data.categories);
                };

                getData();
            }

            _isMounted.current = true;
        }

        return () => _isMounted.current;
    }, [getPost, updateIndexedStates, id]);

    // Add a new post
    useEffect(() => {

        async function getNewData() {
            // New Page refresh
            getNewPost();
            setPublishAtDate();
        }

        if(!_isMountedAdd.current) {
            if(!apiResponsesState.id) {
                getNewData();
            }

            _isMountedAdd.current = true;
        }
        return () => _isMountedAdd.current;
    }, [apiResponsesState.id, getNewPost, setPublishAtDate]);

    // Update publish date if any of the publish date fields update
    useEffect(() => {
        setPublishAtDate();
    }, [	formState.publishYear,
        formState.publishMonth,
        formState.publishDay,
        formState.publishHour,
        formState.publishMinute]);

    // Retrieve existing post to edit
    function getPost(id) {
        return new Promise(resolve => {
            fetch(`${REACT_APP_API_URL}/getPost/` + id)
                .then(res => checkAPIResponse(res))
                .then(
                    result => {
                        if(result && result.post && Array.isArray(result.post) && result.post.length === 1) {
                            const 	[ post ]						= result.post,
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
                                categoryNamesSelectedDisplay.push(
                                    getlistItemDisplay(postCategory.name, postCategory.name, handleCategoryClickRemove)
                                );
                            });


                            // ******** Populate Series Objects *********
                            // Loop through series already attached to a post
                            result.postSeries.forEach(series => {
                                // Add series to an array, to add/remove series, and post to save
                                seriesNameSelected.push(series.name);

                                // Create an array of html list elements to display series
                                seriesSelectedDisplay.push(
                                    getlistItemDisplay(series.id, series.name, handleSeriesClickRemove));
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
                                    ...seriesState,
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
                            throw new Error("Result post response is invalid. Check API response");
                        }
                    },
                    error => {
                        setAPIResponsesState(state => ({
                            ...state,
                            isLoaded	: false,
                            error
                        }));

                        // eslint-disable-next-line no-console
                        console.log("No Response from API to retrieve post", error);
                    }
                ).catch(error => {
                    setAPIResponsesState(state => ({
                        ...state,
                        isLoaded	: false,
                        error
                    }));

                    // eslint-disable-next-line no-console
                    console.error("API Request Fetch Error:", error);
                });
        });
    }

    function getNewPost() {
        fetch(`${REACT_APP_API_URL}/getNewPost`)
            .then(res => checkAPIResponse(res))
            .then(
                result => {
                    if(result.series && result.categories && result.flickrSets) {
                        const	tempForm = formState;

                        updateIndexedStates({series : result.series}, {categories: result.categories});

                        tempForm.flickrSets = result.flickrSets;

                        setAPIResponsesState(state => ({
                            ...state,
                            isLoaded	: true,
                            isAdmin		: result.isAdmin}));


                        setSeriesState(state => ({
                            ...state,
                            series	: result.series
                        }));

                        setCategoriesState(_state => ({
                            ..._state,
                            categories			: result.categories,
                            categoryOverlay		: null
                        }));

                        setFormState(state => ({
                            ...state,
                            form		: tempForm,
                            flickrSets	: result.flickrSets || []
                        }));

                    } else {
                        throw new Error("Result new post response is invalid. Check API response");
                    }
                },
                error => {
                    setAPIResponsesState(state => ({
                        ...state,
                        isLoaded	: false,
                        error
                    }));

                    // eslint-disable-next-line no-console
                    console.log("No Response from API to retrieve new post", error);
                }
            ).catch(error => {
                setAPIResponsesState(state => ({
                    ...state,
                    isLoaded	: false,
                    error
                }));

                // eslint-disable-next-line no-console
                console.error("API Request Fetch Error for new post:", error);
            });
    }

    // TinyMCE content field update
    function handleEditorChange(content) {
        setFormState(state => ({
            ...state,
            content
        }));
    }

    // Format the publish date form fields into a valid date format
    function setPublishAtDate() {
        let {publishDay} = formState;

        // Check and fix if days are over Month Days limit
        if(formState.publishYear > 0 && formState.publishMonth > 0) {
            const lastDay = new Date(formState.publishYear, formState.publishMonth, 0).getDate();

            if(lastDay < publishDay) {
                publishDay = lastDay;

                setFormState(state => ({
                    ...state,
                    publishDay
                }));
            }
        }

        const publishAt =	formState.publishYear +
							"-" +
							(formState.publishMonth < 10 ? "0" : "") +
							+
							formState.publishMonth +
							"-" +
							(publishDay < 10 ? "0" : "") +
							publishDay +
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
        }));
    }

    // Set form fields state
    function handleTextUpdate(event) {
        const	fieldName	= event.target.name;

        setFormState(state => ({
            ...state,
            [fieldName] : event.target.value
        }));
    }

    // Trigger when the user clicks to remove existing Categories applied to the post
    function handleCategoryClickRemove(name) {
        const	categoryNamesSelectedDisplay = [];

        // Remove the clicked on category from the existing list of categories selected
        const    categoryNamesSelected = formState.categoryNamesSelected.filter(
            categoryName => categoryName !== name);

        // Then lowercase them for use in category search
        const 	categoriesSelectedLowerCased = categoryNamesSelected.map(category => category.toLowerCase());

        // Update the displayed list of categories selected
        for(let index in categoryNamesSelected) {
            categoryNamesSelectedDisplay.push(
                getlistItemDisplay(index, categoryNamesSelected[index], handleCategoryClickRemove));
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
    function handleSeriesClickRemove(name) {
        const	seriesSelectedDisplay = [], // temp variable to update series selected displayed to user
            // Update series submitted in form, without the removed series
            seriesNameSelected = formState.seriesNameSelected.filter((seriesName) => seriesName !== name);

        // if series selected still exists, after removing one, then update the display list, san removed series.
        // Otherwise, the series selected/displayed is now empty.
        if(seriesNameSelected.length) {
            for(let index in seriesNameSelected) {
                // recreate the list of series selected
                seriesSelectedDisplay.push(
                    getlistItemDisplay(index, seriesNameSelected[index], handleSeriesClickRemove));
            }
        }

        // Update state of series displayed to user and submitted in form
        setSeriesState({
            ...seriesState,
            seriesSelectedDisplay,
        });

        setFormState({
            ...formState,
            seriesNameSelected,
        });
    }

    // From the category search modal results, add a category clicked, to the selected category list
    function handleCategoryClick(event) {
        const	categoryName					= event.currentTarget.dataset.value,
            {categoryNamesSelected} = formState,
            {categoryNamesSelectedDisplay} = categoriesState,
            {categoriesSelectedLowerCased} = categoriesState;

        // If the category name is not already selected, then add to list of categories selected
        // Note: categories should't appear in search overlay, to select, if already selected
        if(categoryNamesSelected.indexOf(categoryName) === -1) {
            // Update the categories selected form key and lowercased comparison key
            categoryNamesSelected.push(categoryName);
            categoriesSelectedLowerCased.push(categoryName.toLowerCase());

            // Add selected category to the top of the categories selected display
            categoryNamesSelectedDisplay.unshift(
                getlistItemDisplay(categoryName, categoryName, handleCategoryClickRemove));

            // Update state of categories selected and clear the category overlay results
            setFormState(state => ({
                ...state,
                categoryNamesSelected
            }));

            setCategoriesState(state => ({
                ...state,
                categoryNamesSelectedDisplay,
                categoriesSelectedLowerCased,
                categoryOverlay	: ""
            }));
        }
    }

    function handleSearchResultsClose() {
        setCategoriesState(state => ({
            ...state,
            categoryOverlay	: ""
        }));
    }

    const buildResultsOverlay = results =>
        <div className="search-results-container">
            <div
                className   = "close"
                onClick     = {handleSearchResultsClose}
                onKeyDown   = {handleSearchResultsClose}
                tabIndex    = "0"
                role        = "button"
            >x</div>
            <ul className="search-results-overlay">
                {
                    results.length ?
                        results.map((result, index) => (
                            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                            <li key			= {index}
                                data-value	= {result}
                                data-id		= {index}
                                onClick		= {handleCategoryClick}
                                onKeyDown   = {handleCategoryClick}
                            >
                                {result}
                            </li>
                        )) : "No Results Found"
                }
            </ul>
        </div>;

    const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    function handleCategoryInput(event) {
        const 	searchTerms	= event.target.value.toLowerCase().trim(),
            results 	= searchTerms.length ? categoriesState.categoriesById.filter(term => {
                const regex = RegExp(escapeRegExp(searchTerms), "gi");

                // Found by regular expression and not in current categories list
                return (
                    regex.test(term) && categoriesState.categoriesSelectedLowerCased.indexOf(term.toLowerCase()) === -1
                );
            }) : "";

        setCategoriesState({
            ...categoriesState,
            categoryOverlay	: searchTerms.length ? buildResultsOverlay(results, searchTerms) : ""
        });

        setFormState({
            ...formState,
            categoryName : event.target.value
        });
    }

    function handleSeriesSelection(e) {
        let {seriesSelectedDisplay} = seriesState,
            {postSeriesSelected} = formState,
            {seriesNameSelected} = formState,
            id						= e.target.value,
            name					= seriesState.seriesById[id];

        seriesSelectedDisplay.push(getlistItemDisplay(id, name, handleSeriesClickRemove));

        postSeriesSelected.push({
            id, name
        });

        seriesNameSelected.push(name);

        setSeriesState({
            ...seriesState,
            seriesSelectedDisplay
        });

        setFormState({
            ...formState,
            postSeriesSelected,
            seriesNameSelected
        });
    }

    const getAlertSaveStatus = postAdded =>
        <div className="alert alert-success">
            Post Successfully Saved{postAdded ? `...Redirecting in ${apiResponsesState.redirectCountDown} Seconds` : ""}
        </div>;

    function handleSubmit(event) {
        let action = apiResponsesState.id ? "updatePost" : "addPost";

        event.preventDefault();

        // Save post to database
        fetch(`${REACT_APP_API_URL}/${action}`, {
            method	: "POST",
            body	: JSON.stringify(formState),
            headers	: {	"Content-Type": "application/json"}
        })
            .then(res => checkAPIResponse(res))
            .then(json => {
                let savedPostStatuses = new Set();

                // Display alert messages for components of form
                savedPostStatuses.add(setSavedPostStatuses("Deleted Post Categories", "deletedPostCategories", json, setAPIStatuses));
                savedPostStatuses.add(setSavedPostStatuses("Saved Post Categories", "savedPostCategories", json, setAPIStatuses));
                savedPostStatuses.add(setSavedPostStatuses("Saved Flickr Set", "savedPostFlickrSet", json, setAPIStatuses));
                savedPostStatuses.add(setSavedPostStatuses("Saved Post Series", "savedPostSeries", json, setAPIStatuses));
                savedPostStatuses.add(setSavedPostStatuses("Deleted Post Series", "deletedPostSeries", json, setAPIStatuses));
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
                        setTimeout(() => setAPIStatuses(state => ({
                            ...state,
                            saveStatus : null
                        })), 5000);
                    }

                } else {
                    // Post was not saved successfully. Display error return or unknown for none
                    setAPIStatuses(state => ({
                        ...state,
                        updatePosted	: false,
                        saveStatus		: 	<div className="alert alert-danger">Error Saving Post.
                            {	json.savePost && json.savePost.message && json.savePost.message.length ?
                                " " + json.savePost.message : " Unknown Error."
                            }
                        </div>
                    }));
                }
            },
            // eslint-disable-next-line no-console
            error => console.log("No Response from API saving post", error)
            // eslint-disable-next-line no-console
            ).catch(error => console.error("API Request Fetch Error saving post:", error));
    }

    function handleSaveDraft() {

        setAPIStatuses(state => ({
            ...state,
            saveDraftStatus	: <div className="alert alert-success">Saving draft...</div>
        }));

        // Save draft to database
        fetch(`${REACT_APP_API_URL}/saveDraft`, {
            method	: "POST",
            body	: JSON.stringify(formState),
            headers	: {	"Content-Type": "application/json"}
        })
            .then(res => checkAPIResponse(res))
            .then(json => {
                (json.status && json.status.affectedRows && json.status.affectedRows > 0) &&
				setAPIStatuses(state => ({ ...state, updatePosted	: true, saveDraftStatus : <div className="alert alert-success">Draft Saved!!!</div>}));
                setTimeout(() => setAPIStatuses(state => ({
                    ...state,
                    saveDraftStatus : null
                })), 5000);
            // eslint-disable-next-line no-console
            }, error => console.log("No Response from API saving draft", error)
            // eslint-disable-next-line no-console
            ).catch(error => console.error("API Request Fetch Error saving draft:", error));
    }

    function post() {
        if (apiResponsesState.error) {
            return <div>Error: {apiResponsesState.error.message}</div>;
        } else if (!apiResponsesState.isLoaded) {
            return <div>Loading...</div>;
        } else {
            return <>{showDemoMessage(!apiResponsesState.isAdmin)}
                <Form
                    form							= {formState}
                    initialContent                  = {initialContent}

                    // Handlers
                    handleCategoryInput				= {handleCategoryInput}
                    handleTextUpdate				= {handleTextUpdate}
                    handleSubmit					= {handleSubmit}
                    onEditorChange				    = {handleEditorChange}
                    handleSaveDraft					= {handleSaveDraft}
                    handleSeriesSelection			= {handleSeriesSelection}

                    // Category Selection
                    categoryOverlay					= {categoriesState.categoryOverlay}
                    categoryNamesSelectedDisplay	= {categoriesState.categoryNamesSelectedDisplay}

                    // Series Selection
                    series							= {seriesState.series}
                    seriesSelectedDisplay			= {seriesState.seriesSelectedDisplay}

                    // Save Statuses
                    saveStatus						= {apiStatuses.saveStatus}
                    saveDraftStatus					= {apiStatuses.saveDraftStatus}

                    deletedPostCategoriesStatus		= {apiStatuses.deletedPostCategoriesStatus}
                    savedPostCategoriesStatus		= {apiStatuses.savedPostCategoriesStatus}
                    savedPostFlickrSetStatus		= {apiStatuses.savedPostFlickrSetStatus}
                    savedPostSeriesStatus			= {apiStatuses.savedPostSeriesStatus}
                    deletedPostSeriesStatus			= {apiStatuses.deletedPostSeriesStatus}
                />
            </>;
        }
    }

    return <div>{post()}</div>;
}