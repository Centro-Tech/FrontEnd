import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:8080"});

export default API;