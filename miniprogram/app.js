// app.js - AI 三餐菜谱规划工具
App({
  globalData: {
    // 用户录入的食材列表
    ingredients: [],
    // 当前生成的菜谱方案
    currentRecipe: null,
    // 是否从历史记录跳转（用于恢复菜谱显示）
    showHistoryRecipe: false,
    // 购物清单
    shoppingList: [],
    // 我的菜谱（云数据库缓存）
    myRecipes: []
  },

  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'cloud1-d3gq9jjh79e6c8ff', // 云开发环境 ID
      traceUser: true
    });
  }
});