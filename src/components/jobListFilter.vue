<template>
  <div class="collapse">
    <div class="collapse__header">
      <span class="collapse__header-tip">搜索</span>
      <Input
        clearable
        v-model="keyword"
        @on-change="getFilteredJob"
        placeholder="Enter something..."
        class="collapse__header-input"
      />
      <Icon type="ios-arrow-up" class="collapse__header-arrow-up" v-show="collapseIsOpen" @click="handleCollapse"/>
      <Icon type="ios-arrow-down" class="collapse__header-arrow-down" v-show="!collapseIsOpen" @click="handleCollapse"/>
      <Button type="error" icon="ios-trash" @click="deleteFilterFactor" v-show="filterConditions.length !== 0">删除</Button>
      <Button icon="ios-close" class="filter__clear" @click="clearFilterFactor" v-show="filterConditions.length !== 0">清除</Button>
    </div>
    <transition name="slide-fade">
      <div class="collapse__content" v-show="collapseIsOpen">
        <Row>
          <Tabs class="tabs" :value="curTab" @on-click="changeTab">
            <TabPane v-for="(column, index) in filterColumn" :key="column.title" :label="column.title" :class="column.key" :name="index.toString()">
              <CheckboxGroup v-model="filterConditions">
                <Row type="flex">
                  <Col span="4" v-for="(item, index) in filterData[column.key]" :key="index">
                    <Checkbox :label="column.key + ':' + index + ':' + item[column.item_key] + ':' + item.id">
                      <span>{{ item[column.item_key] }}</span>
                    </Checkbox>
                  </Col>
                </Row>
              </CheckboxGroup>
            </TabPane>
          </Tabs>
        </Row>
        <div class="collapse__footer">
          <Row class="filter__container">
            <!-- <span class="filter__title">筛选条件</span> -->
            <div class="filter__content" v-show="filterConditions.length !== 0">
              <div v-for="(val, key, idx) in filterFactors" :key="val.title" v-show="val.values.length !== 0" class="filter-factor">
                <span class="filter-factor__title" @click="changeTab(idx + '')">{{val.title}}</span>
                <div class="filter-factor__content">
                  <Tag v-for="(factor, index) in val.values" :key="factor" closable @on-close="close(key, index)">{{ factor.split(':')[2] }}</Tag>
                </div>
              </div>
            </div>
          </Row>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CONST from '../constant/constant'
import { deleteTag } from '../api/reef/request'

export default {
  data () {
    return {
      filterColumn: [ // 将获得的数据以统一的格式存放到filterData中，以便于v-for循环
        {
          title: '测试用途',
          key: 'job_test_area',
          item_key: 'description'
        }, {
          title: '自定义标签',
          key: 'custom_tag',
          item_key: 'custom_tag_name'
        }, {
          title: '维护人员',
          key: 'reefuser',
          item_key: 'username'
        }, {
          title: '适用机型',
          key: 'phone_model',
          item_key: 'phone_model_name'
        }, {
          title: '安卓版本',
          key: 'android_version',
          item_key: 'version'
        }, {
          title: 'ROM版本',
          key: 'rom_version',
          item_key: 'version'
        }
      ],
      filterData: {}, // 提供的筛选条件
      filterConditions: [], // 已选的筛选条件
      filterFactors: {
        'phone_model': {
          title: '适用机型',
          values: []
        },
        'job_test_area': {
          title: '测试用途',
          values: []
        },
        'android_version': {
          title: '安卓版本',
          values: []
        },
        'rom_version': {
          title: 'ROM版本',
          values: []
        },
        'reefuser': {
          title: '维护人员',
          values: []
        },
        'custom_tag': {
          title: '自定义标签',
          values: []
        }
      },
      curTab: '0',
      filterFactorNum: new Array(6).fill(0),
      keyword: '',
      collapseIsOpen: true
    }
  },
  computed: {
    ...mapState(['basicData'])
  },
  watch: {
    filterConditions (newVal, oldVal) {
      if (newVal.length > oldVal.length) {
        let data = newVal[newVal.length - 1].split(':')
        this.filterFactors[data[0]].values.push(newVal[newVal.length - 1])
        this.filterFactorNum[this.curTab]++
      } else {
        for (let i = 0; i < oldVal.length; i++) {
          if (newVal[i] !== oldVal[i]) {
            let data = oldVal[i].split(':')
            let preFactorNum = 0
            for (let j = 0; j < this.curTab; j++) {
              preFactorNum += this.filterFactorNum[j]
            }
            this.filterFactors[data[0]].values.splice(i - preFactorNum, 1)
            this.filterFactorNum[this.curTab]--
            break
          }
        }
      }
      this.getFilteredJob()
    },
    basicData (val) {
      for (let i = 0; i < val.length - 1; i++) {
        this.$set(this.filterData, CONST.BASIC_DATA_KEYS[i].underlineCase, val[i])
      }
    }
  },
  methods: {
    getFilterFactors () { // 将filterConditions数组整理为筛选条件
      let filterFactors = {}
      this.filterConditions.forEach(item => {
        let info = item.split(':')
        let type = info[0]
        let index = info[1]
        if (filterFactors[type] === undefined) filterFactors[type] = []
        filterFactors[type].push(this.filterData[type][index])
      })
      return filterFactors
    },
    getUrlParam () { // 将筛选条件整理为符合格式的url参数
      let filterFactors = this.getFilterFactors()
      let factors = []
      Object.keys(filterFactors).forEach(key => {
        let condition = []
        filterFactors[key].forEach(item => {
          condition.push(item.id)
        })
        if (key === 'job_test_area') key = 'test_area' // 使命名一致
        else if (key === 'phone_model') key = 'phone_models'
        else if (key === 'reefuser') key = 'author'

        condition.forEach(item => {
          item = key + '__id=' + item
        })
        let conditionStr = key + '__id__in=' + 'ReefList[' + condition.join('{%,%}') + ']'
        factors.push(conditionStr)
      })
      return `&job_name__icontains=${this.keyword}&${factors.join('_')}`
    },
    getFilteredJob () { // 筛选条件改变时触发该函数，获取符合条件的job
      this.$emit('getFilterParam', this.getUrlParam())
    },
    clear () { // 清空已选筛选条件
      this.filterConditions = []
      this.getFilteredJob()
    },
    close (key, index) {
      let temp = this.filterFactors[key].values[index]
      this.filterFactors[key].values.splice(index, 1)
      let tempIndex = this.filterConditions.findIndex((val, idx) => {
        return val === temp
      })
      this.filterConditions.splice(tempIndex, 1)
      this.getFilteredJob()
    },
    changeTab (index) {
      this.curTab = index
    },
    clearFilterFactor () {
      this.filterConditions = []
      for (let key in this.filterFactors) {
        this.filterFactors[key].values = []
      }
    },
    deleteFilterFactor () {
      Promise.all(this.filterConditions.map(val => {
        let data = val.split(':')
        return deleteTag(data[0], data[3])
      })).then(res => {
        this.$store.dispatch('setBasicData')
        this.clearFilterFactor()
      })
    },
    handleCollapse () {
      this.collapseIsOpen = !this.collapseIsOpen
    }
  },
  mounted () {
    if (JSON.stringify(this.filterData) === '{}') {
      if (!this.basicData) return
      for (let i = 0; i < this.basicData.length - 1; i++) {
        this.$set(this.filterData, CONST.BASIC_DATA_KEYS[i].underlineCase, this.basicData[i])
      }
    }
  }
}
</script>

<style lang="less" scoped>
.collapse {
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
  border: 1px solid #cccccc;
  border-radius: 6px;
  .slide-fade-enter-active {
    transition: all .3s ease;
  }
  .slide-fade-leave-active {
    transition: all .3s ease;
  }
  .slide-fade-enter, .slide-fade-leave-to {
    opacity: 0;
  }
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6em 0;
    width: 100%;
    background-color: #eeeeee;
    border-radius: 6px;

    &-tip {
      width: 3.6em;
      text-align: center;
    }
    &-arrow-up, &-arrow-down {
      padding: 0.6em;
      margin: 0 0.6em;
      border-radius: 50%;
      cursor: pointer;
      &:hover {
        background-color: #cccccc;
      }
    }
    .filter__clear {
      margin: 0 0.6em;
    }
  }
  &__content {
    padding: 1em;
  }
  &__footer {
    .filter__container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      overflow: hidden;
      .filter__title {
        writing-mode: vertical-lr;
        margin: 1em;
      }
      .filter__content {
        padding: 1em 0 0;
        .filter-factor {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin: 0.2em;
          min-height: 26px;
          &__title {
            font-size: 0.75em;
            width: 6em;
            cursor: pointer;
          }
          &__content {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
          }
        }
      }
    }
  }
}
</style>
