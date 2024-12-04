import { onMessage, sendMessage } from "@/utils/messaging/extension";

onMessage('download', ({ data }) => {
  if (data.filename) {
    const regexp: RegExp = /[^\w\u4e00-\u9fa5\.\-\_]/g;
    // 替换掉特殊字符
    data.filename = `${i18n.t('name')}-${data.filename}`.replace(regexp, "");
    if (data.path) {
      const path = data.path.replace(regexp, "");
      data.filename = `${path}/${data.filename}`;
    }
  }
  delete data.path;
  return browser.downloads.download(data);
});

onMessage('openPopup', () => {
  return browser.action.openPopup();
});

onMessage('getStringLength', message => {
  return message.data.data.length;
});

// onMessage('openQrCodeDialog', ({ data, sender }) => {
//   return sendMessage('openQrCodeDialog', data, sender.tab?.id);
// });