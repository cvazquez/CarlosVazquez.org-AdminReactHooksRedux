// Current state of tabs editing
const iniialState = {
    postEdits	: [
    /* {	draftId	: 0,
				title	: "Test",
				content	: "",
				saved	: false,

		} */
    ]
};

export default function postEditsReducer(state = iniialState, action) {
    switch(action.type) {
        case "postEdits/added":
            return {
                ...state,
                postEdits	: [
                    ...state.postEdits,
                    {
                        draftId			: action.payload.draftId,
                        title			: action.payload.title,
                        teaser			: action.payload.teaser,
                        metaDescription	: action.payload.metaDescription,
                        metaKeyWords	: action.payload.metaKeyWords,
                        content			: action.payload.content,

                        // Publish At Date
                        publishAt		: action.payload.publishAt,
                        publishYear		: action.payload.publishYear,
                        publishMonth	: action.payload.publishMonth,
                        publishDay		: action.payload.publishDay,
                        publishHour		: action.payload.publishHour,
                        publishMinute	: action.payload.publishMinute,

                        //Options
                        categories	: action.payload.categories,
                        series		: action.payload.series,
                        flickrId	: action.payload.flickrId,
                    }
                ]
            }
        default:
            return state
    }
}