/*
	This Modal will display when a post's Deactivate link is clicked, to confirm the deactivation of a post
	Default is hidden
*/

import React, { useState } from 'react';
import { checkAPIResponse } from '../../helpers/api'


export default function useDeactivateModal(activate = false, title = "", id, ids = []) {

	let	[modal, setModal] = useState({
		// Deactivation confirmation overlay/modal and its properties
		activate,
		title,
		id, // Post currently deleting
		ids, // History of posts deleted, to use when refreshing active entries
		responseInvalid : undefined
	});

	// The user confirmation deactivation of the post. Send a request to API to deactivate in DB
	function handleDeleteOKClick() {
		fetch(`${process.env.REACT_APP_API_URL}/deactivatePostById/${this.modal.id}`)
			.then(res => checkAPIResponse(res))
			.then(result => {

				if(result.deactivated && result.deactivated.affectedRows && result.deactivated.affectedRows > 0) {
					// Process successfull deactivate response

					// get current list of deleted ids and append to
					let deletedIds = this.modal.ids;

					deletedIds.push(parseInt(this.modal.id));

					setModal({
						// Remove deleted posts from entries displayed to user
						activeEntries	: this.entries.filter(entry => deletedIds.indexOf(entry.id) === -1),

						// Update list of deleted post ids
						deletedIds
					});

					// Remove delete confirmation modal
					this.handleDeleteCancel();

				} else {
					// Post did NOT deactivate successfully. Display message to user.
					setModal({responseInvalid : "Error deactivating post. Try again."});

					throw new Error("Deactivate response is invalid. Check API response")
				}
			},
			error => {
				// Post did NOT deactivate successfully. Display message to user.
				setModal({responseInvalid : "Error deactivating post. Try again."});

				console.log("No Response from API to deactivate post", error)

			}).catch(error => {
				// Post did NOT deactivate successfully. Display message to user.
				setModal({deleteResponseInvalid	: "Error deactivating post. Try again."});

				console.error("API Request Fetch Error:", error)
			})
	}

	// removes the delete confirmation overlay/modal and its properties
	function handleDeleteCancel() {
		setModal({
			activate	 	: "",
			title			: "",
			id				: null,
			responseInvalid : null
		});

		document.body.classList.remove('overlay');
	}

	return	{
				display :	<div className={modal.activate ? "lightbox" : "hidden"}>
								<span	className	= {modal.activate ? "close-x" : "hidden"}
										onClick		= {handleDeleteCancel}>x</span>
								<div className="deactivation-confirmation">
									Confirm Deactivation of "{modal.title}"?

									<div className="deactivation-buttons">
										<button onClick	= {handleDeleteOKClick}>OK</button>
										<button onClick	= {handleDeleteCancel}>Cancel</button>
									</div>

									{modal.responseInvalid}
								</div>
							</div>,
				setModal
			}
}