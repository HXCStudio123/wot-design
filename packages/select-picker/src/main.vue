<template>
  <div class="wd-col-picker wd-select-picker">
    <div class="wd-col-picker__field" @click="showPicker">
      <slot>
        <div
          class="wd-col-picker__cell"
          :class="[
            {
            'is-disabled': disabled,
            'is-readonly': readonly,
            'is-align-right': alignRight,
            'is-error': error
            },
            size ? `is-${size}` : ''
          ]"
        >
          <div
            v-if="label || $slots.label"
            class="wd-col-picker__label"
            :class="{
              'is-required': required
            }"
            :style="labelWidth ? `min-width: ${labelWidth}; max-width: ${labelWidth}` : ''"
          >
            <slot name="label">{{ label }}</slot>
          </div>
          <div
            class="wd-col-picker__value"
            :class="{
              'wd-col-picker__value--placeholder': (!value || (value instanceof Array && !value.length))
            }"
          >{{ ((!value || (value instanceof Array && !value.length)) ? placeholder : showValue) || t('wd.colPicker.placeholder') }}</div>
          <i v-if="!disabled && !readonly" class="wd-col-picker__arrow wd-icon-arrow-right"></i>
        </div>
      </slot>
    </div>
    <wd-action-sheet
      v-model="pickerShow"
      :duration="250"
      :title="title || t('wd.colPicker.title')"
      @close="handlePickerClose"
    >
      <div class="wd-select-picker__wrapper">
        <slot name="content">
          <!-- 多选 -->
          <wd-checkbox-group v-if="type === 'checkbox'" v-model="value" cell size="large">
            <wd-checkbox
              v-for="(item, index) in dataset"
              :key="index"
              :value="item[valueKey]"
              :disabled="item.disabled"
            >{{item[labelKey]}}</wd-checkbox>
          </wd-checkbox-group>
          <!-- 单选 -->
          <wd-radio-group v-if="type === 'radio'" v-model="value" size="large" cell>
            <wd-radio
              v-for="(item, index) in dataset"
              :key="index"
              :value="item[valueKey]"
              :disabled="item.disabled"
            >{{item[labelKey]}}</wd-radio>
          </wd-radio-group>
        </slot>
      </div>
      <div class="footer">
        <wd-button suck type="primary" @click="onConfirm">确定</wd-button>
      </div>
    </wd-action-sheet>
  </div>
</template>

<script>
import locale from 'wot-design/src/mixins/locale'
import WdActionSheet from 'wot-design/packages/action-sheet'
import WdCheckbox from 'wot-design/packages/checkbox'
import WdCheckboxGroup from 'wot-design/packages/checkbox-group'
import WdRadio from 'wot-design/packages/radio'
import WdRadioGroup from 'wot-design/packages/radio-group'
import cellProps from 'wot-design/packages/select-picker/src/cellProps'

// import WdLoading from 'wot-design/packages/loading'
// import animateScrollLeft from 'wot-design/src/utils/animateScrollLeft'

export default {
  name: 'WdSelectPicker',
  mixins: [locale],
  components: {
    WdActionSheet,
    WdCheckbox,
    WdCheckboxGroup,
    WdRadio,
    WdRadioGroup
  },
  data () {
    return {
      pickerShow: false,
      currentCol: 0,
      selectList: [],
      pickerColSelected: [],
      loading: false,
      showValue: '',
      isChange: false,
      lastSelectList: [],
      lastPickerColSelected: [],
      lineStyle: {}
    }
  },
  props: {
    ...cellProps,
    dataset: {
      type: Array,
      default () {
        return []
      }
    },
    value: [Array, String, Number, Boolean],
    // type: checkbox/radio/custom
    type: {
      type: String,
      default: 'checkbox'
    },
    // columns: {
    //   type: Array,
    //   required: true
    // },
    // label: String,
    // labelWidth: String,
    // disabled: Boolean,
    // readonly: Boolean,
    // placeholder: String,
    // title: String,
    // alignRight: Boolean,
    // error: Boolean,
    // required: Boolean,
    // size: String,
    // columnChange: {
    //   type: Function,
    //   required: true
    // },
    displayFormat: Function,
    beforeConfirm: Function,
    valueKey: {
      type: String,
      default: 'value'
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    loadingColor: String
  },
  watch: {
    value: {
      handler (val) {
        this.setShowValue()
      },
      immediate: true
    }
  },
  methods: {
    handlePickerClose () {
      // 未确定选项时，数据还原复位
      this.$emit('close')
    },
    showPicker () {
      if (this.disabled || this.readonly) return
      this.pickerShow = true
    },
    onConfirm () {
      this.pickerShow = false
    },
    setShowValue () {
      this.showValue = this.value
    }
  }
}
</script>
