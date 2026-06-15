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
    var that = this;

    // 从云数据库加载历史记录
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: { type: 'getHistory' },
      success: function (res) {
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
        console.error('从云数据库获取历史失败', err);
        // 降级：从本地存储读取
        that.loadLocalData();
      }
    });

    // 从云数据库加载收藏
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: { type: 'getFavorites' },
      success: function (res) {
        if (res.result && res.result.success && res.result.data) {
          that.setData({ favorites: res.result.data });
        }
      },
      fail: function (err) {
        console.error('从云数据库获取收藏失败', err);
        // 降级：从本地存储读取
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
            console.error('清空本地历史失败', e);
          }
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: { type: 'clearHistory' },
            success: function (res) {
              console.log('云数据库清空历史成功', res);
            },
            fail: function (err) {
              console.error('云数据库清空历史失败', err);
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
            success: function (res) {
              console.log('云数据库清空收藏成功', res);
            },
            fail: function (err) {
              console.error('云数据库清空收藏失败', err);
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
  }
});