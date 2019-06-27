import Mock from 'mockjs'
export const jobLibSvcExecute = (options) => {
  let parameterData = JSON.parse(options.body)
  let requestName = parameterData.requestName
  console.log('请求名====' + requestName)
  return jobLibSvcExecuteFunction(requestName)
}

function jobLibSvcExecuteFunction (requestName) {
  switch (requestName) {
    case 'callEblockExce' :
      return {
        stageJobLabel: 'job-92348cd3-3512-4488-842d-36dc631a9083',
        state: true
      }
  }
}

export const deviceOperationStatus = (options) => {
  return {
    state: true,
    file: Mock.Random.dataImage()
  }
}
