'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 游戏类型模型
 */
var gameTypeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        unique: true
    }
});
gameTypeSchema.methods = {
    
};

mongoose.model('GameType', gameTypeSchema);