import base from './base'
import devEnv from './dev.env'

export const baseURL = process.env.NODE_ENV === 'production' ? `http://${prodEnv.REEF_HOST}:${base.REEF_PORT}` : `http://${devEnv.REEF_HOST}:${base.REEF_PORT}`
export const jobLibSvcURL = process.env.NODE_ENV === 'production' ? `http://${prodEnv.CORAL_HOST}:${base.JOBSVC_PORT}` : `http://${devEnv.CORAL_HOST}:${base.JOBSVC_PORT}`
