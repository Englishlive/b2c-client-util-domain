define(['Defer'], function (Defer) {
    'use strict';
    return window.Promise || Defer.Promise;
});