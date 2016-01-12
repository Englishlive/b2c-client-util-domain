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

/*
 * A compact version of Promise
 */
var Defer = function () {
    'use strict';
    var PROTOTYPE = 'prototype', FUNCTION = 'function', RESOLVED = 'resolved', REJECTED = 'rejected';
    function resolve() {
        var me = this;
        me.promise.result = arguments[0];
        if (me.promise[REJECTED]) {
            return;
        }
        me.promise[RESOLVED] = true;
        for (var i = 0; i < me.promise._s.length; i++) {
            me.promise._s[i].call(null, me.promise.result);
        }
        me.promise._s = [];
    }
    function reject() {
        var me = this;
        me.promise.error = arguments[0];
        if (me.promise[RESOLVED]) {
            return;
        }
        me.promise[REJECTED] = true;
        for (var i = 0; i < me.promise._f.length; i++) {
            me.promise._f[i].call(null, me.promise.error);
        }
        me.promise._f = [];
    }
    function Defer(promise) {
        if (!(this instanceof Defer)) {
            return new Defer(promise);
        }
        var me = this;
        me.promise = promise && 'then' in promise ? promise : new Promise(me);
        me.resolve = function () {
            return resolve.apply(me, arguments);
        };
        me.reject = function () {
            return reject.apply(me, arguments);
        };
    }
    function Promise(arg) {
        this._s = [];
        this._f = [];
        this._defer = arg && arg instanceof Defer ? arg : new Defer(this);
        this.result = null;
        this.error = null;
        if (typeof arg === FUNCTION) {
            try {
                arg.call(this, this._defer.resolve, this._defer.reject);
            } catch (ex) {
                this._defer.reject(ex);
            }
        }
    }
    function createResultHandlerWrapper(handler, defer) {
        var me = this;
        return function () {
            var res = handler.apply(me, arguments);
            if (res && typeof res.then === FUNCTION) {
                res.then(function () {
                    defer.resolve.apply(defer, arguments);
                }, function () {
                    defer.reject.apply(defer, arguments);
                });
            } else {
                defer.resolve.apply(defer, res == null ? [] : [res]);
            }
        };
    }
    Promise[PROTOTYPE].then = function (onSuccess, onFailure) {
        var defer = new Defer();
        var me = this;
        var handleSuccess, handleFail;
        if (typeof onSuccess == FUNCTION) {
            handleSuccess = createResultHandlerWrapper.call(me, onSuccess, defer);
        } else {
            handleSuccess = defer.resolve;
        }
        if (me[RESOLVED]) {
            handleSuccess.call(null, me.result);
        } else {
            me._s.push(handleSuccess);
        }
        if (typeof onFailure == FUNCTION) {
            handleFail = createResultHandlerWrapper.call(me, onFailure, defer);
        } else {
            handleFail = defer.reject;
        }
        if (me[REJECTED]) {
            handleFail.call(null, me.error);
        } else {
            me._f.push(handleFail);
        }
        return defer.promise;
    };
    Defer.Promise = Promise;
    Defer.resolve = function () {
        var result = new Defer();
        result.resolve();
        return result.promise;
    };
    Defer.all = function (promises) {
        return new Promise(function (rs, rj) {
            var length = promises.length;
            var count = 0;
            var results = [];
            function check(result) {
                results.push(result);
                count++;
                if (length === count) {
                    rs(results);
                }
            }
            for (var l = promises.length; l--;) {
                if (!('then' in promises[l])) {
                    length--;
                } else {
                    promises[l].then(check, rj);
                }
            }
            if (length <= 0) {
                rs();
                return;
            }
        });
    };
    return Defer;
}();
var Domain = function (Defer) {
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
    Domain.englishLives = [
        Domain.ENGLISHTOWN,
        Domain.ENGLISHLIVE,
        Domain.ENGLISHLIVE_QA,
        Domain.ENGLISHLIVE_STAGING
    ];
    Domain.englishTowns = [
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
    Domain.all = [Domain.ENGLISHTOWN_SEO].concat(Domain.englishLives).concat(Domain.englishTowns);
    Domain.env = {};
    Domain.env.LIVE = LIVE;
    Domain.env.STAGING = STAGING;
    Domain.env.QA = QA;
    Domain.env.DEV = DEV;
    var englishtownMarkets = [
        {
            code: 'jp',
            domain: Domain.ENGLISHTOWN_JP,
            brand: 'englishtown'
        },
        {
            code: 'tw',
            domain: Domain.ENGLISHTOWN,
            brand: 'englishtown'
        }
    ];
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
                var reject = new Defer();
                reject.reject('Option must be specified');
                return reject.promise;
            }
            if (options.market) {
                return Defer.resolve(getByMarket(options.market));
            }
            return Defer.reject('Option is empty or unknown');
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
        if (topLevel == null) {
            return;
        }
        if (topLevel === Domain.ENGLISHLIVE || topLevel === Domain.ENGLISHLIVE_QA || topLevel === Domain.ENGLISHLIVE_STAGING) {
            if (env === LIVE) {
                this._context.domain = Domain.ENGLISHLIVE;
            } else if (env === STAGING) {
                this._context.domain = 'stg-' + Domain.ENGLISHLIVE;
            } else if (env === QA) {
                this._context.domain = 'qa-' + Domain.ENGLISHLIVE;
            } else if (env === DEV) {
                this._context.domain = 'dev-' + Domain.ENGLISHLIVE;
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
        if (topLevel === Domain.ENGLISHLIVE_QA) {
            return QA;
        }
        if (topLevel === Domain.ENGLISHLIVE_STAGING) {
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
            return Defer.resolve(me._context.domain);
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
            return Defer.resolve(sub + marketDomain);
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
}(Defer);
var bundle = function (Domain) {
    'use strict';
    return { Domain: Domain };
}(Domain);

return bundle;

}));
