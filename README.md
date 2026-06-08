# 015-foodplan - AI 三餐菜谱规划演示工具

> 智能搭配家常菜式

## 项目简介

微信小程序课程作业项目，AI 三餐菜谱规划演示工具。

## 功能

- 食材录入（手动输入 + 拍照识别）
- AI 菜谱生成（早/中/晚三餐）
- 买菜清单自动生成
- 历史记录与收藏
- 菜谱分享

## 技术栈

- 微信原生小程序（WXML/WXSS/JS）
- 微信云开发（云函数 + 云数据库）
- 微信混元大模型 API

## 部署步骤

1. 用 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 导入本项目
2. 在 `app.js` 中配置你的微信云开发环境 ID
3. 上传并部署 `cloudfunctions/quickstartFunctions` 云函数
4. 填写小程序名称和简介后提交审核

## 免责声明

本工具为课程演示项目，仅提供家常菜谱搭配参考，不提供任何医疗、营养、健康指导服务。
