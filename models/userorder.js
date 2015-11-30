'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 订单模型
 */
var orderSchema = new Schema({
    games: Array,
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    price: {
        type: Number,
        default: 0
    },
    //订单状态
    status: {
        type: Boolean,
        default: false
    },
    createtime: {
        type: Date,
        default: Date.now
    },
    outtime: String
});
orderSchema.methods = {
    
};

mongoose.model('UserOrder', orderSchema);