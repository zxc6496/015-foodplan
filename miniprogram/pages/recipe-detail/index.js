// 菜谱详情页面
var app = getApp();

Page({
  data: {
    meal: null,
    peopleCount: 2,
    isFavorited: false,
    mealIndex: 0
  },

  onLoad: function (options) {
    var that = this;
    var index = parseInt(options.index) || 0;

    if (options.mode === 'fav') {
      // 来自收藏
      var fav = app.globalData.viewFavRecipe;
      if (fav) {
        this.setData({ meal: fav, peopleCount: fav.peopleCount || 2, mealIndex: 0 });
        this.checkFavorite(fav);
      }
    } else {
      // 来自当前菜谱
      var recipe = app.globalData.currentRecipe;
      if (recipe && recipe.meals && recipe.meals[index]) {
        var meal = recipe.meals[index];
        meal.peopleCount = recipe.peopleCount || 2;
        this.setData({
          meal: meal,
          peopleCount: recipe.peopleCount || 2,
          mealIndex: index
        });
        this.checkFavorite(meal);
      }
    }
  },

  // 检查是否已收藏
  checkFavorite: function (meal) {
    try {
      var favorites = wx.getStorageSync('recipe_favorites') || [];
      var found = favorites.some(function (f) {
        return f.dish && f.dish.name === meal.dish.name;
      });
      this.setData({ isFavorited: found });
    } catch (e) {
      console.error('检查收藏状态失败', e);
    }
  },

  // 切换收藏
  toggleFavorite: function () {
    var that = this;
    var meal = this.data.meal;
    if (!meal) return;

    try {
      var favorites = wx.getStorageSync('recipe_favorites') || [];
      if (this.data.isFavorited) {
        // 取消收藏
        favorites = favorites.filter(function (f) {
          return f.dish && f.dish.name !== meal.dish.name;
        });
        this.setData({ isFavorited: false });
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      } else {
        // 添加收藏
        favorites.unshift({
          meal: meal.meal,
          dish: meal.dish,
          peopleCount: this.data.peopleCount
        });
        this.setData({ isFavorited: true });
        wx.showToast({ title: '已收藏', icon: 'success' });
      }
      wx.setStorageSync('recipe_favorites', favorites);
    } catch (e) {
      console.error('收藏操作失败', e);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 分享
  onShareAppMessage: function () {
    var meal = this.data.meal;
    return {
      title: meal ? meal.dish.name + ' - AI 三餐菜谱规划工具' : 'AI 三餐菜谱规划工具',
      path: '/pages/home/index'
    };
  }
});