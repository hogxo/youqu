'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 资源类型模型
 */
var resourceTypeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        unique: true
    }
});
resourceTypeSchema.methods = {
    
};

mongoose.model('ResourceType', resourceTypeSchema);