const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// ========== 原有功能保持 ==========

// 获取openid
const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID
  };
};

// 获取小程序二维码
const getMiniProgramCode = async () => {
  const resp = await cloud.openapi.wxacode.get({ path: 'pages/index/index' });
  const { buffer } = resp;
  const upload = await cloud.uploadFile({ cloudPath: 'code.png', fileContent: buffer });
  return upload.fileID;
};

// ========== 菜谱数据库操作 ==========

// 保存历史记录到云数据库
const saveHistory = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    await db.collection('recipe_history').add({
      data: {
        openid: wxContext.OPENID,
        time: event.time,
        ingredients: event.ingredients,
        taste: event.taste,
        peopleCount: event.peopleCount,
        meals: event.meals
      }
    });
    return { success: true };
  } catch (e) {
    console.error('保存历史失败', e);
    return { success: false, errMsg: e.message };
  }
};

// 获取历史记录
const getHistory = async () => {
  const wxContext = cloud.getWXContext();
  try {
    var res = await db.collection('recipe_history')
      .where({ openid: wxContext.OPENID })
      .orderBy('time', 'desc')
      .limit(20)
      .get();
    return { success: true, data: res.data };
  } catch (e) {
    console.error('获取历史失败', e);
    return { success: false, errMsg: e.message };
  }
};

// 清空历史记录
const clearHistory = async () => {
  const wxContext = cloud.getWXContext();
  try {
    await db.collection('recipe_history').where({ openid: wxContext.OPENID }).remove();
    return { success: true };
  } catch (e) {
    console.error('清空历史失败', e);
    return { success: false, errMsg: e.message };
  }
};

// 添加收藏
const addFavorite = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    await db.collection('recipe_favorites').add({
      data: {
        openid: wxContext.OPENID,
        time: event.time,
        meal: event.meal,
        dish: event.dish,
        peopleCount: event.peopleCount
      }
    });
    return { success: true };
  } catch (e) {
    console.error('添加收藏失败', e);
    return { success: false, errMsg: e.message };
  }
};

// 取消收藏（按菜名）
const removeFavorite = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    await db.collection('recipe_favorites')
      .where({ openid: wxContext.OPENID, 'dish.name': event.dishName })
      .remove();
    return { success: true };
  } catch (e) {
    console.error('取消收藏失败', e);
    return { success: false, errMsg: e.message };
  }
};

// 获取收藏列表
const getFavorites = async () => {
  const wxContext = cloud.getWXContext();
  try {
    var res = await db.collection('recipe_favorites')
      .where({ openid: wxContext.OPENID })
      .orderBy('time', 'desc')
      .get();
    return { success: true, data: res.data };
  } catch (e) {
    console.error('获取收藏失败', e);
    return { success: false, errMsg: e.message };
  }
};

// 清空收藏
const clearFavorites = async () => {
  const wxContext = cloud.getWXContext();
  try {
    await db.collection('recipe_favorites').where({ openid: wxContext.OPENID }).remove();
    return { success: true };
  } catch (e) {
    console.error('清空收藏失败', e);
    return { success: false, errMsg: e.message };
  }
};

// ========== 我的菜谱 CRUD ==========

// 获取我的菜谱列表
const getMyRecipes = async () => {
  const wxContext = cloud.getWXContext();
  try {
    var res = await db.collection('myRecipes')
      .where({ openid: wxContext.OPENID })
      .orderBy('createTime', 'desc')
      .get();
    return { success: true, data: res.data };
  } catch (e) {
    console.error('获取我的菜谱失败', e);
    return { success: false, errMsg: e.message };
  }
};

// 添加我的菜谱
const addMyRecipe = async (event) => {
  const wxContext = cloud.getWXContext();
  try {
    await db.collection('myRecipes').add({
      data: {
        openid: wxContext.OPENID,
        meal: event.data.meal,
        dishName: event.data.dishName,
        ingredients: event.data.ingredients,
        peopleCount: event.data.peopleCount,
        date: event.data.date,
        createTime: db.serverDate()
      }
    });
    return { success: true };
  } catch (e) {
    console.error('添加我的菜谱失败', e);
    return { success: false, errMsg: e.message };
  }
};

// 更新我的菜谱
const updateMyRecipe = async (event) => {
  try {
    await db.collection('myRecipes').doc(event._id).update({
      data: {
        meal: event.data.meal,
        dishName: event.data.dishName,
        ingredients: event.data.ingredients,
        peopleCount: event.data.peopleCount,
        date: event.data.date
      }
    });
    return { success: true };
  } catch (e) {
    console.error('更新我的菜谱失败', e);
    return { success: false, errMsg: e.message };
  }
};

// 删除我的菜谱
const deleteMyRecipe = async (event) => {
  try {
    await db.collection('myRecipes').doc(event._id).remove();
    return { success: true };
  } catch (e) {
    console.error('删除我的菜谱失败', e);
    return { success: false, errMsg: e.message };
  }
};

// ========== 菜谱相关功能 ==========

// 菜谱模板库
var recipeTemplates = {
  '西红柿': [
    { name: '西红柿炒鸡蛋', ingredients: '西红柿,鸡蛋,葱,姜,蒜,盐,油,生抽', steps: '1. 西红柿切块，鸡蛋打散备用\n2. 热锅倒油，先炒鸡蛋至凝固盛出\n3. 锅中再加少许油，爆香葱姜蒜\n4. 放入西红柿翻炒出汁\n5. 倒回鸡蛋，加盐和生抽调味\n6. 翻炒均匀即可出锅', cookTime: 10 },
    { name: '西红柿蛋汤', ingredients: '西红柿,鸡蛋,葱,盐,油,姜', steps: '1. 西红柿切小块\n2. 锅中放少许油，下西红柿翻炒\n3. 加入适量清水煮开\n4. 鸡蛋打散淋入锅中\n5. 加盐调味，撒葱花即可', cookTime: 8 },
    { name: '西红柿炖牛腩', ingredients: '西红柿,牛肉,土豆,姜,葱,料酒,生抽,盐,油', steps: '1. 牛肉切块焯水去血沫\n2. 西红柿切块，土豆去皮切块\n3. 热锅倒油，炒香姜片\n4. 放入牛肉翻炒，加料酒生抽\n5. 加足量水炖煮40分钟\n6. 放入西红柿和土豆继续炖15分钟\n7. 加盐调味出锅', cookTime: 60 }
  ],
  '土豆': [
    { name: '酸辣土豆丝', ingredients: '土豆,青椒,干辣椒,醋,盐,油,蒜,姜', steps: '1. 土豆去皮切细丝，泡水去淀粉\n2. 青椒切丝，干辣椒切段\n3. 热锅放油，爆香蒜姜干辣椒\n4. 放入土豆丝大火翻炒\n5. 加醋、盐调味\n6. 放入青椒丝翻匀出锅', cookTime: 15 },
    { name: '土豆烧排骨', ingredients: '排骨,土豆,姜,蒜,生抽,老抽,料酒,盐,油', steps: '1. 排骨焯水洗净\n2. 土豆去皮切块\n3. 热锅放油，炒香姜蒜\n4. 放入排骨翻炒至微黄\n5. 加生抽老抽料酒和清水\n6. 炖煮30分钟后加入土豆\n7. 继续炖15分钟至土豆软烂，加盐出锅', cookTime: 50 }
  ],
  '鸡蛋': [
    { name: '水蒸蛋', ingredients: '鸡蛋,盐,酱油,葱,温水', steps: '1. 鸡蛋打散，加入1.5倍温水搅匀\n2. 加少许盐调味\n3. 用滤网过滤蛋液\n4. 盖保鲜膜，水开后蒸10分钟\n5. 淋少许酱油和葱花即可', cookTime: 12 },
    { name: '蛋炒饭', ingredients: '鸡蛋,米饭,葱,盐,油,胡萝卜(可选),青豆(可选)', steps: '1. 鸡蛋打散备用\n2. 热锅倒油，炒鸡蛋至碎盛出\n3. 锅中再加油，放入米饭炒散\n4. 倒回鸡蛋，加盐翻炒均匀\n5. 撒葱花出锅', cookTime: 10 }
  ],
  '猪肉': [
    { name: '回锅肉', ingredients: '五花肉,青椒,蒜苗,豆瓣酱,姜,蒜,生抽,料酒,油', steps: '1. 五花肉整块冷水下锅煮至八成熟\n2. 捞出切片\n3. 热锅放少许油，下肉片煸炒出油\n4. 加入豆瓣酱炒出红油\n5. 放入姜蒜、青椒、蒜苗翻炒\n6. 加生抽调味出锅', cookTime: 25 },
    { name: '青椒肉丝', ingredients: '猪肉,青椒,姜,蒜,生抽,料酒,盐,淀粉,油', steps: '1. 猪肉切丝，加料酒生抽淀粉腌制\n2. 青椒切丝\n3. 热锅倒油，滑炒肉丝至变色盛出\n4. 锅中留底油，爆香姜蒜\n5. 放入青椒翻炒\n6. 倒回肉丝，加盐翻炒均匀', cookTime: 15 }
  ],
  '鸡肉': [
    { name: '宫保鸡丁', ingredients: '鸡胸肉,花生米,黄瓜,胡萝卜,干辣椒,蒜,姜,生抽,醋,糖,淀粉,油', steps: '1. 鸡肉切丁，加生抽淀粉腌制\n2. 黄瓜、胡萝卜切丁\n3. 调酱汁：生抽+醋+糖+淀粉+水\n4. 热锅倒油，炒熟花生米盛出\n5. 爆香干辣椒姜蒜，放入鸡丁翻炒\n6. 加入蔬菜丁翻炒\n7. 倒入酱汁，放花生米翻匀出锅', cookTime: 20 },
    { name: '土豆炖鸡块', ingredients: '鸡肉,土豆,胡萝卜,姜,蒜,生抽,老抽,料酒,盐,油', steps: '1. 鸡肉切块焯水\n2. 土豆、胡萝卜去皮切块\n3. 热锅倒油，炒香姜蒜\n4. 放入鸡块翻炒，加料酒生抽老抽\n5. 加水炖煮20分钟\n6. 加入土豆胡萝卜继续炖15分钟\n7. 加盐调味出锅', cookTime: 40 }
  ],
  '鱼': [
    { name: '清蒸鱼', ingredients: '鱼,姜,葱,蒸鱼豉油,料酒,盐,油', steps: '1. 鱼处理干净，两面划刀\n2. 抹盐和料酒腌制10分钟\n3. 盘中铺姜片，放上鱼\n4. 水开后上锅蒸8-10分钟\n5. 倒掉蒸出的汁水\n6. 撒葱姜丝，淋热油和蒸鱼豉油', cookTime: 20 },
    { name: '红烧鱼', ingredients: '鱼,姜,蒜,葱,生抽,老抽,料酒,糖,盐,油', steps: '1. 鱼处理干净，两面划刀抹盐\n2. 热锅倒油，鱼煎至两面金黄\n3. 放入姜蒜爆香\n4. 加料酒生抽老抽糖和清水\n5. 大火烧开转小火炖10分钟\n6. 收汁撒葱花出锅', cookTime: 25 }
  ],
  '青菜': [
    { name: '清炒时蔬', ingredients: '青菜,蒜,盐,油,蚝油(可选)', steps: '1. 青菜洗净沥干\n2. 热锅倒油，爆香蒜片\n3. 放入青菜大火快炒\n4. 菜变软后加盐和蚝油\n5. 翻炒均匀出锅', cookTime: 5 }
  ],
  'default': [
    { name: '家常小炒', ingredients: '主料配青椒,蒜,姜,生抽,盐,油', steps: '1. 主料洗净切好备用\n2. 热锅倒油，爆香姜蒜\n3. 放入主料翻炒\n4. 加生抽和盐调味\n5. 翻炒均匀出锅', cookTime: 10 },
    { name: '家常炖菜', ingredients: '主料,姜,蒜,生抽,料酒,盐,油', steps: '1. 主料处理干净切块\n2. 热锅倒油，爆香姜蒜\n3. 放入主料翻炒\n4. 加生抽料酒和清水\n5. 大火烧开转小火炖至软烂\n6. 加盐调味出锅', cookTime: 30 }
  ]
};

// 获取食材对应的菜谱
function getDishForIngredient(ingredient) {
  var dishes = recipeTemplates[ingredient];
  if (dishes && dishes.length > 0) {
    return dishes[Math.floor(Math.random() * dishes.length)];
  }
  // 尝试模糊匹配
  for (var key in recipeTemplates) {
    if (key === 'default') continue;
    if (ingredient.indexOf(key) >= 0 || key.indexOf(ingredient) >= 0) {
      var d = recipeTemplates[key];
      return d[Math.floor(Math.random() * d.length)];
    }
  }
  var defaults = recipeTemplates['default'];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// AI 菜谱生成
const generateRecipe = async (event) => {
  var ingredients = event.ingredients || [];
  var peopleCount = event.peopleCount || 2;
  var taste = event.taste || '家常';
  var taboos = event.taboos || [];

  if (ingredients.length === 0) {
    return { error: '请先添加食材' };
  }

  // 尝试调用混元大模型
  try {
    var aiResult = await callHunyuanModel(ingredients, peopleCount, taste, taboos);
    if (aiResult) {
      return { recipe: aiResult, source: 'ai' };
    }
  } catch (e) {
    console.log('AI 调用失败，使用模板生成', e);
  }

  // 模板生成（降级方案）
  return { recipe: generateTemplateRecipe(ingredients, peopleCount, taste, taboos), source: 'template' };
};

// 调用混元大模型
const callHunyuanModel = async (ingredients, peopleCount, taste, taboos) => {
  try {
    var res = await cloud.openapi.cloudbaseAINew.run({
      model: 'hunyuan-lite',
      messages: [{
        role: 'user',
        content: buildPrompt(ingredients, peopleCount, taste, taboos)
      }]
    });
    var content = res.result && res.result.choices && res.result.choices[0] && res.result.choices[0].message.content;
    if (content) {
      return parseAIResponse(content, peopleCount);
    }
    return null;
  } catch (e) {
    console.log('混元模型调用异常', e);
    return null;
  }
};

// 构建 AI prompt
function buildPrompt(ingredients, peopleCount, taste, taboos) {
  var tabooStr = taboos.length > 0 ? '不要使用以下食材：' + taboos.join('、') + '。' : '';
  return '你是一个家常菜谱助手。请根据以下条件生成一日三餐菜谱，' +
    '回复严格的JSON格式，不要任何额外文字。\n' +
    '现有食材：' + ingredients.join('、') + '\n' +
    '用餐人数：' + peopleCount + '人\n' +
    '口味偏好：' + taste + '口味\n' +
    tabooStr +
    'JSON格式：{"meals":[{"meal":"早餐","dish":{"name":"菜名","ingredients":"所需食材(逗号分隔)","steps":"详细步骤(换行分隔)","cookTime":分钟数}},{"meal":"午餐","dish":{...}},{"meal":"晚餐","dish":{...}}]}';
}

// 解析 AI 返回
function parseAIResponse(content, peopleCount) {
  try {
    var jsonStr = content;
    // 尝试提取 JSON
    var start = content.indexOf('{');
    var end = content.lastIndexOf('}');
    if (start >= 0 && end > start) {
      jsonStr = content.substring(start, end + 1);
    }
    var recipe = JSON.parse(jsonStr);
    recipe.peopleCount = peopleCount;
    return recipe;
  } catch (e) {
    console.error('AI 返回解析失败', e.message);
    return null;
  }
}

// 模板生成菜谱
function generateTemplateRecipe(ingredients, peopleCount, taste, taboos) {
  var shuffled = ingredients.slice();
  // 随机打乱
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }

  var selected = [];
  var used = {};

  // 早餐：选择1-2个食材
  var breakfast = getMealDish(shuffled, 0, used, taboos, taste, '早餐');
  selected.push({ meal: '早餐', dish: breakfast });

  // 午餐：选择2-3个食材
  var lunchDishes = [];
  for (var k = 0; k < Math.min(shuffled.length, 3); k++) {
    var d = getMealDish(shuffled, k, used, taboos, taste, '午餐');
    if (d && !lunchDishes.some(function(x) { return x.name === d.name; })) {
      lunchDishes.push(d);
    }
    if (lunchDishes.length === 3) break;
  }
  if (lunchDishes.length === 0) lunchDishes.push(getDefaultDish('午餐'));
  var lunchCombined = combineDishes(lunchDishes, '午餐');
  selected.push({ meal: '午餐', dish: lunchCombined });

  // 晚餐：与午餐类似的逻辑
  var dinnerDishes = [];
  var offset = Math.min(shuffled.length, 2);
  for (var m = 0; m < Math.min(shuffled.length, 3); m++) {
    var dd = getMealDish(shuffled, (offset + m) % shuffled.length, used, taboos, taste, '晚餐');
    if (dd && !dinnerDishes.some(function(x) { return x.name === dd.name; })) {
      dinnerDishes.push(dd);
    }
    if (dinnerDishes.length === 3) break;
  }
  if (dinnerDishes.length === 0) dinnerDishes.push(getDefaultDish('晚餐'));
  var dinnerCombined = combineDishes(dinnerDishes, '晚餐');
  selected.push({ meal: '晚餐', dish: dinnerCombined });

  return { meals: selected, peopleCount: peopleCount, taste: taste, ingredients: ingredients, taboos: taboos };
}

// 获取菜式
function getMealDish(ingredients, index, used, taboos, taste, mealType) {
  var ingredient = ingredients[index % ingredients.length];
  if (!ingredient) return getDefaultDish(mealType);

  var dish = getDishForIngredient(ingredient);
  if (taboos && taboos.length > 0) {
    for (var t = 0; t < taboos.length; t++) {
      if (ingredient.indexOf(taboos[t]) >= 0 || (dish.ingredients && dish.ingredients.indexOf(taboos[t]) >= 0)) {
        return getDefaultDish(mealType);
      }
    }
  }
  return dish;
}

// 合并多道菜
function combineDishes(dishes, mealType) {
  if (dishes.length === 1) return dishes[0];

  var names = [];
  var allIngredients = [];
  var allSteps = [];
  var maxCookTime = 0;

  dishes.forEach(function(d, i) {
    names.push(d.name);
    allIngredients.push(d.ingredients);
    allSteps.push((i + 1) + '. ' + d.name + ':\n' + d.steps);
    if (d.cookTime > maxCookTime) maxCookTime = d.cookTime;
  });

  return {
    name: names.join(' + '),
    ingredients: allIngredients.join('；'),
    steps: allSteps.join('\n\n'),
    cookTime: maxCookTime
  };
}

// 默认菜式
function getDefaultDish(mealType) {
  if (mealType === '早餐') {
    return { name: '家常煎蛋配粥', ingredients: '鸡蛋,大米,盐,油,酱油,葱', steps: '1. 大米淘洗干净加水煮粥\n2. 煎蛋：热锅放油打入鸡蛋\n3. 煎至两面金黄\n4. 粥煮好后配上煎蛋和葱花酱油', cookTime: 20 };
  }
  return { name: '家常小炒', ingredients: '青椒,猪肉,蒜,姜,生抽,盐,油', steps: '1. 猪肉切片，青椒切丝\n2. 热锅倒油爆香姜蒜\n3. 放入肉片翻炒至变色\n4. 加入青椒翻炒\n5. 加生抽和盐调味出锅', cookTime: 10 };
}

// 食材识别（图片识别）
const recognizeIngredient = async (event) => {
  var fileID = event.fileID;
  if (!fileID) {
    return { error: '请提供图片' };
  }

  try {
    // 尝试通过混元视觉模型识别
    var imgUrl = await getTempFileURL(fileID);
    if (imgUrl) {
      try {
        var res = await cloud.openapi.cloudbaseAINew.run({
          model: 'hunyuan-vision',
          messages: [{
            role: 'user',
            content: [{
              type: 'image_url',
              image_url: { url: imgUrl }
            }, {
              type: 'text',
              text: '识别图片中出现的所有食材名称，只返回食材名称列表，用逗号分隔，不要任何额外文字。如：西红柿,鸡蛋,青菜'
            }]
          }]
        });
        var text = res.result && res.result.choices && res.result.choices[0] && res.result.choices[0].message.content;
        if (text) {
          var ingredients = text.split(/[,，、]/).map(function(s) { return s.trim(); }).filter(Boolean);
          return { ingredients: ingredients, source: 'ai' };
        }
      } catch (aiErr) {
        console.log('AI 视觉识别失败，返回模拟数据', aiErr.message);
      }
    }
  } catch (e) {
    console.error('识别失败', e.message);
  }

  // 降级：返回模拟识别结果
  return {
    ingredients: ['西红柿', '鸡蛋', '青菜'],
    source: 'mock',
    note: 'AI 识别暂不可用，已返回示例食材，请手动调整'
  };
};

// 获取临时下载链接
const getTempFileURL = async (fileID) => {
  try {
    var res = await cloud.getTempFileURL({ fileList: [fileID] });
    if (res.fileList && res.fileList.length > 0) {
      return res.fileList[0].tempFileURL;
    }
  } catch (e) {
    console.error('获取文件链接失败', e);
  }
  return null;
};

// 云函数入口
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getOpenId':
      return await getOpenId();
    case 'getMiniProgramCode':
      return await getMiniProgramCode();
    case 'saveHistory':
      return await saveHistory(event);
    case 'getHistory':
      return await getHistory();
    case 'clearHistory':
      return await clearHistory();
    case 'addFavorite':
      return await addFavorite(event);
    case 'removeFavorite':
      return await removeFavorite(event);
    case 'getFavorites':
      return await getFavorites();
    case 'clearFavorites':
      return await clearFavorites();
    case 'getMyRecipes':
      return await getMyRecipes();
    case 'addMyRecipe':
      return await addMyRecipe(event);
    case 'updateMyRecipe':
      return await updateMyRecipe(event);
    case 'deleteMyRecipe':
      return await deleteMyRecipe(event);
    case 'generateRecipe':
      return await generateRecipe(event);
    case 'recognizeIngredient':
      return await recognizeIngredient(event);
    default:
      return { error: 'Unknown type: ' + event.type };
  }
};