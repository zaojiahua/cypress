import base from './base'
import prodEnv from './prod.env'

export const baseURL = process.env.NODE_ENV === 'production' ? `http://${devEnv.REEF_HOST}:${base.REEF_PORT}` : `http://${prodEnv.REEF_HOST}:${base.REEF_PORT}`
export const jobLibSvcURL = process.env.NODE_ENV === 'production' ? `http://${devEnv.CORAL_HOST}:${base.JOBSVC_PORT}` : `http://${prodEnv.CORAL_HOST}:${base.JOBSVC_PORT}`
