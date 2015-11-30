'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 游戏模型
 */
var memberLevelSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    photo: String,
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 0
    },    
    remark: String
});

memberLevelSchema.methods = {

};

mongoose.model('MemberLevel', memberLevelSchema);