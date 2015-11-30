'use strict';
var crypto = require('crypto');
var _ = require('underscore');
/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * 用户模型
 */
var wxUserSchema = new Schema({
    wechaid: {
        type: String,
        required: true,
        unique: true
    },
    wechaname: {
        type: String,
        required: true
    },
    truename: String,
    mobile: {
        type: String
    },
    qq: {
        type: String
    },
    //性别 '男', '女', '保密'
    gender: {
        type: Number,
        enum: [0, 1, 2]
    },
    birthday: {
        type: Date,
        default: Date.now
    },
    address: {
        type: String
    },
    integral: Number,
    consume: Number,
    level: {
        type: Schema.ObjectId,
        ref: 'MemberLevel'
    },
    created: {
        type: Date,
        default: Date.now
    },
    age: {
        type: Number,
        default: 0
    }
});

/**
 * Methods
 */
wxUserSchema.methods = {
};

mongoose.model('WxUser', wxUserSchema);