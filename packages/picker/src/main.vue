<template>
  <div :class="customClass">
    <custom-cell />
    <wd-popup
      ref="popup"
      v-model="popupShow"
      :teleport="teleport"
      position="bottom"
      @click-modal="onCancel"
      @popstate="onCancel"
      :duration="250"
      :close-on-click-modal="closeOnClickModal"
      :close-on-popstate="closeOnPopstate"
      :safe-area-inset-bottom="safeAreaInsetBottom"
      class="wd-picker__popup"
    >
      <toolbar :target="currentTarget"></toolbar>
      <div class="wd-picker__container">
        <wd-picker-view
          ref="pickerView"
          v-model="pickerValue"
          :columns="displayColumns"
          :loading="loading"
          :loading-color="loadingColor"
          :arrow-html="arrowHtml"
          :value-key="valueKey"
          :label-key="labelKey"
          :columns-height="columnsHeight"
          :column-change="columnChange"
        />
      </div>
    </wd-popup>
  </div>
</template>

<script>
import locale from 'wot-design/src/mixins/locale'
import WdPopup from 'wot-design/packages/popup'
import WdPickerView from 'wot-design/packages/picker-view'
import picker from 'wot-design/src/mixins/picker'

export default {
  name: 'WdPicker',
  mixins: [locale, picker],
  components: {
    WdPopup,
    WdPickerView
  },

  data () {
    return {
      // 开始
      pickerValue: '',
      lastColumns: [],
      displayColumns: []
    }
  },

  props: {
    columns: [Array, Object],
    value: [String, Number, Boolean, Array],
    teleport: [String, Object]
  },

  watch: {
    value: {
      handler () {
        this.pickerValue = this.value
        this.$nextTick(() => {
          this.setShowValue()
        })
      },
      immediate: true
    },
    columns: {
      handler (val) {
        this.displayColumns = val
        this.lastColumns = val
        this.$nextTick(() => {
          this.setShowValue()
        })
      },
      immediate: true
    }
  },

  methods: {
    // 对外暴露接口，打开弹框
    open () {
      this.showPopup()
    },

    // 对外暴露接口，关闭弹框
    close () {
      this.onCancel()
    },

    onCancel () {
      this.displayColumns = this.lastColumns
      this.pickerValue = this.value
      this.closePopup()
    },

    onConfirm () {
      if (this.loading) {
        this.popupShow = false
        this.$emit('confirm', this.pickerValue)
        return
      }
      if (this.beforeConfirm) {
        this.beforeConfirm(this.pickerValue, isPass => {
          isPass && this.handleConfirm(this.pickerValue)
        })
      } else {
        this.handleConfirm(this.pickerValue)
      }
    },

    showPopInit () {
      const pickerView = this.$refs.pickerView
      this.lastColumns = pickerView.getColumnsData()
    },

    handleConfirm () {
      this.$emit('input', this.pickerValue)
      this.$emit('confirm', this.pickerValue)
      this.closePopup()
    },

    setShowValue () {
      const pickerView = this.$refs.pickerView

      if (this.displayFormat) {
        const items = pickerView.getItems()
        this.showValue = this.displayFormat(items)
        return
      }

      const labels = pickerView.getLabels()
      const label = labels.length === 1
        ? labels[0]
        : labels.join(',')

      this.showValue = label
    }
  }
}
</script>
