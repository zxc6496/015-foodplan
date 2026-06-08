// 生成菜谱页面
var app = getApp();

// ========== 菜谱模板库（内置，不依赖云函数） ==========
// calories: 每人大约热量(kcal)，为家常菜式估算值，仅供参考
var recipeTemplates = {
  '西红柿': [
    { name: '西红柿炒鸡蛋', ingredients: '西红柿,鸡蛋,葱,姜,蒜,盐,油,生抽', steps: '1. 西红柿切块，鸡蛋打散备用\n2. 热锅倒油，先炒鸡蛋至凝固盛出\n3. 锅中再加少许油，爆香葱姜蒜\n4. 放入西红柿翻炒出汁\n5. 倒回鸡蛋，加盐和生抽调味\n6. 翻炒均匀即可出锅', cookTime: 10, calories: 180 },
    { name: '西红柿蛋汤', ingredients: '西红柿,鸡蛋,葱,盐,油,姜', steps: '1. 西红柿切小块\n2. 锅中放少许油，下西红柿翻炒\n3. 加入适量清水煮开\n4. 鸡蛋打散淋入锅中\n5. 加盐调味，撒葱花即可', cookTime: 8, calories: 90 },
    { name: '西红柿炖牛', ingredients: '西红柿,牛肉,土豆,姜,葱,料酒,生抽,盐,油', steps: '1. 牛肉切块水去血沫\n2. 西红柿切块，土豆去皮切块\n3. 热锅倒油，炒香姜片\n4. 放入牛肉翻炒，加料酒生抽\n5. 加足量水炖煮40分钟\n6. 放入西红柿和土豆继续炖15分钟\n7. 加盐调味出锅', cookTime: 60, calories: 320 }
  ],
  '土豆': [
    { name: '酸辣土豆丝', ingredients: '土豆,青椒,干辣椒,醋,盐,油,蒜,姜', steps: '1. 土豆去皮切细丝，泡水去淀粉\n2. 青椒切丝，干辣椒切段\n3. 热锅放油，爆香蒜姜干辣椒\n4. 放入土豆丝大火翻炒\n5. 加醋、盐调味\n6. 放入青椒丝翻匀出锅', cookTime: 15, calories: 140 },
    { name: '土豆烧排骨', ingredients: '排骨,土豆,姜,蒜,生抽,老抽,料酒,盐,油', steps: '1. 排骨焯水洗净\n2. 土豆去皮切块\n3. 热锅放油，炒香姜蒜\n4. 放入排骨翻炒至微黄\n5. 加生抽老抽料酒和清水\n6. 炖煮30分钟后加入土豆\n7. 继续炖15分钟至土豆软烂，加盐出锅', cookTime: 50, calories: 350 }
  ],
  '鸡蛋': [
    { name: '水蒸蛋', ingredients: '鸡蛋,盐,酱油,葱,温水', steps: '1. 鸡蛋打散，加入1.5倍温水搅匀\n2. 加少许盐调味\n3. 用滤网过滤蛋液\n4. 盖保鲜膜，水开后蒸10分钟\n5. 淋少许酱油和葱花即可', cookTime: 12, calories: 120 },
    { name: '蛋炒饭', ingredients: '鸡蛋,米饭,葱,盐,油,胡萝卜(可选),青豆(可选)', steps: '1. 鸡蛋打散备用\n2. 热锅倒油，炒鸡蛋至碎盛出\n3. 锅中再加油，放入米饭炒散\n4. 倒回鸡蛋，加盐翻炒均匀\n5. 撒葱花出锅', cookTime: 10, calories: 280 }
  ],
  '猪肉': [
    { name: '回锅肉', ingredients: '五花肉,青椒,蒜苗,豆瓣酱,姜,蒜,生抽,料酒,油', steps: '1. 五花肉整块冷水下锅煮至八成熟\n2. 捞出切片\n3. 热锅放少许油，下肉片煸炒出油\n4. 加入豆瓣酱炒出红油\n5. 放入姜蒜、青椒、蒜苗翻炒\n6. 加生抽调味出锅', cookTime: 25, calories: 420 },
    { name: '青椒肉丝', ingredients: '猪肉,青椒,姜,蒜,生抽,料酒,盐,淀粉,油', steps: '1. 猪肉切丝，加料酒生抽淀粉腌制\n2. 青椒切丝\n3. 热锅倒油，滑炒肉丝至变色盛出\n4. 锅中留底油，爆香姜蒜\n5. 放入青椒翻炒\n6. 倒回肉丝，加盐翻炒均匀', cookTime: 15, calories: 260 }
  ],
  '鸡肉': [
    { name: '宫保鸡丁', ingredients: '鸡胸肉,花生米,黄瓜,胡萝卜,干辣椒,蒜,姜,生抽,醋,糖,淀粉,油', steps: '1. 鸡肉切丁，加生抽淀粉腌制\n2. 黄瓜、胡萝卜切丁\n3. 调酱汁：生抽+醋+糖+淀粉+水\n4. 热锅倒油，炒熟花生米盛出\n5. 爆香干辣椒姜蒜，放入鸡丁翻炒\n6. 加入蔬菜丁翻炒\n7. 倒入酱汁，放花生米翻匀出锅', cookTime: 20, calories: 340 },
    { name: '土豆炖鸡块', ingredients: '鸡肉,土豆,胡萝卜,姜,蒜,生抽,老抽,料酒,盐,油', steps: '1. 鸡肉切块焯水\n2. 土豆、胡萝卜去皮切块\n3. 热锅倒油，炒香姜蒜\n4. 放入鸡块翻炒，加料酒生抽老抽\n5. 加水炖煮20分钟\n6. 加入土豆胡萝卜继续炖15分钟\n7. 加盐调味出锅', cookTime: 40, calories: 300 }
  ],
  '鱼': [
    { name: '清蒸鱼', ingredients: '鱼,姜,葱,蒸鱼豉油,料酒,盐,油', steps: '1. 鱼处理干净，两面划刀\n2. 抹盐和料酒腌制10分钟\n3. 盘中铺姜片，放上鱼\n4. 水开后上锅蒸8-10分钟\n5. 倒掉蒸出的汁水\n6. 撒葱姜丝，淋热油和蒸鱼豉油', cookTime: 20, calories: 200 },
    { name: '红烧鱼', ingredients: '鱼,姜,蒜,葱,生抽,老抽,料酒,糖,盐,油', steps: '1. 鱼处理干净，两面划刀抹盐\n2. 热锅倒油，鱼煎至两面金黄\n3. 放入姜蒜爆香\n4. 加料酒生抽老抽糖和清水\n5. 大火烧开转小火炖10分钟\n6. 收汁撒葱花出锅', cookTime: 25, calories: 280 }
  ],
  '青菜': [
    { name: '清炒时蔬', ingredients: '青菜,蒜,盐,油,蚝油(可选)', steps: '1. 青菜洗净沥干\n2. 热锅倒油，爆香蒜片\n3. 放入青菜大火快炒\n4. 菜变软后加盐和蚝油\n5. 翻炒均匀出锅', cookTime: 5, calories: 60 }
  ],
  '白菜': [
    { name: '醋溜白菜', ingredients: '白菜,醋,干辣椒,蒜,盐,油,姜', steps: '1. 白菜切块\n2. 热锅倒油，爆香蒜姜干辣椒\n3. 放入白菜大火翻炒\n4. 加醋和盐调味\n5. 翻炒均匀出锅', cookTime: 8, calories: 70 }
  ],
  '胡萝卜': [
    { name: '胡萝卜炒肉', ingredients: '胡萝卜,猪肉,姜,蒜,生抽,盐,油', steps: '1. 胡萝卜切片，猪肉切丝\n2. 热锅倒油，炒香姜蒜\n3. 放入肉丝翻炒至变色\n4. 加入胡萝卜片翻炒\n5. 加生抽和盐调味出锅', cookTime: 15, calories: 220 }
  ],
  '黄瓜': [
    { name: '拍黄瓜', ingredients: '黄瓜,蒜,醋,盐,辣椒油,香油', steps: '1. 黄瓜洗净拍碎切段\n2. 蒜切末\n3. 加入醋、盐、辣椒油、香油拌匀\n4. 腌制5分钟即可', cookTime: 5, calories: 50 }
  ],
  '茄子': [
    { name: '红烧茄子', ingredients: '茄子,蒜,姜,生抽,老抽,糖,盐,油', steps: '1. 茄子切块，撒盐腌制10分钟\n2. 挤去水分\n3. 热锅倒油，茄子煎至表面金黄\n4. 放入姜蒜炒香\n5. 加生抽老抽糖翻炒均匀出锅', cookTime: 15, calories: 150 }
  ],
  '青椒': [
    { name: '青椒炒肉', ingredients: '青椒,猪肉,姜,蒜,生抽,料酒,盐,油', steps: '1. 青椒切丝，猪肉切丝加料酒生抽腌制\n2. 热锅倒油滑炒肉丝盛出\n3. 锅中爆香姜蒜\n4. 放入青椒翻炒\n5. 倒回肉丝加盐翻匀出锅', cookTime: 10, calories: 230 }
  ],
  '豆角': [
    { name: '干煸豆角', ingredients: '豆角,猪肉末,干辣椒,蒜,姜,生抽,盐,油', steps: '1. 豆角去筋掰段\n2. 热锅多倒些油，豆角炸至表面起皱捞出\n3. 锅中留底油，炒香姜蒜干辣椒\n4. 放入肉末炒散\n5. 倒回豆角加生抽盐翻炒均匀', cookTime: 15, calories: 200 }
  ],
  '西兰花': [
    { name: '蒜蓉西兰花', ingredients: '西兰花,蒜,盐,油,蚝油(可选)', steps: '1. 西兰花掰成小朵，焯水捞出\n2. 热锅倒油，爆香蒜末\n3. 放入西兰花翻炒\n4. 加盐和蚝油调味出锅', cookTime: 8, calories: 70 }
  ],
  '冬瓜': [
    { name: '冬瓜排骨汤', ingredients: '冬瓜,排骨,姜,盐,油,枸杞(可选)', steps: '1. 排骨焯水洗净\n2. 冬瓜去皮切块\n3. 锅中加水放排骨姜片煮开\n4. 转小火炖30分钟\n5. 加入冬瓜再炖15分钟\n6. 加盐调味出锅', cookTime: 50, calories: 180 }
  ],
  '洋葱': [
    { name: '洋葱炒鸡蛋', ingredients: '洋葱,鸡蛋,盐,油,生抽', steps: '1. 洋葱切丝，鸡蛋打散\n2. 热锅倒油先炒鸡蛋盛出\n3. 锅中再放油炒洋葱至透明\n4. 倒回鸡蛋加盐和生抽\n5. 翻炒均匀出锅', cookTime: 8, calories: 160 }
  ],
  '牛肉': [
    { name: '土豆烧牛肉', ingredients: '牛肉,土豆,姜,蒜,生抽,老抽,料酒,盐,油', steps: '1. 牛肉切块焯水\n2. 土豆去皮切块\n3. 热锅倒油炒香姜蒜\n4. 放入牛肉翻炒加料酒生抽老抽\n5. 加水炖煮30分钟\n6. 加入土豆再炖15分钟\n7. 加盐调味出锅', cookTime: 50, calories: 380 }
  ],
  '虾': [
    { name: '油焖大虾', ingredients: '虾,姜,蒜,料酒,生抽,糖,盐,油,葱', steps: '1. 虾去壳去虾线\n2. 热锅倒油，放虾煎至变红\n3. 放入姜蒜炒香\n4. 加料酒生抽糖翻炒\n5. 加少许水焖2分钟\n6. 撒葱花出锅', cookTime: 10, calories: 190 }
  ],
  '鸡翅': [
    { name: '可乐鸡翅', ingredients: '鸡翅,可乐,姜,蒜,生抽,老抽,料酒,盐', steps: '1. 鸡翅两面划刀\n2. 冷水下锅加料酒焯水\n3. 热锅倒油煎鸡翅至两面金黄\n4. 放入姜蒜加生抽老抽\n5. 倒入可乐没过鸡翅\n6. 大火烧开转小火收汁至浓稠', cookTime: 25, calories: 350 }
  ],
  '五花肉': [
    { name: '红烧肉', ingredients: '五花肉,姜,蒜,冰糖,生抽,老抽,料酒,盐,油', steps: '1. 五花肉切块冷水下锅水\n2. 热锅放少许油下五花肉煎出油\n3. 加入冰糖炒化\n4. 加生抽老抽料酒和清水\n5. 大火烧开转小火炖40分钟\n6. 大火收汁加盐出锅', cookTime: 50, calories: 480 }
  ],
  '鸡腿': [
    { name: '红烧鸡腿', ingredients: '鸡腿,姜,蒜,生抽,老抽,料酒,糖,盐,油', steps: '1. 鸡腿划几刀\n2. 热锅倒油煎鸡腿至两面金黄\n3. 放入姜蒜炒香\n4. 加料酒生抽老抽糖和清水\n5. 大火烧开转小火炖20分钟\n6. 大火收汁加盐出锅', cookTime: 25, calories: 320 }
  ],
  '排骨': [
    { name: '糖醋排骨', ingredients: '排骨,醋,糖,生抽,老抽,料酒,姜,盐,油', steps: '1. 排骨焯水洗净\n2. 热锅倒油下排骨煎至微黄\n3. 加入姜炒香\n4. 加料酒生抽老抽糖醋和清水\n5. 大火烧开转小火炖30分钟\n6. 大火收汁出锅', cookTime: 40, calories: 360 }
  ],
  '大米': [
    { name: '蛋炒饭', ingredients: '大米(米饭),鸡蛋,葱,盐,油', steps: '1. 鸡蛋打散备用\n2. 热锅倒油炒鸡蛋至碎盛出\n3. 锅中再加油放入米饭炒散\n4. 倒回鸡蛋加盐翻炒均匀\n5. 撒葱花出锅', cookTime: 10, calories: 280 }
  ],
  '面条': [
    { name: '西红柿鸡蛋面', ingredients: '面条,西红柿,鸡蛋,葱,盐,油,姜,蒜', steps: '1. 面条煮熟捞出\n2. 西红柿切块，鸡蛋打散\n3. 热锅倒油炒鸡蛋盛出\n4. 爆香葱姜蒜放入西红柿炒出汁\n5. 倒回鸡蛋加盐和清水煮开\n6. 浇在面条上即可', cookTime: 15, calories: 350 }
  ],
  '面粉': [
    { name: '家常烙饼', ingredients: '面粉,水,盐,油', steps: '1. 面粉加温水揉成面团醒20分钟\n2. 面团成薄片\n3. 刷油和盐卷起再擀平\n4. 平底锅刷油烙至两面金黄\n5. 切成小块即可', cookTime: 30, calories: 300 }
  ],
  '馒头': [
    { name: '炒馒头', ingredients: '馒头,鸡蛋,青椒,盐,油', steps: '1. 馒头切块\n2. 鸡蛋打散\n3. 馒头块裹上蛋液\n4. 热锅倒油煎馒头块至金黄\n5. 加入青椒翻炒加盐出锅', cookTime: 10, calories: 250 }
  ],
  '米粉': [
    { name: '炒米粉', ingredients: '米粉,鸡蛋,青菜,胡萝卜,生抽,盐,油,蒜', steps: '1. 米粉用温水泡软\n2. 鸡蛋打散炒熟备用\n3. 热锅倒油爆香蒜\n4. 放入青菜胡萝卜丝翻炒\n5. 加入米粉和鸡蛋\n6. 加生抽和盐翻炒均匀出锅', cookTime: 12, calories: 320 }
  ],
  '饺子皮': [
    { name: '韭菜鸡蛋饺子', ingredients: '饺子皮,韭菜,鸡蛋,盐,油,香油', steps: '1. 韭菜切碎，鸡蛋炒熟切碎\n2. 韭菜鸡蛋混合加盐香油拌匀做馅\n3. 取饺子皮包入馅料\n4. 捏紧边缘封口\n5. 水开后下饺子煮至浮起即可', cookTime: 30, calories: 280 }
  ],
  '小米': [
    { name: '小米粥', ingredients: '小米,水,红枣(可选),枸杞(可选)', steps: '1. 小米淘洗干净\n2. 加水大火烧开\n3. 转小火熬煮20分钟\n4. 可加入红枣枸杞\n5. 煮至浓稠即可', cookTime: 25, calories: 130 }
  ],
  '玉米': [
    { name: '玉米排骨汤', ingredients: '玉米,排骨,胡萝卜,姜,盐,油', steps: '1. 排骨焯水洗净\n2. 玉米切段，胡萝卜切块\n3. 锅中加水放排骨姜片煮开\n4. 转小火炖30分钟\n5. 加入玉米胡萝卜再炖15分钟\n6. 加盐调味出锅', cookTime: 50, calories: 220 }
  ],
  'default': [
    { name: '家常小炒', ingredients: '主料,青椒,蒜,姜,生抽,盐,油', steps: '1. 主料洗净切好备用\n2. 热锅倒油爆香姜蒜\n3. 放入主料翻炒\n4. 加入青椒翻炒\n5. 加生抽和盐调味出锅', cookTime: 10, calories: 200 },
    { name: '家常炖菜', ingredients: '主料,姜,蒜,生抽,料酒,盐,油', steps: '1. 主料处理干净切块\n2. 热锅倒油爆香姜蒜\n3. 放入主料翻炒\n4. 加生抽料酒和清水\n5. 大火烧开转小火炖至软烂\n6. 加盐调味出锅', cookTime: 30, calories: 250 }
  ]
};

// 默认菜式
function getDefaultDish(mealType) {
  if (mealType === '早餐') {
    return { name: '家常煎蛋配粥', ingredients: '鸡蛋,大米,盐,油,酱油,葱', steps: '1. 大米淘洗干净加水煮粥\n2. 煎蛋：热锅放油打入鸡蛋\n3. 煎至两面金黄\n4. 粥煮好后配上煎蛋和葱花酱油', cookTime: 20, calories: 260 };
  }
  return { name: '家常小炒', ingredients: '青椒,猪肉,蒜,姜,生抽,盐,油', steps: '1. 猪肉切片，青椒切丝\n2. 热锅倒油爆香姜蒜\n3. 放入肉片翻炒至变色\n4. 加入青椒翻炒\n5. 加生抽和盐调味出锅', cookTime: 10, calories: 200 };
}

// 获取食材对应的菜谱
function getDishForIngredient(ingredient) {
  var dishes = recipeTemplates[ingredient];
  if (dishes && dishes.length > 0) {
    return dishes[Math.floor(Math.random() * dishes.length)];
  }
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

// 合并多道菜
function combineDishes(dishes) {
  if (dishes.length === 1) return dishes[0];
  var names = [];
  var allIngredients = [];
  var allSteps = [];
  var maxCookTime = 0;
  var totalCalories = 0;
  dishes.forEach(function (d, i) {
    names.push(d.name);
    allIngredients.push(d.ingredients);
    allSteps.push((i + 1) + '. ' + d.name + ':\n' + d.steps);
    if (d.cookTime > maxCookTime) maxCookTime = d.cookTime;
    totalCalories += d.calories || 0;
  });
  return {
    name: names.join(' + '),
    ingredients: allIngredients.join('；'),
    steps: allSteps.join('\n\n'),
    cookTime: maxCookTime,
    calories: totalCalories
  };
}

// 获取菜式（考虑忌口）
function getMealDish(ingredients, index, taboos, mealType) {
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

// 模板生成三餐菜谱
function generateLocalRecipe(ingredients, peopleCount, taste, taboos) {
  var shuffled = ingredients.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }

  var selected = [];

  // 早餐
  var breakfast = getMealDish(shuffled, 0, taboos, '早餐');
  selected.push({ meal: '早餐', dish: breakfast });

  // 午餐
  var lunchDishes = [];
  for (var k = 0; k < Math.min(shuffled.length, 3); k++) {
    var d = getMealDish(shuffled, k, taboos, '午餐');
    if (d && !lunchDishes.some(function (x) { return x.name === d.name; })) {
      lunchDishes.push(d);
    }
    if (lunchDishes.length === 3) break;
  }
  if (lunchDishes.length === 0) lunchDishes.push(getDefaultDish('午餐'));
  selected.push({ meal: '午餐', dish: combineDishes(lunchDishes) });

  // 晚餐
  var dinnerDishes = [];
  var offset = Math.min(shuffled.length, 2);
  for (var m = 0; m < Math.min(shuffled.length, 3); m++) {
    var dd = getMealDish(shuffled, (offset + m) % shuffled.length, taboos, '晚餐');
    if (dd && !dinnerDishes.some(function (x) { return x.name === dd.name; })) {
      dinnerDishes.push(dd);
    }
    if (dinnerDishes.length === 3) break;
  }
  if (dinnerDishes.length === 0) dinnerDishes.push(getDefaultDish('晚餐'));
  selected.push({ meal: '晚餐', dish: combineDishes(dinnerDishes) });

  return {
    meals: selected,
    peopleCount: peopleCount,
    taste: taste,
    ingredients: ingredients,
    taboos: taboos
  };
}

Page({
  data: {
    ingredients: [],
    peopleCount: 2,
    taste: '家常',
    tasteOptions: ['清淡', '麻辣', '家常'],
    taboos: [],
    tabooInput: '',
    loading: false,
    recipe: null
  },

  onShow: function () {
    this.setData({ ingredients: app.globalData.ingredients || [] });
  },

  increasePeople: function () {
    if (this.data.peopleCount < 6) {
      this.setData({ peopleCount: this.data.peopleCount + 1 });
    }
  },

  decreasePeople: function () {
    if (this.data.peopleCount > 1) {
      this.setData({ peopleCount: this.data.peopleCount - 1 });
    }
  },

  selectTaste: function (e) {
    this.setData({ taste: e.currentTarget.dataset.value });
  },

  onTabooInput: function (e) {
    this.setData({ tabooInput: e.detail.value });
  },

  addTaboo: function () {
    var val = this.data.tabooInput.trim();
    if (!val) return;
    var items = val.split(/[,，、]/);
    var taboos = this.data.taboos.slice();
    items.forEach(function (item) {
      item = item.trim();
      if (item && taboos.indexOf(item) === -1) {
        taboos.push(item);
      }
    });
    this.setData({ taboos: taboos, tabooInput: '' });
  },

  removeTaboo: function (e) {
    var idx = e.currentTarget.dataset.index;
    var taboos = this.data.taboos;
    taboos.splice(idx, 1);
    this.setData({ taboos: taboos });
  },

  generateRecipe: function () {
    var that = this;
    var ingredients = this.data.ingredients;

    if (ingredients.length === 0) {
      wx.showToast({ title: '请先添加食材', icon: 'none' });
      return;
    }

    this.setData({ loading: true, recipe: null });

    // 优先使用本地模板生成（100%可用）
    var recipe = generateLocalRecipe(ingredients, this.data.peopleCount, this.data.taste, this.data.taboos);

    // 尝试调用云函数AI增强（不阻塞显示）
    try {
      wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'generateRecipe',
          ingredients: ingredients,
          peopleCount: this.data.peopleCount,
          taste: this.data.taste,
          taboos: this.data.taboos
        },
        success: function (res) {
          if (res.result && res.result.recipe) {
            that.setData({ recipe: res.result.recipe });
            app.globalData.currentRecipe = res.result.recipe;
          }
        },
        fail: function () {
          // 云函数不可用不影响，继续使用本地菜谱
          console.log('云函数调用失败，使用本地菜谱');
        }
      });
    } catch (e) {
      console.log('云函数调用异常', e);
    }

    // 立即显示本地生成的菜谱
    app.globalData.currentRecipe = recipe;
    this.setData({ loading: false, recipe: recipe });
    this.calcShoppingList(recipe);
    this.saveHistory(recipe);
  },

  regenerate: function () {
    this.generateRecipe();
  },

  viewDetail: function (e) {
    var idx = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/recipe-detail/index?index=' + idx
    });
  },

  calcShoppingList: function (recipe) {
    var myIngredients = this.data.ingredients || [];
    var needed = [];
    recipe.meals.forEach(function (meal) {
      var dishIngredients = (meal.dish.ingredients || '').split(/[,，、]/);
      dishIngredients.forEach(function (item) {
        item = item.trim();
        if (item && myIngredients.indexOf(item) === -1 && needed.indexOf(item) === -1) {
          needed.push(item);
        }
      });
    });
    app.globalData.shoppingList = needed;
  },

  goShopping: function () {
    wx.navigateTo({ url: '/pages/shopping/index' });
  },

  saveHistory: function (recipe) {
    try {
      var history = wx.getStorageSync('recipe_history') || [];
      history.unshift({
        time: new Date().toLocaleString(),
        recipe: recipe
      });
      if (history.length > 20) {
        history = history.slice(0, 20);
      }
      wx.setStorageSync('recipe_history', history);
    } catch (e) {
      console.error('保存历史失败', e);
    }
  }
});