import axios from 'axios'
import { baseURL } from '@/config'

class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    return {
      baseURL: this.baseUrl,
      headers: {
        //
      }
    }
  }
  interceptors (instance, url) {
    instance.interceptors.request.use(config => {
      // 在请求头中加token
      if (localStorage.getItem('token')) {
        config.headers.Authorization = sessionStorage.getItem('token')
      }
      if (!Object.keys(this.queue).length) {
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    instance.interceptors.response.use(res => {
      delete this.queue[url]
      const { data, status } = res
      return { data, status }
    }, error => {
      delete this.queue[url]
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
