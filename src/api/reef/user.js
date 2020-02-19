import axios from '../index'

export const login = (username, password) => {
  return axios.request({
    url: 'api/v1/cedar/user_login/',
    method: 'post',
    data: {
      username: username,
      password: password
    }
  })
}
