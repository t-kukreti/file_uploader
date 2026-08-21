import { resumeUpload, startUpload } from "./resumeUploadLogic.js";

const progressBar = document.querySelector('#upload-progress');
const progressText = document.querySelector('#upload-percent');

const uploadForm = document.querySelector('#upload-form');


uploadForm.addEventListener('submit', handleSubmit);


async function handleSubmit(e) {
    e.preventDefault();
    const submitButton = uploadForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    console.log(submitButton);
console.log(submitButton.disabled);
    try {

        const file = document.querySelector('#up_file').files[0];
        const folderId = document.querySelector('input[name="folderId"]').value;
        const uploadSessionId = document.querySelector('input[name="uploadSessionId"]').value;

        if (!file) {
            alert("please select a file");
            submitButton.disabled = false;
            return;
        }

        const file_metaData = {
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
            folderId: folderId || null,
        }

        if (uploadSessionId) {
            // validate the file if its the same file when the uploadSessionId is present.
            // this is a resume flow after interuption
            await resumeUpload(uploadSessionId, file, progressBar, progressText);
        }
        else {
            // normal uplaod
            await startUpload(file, progressBar, progressText, file_metaData);
        }
        // redirect to home page or to the specific folder
        window.location.href = folderId ? `/folders/${folderId}` : '/';
    } catch (err) {
        console.log(err);
        alert(err.message);
        submitButton.disabled = false;
    }
}