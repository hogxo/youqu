'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 资源模型
 */
var posterTmplSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    thumb: String,
    type: {
        type: Schema.ObjectId,
        ref: 'PosterTmplType'
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

posterTmplSchema.methods = {

};

mongoose.model('PosterTmpl', posterTmplSchema);