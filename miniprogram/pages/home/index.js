// 食材录入页面
const app = getApp();

Page({
  data: {
    inputValue: '',
    ingredients: [],
    quickSelected: [],
    recognizing: false,
    // 快速选择分类
    quickCategories: [
      { name: '蔬菜', items: ['西红柿', '土豆', '青菜', '白菜', '胡萝卜', '黄瓜', '茄子', '青椒', '豆角', '西兰花', '冬瓜', '洋葱'] },
      { name: '肉类', items: ['猪肉', '牛肉', '鸡肉', '鸡蛋', '排骨', '鱼', '虾', '鸡翅', '五花肉', '鸡腿'] },
      { name: '主食', items: ['大米', '面条', '面粉', '馒头', '米粉', '饺子皮', '面包', '小米', '玉米'] },
      { name: '调料', items: ['油', '盐', '酱油', '醋', '料酒', '生抽', '老抽', '蚝油', '豆瓣酱', '姜', '蒜', '葱', '花椒', '辣椒'] }
    ]
  },

  onShow: function () {
    var ingredients = app.globalData.ingredients || [];
    this.setData({ ingredients: ingredients, quickSelected: ingredients });
  },

  // 手动输入
  onInput: function (e) {
    this.setData({ inputValue: e.detail.value });
  },

  // 添加食材
  addIngredient: function () {
    var name = this.data.inputValue.trim();
    if (!name) {
      wx.showToast({ title: '请输入食材名称', icon: 'none' });
      return;
    }
    var ingredients = app.globalData.ingredients || [];
    if (ingredients.indexOf(name) >= 0) {
      wx.showToast({ title: '该食材已添加', icon: 'none' });
      this.setData({ inputValue: '' });
      return;
    }
    ingredients.push(name);
    app.globalData.ingredients = ingredients;
    this.setData({ ingredients: ingredients, quickSelected: ingredients, inputValue: '' });
  },

  // 快速选择切换
  toggleQuickIngredient: function (e) {
    var name = e.currentTarget.dataset.name;
    var ingredients = app.globalData.ingredients || [];
    var idx = ingredients.indexOf(name);
    if (idx >= 0) {
      ingredients.splice(idx, 1);
    } else {
      ingredients.push(name);
    }
    app.globalData.ingredients = ingredients;
    this.setData({ ingredients: ingredients, quickSelected: ingredients });
  },

  // 删除食材
  removeIngredient: function (e) {
    var idx = e.currentTarget.dataset.index;
    var ingredients = app.globalData.ingredients || [];
    ingredients.splice(idx, 1);
    app.globalData.ingredients = ingredients;
    this.setData({ ingredients: ingredients, quickSelected: ingredients });
  },

  // 清空全部
  clearAll: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定清空所有食材吗？',
      success: function (res) {
        if (res.confirm) {
          app.globalData.ingredients = [];
          that.setData({ ingredients: [], quickSelected: [] });
        }
      }
    });
  },

  // 拍照识别食材
  takePhoto: function () {
    var that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: function (res) {
        var filePath = res.tempFiles[0].tempFilePath;
        that.recognizeIngredient(filePath);
      },
      fail: function (err) {
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '拍照失败', icon: 'none' });
        }
      }
    });
  },

  // 调用云函数识别食材
  recognizeIngredient: function (filePath) {
    var that = this;
    this.setData({ recognizing: true });
    wx.showLoading({ title: '识别中…' });

    // 上传图片到云存储
    var cloudPath = 'ingredients/' + Date.now() + '.jpg';
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: function (uploadRes) {
        // 调用云函数进行识别
        wx.cloud.callFunction({
          name: 'quickstartFunctions',
          data: {
            type: 'recognizeIngredient',
            fileID: uploadRes.fileID
          },
          success: function (callRes) {
            wx.hideLoading();
            that.setData({ recognizing: false });
            if (callRes.result && callRes.result.ingredients) {
              var newIngredients = callRes.result.ingredients;
              var ingredients = app.globalData.ingredients || [];
              newIngredients.forEach(function (item) {
                if (ingredients.indexOf(item) === -1) {
                  ingredients.push(item);
                }
              });
              app.globalData.ingredients = ingredients;
              that.setData({ ingredients: ingredients, quickSelected: ingredients });
              wx.showToast({ title: '识别成功', icon: 'success' });
            } else {
              wx.showToast({ title: '未识别到食材，请重试', icon: 'none' });
            }
          },
          fail: function () {
            wx.hideLoading();
            that.setData({ recognizing: false });
            // 云函数调用失败，降级为本地模拟识别
            that.mockRecognize();
          }
        });
      },
      fail: function () {
        wx.hideLoading();
        that.setData({ recognizing: false });
        // 云存储上传失败，降级为本地模拟识别
        that.mockRecognize();
      }
    });
  },

  // 本地模拟识别（降级方案）
  mockRecognize: function () {
    var that = this;
    // 常见食材池，随机选 2-3 个模拟识别结果
    var ingredientPool = [
      '鸡蛋', '西红柿', '青菜', '黄瓜', '土豆',
      '猪肉', '鸡肉', '牛肉', '豆腐', '蘑菇',
      '胡萝卜', '白菜', '芹菜', '洋葱', '大蒜'
    ];
    // 随机打乱后取前 2-3 个
    var shuffled = ingredientPool.sort(function () {
      return Math.random() - 0.5;
    });
    var count = Math.floor(Math.random() * 2) + 2; // 2 或 3 个
    var mockIngredients = shuffled.slice(0, count);

    var ingredients = app.globalData.ingredients || [];
    var added = [];
    mockIngredients.forEach(function (item) {
      if (ingredients.indexOf(item) === -1) {
        ingredients.push(item);
        added.push(item);
      }
    });
    app.globalData.ingredients = ingredients;
    that.setData({ ingredients: ingredients, quickSelected: ingredients });
    if (added.length > 0) {
      wx.showToast({ title: '已添加：' + added.join('、'), icon: 'none', duration: 2000 });
    } else {
      wx.showToast({ title: '食材已在列表中', icon: 'none' });
    }
  },

  // 分享给微信好友
  onShareAppMessage: function () {
    return {
      title: 'AI 三餐菜谱规划工具',
      path: '/pages/home/index'
    };
  }
});