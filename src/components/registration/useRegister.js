import { useState } from "react";
import { message } from "antd";
import FormData from "form-data";

import { uploadAvatar } from "../../requests/uploadRequests";

const useRegister = () => {
    const [messageApi, contextHandler] = message.useMessage();
    const [avatarURL, setAvatarURL] = useState('');

    const onChange = info => {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
           console.log(`${info.file.name} file uploaded successfully`);
        }
        else if (info.file.status === 'error') {
            console.log(`${info.file.name} file upload failed.`);
        }
    };
    
    const uploadFile = event => {
        const { onSuccess, onError } = event;
        const formData = new FormData();
        formData.append('avatar', event.file);
        uploadAvatar(formData).then(data => {
            onSuccess(event.file);
            messageApi.success('File uploaded successfully');
            setAvatarURL(data);
        })
        .catch(err => {
            const error = err?.response.data ?
                err.response.data?.error ?
                err.response.data.error :
                err.response.data :
                err;
            messageApi.error(error);
            onError(event.file);
        });
    };

    return {
        onChange,
        uploadFile,
        contextHandler,
        avatarURL
    };
};

export default useRegister;