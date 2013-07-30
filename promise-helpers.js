var _ = require("lodash");

module.exports = {
  seq: function (promises) {
    _.reduce(_.rest(promises), function (prev, curr) {
      return prev.then(function () {return curr; });
    }, promises[0]);
  },
  seq1: function (callbacks) {
    return _.reduce(_.rest(callbacks), function (prev, curr) {
      if (_.isArray(curr)) {
        return prev.then(curr[0], curr[1]);
      }
      return prev.then(curr);
    }, callbacks[0]);
  }
};