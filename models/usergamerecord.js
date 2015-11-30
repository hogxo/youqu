'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 游戏模型
 */
var userGameRecordSchema = new Schema({
    game: {
        type: Schema.ObjectId,
        ref: 'Game'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    playtime: {
        type: Date,
        default: Date.now
    },
    //游戏时长
    duration: {
        type: Number,
        default: 0
    },    
    //获取到的积分
    integral: {
        type: Number,
        default: 0
    }
});

userGameRecordSchema.methods = {

};

mongoose.model('UserGameRecord', userGameRecordSchema);