'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 海报模型
 */
var exchangeSchema = new Schema({
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    thumb: String,
    //配置文件
    integral: Number,
    ex_times: Number,
    limit_times: Number,
    start_time: {
        type: Date,
        default: Date.now
    },
    end_time: {
        type: Date,
        default: Date.now
    },
    //标签
    status: Number
});

exchangeSchema.methods = {

};

mongoose.model('Exchange', exchangeSchema);