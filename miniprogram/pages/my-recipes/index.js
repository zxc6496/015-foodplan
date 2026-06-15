// 我的菜谱列表页面 - 列表展示/删除/筛选/统计
var app = getApp();

Page({
  data: {
    recipes: [],
    allRecipes: [],
    searchKey: '',
    filterCategory: '',
    stats: {
      total: 0,
      monthCount: 0,
      avgPeople: 0
    }
  },

  onLoad: function () {
    this.loadRecipes();
  },

  onShow: function () {
    this.loadRecipes();
  },

  // 从云数据库加载
  loadRecipes: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: { type: 'getMyRecipes' },
      success: function (res) {
        if (res.result && res.result.success) {
          var recipes = res.result.data || [];
          app.globalData.myRecipes = recipes;
          that.setData({ allRecipes: recipes });
          that.applyFilter();
          that.calcStats(recipes);
        } else {
          // 云端返回失败，降级到本地存储
          that.loadLocalRecipes();
        }
      },
      fail: function (err) {
        console.error('加载菜谱失败', err);
        // 云端调用失败，降级到本地存储
        that.loadLocalRecipes();
      }
    });
  },

  // 降级：从本地存储读取
  loadLocalRecipes: function () {
    try {
      var recipes = wx.getStorageSync('my_recipes') || [];
      app.globalData.myRecipes = recipes;
      this.setData({ allRecipes: recipes });
      this.applyFilter();
      this.calcStats(recipes);
    } catch (e) {
      console.error('加载本地菜谱失败', e);
    }
  },

  // 应用筛选
  applyFilter: function () {
    var recipes = this.data.allRecipes;
    var key = this.data.searchKey.trim().toLowerCase();
    var cat = this.data.filterCategory;

    if (key) {
      recipes = recipes.filter(function (r) {
        return r.dishName.toLowerCase().indexOf(key) >= 0;
      });
    }
    if (cat) {
      recipes = recipes.filter(function (r) {
        return r.meal === cat;
      });
    }
    this.setData({ recipes: recipes });
  },

  // 计算统计
  calcStats: function (recipes) {
    var now = new Date();
    var month = now.getMonth();
    var year = now.getFullYear();
    var monthCount = 0;
    var totalPeople = 0;

    recipes.forEach(function (r) {
      if (r.date) {
        var d = new Date(r.date);
        if (d.getMonth() === month && d.getFullYear() === year) {
          monthCount++;
        }
      }
      totalPeople += r.peopleCount || 0;
    });

    this.setData({
      stats: {
        total: recipes.length,
        monthCount: monthCount,
        avgPeople: recipes.length > 0 ? Math.round(totalPeople / recipes.length * 10) / 10 : 0
      }
    });
  },

  // 搜索
  onSearch: function (e) {
    this.setData({ searchKey: e.detail.value });
    this.applyFilter();
  },

  // 分类筛选
  filterByCategory: function (e) {
    this.setData({ filterCategory: e.currentTarget.dataset.cat });
    this.applyFilter();
  },

  // 跳转到添加页面
  goAddPage: function () {
    wx.navigateTo({ url: '/pages/my-recipes/add' });
  },

  // 编辑 - 跳转到添加页面并传入 id
  editRecipe: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/my-recipes/add?id=' + id });
  },

  // 删除
  deleteRecipe: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定删除这条记录吗？',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({ title: '删除中…' });
          wx.cloud.callFunction({
            name: 'quickstartFunctions',
            data: { type: 'deleteMyRecipe', _id: id },
            success: function (res) {
              wx.hideLoading();
              if (res.result && res.result.success) {
                wx.showToast({ title: '已删除', icon: 'success' });
                that.loadRecipes();
              } else {
                wx.showToast({ title: '删除失败', icon: 'none' });
              }
            },
            fail: function (err) {
              wx.hideLoading();
              console.error('删除失败', err);
              wx.showToast({ title: '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  }
});
