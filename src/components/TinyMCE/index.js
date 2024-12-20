import React from "react";
import { Editor } from '@tinymce/tinymce-react';

const TinyMCE = ({ initialContent, updatedContent, onEditorChange, onSaveContent }) => (
    <>
        <Editor
            apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
            initialValue={initialContent}
            value={updatedContent}
            init={{
                height: 500,
                menubar: false,
                plugins: [
                    "save", "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                    "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                    "insertdatetime", "media", "table", "code", "help", "wordcount",
                ],
                toolbar: "save undo redo | formatselect | bold italic backcolor | " +
                "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | code | help",
            }}
            onEditorChange={onEditorChange}
            onSaveContent={onSaveContent}
        />
    </>
);

export default TinyMCE;