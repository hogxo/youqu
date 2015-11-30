'use strict';
var mongoose = require('mongoose'),
    Game = mongoose.model('Game'),
    UserCart = mongoose.model('UserCart'),
    UserOrder = mongoose.model('UserOrder'),
    _ = require('underscore'),
    core = require('../../libs/core'),
    moment = require('moment');

//列表
exports.list = function(req, res) {
    var condition = {};     
    if (req.session.user) {
        condition.user = req.session.user._id;
    }
    UserCart.count(condition).exec().then(function(total) {
        var query = UserCart.find(condition).populate('game', 'name thumb price');
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            var totalprice = 0;
            for (var i = results.length - 1; i >= 0; i--) {
                totalprice += results[i].game.price;
            }
            console.log(err, results);
            res.render('server/usercart/list', {
                title: '购物车列表',
                usercarts: results,
                totalprice: totalprice,
                pageInfo: pageInfo,
                Menu: 'usercart'
            }); 
        });
    });
};

//删除
exports.del = function(req, res) {
    var id = req.body.id;
    UserCart.findById(id).exec(function(err, result) {
        var message = '';
        if(err || !result) {
            message = '内容不存在';
            res.json({
                'success': false,
                'message': message
            });
            return;
        }
        if(req.Roles && req.Roles.indexOf('admin') === -1 && result.author && (result.author._id + '') !== req.session.user._id) {
            message = '没有权限';
            res.json({
                'success': false,
                'message': message
            });
            return;
        }
        //
        result.remove(function(err) {
            var flag = true;
            if(err) {
                flag = false;
                message = '删除失败';
            }
            message = '删除成功';            
            res.json({
                'success': flag,
                'message': message
            });
        });
    });
};

//购买
exports.add = function(req, res) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.user = req.session.user._id;
        }
        var condition = {user:obj.user, game:obj.game};
        UserCart.count(condition).exec().then(function(total) {
            if (total>0) {
                return res.json({
                    success: false,
                    message: '购物车已存在该游戏'
                });
                return;
            }
            var game = new UserCart(obj);
            game.save(function(err, content) {
                if (err) {
                    console.log(err);
                    return res.json({
                        success: false,
                        message: '购买失败'
                    });
                }

                var query = UserCart.find({user: obj.user}).populate('game', 'name thumb price');
                query.sort({created: -1});
                query.exec(function(err, results) {
                    console.log(err, results);
                    var totalprice = 0;
                    for (var i = results.length - 1; i >= 0; i--) {
                        console.log(results[i].game['price']);
                        totalprice += Number(results[i].game.price);
                    }
                    console.log(totalprice);
                    //var json = _.extend({}, _.pick(result, 'id', 'name', 'desc', 'thumb', 'email', 'type', 'author', 'created', 'created'), {});
                    res.json({
                        success: true,
                        message: '购买成功',
                        'totalprice': totalprice,
                        data: results
                    });
                });
            });  
        });            
    }
};

//结算订单
exports.balance = function(req, res) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        var obj = req.body;
        if (req.session.user) {
            obj.user = req.session.user._id;
        }
        if(obj.games==''){
            UserCart.find({user:obj.user}).exec(function(err, results) {
                console.log(results);
                var gameids = [];
                for (var i = results.length - 1; i >= 0; i--) {
                    var cart = new UserCart(results[i]);
                    gameids.push(cart.game);

                    cart.remove(function(err) {
                        console.log('删除成功');
                    });
                }
                console.log(gameids);
                var order = new UserOrder();
                order.user = obj.user;
                order.games = gameids;
                order.price = obj.totalprice;
                order.save(function(err, content) {
                    console.log(err, content);
                    if (err) {
                        return res.json({
                            success: false,
                            message: '订单失败'
                        });
                    }
                    return res.json({
                        success: true,
                        orderid: content.id,
                        message: '订单成功'
                    });
                });                
            });
        }else{
            var gameids = [];
            var count = 0;

            for (var i = obj.games.length - 1; i >= 0; i--) {
                var cartId = obj.games[i];
                UserCart.findById(cartId).exec(function(err, result) {                    
                    gameids.push(result.game);
                    result.remove(function(err) {
                        console.log('删除成功');
                    });
                    count++;
                    if(count>=obj.games.length){
                        var order = new UserOrder();
                        order.user = obj.user;
                        order.games = gameids;
                        order.price = obj.totalprice;
                        order.save(function(err, content) {
                            console.log(err, content);
                            if (err) {
                                return res.json({
                                    success: false,
                                    message: '订单失败'
                                });
                            }

                            return res.json({
                                success: true,
                                orderid: content.id,
                                message: '订单成功'
                            });
                        });
                    }
                });
            }
        }                  
    }
};

//显示订单
exports.order = function(req, res) {
    var id = req.param('id');
    UserOrder.findById(id).exec(function(err, result) {
        console.log(err, result);
        res.render('server/usercart/order', {
            title: '支付订单',
            orderdata: result,
            Menu: 'order'
        }); 
    });
};

//删除订单
exports.delorder = function(req, res) {
    var id = req.param('id');
    UserOrder.findById(id).exec(function(err, result) {
        console.log(err, result);
        result.remove(function(err) {
            var flag = true;
            if(err) {
                flag = false;
                message = '删除失败';
            }
            message = '删除成功';            
            res.json({
                'success': flag,
                'message': message
            });
        }); 
    });
};

//支付订单
exports.pay = function(req, res) {
    
};

//订单列表
exports.myorder = function(req, res) {
    var condition = {};     
    if (req.session.user) {
        condition.user = req.session.user._id;
    }
    UserOrder.count(condition).exec().then(function(total) {
        var query = UserOrder.find(condition);
        //分页
        var pageInfo = core.createPage(req, total, 10);
        //console.log(pageInfo);
        query.skip(pageInfo.start);
        query.limit(pageInfo.pageSize);
        query.sort({created: -1});
        query.exec(function(err, results) {
            var countI = 0;
            for (var i = results.length - 1; i >= 0; i--) {
                var item = results[i];
                var countJ = 0;
                var gamelist = [];
                var games = item.games;            
                for (var i = games.length - 1; i >= 0; i--) {
                    var gameid = games[i];
                    Game.findById(gameid).exec(function(err, result) {
                        gamelist.push(result);
                        countJ++;
                        if(countJ>=games.length){
                            countJ = 0;
                            item.gamelist = gamelist;
                            countI++;
                            if(countI>=results.length){
                                res.render('server/usercart/myorder', {
                                    title: '订单列表',
                                    orders: results,
                                    pageInfo: pageInfo,
                                    Menu: 'myorder'
                                }); 
                            }
                        }
                    });
                }
            }
            
            
        });
    });
};

//搜索
exports.search = function(req, res) {
    if (req.method === 'GET') {
        
    } else if (req.method === 'POST') {
        var condition = {};        
        var key = req.body.key;
        if(key) {
            console.log('关键字为', key);
            var _key = key.replace(/([\(\)\[])/g, '\\$1');//正则bugfix
            var k = '[^\s]*' + _key + '[^\s]*';
            var reg = new RegExp(k, 'gi');
            condition.id = reg;
        }   
        var status = req.body.status;
        if(status){
            condition.status = status;
        }
        var start = req.body.start;
        var end = req.body.end;
        if(start&&end){
            condition.createtime = {'$gte':new Date(start), '$lt':new Date(end)};
        }
        console.log('搜索条件：', condition);
        UserOrder.count(condition).exec().then(function(total) {
            if(total<=0){
                res.json({
                    success: true,
                    message: '搜索完成',
                    data: null
                });
                return;
            }
            var query = UserOrder.find(condition).populate('game', 'name thumb price');
            //分页
            var pageInfo = core.createPage(req, total, 10);
            query.skip(pageInfo.start);
            query.limit(pageInfo.pageSize);
            query.sort({created: -1});
            query.exec(function(err, results) {
                console.log(err, results);
                var countI = 0;
                for (var i = results.length - 1; i >= 0; i--) {
                    var item = results[i];

                    item.outtime = moment(item.createtime).format('LLL');
                    var countJ = 0;
                    var gamelist = [];
                    var games = item.games;            
                    for (var j = games.length - 1; j >= 0; j--) {
                        var gameid = games[j];
                        Game.findById(gameid).exec(function(err, result) {
                            gamelist.push(result);
                            countJ++;
                            if(countJ>=games.length){
                                countJ = 0;
                                console.log('game....', gamelist);
                                item.games = gamelist;
                                console.log('order....', item.games);
                                countI++;
                                if(countI>=results.length){
                                    console.log(results);
                                    res.json({
                                        success: true,
                                        message: '搜索完成',
                                        data: results
                                    });
                                }
                            }
                        });
                    }
                }
                //var json = _.extend({}, _.pick(result, 'id', 'name', 'desc', 'thumb', 'email', 'type', 'author', 'created', 'created'), {});
                
            }); 
        });       
    }
};
