import axios from "axios";

const jcApi = axios.create({
  baseURL: 'https://jcampbellg.me/eventsub'
});

export default jcApi;