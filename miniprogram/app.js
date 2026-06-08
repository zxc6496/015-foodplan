// app.js - AI 三餐菜谱规划工具
App({
  globalData: {
    // 用户录入的食材列表
    ingredients: [],
    // 当前生成的菜谱方案
    currentRecipe: null,
    // 购物清单
    shoppingList: []
  },

  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: '', // 请替换为自己的云开发环境 ID
      traceUser: true
    });
  }
});