(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function () {
      return (root.returnExportsGlobal = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['bundle'] = factory();
  }
}(this, function () {

(function (root, factory) {
    if (true) {
        var Defer = root.returnExportsGlobal = factory();
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        root['Defer'] = factory();
    }
}(this, function () {
    var util;
    util = {
        f: function (obj) {
            return typeof obj === 'function';
        }
    };
    var extAll;
    extAll = function (util) {
        function getResultChecker(results, index, resolve, length, count) {
            return function check(result) {
                results[index] = result;
                count.value++;
                if (length.value === count.value) {
                    resolve(results);
                }
            };
        }
        return function (Defer) {
            Defer.all = function (promises) {
                return new Defer.Promise(function (rs, rj) {
                    var length = { value: promises.length };
                    var count = { value: 0 };
                    var results = [];
                    for (var l = promises.length; l--;) {
                        if (!(promises[l] && util.f(promises[l].then))) {
                            results[l] = promises[l];
                            length.value--;
                        } else {
                            promises[l].then(getResultChecker(results, l, rs, length, count), rj);
                        }
                    }
                    if (length.value <= 0 || length.value === count.value) {
                        rs(results);
                        return;
                    }
                });
            };
        };
    }(util);
    var tickSmall;
    tickSmall = function (func) {
        func();
    };
    var Defer;
    Defer = function (allExt, util, tick) {
        var PROTOTYPE = 'prototype', RESOLVE = 'resolve', REJECT = 'reject', RESOLVED = 'resolved', REJECTED = 'rejected', PENDING = 'pending', PROMISE = 'promise', CALL = 'call', RESULT = 'result', ERROR = 'error', undef;
        function safeRun(func, value, defer) {
            var ret;
            try {
                ret = func[CALL](undef, value);
            } catch (ex) {
                handleError(ex);
                defer[REJECT](ex);
            }
            return ret;
        }
        function reset() {
            this[PROMISE]._s = [];
            this[PROMISE]._f = [];
            this[PROMISE]._d = [];
        }
        function handleError(err) {
            if (util.f(Defer.onError)) {
                Defer.onError(err);
            }
        }
        function resolve(result) {
            var me = this;
            var promise = me[PROMISE];
            function callback(finalResult) {
                promise[RESULT] = finalResult;
                promise[RESOLVED] = true;
                promise[PENDING] = false;
                tick(function () {
                    for (var i = 0; i < promise._s.length; i++) {
                        safeRun(promise._s[i], promise[RESULT], promise._d[i]);
                    }
                    reset[CALL](me);
                });
            }
            function recursiveCall(recursiveResult) {
                promiseAwareCall(recursiveCall, function (error) {
                    promise[PENDING] = false;
                    reject[CALL](me, error);
                }, callback, me, recursiveResult);
            }
            if (promise[RESOLVED] || promise[REJECTED] || promise[PENDING]) {
                return;
            }
            promise[PENDING] = true;
            recursiveCall(result);
        }
        function reject(error) {
            var me = this;
            var promise = me[PROMISE];
            function callback(finalError) {
                promise[ERROR] = finalError;
                promise[REJECTED] = true;
                promise[PENDING] = false;
                tick(function () {
                    for (var i = 0; i < promise._f.length; i++) {
                        safeRun(promise._f[i], promise[ERROR], promise._d[i]);
                    }
                    reset[CALL](me);
                });
            }
            if (promise[RESOLVED] || promise[REJECTED] || promise[PENDING]) {
                return;
            }
            promise[PENDING] = true;
            callback(error);
        }
        function createResultHandlerWrapper(handler, defer) {
            return function (value) {
                tick(function () {
                    var res = safeRun(handler, value, defer);
                    promiseAwareCall(defer[RESOLVE], defer[REJECT], defer[RESOLVE], defer, res);
                });
            };
        }
        function promiseAwareCall(resolve, reject, defaultSolution, context, result) {
            var then, handled;
            try {
                then = (typeof result === 'object' || util.f(result)) && result && result.then;
            } catch (ex) {
                handleError(ex);
                reject[CALL](context, ex);
                return;
            }
            if (result === context[PROMISE]) {
                reject[CALL](context, new TypeError(1));
            } else if (util.f(then)) {
                try {
                    then[CALL](result, function (newResult) {
                        if (handled) {
                            return;
                        }
                        handled = true;
                        resolve[CALL](context, newResult);
                    }, function (newError) {
                        if (handled) {
                            return;
                        }
                        handled = true;
                        reject[CALL](context, newError);
                    });
                } catch (ex) {
                    if (handled) {
                        return;
                    }
                    handled = true;
                    handleError(ex);
                    reject[CALL](context, ex);
                }
            } else {
                if (result === undef) {
                    defaultSolution[CALL](context);
                } else {
                    defaultSolution[CALL](context, result);
                }
            }
        }
        function Defer(promise) {
            if (!(this instanceof Defer)) {
                return new Defer(promise);
            }
            var me = this;
            me[PROMISE] = promise && util.f(promise.then) ? promise : new Promise(me);
            me[RESOLVE] = function (value) {
                resolve[CALL](me, value);
            };
            me[REJECT] = function (value) {
                reject[CALL](me, value);
            };
        }
        function Promise(arg) {
            if (!(this instanceof Promise)) {
                return new Promise(arg);
            }
            this._s = [];
            this._f = [];
            this._d = [];
            this._defer = arg && arg instanceof Defer ? arg : new Defer(this);
            this[RESOLVED] = false;
            this[REJECTED] = false;
            this[PENDING] = false;
            this[RESULT] = null;
            this[ERROR] = null;
            if (util.f(arg)) {
                try {
                    arg[CALL](this, this._defer[RESOLVE], this._defer[REJECT]);
                } catch (ex) {
                    handleError(ex);
                    this._defer[REJECT](ex);
                }
            }
        }
        Promise[PROTOTYPE].then = function (onSuccess, onFailure) {
            var defer = new Defer();
            var me = this;
            var handleSuccess, handleFail;
            me._d.push(defer);
            if (!me[REJECTED]) {
                if (util.f(onSuccess)) {
                    handleSuccess = createResultHandlerWrapper[CALL](me, onSuccess, defer);
                } else {
                    handleSuccess = defer[RESOLVE];
                }
                if (me[RESOLVED]) {
                    handleSuccess[CALL](null, me[RESULT]);
                } else {
                    me._s.push(handleSuccess);
                }
            }
            if (!me[RESOLVED]) {
                if (util.f(onFailure)) {
                    handleFail = createResultHandlerWrapper[CALL](me, onFailure, defer);
                } else {
                    handleFail = defer[REJECT];
                }
                if (me[REJECTED]) {
                    handleFail[CALL](null, me[ERROR]);
                } else {
                    me._f.push(handleFail);
                }
            }
            return defer[PROMISE];
        };
        Defer.Promise = Promise;
        Defer[RESOLVE] = function (v) {
            var result = new Defer();
            result[RESOLVE](v);
            return result[PROMISE];
        };
        Defer[REJECT] = function (v) {
            var result = new Defer();
            result[REJECT](v);
            return result[PROMISE];
        };
        allExt(Defer);
        return Defer;
    }(extAll, util, tickSmall);
    return Defer;
}));
var Promise = function (Defer) {
    'use strict';
    return window.Promise || Defer.Promise;
}(Defer);
var Domain = function (Promise) {
    'use strict';
    var LIVE = 'live';
    var QA = 'qa';
    var STAGING = 'stg';
    var DEV = 'dev';
    Domain.ENGLISHLIVE = 'englishlive.ef.com';
    Domain.ENGLISHLIVE_QA = 'qa-englishlive.ef.com';
    Domain.ENGLISHLIVE_STAGING = 'stg-englishlive.ef.com';
    Domain.ENGLISHTOWN = 'englishtown.com';
    Domain.ENGLISHTOWN_SEO = 'efenglishtown.com';
    Domain.ENGLISHTOWN_JP = 'englishtown.co.jp';
    Domain.ENGLISHTOWN_MX = 'englishtown.com.mx';
    Domain.ENGLISHTOWN_RU = 'englishtown.ru';
    Domain.ENGLISHTOWN_BR = 'englishtown.com.br';
    Domain.ENGLISHTOWN_CN = 'englishtown.cn';
    Domain.ENGLISHTOWN_CN_LEGACY = 'englishtown.com.cn';
    Domain.ENGLISHTOWN_FR = 'englishtown.fr';
    Domain.ENGLISHTOWN_DE = 'englishtown.de';
    Domain.ENGLISHTOWN_ES = 'englishtown.es';
    Domain.ENGLISHCENTER = 'englishcenters.ef.com';
    Domain.ENGLISHCENTER_QA = 'qa-englishcenters.ef.com';
    Domain.ENGLISHCENTER_STAGING = 'stg-englishcenters.ef.com';
    Domain.englishLives = [
        Domain.ENGLISHLIVE,
        Domain.ENGLISHLIVE_QA,
        Domain.ENGLISHLIVE_STAGING
    ];
    Domain.englishCenters = [
        Domain.ENGLISHCENTER,
        Domain.ENGLISHCENTER_QA,
        Domain.ENGLISHCENTER_STAGING
    ];
    Domain.englishTowns = [
        Domain.ENGLISHTOWN,
        Domain.ENGLISHTOWN_JP,
        Domain.ENGLISHTOWN_MX,
        Domain.ENGLISHTOWN_RU,
        Domain.ENGLISHTOWN_BR,
        Domain.ENGLISHTOWN_CN,
        Domain.ENGLISHTOWN_CN_LEGACY,
        Domain.ENGLISHTOWN_FR,
        Domain.ENGLISHTOWN_DE,
        Domain.ENGLISHTOWN_ES
    ];
    Domain.all = [Domain.ENGLISHTOWN_SEO].concat(Domain.englishLives).concat(Domain.englishTowns).concat(Domain.englishCenters);
    Domain.env = {};
    Domain.env.LIVE = LIVE;
    Domain.env.STAGING = STAGING;
    Domain.env.QA = QA;
    Domain.env.DEV = DEV;
    var englishtownMarkets = [{
            code: 'br',
            domain: Domain.ENGLISHTOWN_BR,
            brand: 'englishtown'
        }];
    function has(array, value) {
        if (typeof array.indexOf === 'function') {
            return array.indexOf(value) >= 0;
        } else {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === value) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    function getResolvedPromise(v) {
        return new Promise(function (rs) {
            rs(v);
        });
    }
    function getRejectedPromise(v) {
        return new Promise(function (rs, rj) {
            rj(v);
        });
    }
    function getByMarket(market) {
        var marketInfo;
        for (var l = englishtownMarkets.length; l--;) {
            marketInfo = englishtownMarkets[l];
            if (marketInfo.code == market) {
                return marketInfo.domain;
            }
        }
        return Domain.ENGLISHLIVE;
    }
    Domain.get = {
        by: function (options) {
            if (options == null) {
                return getRejectedPromise('Option must be specified');
            }
            if (options.market) {
                return getResolvedPromise(getByMarket(options.market));
            }
            return getRejectedPromise('Option is empty or unknown');
        }
    };
    Domain.config = { getMarket: null };
    function Domain(domain) {
        if (domain == null) {
            throw new Error('domain must be specified');
        }
        this.domain = domain.toLowerCase();
        this.is = new Checker(this);
        this.get = new Getter(this);
        this.set = new Setter(this);
    }
    Domain.prototype.toString = function () {
        return this.domain;
    };
    function Setter(context) {
        this._context = context;
    }
    Setter.prototype.env = function (env) {
        var topLevel = this._context.get.topLevel(Domain.all);
        var prefixMode = false;
        var productionDomain = Domain.ENGLISHLIVE;
        if (topLevel == null) {
            return;
        }
        if (topLevel === Domain.ENGLISHLIVE || topLevel === Domain.ENGLISHLIVE_QA || topLevel === Domain.ENGLISHLIVE_STAGING || topLevel === Domain.ENGLISHCENTER || topLevel === Domain.ENGLISHCENTER_QA || topLevel === Domain.ENGLISHCENTER_STAGING) {
            prefixMode = true;
        }
        if (prefixMode) {
            if (has(Domain.englishCenters, topLevel)) {
                productionDomain = Domain.ENGLISHCENTER;
            }
            if (env === LIVE) {
                this._context.domain = productionDomain;
            } else if (env === STAGING) {
                this._context.domain = 'stg-' + productionDomain;
            } else if (env === QA) {
                this._context.domain = 'qa-' + productionDomain;
            } else if (env === DEV) {
                this._context.domain = 'dev-' + productionDomain;
            }
        } else {
            if (env === LIVE) {
                this._context.domain = 'www.' + topLevel;
            } else if (env === STAGING) {
                this._context.domain = 'staging.' + topLevel;
            } else if (env === QA) {
                this._context.domain = 'qa.' + topLevel;
            } else if (env === DEV) {
                this._context.domain = 'local.' + topLevel;
            }
        }
    };
    function Getter(context) {
        this._context = context;
    }
    Getter.prototype.topLevel = function (topLevelList) {
        var result = null;
        for (var l = topLevelList.length; l--;) {
            if (this.subsOf(topLevelList[l]) !== null) {
                result = topLevelList[l];
                break;
            }
        }
        return result;
    };
    Getter.prototype.subsOf = function (tlDomain) {
        var fullDomain = this._context.domain;
        var fdParts = fullDomain.split('.');
        var tlParts = tlDomain.split('.');
        var i, l;
        var fdIndex = 0;
        var result = [];
        for (l = tlParts.length; l--;) {
            fdIndex = fdParts.length - (tlParts.length - l);
            if (tlParts[l] !== fdParts[fdIndex]) {
                result = null;
                break;
            }
        }
        if (result === null) {
            return result;
        }
        for (i = 0; i < fdIndex; i++) {
            result.push(fdParts[i]);
        }
        return result;
    };
    Getter.prototype.env = function () {
        var topLevel = this.topLevel(Domain.all);
        if (topLevel == null) {
            return null;
        }
        var parts = this.subsOf(topLevel);
        if (parts == null) {
            return null;
        }
        if (topLevel === Domain.ENGLISHLIVE_QA || topLevel === Domain.ENGLISHCENTER_QA) {
            return QA;
        }
        if (topLevel === Domain.ENGLISHLIVE_STAGING || topLevel === Domain.ENGLISHCENTER_STAGING) {
            return STAGING;
        }
        if (parts[0] === QA || parts[0] == STAGING || parts[0] == DEV) {
            return parts[0];
        }
        if (parts[0] === 'staging') {
            return STAGING;
        }
        if (parts[0] === 'local') {
            return DEV;
        }
        return LIVE;
    };
    Getter.prototype.secure = function () {
        var me = this;
        var isSEODomain = me._context.is.subOf(Domain.ENGLISHTOWN_SEO);
        if (!isSEODomain) {
            return getResolvedPromise(me._context.domain);
        }
        var env = me.env();
        var currentMarketCode;
        var sub = '';
        return Domain.config.getMarket().then(function (value) {
            currentMarketCode = value;
            if (me._context.is.subOf(Domain.englishTowns)) {
                if (env === Domain.env.LIVE) {
                    sub = 'www.';
                } else if (env === Domain.env.QA) {
                    sub = 'qa.';
                } else if (env === Domain.env.STAGING) {
                    sub = 'staging.';
                }
            } else {
                if (env === Domain.env.QA) {
                    sub = 'qa-';
                } else if (env === Domain.env.STAGING) {
                    sub = 'stg-';
                }
            }
        }).then(function () {
            return Domain.get.by({ market: currentMarketCode });
        }).then(function (marketDomain) {
            return getResolvedPromise(sub + marketDomain);
        });
    };
    function Checker(context) {
        this._context = context;
    }
    Checker.prototype.subOf = function (tlDomain) {
        if (typeof tlDomain === 'object' && 'length' in tlDomain) {
            for (var l = tlDomain.length; l--;) {
                if (this.subOf(tlDomain[l])) {
                    return true;
                }
            }
            return false;
        } else {
            return this._context.get.subsOf(tlDomain) !== null ? true : false;
        }
    };
    Checker.prototype.ours = function () {
        return this.subOf(Domain.all);
    };
    return Domain;
}(Promise);
var bundle = function (Domain) {
    'use strict';
    return { Domain: Domain };
}(Domain);

return bundle;

}));
