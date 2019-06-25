import Mock from 'mockjs'
import { baseURL, jobLibSvcURL } from '../config'
import { login } from './reef/user'

Mock.mock(`${baseURL}/api/v1/login/`, login)
// Mock.mock(jobLibSvcURL)

export default Mock
