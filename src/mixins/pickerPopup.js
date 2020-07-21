import WdPopup from 'wot-design/packages/popup'
import locale from 'wot-design/src/mixins/locale'

export default {
  components: {
    WdPopup
  },
  mixins: [locale],
  props: {
    onCancel: Function,
    onConfirm: Function,
    cancelButtonText: String,
    confirmButtonText: String,
    popupShow: Boolean
  },
  render (h) {
    const cancelButton = (
      <button
        class="wd-picker__action wd-picker__action--cancel"
        onClick={this.onCancel}
      >
        {this.cancelButtonText || this.t('wd.picker.cancel')}
      </button>
    )

    const confirmButton = (
      <button
        class="wd-picker__action"
        // onClick={this.onConfirm}
      >
        {this.confirmButtonText || this.t('wd.picker.done')}
      </button>
    )

    const toolbar = (
      <wd-popup
        v-model={this.popupShow}
        position="bottom"
        duration={250}
        // click-modal={this.onCancel}
      >
        <div class="wd-picker__toolbar">{cancelButton}{confirmButton}</div>
        {this.$slots.default}
      </wd-popup>
    )
    return toolbar
  },
  methods: {
    test () {
      console.log('test')
    }
  }
}
