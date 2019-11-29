import Mock from 'mockjs'

export const jobLibSvcExecute = (options) => {
  let parameterData = JSON.parse(options.body)
  let requestName = parameterData.requestName
  console.log('请求名====' + requestName)
  return jobLibSvcExecuteFunction(requestName)
}

let ADBC = {}
let adbcUnitName = ['2JunitBack1Step', '2JunitBack2Steps', '2JunitBack3Steps', '2JunitBackToHome', '2JunitCheckSig4Init', '2JunitDumpKernLog', '2JunitDumpSysLog', '2JunitGetBatteryStats', '2JunitHome1Press', '2JunitSnapshot', '2JunitStartSystemBrowser', '2JunitStartSystemCalculator', '2JunitStartSystemCalendar', '2JunitStartSystemCameraApp', '2JunitStartSystemSettings', '2JunitSwipeButtom2Top', '2JunitSwipeLeft2Right', '2JunitSwipeRight2Left', '2JunitSwipeTop2Buttom', '2JunitTapSpecPosition']
for (let i = 0; i < adbcUnitName.length; i++) {
  ADBC[adbcUnitName[i]] = {
    'jobUnitName': adbcUnitName[i] + '.json',
    'execModName': 'ADBC',
    'execCmdDict': {
      'execCmdList': [
        ['<3adbcTool> shell input keyevent 4'],
        ['<3adbcTool> shell input keyevent 4', '<3adbcTool> shell input keyevent 4'],
        ['<3adbcTool> shell input keyevent 4', '<3adbcTool> shell input keyevent 4', '<3adbcTool> shell input keyevent 4'],
        ['<3adbcTool> shell input keyevent 4', '<3adbcTool> shell input keyevent 4', '<3adbcTool> shell input keyevent 4', '<3adbcTool> shell input keyevent 4', '<3adbcTool> shell input keyevent 4', '<3adbcTool> shell input keyevent 3', '<3adbcTool> shell input keyevent 3'],
        ['<3adbcTool> shell "cat <1ijobDevJobSigPoolFile>"'],
        ['<3adbcTool> shell rm /sdcard/kernel.log', '<3adbcTool> shell "dmesg > /sdcard/kernel.log"', '<3adbcTool> shell dmesg -c', '<3adbcTool> pull /sdcard/kernel.log <blkOutPath>kernel.log'],
        ['<3adbcTool> shell rm /sdcard/system.log', '<3adbcTool> shell "logcat -v threadtime -d  > /sdcard/system.log"', '<3adbcTool> shell logcat -c', '<3adbcTool> pull /sdcard/system.log <rdsDatPath>system.log'],
        ['<3adbcTool> shell dumpsys battery >  <adbOutPath>battery.dat', '<3adbcTool> shell dumpsys batterystats >> <rdsDatPath>battery.dat', 'echo 0 > <rdsDatPath>assess.txt'],
        ['<3adbcTool> shell input keyevent 3'],
        ['<3adbcTool> shell rm /sdcard/snap.png', '<3adbcTool> shell  screencap -p /sdcard/snap.png', '<3adbcTool> pull /sdcard/snap.png <blkOutPath>snap.png'],
        ['<3adbcTool> shell am start -n com.android.browser/com.android.browser.BrowserActivity', '<4ccmd><sleep>3'],
        ['<3adbcTool> shell am start -n com.android.calculator2/com.android.calculator2.Calculator', '<4ccmd><sleep>3'],
        ['<3adbcTool> shell am start -n com.android.calendar/com.android.calendar.LaunchActivity', '<4ccmd><sleep>3'],
        ['<3adbcTool> shell am start -a android.intent.action.MAIN -n com.android.camera/.Camera', '<4ccmd><sleep>3'],
        ['<3adbcTool> shell am start -a android.settings.SETTINGS', '<4ccmd><sleep>3'],
        ['<3adbcTool> shell input swipe 250 550 250 350'],
        ['<3adbcTool> shell input swipe 100 350 350 350'],
        ['<3adbcTool> shell input swipe 350 350 100 350'],
        ['<3adbcTool> shell input swipe 250 350 250 550'],
        ['<3adbcTool> shell input tap <TapPosition>']
      ][i],
      'exptResList': [[], [], [], [], ['<1ijobSignature>'], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []][i],
      'bkupCmdList': [[], [], [], [], ['<1ijobFile>1JUiniCmdsLst.txt', '<3adbcTool> shell "echo <1ijobSignature> >> <1ijobDevJobSigPoolFile> "'], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []][i]
    }
  }
}
let IMGTOOL = {}
let imgToolUnitName = ['2JunitAssessCmpPixels', '2JunitAssessCmpSurfHist', '2JunitFindIconPosition']
for (let i = 0; i < imgToolUnitName.length; i++) {
  IMGTOOL[imgToolUnitName[i]] = {
    'jobUnitName': imgToolUnitName[i] + '.json',
    'execModName': 'IMGTOOL',
    'execCmdDict': {
      'requestName': ['assessImgWithRightImg', 'assessImgBySURFnHist', '2JunitFindIconPosition.json'][i],
      'referImgFile': ['<1ijobFile>reference.png', '<1ijobFile>reference.png', '<1ijobFile>icon.png'][i],
      'configFile': ['<1ijobFile>imageAreas.json', '<1ijobFile>imageAreas.json', '<1ijobFile>iconFindConfig.json'][i],
      'inputImgFile': ['<blkInpPath>snap.png', '<blkInpPath>snap.png', '<blkInpPath>snap.png'][i],
      'outputScoreFile': ['<rdsDatPath>assess.json', '<rdsDatPath>assess.json', '<rdsDatPath>assess.json'][i]
    }
  }
}

function jobLibSvcExecuteFunction (requestName) {
  switch (requestName) {
    case 'callEblockExce' :
      return {
        state: true,
        file: Mock.Random.dataImage()
      }
    case 'getTemporarySpace' :
      return {
        stageJobLabel: 'job-61319af4-6059-49a3-b9a4-cfca1b407833',
        stageJobPath: 'E:\\StaticResource\\jobStagingArea\\job-61319af4-6059-49a3-b9a4-cfca1b407833',
        state: true
      }
    case 'getFeaturePointIntoJob':
      return {
        stageJobLabel: 'job-61319af4-6059-49a3-b9a4-cfca1b407833',
        fileName: 'featurePoint.json',
        state: true
      }
    case 'setjobInfoAndFlowDict': // JobEditor保存
      return {
        state: true
      }
    case 'getJobUnitsBodyDict': // 获取所有的unit
      return {
        'ADBC': ADBC,
        'IMGTOOL': IMGTOOL,
        'LIMBPOWER': {},
        'LIMBTEMPR': {},
        'MONITCAM': {
          '2JunitSnapDevice': {
            'jobUnitName': '2JunitSnapDevice.json',
            'execModName': 'MONITCAM',
            'execCmdDict': {
              'requestName': 'snapshotDevice',
              'deviceID': '<deviceID>',
              'savaFile': '<blkOutPath>snap.png',
              'reqTime': '<currentTime>'
            }
          }
        },
        'SCRIPTEXEC': {}
      }
  }
}

// 'ADBC': {
//   '2JunitBack1Step': {
//     'jobUnitName': '2JunitBack1Step.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input keyevent 4'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitBack2Steps': {
//     'jobUnitName': '2JunitBack2Steps.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input keyevent 4',
//         '<3adbcTool> shell input keyevent 4'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitBack3Steps': {
//     'jobUnitName': '2JunitBack3Steps.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input keyevent 4',
//         '<3adbcTool> shell input keyevent 4',
//         '<3adbcTool> shell input keyevent 4'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitBackToHome': {
//     'jobUnitName': '2JunitBackToHome.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input keyevent 4',
//         '<3adbcTool> shell input keyevent 4',
//         '<3adbcTool> shell input keyevent 4',
//         '<3adbcTool> shell input keyevent 4',
//         '<3adbcTool> shell input keyevent 4',
//         '<3adbcTool> shell input keyevent 3',
//         '<3adbcTool> shell input keyevent 3',
//         '<3adbcTool> shell input keyevent 3'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitCheckSig4Init': {
//     'jobUnitName': '2JunitCheckSig4Init.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell "cat <1ijobDevJobSigPoolFile>"'
//       ],
//       'exptResList': [
//         '<1ijobSignature>'
//       ],
//       'bkupCmdList': [
//         '<1ijobFile>1JUiniCmdsLst.txt',
//         '<3adbcTool> shell "echo <1ijobSignature> >> <1ijobDevJobSigPoolFile> "'
//       ]
//     }
//   },
//   '2JunitDumpKernLog': {
//     'jobUnitName': '2JunitDumpKernLog.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell rm /sdcard/kernel.log',
//         '<3adbcTool> shell "dmesg > /sdcard/kernel.log"',
//         '<3adbcTool> shell dmesg -c',
//         '<3adbcTool> pull /sdcard/kernel.log <blkOutPath>kernel.log'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitDumpSysLog': {
//     'jobUnitName': '2JunitDumpSysLog.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell rm /sdcard/system.log',
//         '<3adbcTool> shell "logcat -v threadtime -d  > /sdcard/system.log"',
//         '<3adbcTool> shell logcat -c',
//         '<3adbcTool> pull /sdcard/system.log <rdsDatPath>system.log'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitGetBatteryStats': {
//     'jobUnitName': '2JunitGetBatteryStats.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell dumpsys battery >  <adbOutPath>battery.dat',
//         '<3adbcTool> shell dumpsys batterystats >> <rdsDatPath>battery.dat',
//         'echo 0 > <rdsDatPath>assess.txt'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitHome1Press': {
//     'jobUnitName': '2JunitHome1Press.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input keyevent 3'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitSnapshot': {
//     'jobUnitName': '2JunitSnapshot.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell rm /sdcard/snap.png',
//         '<3adbcTool> shell  screencap -p /sdcard/snap.png',
//         '<3adbcTool> pull /sdcard/snap.png <blkOutPath>snap.png'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitStartSystemBrowser': {
//     'jobUnitName': '2JunitStartSystemBrowser.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell am start -n com.android.browser/com.android.browser.BrowserActivity',
//         '<4ccmd><sleep>3'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitStartSystemCalculator': {
//     'jobUnitName': '2JunitStartSystemCalculator.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell am start -n com.android.calculator2/com.android.calculator2.Calculator',
//         '<4ccmd><sleep>3'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitStartSystemCalendar': {
//     'jobUnitName': '2JunitStartSystemCalendar.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell am start -n com.android.calendar/com.android.calendar.LaunchActivity',
//         '<4ccmd><sleep>3'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitStartSystemCameraApp': {
//     'jobUnitName': '2JunitStartSystemCameraApp.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell am start -a android.intent.action.MAIN -n com.android.camera/.Camera',
//         '<4ccmd><sleep>3'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitStartSystemSettings': {
//     'jobUnitName': '2JunitStartSystemSettingsApp.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell am start -a android.settings.SETTINGS',
//         '<4ccmd><sleep>3'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitSwipeButtom2Top': {
//     'jobUnitName': '2JunitSwipeButtom2Top.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input swipe 250 550 250 350'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitSwipeLeft2Right': {
//     'jobUnitName': '2JunitSwipeLeft2Right.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input swipe 100 350 350 350'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitSwipeRight2Left': {
//     'jobUnitName': '2JunitSwipeRight2Left.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input swipe 350 350 100 350'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitSwipeTop2Buttom': {
//     'jobUnitName': '2JunitSwipeTop2Buttom.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input swipe 250 350 250 550'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   },
//   '2JunitTapSpecPosition': {
//     'jobUnitName': '2JunitTapSpecPosition.json',
//     'execModName': 'ADBC',
//     'execCmdDict': {
//       'execCmdList': [
//         '<3adbcTool> shell input tap <TapPosition>'
//       ],
//       'exptResList': [],
//       'bkupCmdList': []
//     }
//   }
// },
// 'IMGTOOL': {
//   '2JunitAssessCmpPixels': {
//     'jobUnitName': '2JunitAssessCmpPixels.json',
//     'execModName': 'IMGTOOL',
//     'execCmdDict': {
//       'requestName': 'assessImgWithRightImg',
//       'referImgFile': '<1ijobFile>reference.png',
//       'cmpAreaListFile': '<1ijobFile>imageAreas.json',
//       'inputImgFile': '<blkInpPath>snap.png',
//       'outputScoreFile': '<rdsDatPath>assess.json'
//     }
//   },
//   '2JunitAssessCmpSurfHist': {
//     'jobUnitName': '2JunitAssessCmpSurfHist.json',
//     'execModName': 'IMGTOOL',
//     'execCmdDict': {
//       'requestName': 'assessImgBySURFnHist',
//       'referImgFile': '<1ijobFile>reference.png',
//       'configFile': '<1ijobFile>imageAreas.json',
//       'inputImgFile': '<blkInpPath>snap.png',
//       'outputFile': '<rdsDatPath>assess.json'
//     }
//   },
//   '2JunitFindIconPosition': {
//     'jobUnitName': '2JunitFindIconPosition.json',
//     'execModName': 'IMGTOOL',
//     'execCmdDict': {
//       'requestName': 'identifyIcon',
//       'iconImageFile': '<1ijobFile>icon.png',
//       'configFile': '<1ijobFile>iconFindConfig.json',
//       'inputImageFile': '<blkInpPath>snap.png',
//       'outputFile': '<rdsDatPath>assess.json'
//     }
//   }
// },
