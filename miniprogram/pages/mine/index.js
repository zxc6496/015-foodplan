// 我的页面 - 历史记录、收藏
var app = getApp();

Page({
  data: {
    history: [],
    favorites: []
  },

  onShow: function () {
    this.loadData();
  },

  loadData: function () {
    try {
      var history = wx.getStorageSync('recipe_history') || [];
      // 预计算菜名显示文本，避免 wxml 嵌套循环作用域问题
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
      console.error('加载数据失败', e);
    }
  },

  // 查看历史菜谱
  viewHistory: function (e) {
    var idx = e.currentTarget.dataset.index;
    var history = this.data.history;
    if (history[idx]) {
      app.globalData.currentRecipe = history[idx].recipe;
      wx.switchTab({ url: '/pages/generate/index' });
    }
  },

  // 查看收藏菜谱
  viewFavorite: function (e) {
    var idx = e.currentTarget.dataset.index;
    var favorites = this.data.favorites;
    if (favorites[idx]) {
      // 传递收藏数据到菜谱详情页
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
            console.error('清空失败', e);
          }
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
            console.error('清空失败', e);
          }
          that.setData({ favorites: [] });
        }
      }
    });
  }
});