import axios from 'axios';


export const apiGet = async (url) => {
  const response = await axios.get(url);
  return response.data;
};