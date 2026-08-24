


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
            const { folderId, ...metaDataToVerify } = file_metaData;
            // verify the file
            const response = await fetch(`/uploads/${sessionId}/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({metaDataToVerify}),
            });

            const data = await response.json();
            if(data.valid){
                result = await resumeUpload(sessionId, file, progressBar, progressText, () => isPaused);
            }
            else{
                alert("you didn't select the same file");
                document.querySelector('#up_file').value = "";
                uploadButton.hidden = false;
                pauseButton.hidden = true;
                return ; 
            }

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