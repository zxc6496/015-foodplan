// 我的页面 - 用户信息、历史记录、收藏、设置入口
var app = getApp();

Page({
  data: {
    userInfo: null,
    openIdShort: '',
    theme: 'light',
    history: [],
    favorites: [],
    historyLoading: true,
    favLoading: true
  },

  onShow: function () {
    this.loadUserInfo();
    this.loadData();
  },

  // 加载用户信息
  loadUserInfo: function () {
    var userInfo = app.globalData.userInfo;
    var openId = app.globalData.openId || '';
    this.setData({
      userInfo: userInfo,
      openIdShort: openId ? openId.substring(0, 8) + '...' : '',
      theme: app.globalData.theme || 'light'
    });
  },

  // 获取用户头像昵称（点击登录触发）
  getUserProfile: function () {
    var that = this;
    wx.getUserProfile({
      desc: '用于显示个人主页',
      success: function (res) {
        app.saveUserInfo(res.userInfo);
        that.setData({ userInfo: res.userInfo });
        wx.showToast({ title: '登录成功', icon: 'success' });
      },
      fail: function (err) {
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '获取用户信息失败', icon: 'none' });
        }
      }
    });
  },

  // 退出登录
  logout: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定退出登录吗？',
      success: function (res) {
        if (res.confirm) {
          app.globalData.userInfo = null;
          try {
            wx.removeStorageSync('user_info');
          } catch (e) {
            console.error('清除用户缓存失败', e);
          }
          that.setData({ userInfo: null });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  // 跳转到设置页
  goSettings: function () {
    wx.navigateTo({ url: '/pages/settings/index' });
  },

  loadData: function () {
    var that = this;
    this.setData({ historyLoading: true, favLoading: true });

    // 从云数据库加载历史记录
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: { type: 'getHistory' },
      success: function (res) {
        that.setData({ historyLoading: false });
        if (res.result && res.result.success && res.result.data) {
          var history = res.result.data;
          history.forEach(function (h) {
            if (h.recipe && h.recipe.meals) {
              h.dishNames = h.recipe.meals.map(function (m) {
                return m.dish.name;
              }).join(' | ');
            } else if (h.meals) {
              h.dishNames = h.meals.map(function (m) {
                return m.dish.name;
              }).join(' | ');
            } else {
              h.dishNames = '';
            }
          });
          that.setData({ history: history });
        }
      },
      fail: function (err) {
        that.setData({ historyLoading: false });
        console.error('从云数据库获取历史失败', err);
        that.loadLocalData();
      }
    });

    // 从云数据库加载收藏
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: { type: 'getFavorites' },
      success: function (res) {
        that.setData({ favLoading: false });
        if (res.result && res.result.success && res.result.data) {
          that.setData({ favorites: res.result.data });
        }
      },
      fail: function (err) {
        that.setData({ favLoading: false });
        console.error('从云数据库获取收藏失败', err);
        that.loadLocalData();
      }
    });
  },

  loadLocalData: function () {
    try {
      var history = wx.getStorageSync('recipe_history') || [];
      history.forEach(function (h) {
        if (h.recipe && h.recipe.meals) {
          h.dishNames = h.recipe.meals.map(function (m) {
            return m.dish.name;
          }).join(' | ');
        } else {
          h.dishNames = '';
        }
      });
      var favorites = wx.getStorageSync('recipe_favorites') || [];
      this.setData({ history: history, favorites: favorites });
    } catch (e) {
      console.error('加载本地数据失败', e);
    }
  },

  // 查看历史菜谱
  viewHistory: function (e) {
    var idx = e.currentTarget.dataset.index;
    var history = this.data.history;
    if (history[idx]) {
      var recipe = history[idx].recipe || { meals: history[idx].meals || [] };
      app.globalData.currentRecipe = recipe;
      app.globalData.showHistoryRecipe = true;
      wx.switchTab({ url: '/pages/generate/index' });
    }
  },

  // 查看收藏菜谱
  viewFavorite: function (e) {
    var idx = e.currentTarget.dataset.index;
    var favorites = this.data.favorites;
    if (favorites[idx]) {
      app.globalData.viewFavRecipe = favorites[idx];
      wx.navigateTo({ url: '/pages/recipe-detail/index?mode=fav&index=' + idx });
    }
  },

  // 清空历史
  clearHistory: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定清空所有历史记录吗？',
      success: function (res) {
        if (res.confirm) {
          try {
            wx.setStorageSync('recipe_history', []);
          } catch (e) {
            console.error('清空本地历史失败', e);
          }
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: { type: 'clearHistory' },
            success: function () {
              wx.showToast({ title: '已清空', icon: 'success' });
            },
            fail: function (err) {
              console.error('云数据库清空历史失败', err);
              wx.showToast({ title: '本地已清空', icon: 'success' });
            }
          });
          that.setData({ history: [] });
        }
      }
    });
  },

  // 清空收藏
  clearFavorites: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定清空所有收藏吗？',
      success: function (res) {
        if (res.confirm) {
          try {
            wx.setStorageSync('recipe_favorites', []);
          } catch (e) {
            console.error('清空本地收藏失败', e);
          }
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: { type: 'clearFavorites' },
            success: function () {
              wx.showToast({ title: '已清空', icon: 'success' });
            },
            fail: function (err) {
              console.error('云数据库清空收藏失败', err);
              wx.showToast({ title: '本地已清空', icon: 'success' });
            }
          });
          that.setData({ favorites: [] });
        }
      }
    });
  },

  // 跳转到我的菜谱页面
  goMyRecipes: function () {
    wx.navigateTo({ url: '/pages/my-recipes/index' });
  },

  // 分享给微信好友
  onShareAppMessage: function () {
    return {
      title: 'AI 三餐菜谱规划工具',
      path: '/pages/home/index'
    };
  }
});
