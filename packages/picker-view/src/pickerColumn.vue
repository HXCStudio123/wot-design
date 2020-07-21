<template>
  <div class="wd-picker-view-wrapper" :style="'height: ' + visibleItemHeight + 'px;'">
    <ul
      ref="roller"
      class="wd-picker-view-roller"
      :style="'top: ' + (visibleItemHeight / 2 - itemHeight / 2 ) + 'px;'"
    >
      <li
        v-for="(item, index) in data"
        :key="index"
        :class="{
        'wd-picker-view-roller__item': 1,
        'is-hidden': isHidden(index),
        'wd-picker-view-roller__item--disabled': typeof item === 'string' ? false : item.disabled
        }"
        :style="{
        'transform': `rotate3d(1, 0, 0, ${-18 * index}deg) translateZ(${radius}px)`
        }"
        v-html="arrowHtml ? getItemLabel(item) : ''"
        @click="selectItem(index)"
      >{{ arrowHtml ? '' : getItemLabel(item) }}</li>
    </ul>
    <div
      class="wd-picker-view-content"
      :style="'top: ' + (visibleItemHeight / 2 - itemHeight / 2 ) + 'px;'"
    >
      <ul class="wd-picker-view-list" ref="list">
        <li
          v-for="(item, index) in data"
          :key="index"
          :class="{'wd-picker-view-roller__item--disabled': typeof item === 'string' ? false : item.disabled}"
          v-html="arrowHtml ? getItemLabel(item) : ''"
        >{{ arrowHtml ? '' : getItemLabel(item) }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { range } from 'wot-design/src/utils'

const MOMENTUM_LIMIT_DURATION = 300 // 惯性滑动限制最大时间
const MOMENTUM_DURATION = 600 // 惯性滑动持续时间

export default {
  name: 'WdPickerViewColumn',
  data () {
    return {
      touchParams: {
        startY: 0,
        endY: 0,
        startTime: 0,
        endTime: 0
      },
      // 滑动到的 当前索引
      currentIndex: 1,
      // 平铺 translateY 高度
      transformY: 0,
      // 弧长 | 每一项高
      itemHeight: 35,
      // 当前滚动距离
      scrollDistance: 0,
      // 当前选中索引（已经emit）
      selectedIndex: 0,
      // 半径
      radius: 110,
      // 单个弧形角度
      rollAngle: 18,
      // 判断是否
      moving: false,
      data: this.initialData || []
    }
  },
  props: {
    arrowHtml: Boolean,
    visibleItemCount: Number,
    initialData: {
      type: Array,
      default () {
        return []
      }
    },
    defaultIndex: {
      type: Number,
      default: 0
    },
    value: [String, Number],
    labelKey: String,
    valueKey: String
  },
  computed: {
    length () {
      return this.data.length
    },
    visibleItemHeight () {
      const visible = Math.round(this.visibleItemCount > 7 ? 7 : (this.visibleItemCount < 1 ? 1 : this.visibleItemCount))

      const heightMap = {
        1: 35,
        2: 35 + 33,
        3: 35 + 33 * 2,
        4: 35 + 33 * 2 + 28,
        5: 35 + 33 * 2 + 28 * 2,
        6: 35 + 33 * 2 + 28 * 2 + 20,
        7: 35 + 33 * 2 + 28 * 2 + 20 * 2
      }
      return Number(heightMap[visible])
    }
  },
  watch: {
    value: {
      handler () {
        let selectedIndex = 0
        for (let i = 0; i < this.length; i++) {
          if (this.getItemValue(this.data[i]) === this.value) {
            selectedIndex = i
            break
          }
        }
        this.setIndex(selectedIndex, false)
      },
      immediate: true
    },
    initialData () {
      this.data = this.initialData || []
    },
    selectedIndex (val) {
      if (val !== this.currentIndex) {
        this.transformY = 0
        this.setMove(-this.itemHeight * val, 'end', 0, false)
      }
    }
  },
  methods: {
    isHidden (index) {
      if (index >= this.currentIndex + 9 || index <= this.currentIndex - 9) {
        return true
      } else {
        return false
      }
    },
    setTransform (translateY = 0, type, time = MOMENTUM_DURATION, deg) {
      if (type === 'end') {
        this.$refs.list.style.webkitTransition = `transform ${time}ms cubic-bezier(0.19, 1, 0.22, 1)`
        this.$refs.roller.style.webkitTransition = `transform ${time}ms cubic-bezier(0.19, 1, 0.22, 1)`
      } else {
        this.$refs.list.style.webkitTransition = ''
        this.$refs.roller.style.webkitTransition = ''
      }
      this.$refs.list.style.webkitTransform = `translate3d(0, ${translateY}px, 0)`
      this.$refs.roller.style.webkitTransform = `rotate3d(1, 0, 0, ${deg}deg)`
      this.scrollDistance = translateY
    },

    setMove (move, type, time, change = true) {
      let updateMove = move + this.transformY
      this.moving = true

      if (type === 'end') {
        // 限定滚动距离
        this.moving = false
        if (updateMove > 0) {
          updateMove = 0
        }
        if (updateMove < -(this.length - 1) * this.itemHeight) {
          updateMove = -(this.length - 1) * this.itemHeight
        }
        const endMove = Math.round(updateMove / this.itemHeight) * this.itemHeight
        let index = Math.abs(Math.round(endMove / this.itemHeight))

        const deg = (Math.abs(Math.round(endMove / this.itemHeight))) * this.rollAngle
        // 添加禁用兜底
        if (this.data[index] && this.data[index].disabled) {
          index = this.selectedIndex
          this.selectItem(index)
        } else {
          this.setTransform(endMove, type, time, deg)
        }

        this.currentIndex = index
        if (change) {
          this.setIndex(this.currentIndex)
        }
      } else {
        let deg = '0deg'
        // 滚动过程中设置最大角度限制
        const maxDeg = (this.length - 1) * this.rollAngle + 30
        const minDeg = -30
        deg = range(
          updateMove < 0
            ? (Math.abs(updateMove / this.itemHeight)) * this.rollAngle
            : (-updateMove / this.itemHeight) * this.rollAngle,
          minDeg,
          maxDeg)
        // touch 事件超出当前区域，会触发触底回弹，因此需要阻止继续移动的行为
        if (deg === minDeg || deg === maxDeg) return
        this.currentIndex = Math.abs(Math.round(updateMove / this.itemHeight))

        // 根据限制角度计算当前 竖向滑动 距离
        this.setTransform(updateMove, null, null, deg)
      }
    },
    getItemLabel (item) {
      return typeof item === 'object' && this.labelKey in item ? item[this.labelKey] : item
    },
    getItemValue (item) {
      return typeof item === 'object' && this.valueKey in item ? item[this.valueKey] : this.getItemLabel(item)
    },
    adjustIndex (index) {
      index = range(index, 0, this.length)

      for (let i = index; i < this.length; i++) {
        if (typeof this.data[i] !== 'object' || !this.data[i].disabled) return i
      }

      for (let i = this.length - 1; i >= index; i--) {
        if (typeof this.data[i] !== 'object' || !this.data[i].disabled) return i
      }
    },
    selectItem (index) {
      if (this.moving) return

      this.transformY = -this.currentIndex * this.itemHeight
      this.setMove((this.currentIndex - index) * this.itemHeight, 'end', MOMENTUM_DURATION)
    },
    setIndex (index, userAction = true) {
      index = this.adjustIndex(index)

      if (this.selectedIndex !== index) {
        this.selectedIndex = index

        if (userAction) {
          this.$emit('change')
        }
      }
    },
    onTouchStart (event) {
      const changedTouches = event.changedTouches[0]
      this.touchParams.startY = changedTouches.pageY
      this.touchParams.startTime = event.timestamp || Date.now()
      this.transformY = this.scrollDistance
    },
    onTouchMove (event) {
      event.preventDefault()
      const changedTouches = event.changedTouches[0]
      this.touchParams.lastY = changedTouches.pageY
      this.touchParams.lastTime = event.timestamp || Date.now()
      const move = this.touchParams.lastY - this.touchParams.startY
      this.setMove(move)
    },

    onTouchEnd (event) {
      const changedTouches = event.changedTouches[0]
      this.touchParams.lastY = changedTouches.pageY
      this.touchParams.lastTime = event.timestamp || Date.now()
      let move = this.touchParams.lastY - this.touchParams.startY

      let moveTime = this.touchParams.lastTime - this.touchParams.startTime
      if (moveTime <= MOMENTUM_LIMIT_DURATION) {
        move = move * 2
        moveTime = moveTime + MOMENTUM_DURATION
        this.setMove(move, 'end', moveTime)
      } else {
        this.setMove(move, 'end')
      }
    },
    getValue () {
      let item = this.data[this.selectedIndex]

      if (item) {
        return this.getItemValue(this.data[this.selectedIndex])
      }
    },
    getLabel () {
      return this.getItemLabel(this.data[this.selectedIndex])
    },
    setValue (value) {
      for (let i = 0; i < this.length; i++) {
        if (this.getItemValue(this.data[i]) === value && !this.data[i].disabled) {
          this.setIndex(i, false)
          return
        }
      }
    }
  },
  created () {
    if (this.$parent.children) {
      this.$parent.children.push(this)
    }
  },
  mounted () {
    // 初始化位置 函数
    this.$nextTick(() => {
      this.setMove(-this.itemHeight * this.selectedIndex, 'end', 0)
      this.$el.addEventListener('touchstart', this.onTouchStart)
      this.$el.addEventListener('touchmove', this.onTouchMove)
      this.$el.addEventListener('touchend', this.onTouchEnd)
      this.$el.addEventListener('touchcancel', this.onTouchEnd)
    })
  },
  beforeDestroy () {
    // 移除监听
    this.$el.removeEventListener('touchstart', this.onTouchStart)
    this.$el.removeEventListener('touchmove', this.onTouchMove)
    this.$el.removeEventListener('touchend', this.onTouchEnd)
    this.$el.removeEventListener('touchcancel', this.onTouchEnd)
  },
  destroyed () {
    const { children } = this.$parent

    if (children) {
      children.splice(children.indexOf(this), 1)
    }
  }
}
</script>
