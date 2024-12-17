import React from "react";
import { Editor } from "@tinymce/tinymce-react";
import { getSelectDateOptions } from "../helpers/form";
import {
    TextField,
    MenuItem,
    Select,
    Button,
    InputLabel,
    FormControl,
    Box,
    Grid2,
} from "@mui/material";

const Form = ({
    form,
    handleSubmit,
    handleTextUpdate,
    handleCategoryInput,
    categoryOverlay,
    categoryNamesSelectedDisplay,
    handleSeriesSelection,
    series,
    seriesSelectedDisplay,
    handleEditorChange,
    handleSaveDraft,
    saveStatus,
    saveDraftStatus,
    savedPostCategoriesStatus,
    savedPostFlickrSetStatus,
    savedPostSeriesStatus,
    deletedPostSeriesStatus,
    deletedPostCategoriesStatus,
}) => (
    <Box className="edit" p={3}>
        <form method="post" onSubmit={handleSubmit}>
            <Grid2 container spacing={2}>
                {/* Title Field */}
                <Grid2 size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={form.title}
                        onChange={handleTextUpdate}
                        variant="outlined" />
                </Grid2>

                {/* Teaser Field */}
                <Grid2 size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="Teaser"
                        name="teaser"
                        value={form.teaser}
                        onChange={handleTextUpdate}
                        variant="outlined" />
                </Grid2>

                {/* Meta Description Field */}
                <Grid2 size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="Meta Description"
                        name="metaDescription"
                        value={form.metaDescription}
                        onChange={handleTextUpdate}
                        variant="outlined" />
                </Grid2>

                {/* Meta Keywords Field */}
                <Grid2 size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="Meta Keywords"
                        name="metaKeyWords"
                        value={form.metaKeyWords}
                        onChange={handleTextUpdate}
                        variant="outlined" />
                </Grid2>

                {/* Publish Date Selectors */}
                <Grid2 size={{ xs: 12 }} container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 8 }} container spacing={2} style={{ width: "auto" }}>
                        <Grid2 size={{ xs: 4, md: 4 }} style={{ width: "auto" }}>
                            <FormControl fullWidth>
                                <InputLabel>Year</InputLabel>
                                <Select
                                    name="publishYear"
                                    value={form.publishYear || Date().getFullYear()}
                                    onChange={handleTextUpdate}
                                    label="Year"
                                >
                                    {getSelectDateOptions.years().map((year) => (
                                        <MenuItem key={year.props.value} value={year.props.value}>
                                            {year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 4, md: 2 }} style={{ width: "auto" }}>
                            <FormControl fullWidth>
                                <InputLabel>Month</InputLabel>
                                <Select
                                    name="publishMonth"
                                    value={form.publishMonth}
                                    onChange={handleTextUpdate}
                                    label="Month"
                                >
                                    {getSelectDateOptions.months().map((month) => (
                                        <MenuItem key={month.props.value} value={month.props.value}>
                                            {month}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 4, md: 2 }} style={{ width: "auto" }}>
                            <FormControl fullWidth>
                                <InputLabel>Day</InputLabel>
                                <Select
                                    name="publishDay"
                                    value={form.publishDay}
                                    onChange={handleTextUpdate}
                                    label="Day"
                                >
                                    {getSelectDateOptions.days().map((day) => (
                                        <MenuItem key={day.props.value} value={day.props.value}>
                                            {day}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 4 }} container spacing={2}>
                        <Grid2 size={{ xs: 4, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Hour</InputLabel>
                                <Select
                                    name="publishHour"
                                    value={form.publishHour}
                                    onChange={handleTextUpdate}
                                    label="Hour"
                                >
                                    {getSelectDateOptions.hours().map((hour) => (
                                        <MenuItem key={hour.props.value} value={hour.props.value}>
                                            {hour}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 2, md: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel>Minute</InputLabel>
                                <Select
                                    name="publishMinute"
                                    value={form.publishMinute}
                                    onChange={handleTextUpdate}
                                    label="Minute"
                                >
                                    {getSelectDateOptions.minutes().map((minute) => (
                                        <MenuItem key={minute.props.value} value={minute.props.value}>
                                            {minute}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid2>
                    </Grid2>
                </Grid2>

                {/* Categories Input */}
                <Grid2 size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        autoComplete="off"
                        label="Start Typing a Category"
                        name="categories"
                        value={form.categoryName}
                        onChange={handleCategoryInput}
                        variant="outlined" />
                    <Box>{categoryOverlay}</Box>
                    <Box>{categoryNamesSelectedDisplay}</Box>
                </Grid2>

                {/* Series Selector */}
                <Grid2 size={{ xs: 12 }}>
                    <FormControl fullWidth>
                        <InputLabel>Add to a Series</InputLabel>
                        <Select
                            name="series"
                            value={form.seriesId || ''}
                            onChange={handleSeriesSelection}
                            label="Add to a Series"
                        >
                            <MenuItem value="">-- Add to a Series --</MenuItem>
                            {series.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box>{seriesSelectedDisplay}</Box>
                </Grid2>

                {/* Flickr Set Selector */}
                <Grid2 size={{ xs: 12 }}>
                    <FormControl fullWidth>
                        <InputLabel>Attach To A Flickr Set</InputLabel>
                        <Select
                            name="flickrSetId"
                            value={form.flickrSetId || ''}
                            onChange={handleTextUpdate}
                            label="Attach To A Flickr Set"
                        >
                            <MenuItem value="">-- Attach To A Flickr Set --</MenuItem>
                            {form.flickrSets.map((set) => (
                                <MenuItem key={set.id} value={set.id}>
                                    {set.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid2>

                {/* TinyMCE Editor */}
                <Grid2 size={{ xs: 12 }}>
                    <Box className="editor">
                        <Editor
                            initialValue={form.content}
                            apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
                            init={{
                                menubar: false,
                                plugins: [
                                    "save advlist autolink lists link image charmap print preview anchor",
                                    "searchreplace visualblocks code fullscreen",
                                    "insertdatetime media table paste code help wordcount",
                                ],
                                toolbar: "save undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | code | help",
                                save_onsavecallback: () => { },
                            }}
                            onEditorChange={handleEditorChange}
                            onSaveContent={handleSaveDraft} />
                    </Box>
                </Grid2>

                {/* Submit Button */}
                <Grid2 size={{ xs: 12 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        data-testid="Save"
                    >
                        Save
                    </Button>
                </Grid2>

                {/* Status Messages */}
                <Grid2 size={{ xs: 12 }}>
                    {saveDraftStatus}
                    {saveStatus}
                    {deletedPostCategoriesStatus}
                    {savedPostCategoriesStatus}
                    {savedPostFlickrSetStatus}
                    {savedPostSeriesStatus}
                    {deletedPostSeriesStatus}
                </Grid2>
            </Grid2>
        </form>
    </Box>
);

export default Form;
