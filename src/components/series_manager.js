import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {Link} from "react-router-dom";
import { checkAPIResponse } from "../helpers/api";
import { selectOptionsSequenceFactory } from "../helpers/form";
import { showDemoMessage } from "../helpers/login";

// eslint-disable-next-line
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

export default function SeriesManager() {
    const { id } 				= useParams();

    const [apiResponseState, setAPIResponseState] = useState({
            // api async call results
            error				: undefined,
            isLoaded			: false,
            isAdmin				: true
        }),
        [ seriesState, setSeriesState ] = useState({
            seriesPosts : [],
            name		: '',  // TODO - this will not exist when copy/pasting url
            postsById	: []
        });

    useEffect(() => {
        async function getData() {
            const data = await getSeriesPostsById(id);

            setAPIResponseState(state => ({
                ...state,
                isLoaded	: data.isLoaded,
                isAdmin		: data.isAdmin
            }));

            setSeriesState(state => ({
                ...state,
                seriesPosts	: data.seriesPosts,
                postsById	: data.postsById
            }));
        }

        getData();
    }, [id]);

    function getSeriesPostsById(id) {
        return new Promise(resolve => {
            fetch(`${REACT_APP_API_URL}/getSeriesPostsById/${id}`)
                .then(res => checkAPIResponse(res))
                .then(results => {
                    if(results.seriesPosts && Array.isArray(results.seriesPosts)) {

                        const postsById = [];

                        results.seriesPosts.forEach(post => {
                            postsById[post.entryId] = {
                                sequence	: post.sequence,
                                title		: post.title,
                                saveStatus	: null
                            };
                        });

                        resolve({
                            seriesPosts : results.seriesPosts,
                            loading		: false,
                            postsById,
                            isAdmin		: results.isAdmin
                        });
                    } else {
                        throw(new Error("API did not return any posts for this series. Try adding some."));
                    }
                },
                error => {
                    throw(new Error("getSeriesPostsById Error: ", error));
                });
        })
            .catch(error => {
                setAPIResponseState(state => ({
                    ...state,
                    error
                }));
            });
    }

    function updatePostSeriesSequence(postId, seriesId, sequence, postsById) {
        return new Promise( resolve => {
            fetch(`${REACT_APP_API_URL}/updatePostSeriesSequence`,
                {
                    method	: "POST",
                    body	: JSON.stringify({
                        postId,
                        seriesId,
                        sequence
                    }),
                    headers	: {	"Content-Type": "application/json"}
                })
                .then(res => checkAPIResponse(res))
                .then(results => {

                    if(
                        results.saveSequence
                        && results.saveSequence.affectedRows
                        && results.saveSequence.affectedRows === 1
                    ) {

                        // Display success save status of this post's sequence in series
                        postsById[postId].saveStatus = "Saved Successfully!";

                        resolve({
                            postsById
                        });

                    } else {

                        throw(new Error("Series Posts Update failed. No DB records updated. Refresh and try again."));
                    }

                },
                error => {
                    throw(new Error("Series Posts Update failed. API might be down. Refresh And Try Again. : ", error));
                });
        }).catch(error => {
            // Display failed save status of this post's sequence in series
            postsById[postId].saveStatus = "Failed saving!!";

            setSeriesState(state => ({
                ...state,
                postsById
            }));

            setAPIResponseState(state => ({
                ...state,
                error
            }));
        });
    }

    // The select options drop down of the posts sequence in the series was changed. Initiate an API change
    function handleSequenceChange(e) {
        const	sequence	= e.target.value,
            postId		= e.currentTarget.dataset.entryid,
            { postsById }	= seriesState;

        // Update the sequence of the post
        postsById[postId].sequence = sequence;

        // API call to DB update this posts series sequence
        async function updateData() {
            const data = await updatePostSeriesSequence(postId, id, sequence, postsById);

            setSeriesState(state => ({
                ...state,
                postsById	: data.postsById
            }));

            setTimeout(() => {
                // Remove display status
                data.postsById[postId].saveStatus = null;

                setSeriesState(state => ({
                    ...state,
                    postsById	: data.postsById
                }));
            }, 5000);
        }

        updateData();
    }

    function render() {

        if(apiResponseState.error) {
            return <>Error Loading This Series Post Sequence. Refresh page and try again.</>;
        } else if(apiResponseState.loading) {
            return <>Loading...</>;
        } else {
            /* 	For each post in a series,
				display a drop down sequence of numbers,
				from 1 to number of posts in the series,
				to control the order of each post in the series
			*/
            return <div className="series-manager">
                {showDemoMessage(!apiResponseState.isAdmin)}

                <div className="series-manager-name">{seriesState.name}</div>

                <ul className="series-sequences">
                    {	// Loop through each post in sequence
                        seriesState.seriesPosts.map(post => (
                            <li key={post.entryId}>

                                {/* Select the order this post should show in series list */}
                                <select	name			= "sequence"
                                    value			= {seriesState.postsById[post.entryId].sequence}
                                    data-entryid	= {post.entryId}
                                    onChange		= {handleSequenceChange}>
                                    {selectOptionsSequenceFactory(1, seriesState.seriesPosts.length)}
                                </select>

                                <Link to	= {`/posts/edit/${post.entryId}`}>
                                    {post.title}
                                </Link>
                                <span>{seriesState.postsById[post.entryId].saveStatus}</span>
                            </li>
                        ))}
                </ul>
            </div>;
        }
    }

    return render();
}