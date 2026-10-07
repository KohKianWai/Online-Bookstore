import { environment } from "../environment";
import axios from "axios";

export const createUser = (userDto) => axios.post(`${environment.apiUrl}user`, userDto);

export const createModerator = (moderatorDto) => axios.post(`${environment.apiUrl}moderator`, moderatorDto);

export const checkUsername = (username) => axios.get(`${environment.apiUrl}auth/check-username`, { params: { username } });