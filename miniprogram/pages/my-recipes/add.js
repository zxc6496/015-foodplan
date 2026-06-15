// 添加菜谱页面 - 独立表单页
var app = getApp();

Page({
  data: {
    editingId: '',
    formData: {
      meal: '午餐',
      dishName: '',
      ingredients: '',
      peopleCount: ''
    }
  },

  onLoad: function (options) {
    // 如果传入了编辑数据，填充表单
    if (options.id) {
      var allRecipes = app.globalData.myRecipes || [];
      var recipe = allRecipes.find(function (r) { return r._id === options.id; });
      if (recipe) {
        this.setData({
          editingId: recipe._id,
          formData: {
            meal: recipe.meal,
            dishName: recipe.dishName,
            ingredients: recipe.ingredients,
            peopleCount: String(recipe.peopleCount)
          }
        });
      }
    }
  },

  selectMeal: function (e) {
    this.setData({ 'formData.meal': e.currentTarget.dataset.meal });
  },

  onDishNameInput: function (e) {
    this.setData({ 'formData.dishName': e.detail.value });
  },

  onIngredientsInput: function (e) {
    this.setData({ 'formData.ingredients': e.detail.value });
  },

  onPeopleCountInput: function (e) {
    this.setData({ 'formData.peopleCount': e.detail.value });
  },

  submitForm: function () {
    var that = this;
    var fd = this.data.formData;

    if (!fd.dishName.trim()) {
      wx.showToast({ title: '请输入菜名', icon: 'none' });
      return;
    }
    if (!fd.ingredients.trim()) {
      wx.showToast({ title: '请输入食材', icon: 'none' });
      return;
    }
    var peopleCount = parseInt(fd.peopleCount) || 1;
    if (peopleCount < 1 || peopleCount > 20) {
      wx.showToast({ title: '人数1-20', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中…' });

    var data = {
      meal: fd.meal,
      dishName: fd.dishName.trim(),
      ingredients: fd.ingredients.trim(),
      peopleCount: peopleCount,
      date: new Date().toLocaleDateString()
    };

    var type = this.data.editingId ? 'updateMyRecipe' : 'addMyRecipe';
    var callData = this.data.editingId
      ? { type: type, _id: this.data.editingId, data: data }
      : { type: type, data: data };

    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: callData,
      success: function (res) {
        wx.hideLoading();
        if (res.result && res.result.success) {
          wx.showToast({ title: that.data.editingId ? '修改成功' : '添加成功', icon: 'success' });
          setTimeout(function () {
            wx.navigateBack();
          }, 800);
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      },
      fail: function (err) {
        wx.hideLoading();
        console.error('保存失败', err);
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    });
  },

  goBack: function () {
    wx.navigateBack();
  }
});
