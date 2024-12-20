// Helper functions to use in API calls
import React from "react";

function checkAPIResponse(res) {
    if(res.ok) {
    // Check if API response is JSON
        const contentType = res.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("API response is not JSON!");
        }

        return res.json();
    } else {
        // Invalid network response from API - Server is possibly down
        throw new Error("Invalid API network response: " + res.statusText + ` (${res.status}) - Check if API is running`);
    }
}

function setSavedPostStatuses(name, type, json, setStateHandler) {
    const	status	= json[type];

    if(status) {
        if(status.affectedRows && status.affectedRows > 0) {
            setStateHandler(state => ({
                ...state,
                [type]				: true,
                [type + "Status"]	: <div className="alert alert-success">{name}</div>
            }));
        } else if(status.failed) {
            const message = status.message ? status.message : (type + " Saving Error");

            setStateHandler(state => ({
                ...state,
                [type]				:	false,
                [type + "Status"]	:	<div className="alert alert-danger">
                    {message}
                </div>
            }));

            return message; // return which status failed
        }
    }

    return null;
}

export { checkAPIResponse, setSavedPostStatuses };