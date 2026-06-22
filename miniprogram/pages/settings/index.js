// 设置页面 - 主题切换、清除缓存
var app = getApp();

Page({
  data: {
    theme: 'light',
    cacheSize: 0
  },

  onShow: function () {
    this.setData({ theme: app.globalData.theme || 'light' });
    this.getCacheSize();
  },

  // 获取缓存大小
  getCacheSize: function () {
    var that = this;
    wx.getStorageInfo({
      success: function (res) {
        var size = Math.round(res.currentSize / 1024 * 10) / 10;
        that.setData({ cacheSize: size });
      },
      fail: function (err) {
        console.error('获取缓存信息失败', err);
      }
    });
  },

  // 切换主题
  toggleTheme: function (e) {
    var newTheme = e.detail.value ? 'dark' : 'light';
    app.globalData.theme = newTheme;
    try {
      wx.setStorageSync('app_theme', newTheme);
    } catch (err) {
      console.error('保存主题设置失败', err);
    }
    this.setData({ theme: newTheme });
    wx.showToast({ title: newTheme === 'dark' ? '已切换深色模式' : '已切换浅色模式', icon: 'none' });
  },

  // 清除缓存
  clearCache: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定清除缓存吗？（不影响收藏和历史记录）',
      success: function (res) {
        if (res.confirm) {
          try {
            wx.removeStorageSync('app_theme');
            wx.showToast({ title: '缓存已清除', icon: 'success' });
            that.getCacheSize();
          } catch (e) {
            console.error('清除缓存失败', e);
            wx.showToast({ title: '清除失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 清除所有数据
  clearAllData: function () {
    var that = this;
    wx.showModal({
      title: '警告',
      content: '确定清除所有数据吗？此操作不可恢复！',
      confirmColor: '#FF4D4F',
      success: function (res) {
        if (res.confirm) {
          try {
            wx.clearStorageSync();
            app.globalData.ingredients = [];
            app.globalData.myRecipes = [];
            app.globalData.shoppingList = [];
            wx.showToast({ title: '数据已清除', icon: 'success' });
            that.getCacheSize();
          } catch (e) {
            console.error('清除数据失败', e);
            wx.showToast({ title: '清除失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 分享给微信好友
  onShareAppMessage: function () {
    return {
      title: 'AI 三餐菜谱规划工具',
      path: '/pages/home/index'
    };
  }
});
