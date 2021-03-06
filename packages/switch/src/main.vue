<template>
  <div
    class="wd-switch"
    :class="{
      'is-disabled': disabled,
      'is-checked': checked
    }"
    @click.prevent="switchValue"
    :style="switchSty"
  >
    <input
      type="checkbox"
      class="wd-switch__checkbox"
      :disabled="disabled"
      :true-value="activeValue"
      :false-value="inactiveValue"
      @change="handleChange"
      ref="checkbox"
    />
    <i class="wd-switch__circle" :style="circleSty"></i>
  </div>
</template>

<script>
export default {
  name: 'WdSwitch',
  props: {
    value: [Boolean, String, Number],
    disabled: Boolean,
    activeValue: {
      default: true
    },
    inactiveValue: {
      default: false
    },
    activeColor: String,
    inactiveColor: String,
    size: {
      type: String,
      default: '28px'
    },
    beforeChange: Function
  },
  watch: {
    checked () {
      this.$refs.checkbox.checked = this.checked
    }
  },
  computed: {
    checked () {
      return this.value === this.activeValue
    },
    switchSty () {
      let style = {
        'font-size': this.size
      }
      if (this.activeColor && this.checked) {
        style = Object.assign(style, {
          'background': this.activeColor,
          'border-color': this.activeColor
        })
      }
      if (this.inactiveColor && !this.checked) {
        style = Object.assign(style, {
          'background': this.inactiveColor,
          'border-color': this.inactiveColor
        })
      }

      return style
    },
    circleSty () {
      let style
      if (this.activeColor && this.checked) {
        style = {
          'box-shadow': 'none'
        }
      }
      if (this.inactiveColor && !this.checked) {
        style = {
          'box-shadow': 'none'
        }
      }

      return style
    }
  },
  methods: {
    switchValue () {
      !this.disabled && this.handleChange()
    },
    handleChange () {
      let val = this.checked ? this.inactiveValue : this.activeValue

      if (this.beforeChange) {
        this.beforeChange({
          value: val,
          resolve: (pass) => {
            if (pass) {
              this.$emit('input', val)
              this.$emit('change', val)
            }
          }
        })
      } else {
        this.$emit('input', val)
        this.$emit('change', val)
      }
    }
  },
  mounted () {
    this.$refs.checkbox.checked = this.checked
  },
  created () {
    if ([this.activeValue, this.inactiveValue].indexOf(this.value) === -1) {
      this.$emit('input', this.inactiveValue)
    }
  }
}
</script>
