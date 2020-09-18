import { checkAPIResponse } from '../../helpers/api'

// API request blog posts, to display and edit
export function getPosts() {
	return new Promise(resolve => {
		fetch(`${process.env.REACT_APP_API_URL}/getPosts`)
		.then(res => checkAPIResponse(res))
		.then(
			result => {
				if(result.posts && Array.isArray(result.posts)) {
					// Update render state to display active entries only and replace loading text
					resolve({
						isLoaded		: true,
						activeEntries	: result.posts.filter(entry => entry.deletedAt === null),
						isAdmin			: result.isAdmin
					});


				} else {
						throw new Error("Result posts response is invalid. Check API response")
				}

			},
			error => {
				resolve({
					isLoaded	: false,
					error
				});

				console.log("No Response from API to retrieve posts", error)
			}
		)
		.catch(error => {
			resolve({
				isLoaded	: false,
				error
			});

			console.error("API Request Fetch Error:", error)
		})
	})

}