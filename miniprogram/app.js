// app.js - AI 三餐菜谱规划工具
App({
  globalData: {
    // 用户信息
    userInfo: null,
    openId: '',
    // 用户录入的食材列表
    ingredients: [],
    // 当前生成的菜谱方案
    currentRecipe: null,
    // 是否从历史记录跳转（用于恢复菜谱显示）
    showHistoryRecipe: false,
    // 购物清单
    shoppingList: [],
    // 我的菜谱（云数据库缓存）
    myRecipes: [],
    // 主题模式：light / dark
    theme: 'light'
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

    // 读取本地缓存的主题设置
    try {
      var theme = wx.getStorageSync('app_theme');
      if (theme) {
        this.globalData.theme = theme;
      }
    } catch (e) {
      console.error('读取主题设置失败', e);
    }

    // 用户登录获取身份
    this.userLogin();
  },

  // 用户登录
  userLogin: function () {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          // 通过云函数获取 openid
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: { type: 'getOpenId' },
            success: function (loginRes) {
              if (loginRes.result && loginRes.result.openid) {
                that.globalData.openId = loginRes.result.openid;
                // 尝试读取本地缓存的用户信息
                try {
                  var cachedUser = wx.getStorageSync('user_info');
                  if (cachedUser) {
                    that.globalData.userInfo = cachedUser;
                  }
                } catch (e) {
                  console.error('读取缓存用户信息失败', e);
                }
              }
            },
            fail: function (err) {
              console.error('获取用户身份失败', err);
            }
          });
        }
      },
      fail: function (err) {
        console.error('登录失败', err);
      }
    });
  },

  // 保存用户信息到本地缓存
  saveUserInfo: function (userInfo) {
    this.globalData.userInfo = userInfo;
    try {
      wx.setStorageSync('user_info', userInfo);
    } catch (e) {
      console.error('保存用户信息失败', e);
    }
  }
});