<template>
  <div>
    <Row>
      <Divider>用例筛选</Divider>
      <Tabs type="card" class="tabs">
        <TabPane v-for="column in filterColumn" :key="column.title" :label="column.title" :class="column.key">
          <CheckboxGroup v-model="filterRules" @on-change="onJobFilterChange">
            <Row type="flex">
              <Col span="4" v-for="(item, index) in filterData[column.key]" :key="index">
                <Checkbox :label="column.key + ':' + index + ':' + item[column.item_key]">
                  <span>{{ item[column.item_key] }}</span>
                </Checkbox>
              </Col>
            </Row>
          </CheckboxGroup>
        </TabPane>
      </Tabs>
    </Row>

    <Row style="margin-top: 50px; border-bottom: 1px solid #dcdee2;">
      <Tag v-for="tag in filterColumn" :key="tag.title" :color="colors[tag.key]" >{{ tag.title }}</Tag>
    </Row>

    <Row>
      <Row style="margin-top: 20px; min-height: 30px;">
        <Tag v-for="(label, index) in filterRules" :key="index" :color="colors[label.split(':')[0]]" closable @on-close="close(index)">{{ label.split(':')[2] }}</Tag>
      </Row>
      <Button style="margin: 30px 0px;" @click="clear()">清空</Button>
    </Row>

  </div>
</template>

<script>
import util from '../lib/util/validate.js'
import serializer from '../lib/util/jobListSerializer'
import { getPhoneModelList } from '../api/reef/phoneModel'
import { getJobTestAreaList } from '../api/reef/jobTestArea'
import { getAndroidVersionList } from '../api/reef/androidVersion'
import { getRomVersionList } from '../api/reef/romVersion'
import { getReefUserList } from '../api/reef/reefUser'
import { getCustomTagList } from '../api/reef/customTag'

export default {
  data () {
    return {
      filterColumn: [ // 将获得的数据以统一的格式存放到filterData中，以便于v-for循环
        {
          title: '适用机型',
          key: 'phone_model',
          item_key: 'phone_model_name'
        }, {
          title: '测试用途',
          key: 'job_test_area',
          item_key: 'description'
        }, {
          title: '安卓版本',
          key: 'android_version',
          item_key: 'version'
        }, {
          title: 'ROM版本',
          key: 'rom_version',
          item_key: 'version'
        }, {
          title: '维护人员',
          key: 'reefuser',
          item_key: 'username'
        }, {
          title: '自定义标签',
          key: 'custom_tag',
          item_key: 'custom_tag_name'
        }
      ],
      filterData: {}, // 提供的筛选条件
      filterRules: [], // 已选的筛选条件
      filterUrlParam: '', // 根据已选的筛选条件生成的url参数
      colors: { // Tag的颜色
        phone_model: 'default',
        job_test_area: 'red',
        android_version: 'orange',
        rom_version: 'cyan',
        reefuser: 'blue',
        custom_tag: 'purple'
      }
    }
  },
  methods: {
    _jobRender () { // 将filterRules数组整理为筛选条件
      let selectedData = {}
      this.filterRules.forEach(item => {
        let info = item.split(':')
        let type = info[0]
        let index = info[1]
        if (selectedData[type] === undefined) selectedData[type] = []
        selectedData[type].push(this.filterData[type][index])
      })
      return selectedData
    },
    selectedDetail (selectedData) { // 将筛选条件整理为符合格式的url参数
      let conditions = []
      Object.keys(selectedData).forEach(key => {
        let condition = []
        selectedData[key].forEach(item => {
          condition.push(item.id)
        })
        if (key === 'job_test_area') key = 'test_area' // 使命名一致
        else if (key === 'phone_model') key = 'phone_models'
        else if (key === 'reefuser') key = 'author'

        condition.forEach(item => {
          item = key + '__id=' + item
        })

        let conditionStr = key + '__id__in=' + 'ReefList[' + condition.join('{%,%}') + ']'
        conditions.push(conditionStr)
      })

      return conditions.join('&')
    },
    onJobFilterChange () { // 筛选条件改变时触发该函数，获取符合条件的job
      let selectedData = this._jobRender()
      this.filterUrlParam = '&' + this.selectedDetail(selectedData)
      this.$emit('getMsg', this.filterUrlParam)
    },
    clear () { // 清空已选筛选条件
      this.filterRules = []
      this.onJobFilterChange()
    },
    close (index) {
      this.filterRules.splice(index, 1)
      this.onJobFilterChange()
    }
  },
  beforeCreate () {
    getPhoneModelList().then(res => {
      this.$set(this.filterData, 'phone_model', util.validate(serializer.getPhoneModelSerializer, res.data).phonemodels)
    }).catch(error => {
      console.log(error)
    })
    getJobTestAreaList().then(res => {
      this.$set(this.filterData, 'job_test_area', util.validate(serializer.getJobTestAreaSerializer, res.data).jobtestareas)
    }).catch(error => {
      console.log(error)
    })
    getAndroidVersionList().then(res => {
      this.$set(this.filterData, 'android_version', util.validate(serializer.getAndroidVersionSerializer, res.data).androidversions)
    }).catch(error => {
      console.log(error)
    })
    getRomVersionList().then(res => {
      this.$set(this.filterData, 'rom_version', util.validate(serializer.getRomVersionSerializer, res.data).romversions)
    }).catch(error => {
      console.log(error)
    })
    getReefUserList().then(res => {
      this.$set(this.filterData, 'reefuser', util.validate(serializer.getReefUserSerializer, res.data).reefusers)
    }).catch(error => {
      console.log(error)
    })
    getCustomTagList().then(res => {
      this.$set(this.filterData, 'custom_tag', util.validate(serializer.getCustomTagSerializer, res.data).customtags)
    }).catch(error => {
      console.log(error)
    })
  }
}
</script>
