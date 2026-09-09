import { resumeUpload, startUpload, stopUpload } from "./resumeUploadLogic.js";

const progressBar = document.querySelector('#upload-progress');
const progressText = document.querySelector('#upload-percent');

const uploadForm = document.querySelector('#upload-form');

const uploadButton = uploadForm.querySelector('#upload-btn');
const pauseButton = uploadForm.querySelector('#pause-btn');
const stopButton = uploadForm.querySelector('#stop-btn');

// variable for sharing the state
let isPaused = false; 
let isStopping = false;
let currentUploadSessionId = null;


uploadForm.addEventListener('submit', handleSubmit);
pauseButton.addEventListener('click', handlePause);
stopButton.addEventListener('click', handleStop);

async function handlePause(){
    isPaused = true;
    pauseButton.hidden = true;
    stopButton.hidden = true;
    uploadButton.hidden = false;
    uploadButton.textContent = "Resume Upload";
    console.log('pause clicked');
}

function showAvailableButtons(){
    isPaused = false;
    isStopping = false;
    uploadButton.hidden = true;
    pauseButton.hidden = false;
    stopButton.hidden = false;
    stopButton.disabled = false;
    stopButton.textContent = "Stop Upload";
}

async function handleStop(){
    console.log("stop clicked");
    console.log(currentUploadSessionId);
    if(!currentUploadSessionId) return;
    const confirmed = confirm("Are you sure you want to stop and discard this Upload? ");
    if(!confirmed) return;

    isStopping = true;
    isPaused = true;

    stopButton.disabled = true;
    pauseButton.disabled = true;
    stopButton.textContent = "Stopping ...";

    try{
        const result = await stopUpload(currentUploadSessionId);
        if(result.alreadyCompleted){
            alert("Your file finished uploading just before you clicked stop. It has been saved.");
            const folderId = document.querySelector('input[name="folderId"]').value;
            window.location.href = folderId ? `/folders/${folderId}` : '/';
        }
        else{
            alert ("Upload cancelled and discarded");
            window.location.href = '/';
        }

    }catch(err){
        console.log(err);
        alert("something went wrong while stopping the upload: " + err.message);
        stopButton.disabled = false;
        pauseButton.disabled = false;
        stopButton.textContent = "Stop Upload";
        isStopping = false;
        isPaused = false;
    }

}


async function handleSubmit(e) {

    const onSessionCreated = (sessionId) => {
        currentUploadSessionId = sessionId;
    };

    e.preventDefault();
    showAvailableButtons();


    try {
        const file = document.querySelector('#up_file').files[0];
        const folderId = document.querySelector('input[name="folderId"]').value;
        const uploadSessionId = document.querySelector('input[name="uploadSessionId"]').value;

        if (!file) {
            alert("please select a file");
            uploadButton.hidden = false;
            pauseButton.hidden = true;
            stopButton.hidden = true;
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
                currentUploadSessionId = sessionId;
                result = await resumeUpload(sessionId, file, progressBar, progressText, () => isPaused);
            }
            else{
                alert("you didn't select the same file");
                document.querySelector('#up_file').value = "";
                uploadButton.hidden = false;
                pauseButton.hidden = true;
                stopButton.hidden = true;
                return ; 
            }

        }
        else {
            // normal uplaod
            result = await startUpload(file, progressBar, progressText, file_metaData, () => isPaused, onSessionCreated);
        }
        
        // redirect to home page or to the specific folder
        if(! isPaused){
            window.location.href = folderId ? `/folders/${folderId}` : '/';
        }
    } catch (err) {
        if(isStopping) return;
        console.log(err);
        alert(err.message);
        uploadButton.hidden = false;
        pauseButton.hidden = true;
        stopButton.hidden = true;
        isPaused = false;
        currentUploadSessionId = null;
    }
}