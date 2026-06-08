// 买菜清单页面
var app = getApp();

Page({
  data: {
    shoppingList: [],
    boughtList: [],
    boughtCount: 0
  },

  onShow: function () {
    this.loadData();
  },

  loadData: function () {
    var shoppingList = app.globalData.shoppingList || [];
    var boughtList = [];
    try {
      boughtList = wx.getStorageSync('bought_ingredients') || [];
    } catch (e) {
      console.error('读取已购记录失败', e);
    }
    this.setData({
      shoppingList: shoppingList,
      boughtList: boughtList,
      boughtCount: boughtList.length
    });
  },

  // 切换购买状态
  toggleBought: function (e) {
    var name = e.currentTarget.dataset.name;
    var type = e.currentTarget.dataset.type;
    var shoppingList = this.data.shoppingList.slice();
    var boughtList = this.data.boughtList.slice();

    if (type === 'shopping') {
      // 从未购变为已购
      var idx = shoppingList.indexOf(name);
      if (idx >= 0) {
        shoppingList.splice(idx, 1);
        boughtList.push(name);
      }
    } else {
      // 从已购变为未购
      var idx = boughtList.indexOf(name);
      if (idx >= 0) {
        boughtList.splice(idx, 1);
        shoppingList.push(name);
      }
    }

    this.setData({
      shoppingList: shoppingList,
      boughtList: boughtList,
      boughtCount: boughtList.length
    });

    app.globalData.shoppingList = shoppingList;
    try {
      wx.setStorageSync('bought_ingredients', boughtList);
    } catch (e) {
      console.error('保存已购记录失败', e);
    }
  },

  // 一键清空
  clearAll: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定清空所有清单吗？',
      success: function (res) {
        if (res.confirm) {
          app.globalData.shoppingList = [];
          try {
            wx.setStorageSync('bought_ingredients', []);
          } catch (e) {
            console.error('清空失败', e);
          }
          that.setData({
            shoppingList: [],
            boughtList: [],
            boughtCount: 0
          });
        }
      }
    });
  }
});