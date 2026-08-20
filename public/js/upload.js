
const progressBar = document.querySelector('#upload-progress');
const progressText = document.querySelector('#upload-percent');

const uploadForm = document.querySelector('#upload-form');
uploadForm.addEventListener('submit', handleSubmit);


async function handleSubmit(e) {
    e.preventDefault();

    const file = document.querySelector('#up_file').files[0];
    const folderId = document.querySelector('input[name="folderId"]').value;

    if (!file) {
        alert("please select a file");
        return;
    }

    // file is present.
    const file_metaData = {
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        folderId: folderId || null,
    }

    // send meta data to the uploadController.
    const response = await fetch('/uploads/uploadFile', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(file_metaData),
    });

    const data = await response.json();
    console.log(data);

    // get the total parts
    const totalParts = Math.ceil(file.size / data.partSize);
    console.log("total parts", totalParts);

    // loop through all the parts

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * data.partSize;
        const end = Math.min(start + data.partSize, file.size);

        const chunk = file.slice(start, end);

        const partResponse = await fetch(`/uploads/${data.uploadSessionId}/parts/${partNumber}`, {
            method: "POST",
        });
        const partData = await partResponse.json();

        const uploadResponse = await fetch(partData.signedUrl, {
            "method": "PUT",
            body: chunk,
        });


        if (!uploadResponse.ok) {
            throw new Error(`part ${partNumber} upload failed`);
        }

        // get etag
        const etag = uploadResponse.headers.get('ETag');

        // save etag, partno. and uploadSessionId to the db.
        const savePartToDb = await fetch(`/uploads/${data.uploadSessionId}/parts/${partNumber}`, {
            method: "PUT",
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({etag}),
        });

        // progress bar 
        const uploadedBytes = Math.min(partNumber * data.partSize, file.size);
        const progress = (uploadedBytes / file.size) * 100;

        progressBar.value = progress;
        progressText.textContent = `${Math.round(progress)}%`;
    }

    // another request to express 
    const completeResponse = await fetch(`/uploads/${data.uploadSessionId}/complete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const completeData = await completeResponse.json();
    console.log("Upload completed: ", completeData);

    // redirect to home page or to the specific folder
    window.location.href = folderId ? `/folders/${folderId}` : '/';

}