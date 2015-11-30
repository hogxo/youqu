'use strict';

/**
 * 模块依赖
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * 游戏模型
 */
var userGameSchema = new Schema({
    game: {
        type: Schema.ObjectId,
        ref: 'Game'
    },
    gamename: String,
    gametype:{
        type: Schema.ObjectId,
        ref: 'GameType'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    buytime: {
        type: Date,
        default: Date.now
    },
    //修改次数
    modify: {
        type: Number,
        default: 0
    },
    //游戏次数
    playcount: {
        type: Number,
        default: 0
    },
    //游戏送出积分
    integral: {
        type: Number,
        default: 0
    },
    //游戏分享次数
    share: {
        type: Number,
        default: 0
    },
    //最后修改时间
    modifytime: {
        type: Date,
        default: Date.now
    },
    //游戏配置文件地址
    config: String,
    //游戏状态 0未发布 1已上线 2已下线
    status: {
        type: Number,    
        enum: [0, 1, 2]
    },
    //游戏状态 0未发布 1已上线 2已下线
    statusname: String,
    outtime: String
});

userGameSchema.methods = {

};

mongoose.model('UserGame', userGameSchema);