
import { resumeUpload, startUpload } from "./resumeUploadLogic.js";

const progressBar = document.querySelector('#upload-progress');
const progressText = document.querySelector('#upload-percent');

const uploadForm = document.querySelector('#upload-form');

const uploadButton = uploadForm.querySelector('#upload-btn');
const pauseButton = uploadForm.querySelector('#pause-btn');

let isPaused = false; // variable for sharing the state
let currentUploadSessionId = null;

// pauseButton.hidden = true;
// uploadButton.hidden = false;


uploadForm.addEventListener('submit', handleSubmit);
pauseButton.addEventListener('click', handlePause);

async function handlePause(){
    isPaused = true;
    pauseButton.hidden = true;
    uploadButton.hidden = false;
    uploadButton.textContent = "Resume Upload";
    console.log('pause clicked');
}

function showPauseButton(){
    isPaused = false;
    uploadButton.hidden = true;
    pauseButton.hidden = false;
}


async function handleSubmit(e) {
    e.preventDefault();
    showPauseButton();


    try {
        const file = document.querySelector('#up_file').files[0];
        const folderId = document.querySelector('input[name="folderId"]').value;
        const uploadSessionId = document.querySelector('input[name="uploadSessionId"]').value;

        if (!file) {
            alert("please select a file");
            uploadButton.disabled = false;
            pauseButton.disabled = true;
            return;
        }
        const file_metaData = {
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
            folderId: folderId || null,
        }
        const sessionId = currentUploadSessionId || uploadSessionId;
        let result;
        if (sessionId) {
            // validate the file if its the same file when the uploadSessionId is present.
            // this is a resume flow after interuption
            result = await resumeUpload(sessionId, file, progressBar, progressText, () => isPaused);
        }
        else {
            // normal uplaod
            result = await startUpload(file, progressBar, progressText, file_metaData, () => isPaused);
        }
        currentUploadSessionId = result.uploadSessionId;
        // redirect to home page or to the specific folder
        if(! isPaused){
            window.location.href = folderId ? `/folders/${folderId}` : '/';
        }
    } catch (err) {
        console.log(err);
        alert(err.message);
        uploadButton.hidden = false;
        pauseButton.hidden = true;
    }
}