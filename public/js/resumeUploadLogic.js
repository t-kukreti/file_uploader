export const resumeUpload = async (uploadSessionId, file, progressBar, progressText, checkIsPaused) => {
    // fetch the uploadState of current file
    const response = await fetch(`/uploads/${uploadSessionId}/uploadState`);

    if(!response.ok){
        throw new Error("Error occurred while fetching upload state");
    }

    const uploadState = await response.json();
    const { partSize, fileMetaData, parts } = uploadState;

    // get expected parts
    const expectedPartCount = getExpectedPartCount(fileMetaData, partSize);
    // get missing parts
    const missingParts = getMissingParts(parts, expectedPartCount);
    const completedParts = parts.length;

    const progressSaved = calculateProgress(completedParts, expectedPartCount);
    showProgress(progressBar, progressText, progressSaved);
    // upload the parts
    const completed = await uploadParts(missingParts, partSize, file, uploadSessionId, completedParts, expectedPartCount,  progressBar, progressText, checkIsPaused);
    // upload complete
    if(! completed){
        return {uploadSessionId, completed: false};
    }
    await uploadPartsComplete(uploadSessionId);
    return {uploadSessionId, completed: true};
};

export const startUpload = async(file, progressBar, progressText, fileMetaData, checkIsPaused) => {
    // send metadata
    const { partSize, uploadSessionId } = await sendFileMetaData(fileMetaData);
    // get expected parts
    const expectedPartCount = getExpectedPartCount(fileMetaData, partSize);
    // array of all the parts
    const parts = Array.from({ length: expectedPartCount }, (_, i) => i + 1);
    // upload the parts
    const completed = await uploadParts(parts, partSize, file, uploadSessionId, 0, expectedPartCount, progressBar, progressText, checkIsPaused);
    if(! completed){
        return {uploadSessionId, completed: false};
    }
    // upload complete
    await uploadPartsComplete(uploadSessionId);
    return {uploadSessionId, completed: true};
};

// export const stopUpload = async () => {

// };

export const sendFileMetaData = async (fileMetaData) => {
    const response = await fetch('/uploads/uploadFile', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(fileMetaData),
    });
    if(!response.ok){
        throw new Error("Error occurred while sending file metadata");
    }
    const data = await response.json();
    return data;
};


export const getExpectedPartCount = (file, partSize) => Math.ceil(Number(file.size)/partSize);
export const getMissingParts = (parts, expectedPartCount) => {
    // retrieve all parts from the db
    const allParts = new Set(parts.map((part) => part.partNumber));
    let missingParts = [];
    for(let i = 1; i <= expectedPartCount; i++){
        if( !allParts.has(i)) missingParts.push(i);
    }
    return missingParts;
};


export const uploadParts = async (parts, partSize, file, uploadSessionId, completedPartCount, expectedPartCount, progressBar, progressText, checkIsPaused ) => {
    // [1,4]; 
    for(let i = 0; i < parts.length; i++){

        if(checkIsPaused()){
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

        if(!partResponse.ok) throw new Error(`Error occurred while sending part: ${partNumber}`);

        const partData = await partResponse.json();

        const uploadResponse = await fetch(partData.signedUrl, {
            method: "PUT",
            body: chunk,
        });

        if(! uploadResponse.ok){
            throw new Error(`part ${partNumber} uplaod failed`);
        }

        const etag = uploadResponse.headers.get('ETag');

        if(!etag) throw new Error(`Etag missing for part: ${partNumber}`);

        // save etag, partno. and uploadSessionId to the db
        const saveResponse = await fetch(`/uploads/${uploadSessionId}/parts/${partNumber}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({etag}),
        });

        if(!saveResponse.ok) throw new Error(`Failed to save part: ${partNumber}`);



        const progress = calculateProgress( (i+1+completedPartCount), expectedPartCount);

        showProgress(progressBar, progressText, progress);

    }
    return true;
};


export const uploadPartsComplete = async(uploadSessionId) => {
    const completeResponse = await fetch(`/uploads/${uploadSessionId}/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if(!completeResponse.ok){
        throw new Error("Error occurred while completing upload");
    }
    const completeData = await completeResponse.json();
    console.log("Upload Completed: ", completeData);
};

export const calculateProgress = (completedParts, totalParts) => {
    return (completedParts/ totalParts) * 100;
};

export const showProgress = (progressBar, progressText, progress) => {
    progressBar.value = progress;
    progressText.textContent = `${Math.round(progress)}%`;
};

