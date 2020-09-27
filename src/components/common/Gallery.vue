<template>
  <Modal v-model="curOpen" :closable="false" fullscreen @on-ok="close(true)" @on-cancel="close(false)">
    <div class="gallery" :class="mode">
      <div class="thumbnail">
        <ul>
          <li v-for="pic in picUrl" :key="pic.name">
            <img :src="pic.file" :alt="pic.name" :title="pic.name" @click="selectPic(pic)">
            <p :title="pic.name">{{ pic.name }}</p>
          </li>
        </ul>
      </div>
      <div class="picture">
        <img :src="curPic.file" :alt="curPic.name">
      </div>
    </div>
  </Modal>
</template>
<script>
export default {
  name: 'Gallery',
  props: {
    open: Boolean,
    mode: {
      type: String,
      default: 'horizontal',
      validator: (val) => {
        if (val !== 'horizontal' || val !== 'vertical') {
          return 'horizontal'
        }
      }
    },
    picUrl: {
      type: Array,
      default () {
        return [
          // {
          //   name: 1,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/6ef75a2cbd.jpg'
          // }, {
          //   name: 2,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/fd949f19b7.jpg'
          // }, {
          //   name: 3,
          //   file: 'http://t1.hxzdhn.com/uploads/tu/202003/9999/0fe7a588bd.jpg'
          // }, {
          //   name: 4,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202004/9999/20c1f570c5.jpg'
          // }, {
          //   name: 5,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/6ef75a2cbd.jpg'
          // }, {
          //   name: 6,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/fd949f19b7.jpg'
          // }, {
          //   name: 7,
          //   file: 'http://t1.hxzdhn.com/uploads/tu/202003/9999/0fe7a588bd.jpg'
          // }, {
          //   name: 8,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202004/9999/20c1f570c5.jpg'
          // }, {
          //   name: 9,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/6ef75a2cbd.jpg'
          // }, {
          //   name: 10,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/fd949f19b7.jpg'
          // }, {
          //   name: 11,
          //   file: 'http://t1.hxzdhn.com/uploads/tu/202003/9999/0fe7a588bd.jpg'
          // }, {
          //   name: 12,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202004/9999/20c1f570c5.jpg'
          // }, {
          //   name: 13,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/6ef75a2cbd.jpg'
          // }, {
          //   name: 14,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/fd949f19b7.jpg'
          // }, {
          //   name: 15,
          //   file: 'http://t1.hxzdhn.com/uploads/tu/202003/9999/0fe7a588bd.jpg'
          // }, {
          //   name: 16,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202004/9999/20c1f570c5.jpg'
          // }, {
          //   name: 17,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/6ef75a2cbd.jpg'
          // }, {
          //   name: 18,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/fd949f19b7.jpg'
          // }, {
          //   name: 19,
          //   file: 'http://t1.hxzdhn.com/uploads/tu/202003/9999/0fe7a588bd.jpg'
          // }, {
          //   name: 20,
          //   file: 'https://t1.hxzdhn.com/uploads/tu/202004/9999/20c1f570c5.jpg'
          // }
        ]
      }
    }
  },
  data () {
    return {
      curPic: {
        file: '',
        name: ''
      },
      curOpen: false
    }
  },
  watch: {
    picUrl (val) {
      setTimeout(() => {
        if (val[0]) this.curPic = JSON.parse(JSON.stringify(val[0]))
      }, 300)
    },
    curPic (val) {
      let image = new Image()
      image.src = this.curPic.file
      image.onload = () => {
        if (image.width > image.height) {
          this.picDom.style.width = '100%'
          this.picDom.style.maxWidth = '100%'
        } else {
          this.picDom.style.height = '100%'
          this.picDom.style.maxHeight = '100%'
        }
      }
    },
    open (val) {
      this.curOpen = val
    }
  },
  methods: {
    selectPic (val) {
      this.curPic = JSON.parse(JSON.stringify(val))
    },
    close (toggle) {
      if (toggle) {
        this.$emit('getPic', this.curPic)
      }
      this.$emit('close', false)
    }
  },
  mounted () {
    this.picDom = document.querySelector('.picture > img')
  }
}
</script>
<style lang="less" scoped>
@import '../../css/common.less';
.gallery {
  display: flex;
  height: 100%;
  .thumbnail {
    padding: 1em;
    border-radius: 4px;
    background-color: @darkBGC;
    ul {
      list-style: none;
      overflow: auto;
      li {
        text-align: center;
        img {
          cursor: pointer;
          border-radius: 4px;
          transition: all .3s linear;
          &:hover {
            box-shadow: 0 0 6px #333333;
          }
        }
      }
      p {
        width: 100%;
        color: @logoColor;
        text-align: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .picture {
    flex: 1;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 1.4em;
    background-color: @lightBGC;
  }
}
.horizontal {
  flex-direction: row;
  .thumbnail {
    height: 100%;
    width: 160px;
    ul {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      li {
        width: 100%;
        margin-bottom: 1.4em;
        img {
          width: 100%;
        }
      }
      :last-child {
        margin-bottom: 0;
      }
    }
  }
}
.vertical {
  flex-direction: column;
  .thumbnail {
    height: 200px;
    padding-bottom: 0.4em;
    ul {
      display: flex;
      height: 100%;
      li {
        height: 100%;
        width: 100px;
        margin-right: 1em;
        img {
          height: calc(100% - 28px);
        }
      }
      :last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
