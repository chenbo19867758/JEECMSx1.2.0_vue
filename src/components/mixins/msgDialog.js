import MsgDialog from '@/components/dialog/MsgDialog'

export default {
  components: {
    MsgDialog
  },
  data () {
    return {
      msgDialog: {
        visible: false,
        showCancel: true,
        content: '',
        type: '',
        data: {}
      }
    }
  },
  methods: {
    showMsgDialog () {
      console.log(this.msgDialog.visible)
      this.msgDialog.visible = true
    },
    hideMsgDialog () {
      this.msgDialog.visible = false
    }
  }
}
