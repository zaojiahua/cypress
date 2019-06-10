import ip from './ip'
export default {
  'REEF_HOST': ip.REEF_HOST,
  'REEF_PORT': '8000',
  'CORAL_HOST': ip.CORAL_HOST,
  'ADMIN_PORT': '10803',
  'CONFIG_PORT': '10808',
  'DEVINDOOR_PORT': '10802',
  'CREATETBOARD_PORT': '10811',
  'JOBSVC_PORT': '10801'
}

export const baseURL = process.env.NODE_ENV === 'production' ? '/production/' : `http://${ip.REEF_HOST}:${ip.REEF_PORT}`
export const jobLibSvcURL = `http://${ip.CORAL_HOST}:${ip.JOBSVC_PORT}`
