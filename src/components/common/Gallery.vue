<template>
  <div class="gallery" :class="mode">
    <div class="thumbnail">
      <div>
        <img v-for="pic in picUrl" :src="pic.url" :alt="pic.title" :key="pic.url" @click="selectPic(pic)">
      </div>
    </div>
    <div class="picture">
      <img :src="curPic.url" :alt="curPic.title">
    </div>
  </div>
</template>
<script>
export default {
  name: 'Gallery',
  props: {
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
          {
            url: 'https://t1.hxzdhn.com/uploads/tu/202005/9999/085a4d3e7e.jpg',
            title: '1'
          },
          {
            url: 'https://siwayu.com/faces/taomiaoxiezhen/ID0077/4.jpg',
            title: '2'
          },
          {
            url: 'http://t1.hxzdhn.com/uploads/tu/201809/9999/5b591df791.jpg',
            title: '3'
          },
          {
            url: 'https://t1.hxzdhn.com/uploads/tu/202004/9999/b55aa006d9.jpg',
            title: '4'
          }
        ]
      }
    }
  },
  data () {
    return {
      curPic: {
        url: '',
        title: ''
      },
      curPicUrl: ''
    }
  },
  methods: {
    selectPic (val) {
      this.curPic = this._.cloneDeep(val)
      let image = new Image()
      image.src = this.curPic.url
      image.onload = () => {
        if (image.width > image.height) {
          this.picDom.style.width = '100%'
          this.picDom.style.maxWidth = '100%'
        } else {
          this.picDom.style.height = '100%'
          this.picDom.style.maxHeight = '100%'
        }
      }
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
    img {
      display: block;
      cursor: pointer;
      border-radius: 4px;
      transition: all .3s linear;
      &:hover {
        box-shadow: 0 0 6px #333333;
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
    width: 200px;
  }
}
.vertical {
  flex-direction: column;
  .thumbnail {
    height: 200px;
    div {
      display: flex;
      height: 100%;
      overflow: auto;
      img {
        height: 100%;
        margin-right: 1em;
      }
    }
  }
  .vertical {
    img {
      height: 100%;
    }
  }
}
</style>
