'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 购物车模型
 */
var cartSchema = new Schema({
    game: {
        type: Schema.ObjectId,
        ref: 'Game'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    buytime: {
        type: Date,
        default: Date.now
    }
});
cartSchema.methods = {
    
};

mongoose.model('UserCart', cartSchema);