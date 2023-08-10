import { uploadTaskImage } from "../../requests/uploadRequests";

class FileUploadAdapter {
    constructor(loader, token) {
        this.loader = loader;
        this.token = token;
    }

    upload() {
        return this.loader.file.then(file => 
            new Promise((resolve, reject) => {
                const taskFile = new FormData();
                taskFile.append('upload', file);
                uploadTaskImage(taskFile, this.token).then(data => {
                    resolve({
                        default: data.url
                    });
                })
                .catch(err => {
                    reject(err);
                });
            })
            .catch(err => {
                const error = err?.response.data ?
                    err.response.data?.error ?
                    err.response.data.error :
                    err.response.data :
                    err;
                throw new Error(error);
            })
        );
    };
};

export default FileUploadAdapter;
