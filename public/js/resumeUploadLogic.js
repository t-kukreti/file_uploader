export const resumeUpload = async (uploadSessionId, file, progressBar, progressText, checkIsPaused, setCurrentXhr) => {
    // fetch the uploadState of current file
    const response = await fetch(`/uploads/${uploadSessionId}/uploadState`);

    if (!response.ok) {
        throw new Error("Error occurred while fetching upload state");
    }

    const uploadState = await response.json();
    const { partSize, fileMetaData, parts } = uploadState;

    // get expected parts
    const expectedPartCount = getExpectedPartCount(fileMetaData, partSize);
    // get missing parts
    const missingParts = getMissingParts(parts, expectedPartCount);

    const completedBytes = parts.reduce((total, part) => {
        const start = (part.partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);

        return total + (end - start);
    }, 0);


    // upload the parts
    const completed = await uploadParts(missingParts, partSize, file, uploadSessionId, progressBar, progressText, checkIsPaused, setCurrentXhr, completedBytes);
    // upload complete
    if (!completed) {
        return { uploadSessionId, completed: false };
    }
    await uploadPartsComplete(uploadSessionId);
    return { completed: true };
};

export const startUpload = async (file, progressBar, progressText, fileMetaData, checkIsPaused, onSessionCreated, setCurrentXhr) => {
    // send metadata
    const { partSize, uploadSessionId } = await sendFileMetaData(fileMetaData);
    // set currentSessionId
    onSessionCreated(uploadSessionId);
    // get expected parts
    const expectedPartCount = getExpectedPartCount(fileMetaData, partSize);
    // array of all the parts
    const parts = Array.from({ length: expectedPartCount }, (_, i) => i + 1);
    // upload the parts
    const completed = await uploadParts(parts, partSize, file, uploadSessionId, progressBar, progressText, checkIsPaused, setCurrentXhr, 0);

    if (!completed) {
        return { uploadSessionId, completed: false };
    }
    // upload complete
    await uploadPartsComplete(uploadSessionId);
    return { completed: true };
};

export const stopUpload = async (uploadSessionId, currentXhr) => {
    // get the current state 
    const stateResponse = await fetch(`/uploads/${uploadSessionId}/uploadState`);
    if (!stateResponse.ok) {
        throw new Error("Error occured while fetching upload State");
    }

    const uploadState = await stateResponse.json();
    const { fileMetaData } = uploadState;

    if (fileMetaData.status === "READY") return { alreadyCompleted: true };

    if(currentXhr){
        currentXhr.abort();
    }

    // upload not complete
    const abortResponse = await fetch(`/uploads/${uploadSessionId}`, {
        method: "DELETE",
    });

    if (!abortResponse.ok) throw new Error("Failed to abort upload");

    return { alreadyCompleted: false };

};

export const sendFileMetaData = async (fileMetaData) => {
    const response = await fetch('/uploads/uploadFile', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(fileMetaData),
    });
    if (!response.ok) {
        throw new Error("Error occurred while sending file metadata");
    }
    const data = await response.json();
    return data;
};


export const getExpectedPartCount = (file, partSize) => Math.ceil(Number(file.size) / partSize);
export const getMissingParts = (parts, expectedPartCount) => {
    // retrieve all parts from the db
    const allParts = new Set(parts.map((part) => part.partNumber));
    let missingParts = [];
    for (let i = 1; i <= expectedPartCount; i++) {
        if (!allParts.has(i)) missingParts.push(i);
    }
    return missingParts;
};


export const uploadParts = async (parts, partSize, file, uploadSessionId, progressBar, progressText, checkIsPaused, setCurrentXhr, completedBytes) => {
    // [1,4]; 
    for (let i = 0; i < parts.length; i++) {

        if (checkIsPaused()) {
            // upload stopped.
            console.log("upload paused");
            return false;
        }

        let partNumber = parts[i];

        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);

        const chunk = file.slice(start, end);

        // send part 
        const partResponse = await fetch(`/uploads/${uploadSessionId}/parts/${partNumber}`, {
            method: "POST",
        });

        if (!partResponse.ok) throw new Error(`Error occurred while sending part: ${partNumber}`);

        const partData = await partResponse.json();

        // upload the file data in chunks
        const etag = await uploadChunksWithXhr(partData.signedUrl, chunk, progressBar, progressText, setCurrentXhr, completedBytes, file.size);


        if (!etag) throw new Error(`Etag missing for part: ${partNumber}`);
        
        
        // save etag, partno. and uploadSessionId to the db
        const saveResponse = await fetch(`/uploads/${uploadSessionId}/parts/${partNumber}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ etag }),
        });
        
        if (!saveResponse.ok) throw new Error(`Failed to save part: ${partNumber}`);
        completedBytes += chunk.size;

    }
    return true;
};

const uploadChunksWithXhr = async (signedUrl, chunk, progressBar, progressText, setCurrentXhr, completedBytes, fileSize) => {

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        setCurrentXhr(xhr);
    xhr.open('PUT', signedUrl, true);

    // when upload starts, display progress bar
    xhr.upload.addEventListener('loadstart', () => {
        progressBar.classList.add('visible');
        progressText.classList.add('visible');
    });

    // progress event recieved, we update the bar
    xhr.upload.addEventListener('progress', (e) => {
        const uploadedBytes = completedBytes + e.loaded;
        const progress = (uploadedBytes / fileSize) * 100;
        progressBar.value = progress;
        progressText.textContent = `Uploading (${progress.toFixed(2)}%)...`;
    });

    // chunk upload complete successfully, get the etag
    xhr.addEventListener('load', () => {
        if(xhr.status >= 200 && xhr.status < 300){
            const etag = xhr.getResponseHeader('ETag');

            if(!etag){
                reject(new Error("Etag missing from upload response"));
                setCurrentXhr(null);
                return ;
            }
            setCurrentXhr(null);
            resolve(etag);
            
        } else {
            setCurrentXhr(null);
            reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
    });

    // in case of an error, abort, or a timeout, we hide the progress bar
    function errorAction(event) {
        progressBar.classList.remove('visible');
        progressText.textContent = `Upload failed: ${event.type}`;
        setCurrentXhr(null);

        reject(new Error(`Upload: ${event.type}`));
    }

    xhr.upload.addEventListener('error', errorAction);
    xhr.upload.addEventListener('abort', errorAction);
    xhr.upload.addEventListener('timeout', errorAction);
    
    
    xhr.send(chunk);
    
});

};

export const uploadPartsComplete = async (uploadSessionId) => {
    const completeResponse = await fetch(`/uploads/${uploadSessionId}/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!completeResponse.ok) {
        throw new Error("Error occurred while completing upload");
    }
    const completeData = await completeResponse.json();
    console.log("Upload Completed: ", completeData);
};


