/*
	 Display a list of Blog posts to Edit/Deactivate

	 TODOS:
		 * Add ability to show deactivated posts
		 * Add ability to sort title, id and date columns
 */

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"
import useDeactivateModal from "./modals/useDeactivate";
import { getPosts } from "./apis/posts";
import { showDemoMessage } from "../helpers/login";
import { useSelector } from "react-redux";


export default function Posts() {
    const	[apiResponses, setAPIResponses] = useState({
            // Async check if posts have loaded
            error		: null,
            isLoaded	: false,
            isAdmin		: true, // temporary (fake) security for demoing

            // Posts loaded from API call
            activeEntries	: []
        }),
        deactivateModal = useDeactivateModal(),
        unMounted		= useRef(false),
        posts 			= useSelector(state => state.posts);

    deactivateModal.referenceAPIResponses(setAPIResponses);

    useEffect(() => {
        async function getData(posts) {
            let data = await posts;

            if(posts.isLoaded) {
                data = posts;
                data.activeEntries = data.entries;
            } else {
                data = await getPosts();
            }

            data.isLoaded ?
                setAPIResponses(state => ({
                    ...state,
                    isLoaded		: data.isLoaded,
                    activeEntries	: data.activeEntries,
                    isAdmin			: data.isAdmin
                }))
                :
                setAPIResponses(state => ({
                    ...state,
                    isLoaded	: false,
                    error		: data.error
                }));
        }

        if(!unMounted.current) {
            getData(posts);
        }

        return () => unMounted.current = true;
    }, [posts])

    // When a post's Deactivate link is clicked
    function handleDeleteClick(e) {
        const	post	= e.currentTarget.dataset; // Title and id of the post clicked

        // Add an opaque overlay over entire body
        document.body.classList.add("overlay");

        deactivateModal.setModal(modal => ({
            ...modal,
            activate	: true,
            title		: post.title,
            id			: post.id,
            entries		: apiResponses.activeEntries
        }));
    }


    if (apiResponses.error) {

        // Display error message from the API call
        return <div>Error: {apiResponses.error.message}</div>;

    } else if (!apiResponses.isLoaded) {

        // While the API call is waiting for a response
        return <div>Loading...</div>;

    } else {
    // API call response is successful. Display list of posts.
    // display list of posts to edit/deactivate
        return <>
            {	// When Deactivate is clicked, display the confirmation modal
                deactivateModal.display()
            }
            {showDemoMessage(!apiResponses.isAdmin)}

            <div className="grid-container posts">
                <div className="grid-header-wrapper">
                    <div>Id</div>
                    <div>Title</div>
                    <div>Actions</div>
                    <div>Created</div>
                    <div>Published</div>
                    <div>Deleted</div>
                </div>
                {	// Loop through list of posts and display, with id, title, dates and links to Edit/Deactivate,
                    apiResponses.activeEntries.map(entry => (
                        <React.Fragment key={entry.id}>
                            <div className="grid-row-wrapper"
                            >
                                <div>{entry.id}</div>
                                <div>{entry.title}</div>
                                <div>
                                    <Link	to			= {`/posts/edit/${entry.id}`}
                                        key			= {`Entry${entry.id}`}
                                        className	= "edit"
                                        data-testid	= {entry.id}>
                                        Edit&nbsp;
                                    </Link>
                                    <span
                                        onClick		= {handleDeleteClick}
                                        onKeyDown   ={handleDeleteClick}
                                        data-id		= {entry.id}
                                        data-title	= {entry.title}
                                        className	= "delete"
                                        role        = "button"
                                        tabIndex    = {0}>
                                        Deactivate
                                    </span>
                                </div>
                                <div>{entry.createdAt}</div>
                                <div>{entry.publishAt}</div>
                                <div>{entry.deletedAt}</div>
                            </div>
                        </React.Fragment>
                    ))
                }
            </div>
        </>
    }
}