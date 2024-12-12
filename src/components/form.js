import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { getSelectDateOptions } from "../helpers/form";


export default function Form({
    form, handleSubmit, handleTextUpdate,
    handleCategoryInput, categoryOverlay, categoryNamesSelectedDisplay,
    handleSeriesSelection, series, seriesSelectedDisplay,
    handleEditorChange, handleSaveDraft, saveStatus,
    saveDraftStatus, savedPostCategoriesStatus, savedPostFlickrSetStatus, savedPostSeriesStatus,
    deletedPostSeriesStatus, deletedPostCategoriesStatus,
}) {
    return	<div className="edit">
        <form method="post" onSubmit={handleSubmit}>
            <div className="meta-fields">
                <input 	type="text"
                    name="title"
                    value={form.title}
                    placeholder="Title"
                    onChange={handleTextUpdate} />

                <input 	type="text"
                    name="teaser"
                    value={form.teaser}
                    placeholder="Teaser"
                    onChange={handleTextUpdate} />

                <input 	type="text"
                    name="metaDescription"
                    value={form.metaDescription}
                    placeholder="Meta Description"
                    onChange={handleTextUpdate} />

                <input 	type="text"
                    name="metaKeyWords"
                    value={form.metaKeyWords}
                    placeholder="Meta Keywords"
                    onChange={handleTextUpdate} />

                <div>
                    <select	name		= "publishYear"
                        value		= {form.publishYear}
                        onChange	= {handleTextUpdate}>
                        {getSelectDateOptions.years()}
                    </select>
                    <select	name		= "publishMonth"
                        value		= {form.publishMonth}
                        onChange	= {handleTextUpdate}>
                        {getSelectDateOptions.months()}
                    </select>
                    <select	name		= "publishDay"
                        value		= {form.publishDay}
                        onChange	= {handleTextUpdate}>
                        {getSelectDateOptions.days()}
                    </select>

							&nbsp;&nbsp;&nbsp;
                    <select	name		= "publishHour"
                        value		= {form.publishHour}
                        onChange	= {handleTextUpdate}>
                        {getSelectDateOptions.hours()}
                    </select>
                    <select	name		= "publishMinute"
                        value		= {form.publishMinute}
                        onChange	= {handleTextUpdate}>
                        {getSelectDateOptions.minutes()}
                    </select>
                </div>

                <input	type		= "text"
                    autoComplete = "off"
                    name		= "categories"
                    placeholder	= "Start Typing a Category"
                    value		= {form.categoryName}
                    onChange	= {handleCategoryInput} />
                <div>{categoryOverlay}</div>
                <ul className="category-names-selected">{categoryNamesSelectedDisplay}</ul>

                <select name		= "series"
                    value		= {form.seriesId}
                    onChange	= {handleSeriesSelection}>
                    <option value="">-- Add to a Series --</option>
                    {series.map(series => (
                        <option key		= {series.id}
                            value	= {series.id}>
                            {series.name}
                        </option>
                    ))}
                </select>
                <ul className="series-names-selected">
                    {seriesSelectedDisplay}
                </ul>

                <select name		= "flickrSetId"
                    value		= {form.flickrSetId}
                    onChange	= {handleTextUpdate}>
                    <option value="">-- Attach To A Flickr Set --</option>
                    {form.flickrSets.map(flickrSet => (
                        <option key		= {flickrSet.id}
                            value	= {flickrSet.id}>
                            {flickrSet.title}
                        </option>
                    ))}
                </select>
            </div>

            {saveDraftStatus}

            <div className="editor">
                <Editor
                    initialValue	= {form.content}
                    apiKey			= {process.env.REACT_APP_TINYMCE_API_KEY}
                    init			= {{
                        menubar	: false,
                        plugins	: [
                            "save advlist autolink lists link image charmap print preview anchor",
                            "searchreplace visualblocks code fullscreen",
                            "insertdatetime media table paste code help wordcount"
                        ],
                        toolbar	:
									`save undo redo | formatselect | bold italic backcolor |
									alignleft aligncenter alignright alignjustify |
									bullist numlist outdent indent | removeformat | code | help`,
                        save_onsavecallback: function () {}
                    }}
                    onEditorChange	= {handleEditorChange}
                    onSaveContent	= {handleSaveDraft}
                />
            </div>

            {saveStatus}
            {deletedPostCategoriesStatus}
            {savedPostCategoriesStatus}
            {savedPostFlickrSetStatus}
            {savedPostSeriesStatus}
            {deletedPostSeriesStatus}

            <input	type		= "submit"
                name		= "submitPost"
                value		= "Save"
                data-testid	= "Save"  />
        </form>
    </div>;
}