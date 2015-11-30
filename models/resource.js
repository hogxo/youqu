'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 资源模型
 */
var resourceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    thumb: String,
    url: String,
    category: {
        type: Schema.ObjectId,
        ref: 'ResourceType'
    },
    author: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    //标签
    tag: String
});

resourceSchema.methods = {

};

mongoose.model('Resource', resourceSchema);