import Mock from 'mockjs'

let Random = Mock.Random

export const getUsableDeviceList = (options) => {
  let devices = []
  for (let i = 0; i < 10; i++) {
    let device = {
      android_version: {
        version: Random.integer(1, 10) + '.' + Random.integer(0, 10) + '.' + Random.integer(0, 10)
      },
      device_label: Random.string(3, 7) + '---' + Random.string(7) + '---' + Random.string(7),
      device_name: Random.first(),
      id: Random.integer(0, 100),
      phone_address: Random.ip(),
      phone_model: {
        phone_model_name: Random.last()
      },
      rom_version: {
        version: Random.integer(1, 10) + '.' + Random.integer(0, 10) + '.' + Random.integer(0, 10)
      }
    }
    devices.push(device)
  }
  return Mock.mock({
    'devices|1-2': devices
  })
}
