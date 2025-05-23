import axios from "axios"
import { showAlert } from "./alert"

// TYPE IS EITHER PASSWORD OR (NAME AND EMAIL)
export const updateSettings = async (data, type) => {
    try {
        const url =
            type === 'password' ?
                'http://localhost:3000/api/v1/users/updateMyPassword' :
                'http://localhost:3000/api/v1/users/updateMe'
        const res = await axios({
            method: "PATCH",
            url,
            data
        })

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfuly`)
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}