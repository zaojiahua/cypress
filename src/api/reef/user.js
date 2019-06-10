import axios from '../index'

export const login = (username, password) => {
  return axios.request({
    url: 'api/v1/login/',
    method: 'post',
    data: {
      username: username,
      password: password
    }
  })
}
