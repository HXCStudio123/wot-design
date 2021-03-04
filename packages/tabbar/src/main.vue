<template>
  <div
    class="wd-tabbar"
    :class="{
      'is-border': border,
      'is-fixed': fixed,
    }"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'WdTabbar',
  provide () {
    return {
      tabbar: this
    }
  },
  data () {
    return {
      items: []
    }
  },
  props: {
    value: [Number, String],
    border: Boolean,
    fixed: Boolean,
    activeColor: String,
    inactiveColor: String,
    badgeColor: String
  },
  computed: {
    activeIndex () {
      let value = 0
      if (typeof this.value === 'number') {
        value = this.value
      } else if (this.items.length) {
        this.items.forEach((item, index) => {
          if (item.name !== this.value) return
          value = index
        })
      }

      return value
    }
  },
  methods: {
    changeTabbar (index) {
      if (this.activeIndex === index) return

      let name = this.items[index].name
      this.$emit('change', index, name)
      if (typeof this.value === 'number') {
        this.$emit('input', index)
      } else {
        this.$emit('input', name)
      }
    }
  }
}
</script>
