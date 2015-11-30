'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 海报模型
 */
var posterSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    thumb: String,
    tmpl: {
        type: Schema.ObjectId,
        ref: 'PosterTmpl'
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    //配置文件
    config: String,
    //海报宽
    width: Number,
    //海报高
    height: Number,
    //单位
    unit: String,
    //二维码图片
    qrcode: String,
    //标签
    tag: String
});

posterSchema.methods = {

};

mongoose.model('Poster', posterSchema);