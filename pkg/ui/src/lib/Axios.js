import axios from "axios"
import { isDev } from "./Utils"

export const http = axios.create({
    // baseURL: isDev() ? "http://localhost:8080/api/" : "api/",
    baseURL: isDev() ? "http://vpn-vipien.default.svc.cluster.local:8080/api/" : "api/",
})