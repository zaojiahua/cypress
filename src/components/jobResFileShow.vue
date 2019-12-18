<template>
  <div>
    <div v-for="(file, index) in filesData" :key="index" v-show="index === currentFile" class="file-container">
        <div v-if="file.type === 'jpg' || file.type === 'png'" class="img">
            <img :src="file.file" :alt="file.name" :title="file.name">
        </div>
        <div v-else @keydown="keydownHandler" class="text">
            <Input type="textarea" :autosize="{minRows: 30, maxRows: 30}" v-model="file.file" />
            <Button type="primary" long @click="saveChange(file.file)" style="margin-top: 20px;">保存更改</Button>
        </div>
    </div>
  </div>
</template>

<script>
import { isJsonString, insertAfterCursor } from '../lib/tools'

export default {
  props: {
    filesData: {
      type: Array,
      required: true
    },
    currentFile: {
      type: Number,
      default: 0
    }
  },
  methods: {
    saveChange (file) {
      if (isJsonString(file)) {
        this.$emit('saveChange', file)
      } else {
        this.$Message.error({
          background: true,
          content: '不是JSON格式，请检查您的内容'
        })
      }
    },
    keydownHandler (event) {
      let insertStr = '  '
      if (event.keyCode === 9) {
        event.preventDefault()
        insertAfterCursor(event.target, insertStr)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.file-container {
    // height: 900px;

    box-sizing: border-box;

    .img{
        text-align: center;
        max-height: 900px;
        img {
            max-height: 900px;
        }
    }
}
</style>
