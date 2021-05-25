import axios from 'axios'
import { NetworkError } from "./error"

export default function (baseURL) {
  const service = axios.create({
    baseURL,
    timeout: 2000000,
  })

  // 请求拦截器
  service.interceptors.request.use(
    config => {
      return config
    },
    error => {
      throw error
    }
  )

  //  响应拦截器
  service.interceptors.response.use(
    response => {
      return response.data
    },
    error => {
      console.log(error.config.data)
      throw new NetworkError(error.message)
    }
  )

  return service
}