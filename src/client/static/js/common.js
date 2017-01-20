var messager = {
  _parseContent: function (content) {
    if (typeof content !== 'string') {
      if (content.message) {
        return content.message;
      }
      if (content.error && content.error.message) {
        return content.error.message;
      }
      if (content.Detail) {
        return content.Detail;
      }
      return JSON.stringify(content);
    }
    return content;
  },

  error: function (content) {
    content = this._parseContent(content);
    spop({
      template: content,
      position: "top-right",
      style: "error",
      autoclose: 10000,
      group: "same"
    });
  },

  success: function (content) {
    content = this._parseContent(content);
    spop({
      template: content,
      position: "top-right",
      style: "success",
      autoclose: 10000,
      group: "same"
    });
  }
}

window.messager = messager;