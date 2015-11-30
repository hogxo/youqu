'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 海报模型
 */
var clientSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    wxname: String,
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    //配置文件
    ex_times: Number,
    //标签
    status: Number
});

clientSchema.methods = {

};

mongoose.model('Client', clientSchema);