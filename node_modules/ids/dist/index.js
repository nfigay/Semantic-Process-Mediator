function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var hat$1 = {exports: {}};

var hasRequiredHat;

function requireHat () {
	if (hasRequiredHat) return hat$1.exports;
	hasRequiredHat = 1;
	var hat = hat$1.exports = function (bits, base) {
	    if (!base) base = 16;
	    if (bits === undefined) bits = 128;
	    if (bits <= 0) return '0';
	    
	    var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
	    for (var i = 2; digits === Infinity; i *= 2) {
	        digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
	    }
	    
	    var rem = digits - Math.floor(digits);
	    
	    var res = '';
	    
	    for (var i = 0; i < Math.floor(digits); i++) {
	        var x = Math.floor(Math.random() * base).toString(base);
	        res = x + res;
	    }
	    
	    if (rem) {
	        var b = Math.pow(base, rem);
	        var x = Math.floor(Math.random() * b).toString(base);
	        res = x + res;
	    }
	    
	    var parsed = parseInt(res, base);
	    if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
	        return hat(bits, base)
	    }
	    else return res;
	};

	hat.rack = function (bits, base, expandBy) {
	    var fn = function (data) {
	        var iters = 0;
	        do {
	            if (iters ++ > 10) {
	                if (expandBy) bits += expandBy;
	                else throw new Error('too many ID collisions, use more bits')
	            }
	            
	            var id = hat(bits, base);
	        } while (Object.hasOwnProperty.call(hats, id));
	        
	        hats[id] = data;
	        return id;
	    };
	    var hats = fn.hats = {};
	    
	    fn.get = function (id) {
	        return fn.hats[id];
	    };
	    
	    fn.set = function (id, value) {
	        fn.hats[id] = value;
	        return fn;
	    };
	    
	    fn.bits = bits || 128;
	    fn.base = base || 16;
	    return fn;
	};
	return hat$1.exports;
}

var hatExports = requireHat();
var hat = /*@__PURE__*/getDefaultExportFromCjs(hatExports);

/**
 * @typedef { [ number, number ] | [ number, number, number ] } Seed
 */

/**
 * Create a new id generator / cache instance.
 *
 * You may optionally provide a seed that is used internally.
 *
 * @param {Seed} [seed]
 */
function Ids(seed) {

  if (!(this instanceof Ids)) {
    return new Ids(seed);
  }

  seed = seed || [ 128, 36, 1 ];
  this._seed = seed.length ? hat.rack(seed[0], seed[1], seed[2]) : seed;
}

/**
 * Generate a next id.
 *
 * @param {Object} [element] element to bind the id to
 *
 * @return {string} id
 */
Ids.prototype.next = function(element) {
  return this._seed(element || true);
};

/**
 * Generate a next id with a given prefix.
 *
 * @param {Object} [element] element to bind the id to
 *
 * @return {string} id
 */
Ids.prototype.nextPrefixed = function(prefix, element) {
  var id;

  do {
    id = prefix + this.next(true);
  } while (this.assigned(id));

  // claim {prefix}{random}
  this.claim(id, element);

  // return
  return id;
};

/**
 * Manually claim an existing id.
 *
 * @param {string} id
 * @param {any} [element] element the id is claimed by
 */
Ids.prototype.claim = function(id, element) {
  this._seed.set(id, element || true);
};

/**
 * Returns true if the given id has already been assigned.
 *
 * @param  {string} id
 * @return {boolean}
 */
Ids.prototype.assigned = function(id) {
  return this._seed.get(id) || false;
};

/**
 * Unclaim an id.
 *
 * @param  {string} id the id to unclaim
 */
Ids.prototype.unclaim = function(id) {
  delete this._seed.hats[id];
};


/**
 * Clear all claimed ids.
 */
Ids.prototype.clear = function() {

  var hats = this._seed.hats,
      id;

  for (id in hats) {
    this.unclaim(id);
  }
};

export { Ids };
