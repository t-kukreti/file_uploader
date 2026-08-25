

document.querySelectorAll('.rename-btn').forEach((button)=>{
    button.addEventListener('click',()=>{
        const id = button.dataset.id;

        document.getElementById(`rename-${id}`).style.display = "block";
        document.getElementById(`renameBtn-${id}`).style.display = "none";
    });
});

document.querySelectorAll('.delete-folder-form').forEach((form)=>{
    form.addEventListener('submit',(e)=>{
        const confirmed = confirm("Delete this folder and all files ?");
        if(!confirmed){
            e.preventDefault();
        }
    });
});

document.querySelectorAll('.delete-file-form').forEach((form)=>{
    form.addEventListener('submit',(e)=>{
        const confirmed = confirm("Delete this file ?");
        if(!confirmed){
            e.preventDefault();
        }
    });
});

document.querySelectorAll(".cancel-rename").forEach(button => {
    button.addEventListener("click", () => {
        const id = button.dataset.id;

        document.getElementById(`rename-${id}`).style.display = "none";

        document.querySelector(
            `.rename-btn[data-id="${id}"]`
        ).style.display = "inline-block";
    });
});


document.querySelectorAll(".resume-upload").forEach((button) => {
    button.addEventListener('click', () => {
        console.log("resume listener loaded");
        const uploadSessionId = button.dataset.uploadId;
        window.location.href = `/uploads/uploadFile?resume=${uploadSessionId}`;
    });
});
