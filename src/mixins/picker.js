import pickerViewProps from 'wot-design/packages/picker-view/src/pickerViewProps'
import locale from 'wot-design/src/mixins/locale'
import pickerProps from 'wot-design/packages/picker/src/pickerProps'

export default {
  mixins: [locale],
  data () {
    return {
      currentTarget: this,
      showValue: '',
      lastColumns: [],
      popupShow: false
    }
  },
  props: {
    ...pickerViewProps,
    ...pickerProps
  },
  components: {
    CustomCell: {
      render (h) {
        const parent = this.$parent
        const { disabled, readonly, labelWidth, label, value, placeholder, showValue, showPopup, t } = parent
        // 右箭头
        const arrow = !disabled && !readonly ? (<i class="wd-picker__arrow wd-icon-arrow-right"></i>) : ''
        // 右侧展示值
        const valueDiv = <div class="wd-picker__value">
          {((!value || (value instanceof Array && !value.length)) ? placeholder : showValue) || t('wd.picker.placeholder')}
        </div>
        // 左侧label
        const labelWrapper = label || parent.$slots.label ? (<div
          class="wd-picker__label"
          style={labelWidth ? `min-width: ${labelWidth}; max-width: ${labelWidth}` : ''}>
          {parent.$slots.label || (<div>{label}</div>)}
        </div>) : ''
        // 自定义cell
        const cell = parent.$slots.default || <div class="wd-picker__field">
          {labelWrapper}
          {valueDiv}
          {arrow}
        </div>
        const CustomCell = <div onClick={showPopup}>{cell}</div>
        return CustomCell
      }
    },
    toolbar: {
      props: {
        target: Object
      },
      render (h) {
        const { onCancel, onConfirm, cancelButtonText, confirmButtonText, t } = this.target
        const cancelButton = (
          <button
            class="wd-picker__action wd-picker__action--cancel"
            onClick={onCancel}
          >
            {cancelButtonText || t('wd.picker.cancel')}
          </button>
        )

        const confirmButton = (
          <button
            class="wd-picker__action"
            onClick={onConfirm}
          >
            {confirmButtonText || t('wd.picker.done')}
          </button>
        )
        return (
          <div class="wd-picker__toolbar">{cancelButton}{confirmButton}</div>
        )
      }
    }
  },
  methods: {
    showPopup () {
      if (this.disabled || this.readonly) return
      const pickerView = this.timePicker ? this.$refs.pickerView.$refs.pickerView : this.$refs.pickerView
      this.lastColumns = pickerView.getColumnsData()
      this.popupShow = true
    },

    setShowValue (timePicker = false) {
      let label1 = ''
      let label2 = ''
      const pickerView = this.timePicker ? this.$refs.pickerView.$refs.pickerView : this.$refs.pickerView

      if (this.displayFormat) {
        const items = pickerView.getItems()
        label1 = this.displayFormat(items)

        this.showValue = this.region ? label1 + '-' + label2 : label1
        return
      }

      const labels = pickerView.getLabels()
      label1 = labels.length === 1
        ? labels[0]
        : labels.join(',')

      this.showValue = this.region ? label1 + '-' + label2 : label1
    },
    getPickerView (pickerView = true) {
      return this.$refs[pickerView ? 'pickerView' : 'endPickerView']
    }
  }
}
