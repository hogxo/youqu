'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 游戏模型
 */
var gameSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    thumb: String,
    source: String,
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    type: {
        type: Schema.ObjectId,
        ref: 'GameType'
    },
    price: {
        type: Number,
        default: 0
    },
    created: {
        type: Date,
        default: Date.now
    },
    //置顶，权重由数值决定
    isnew: {
        type: Boolean,
        default: false
    }
});

gameSchema.methods = {

};

mongoose.model('Game', gameSchema);