(function($, window, document, undefined) {
  "use strict";

  var points = [],
    area, url = 'https://warm-thicket-98293.herokuapp.com/',
    invocation = new XMLHttpRequest();;

  $.fn.mouseEventsTest = function() {

    $('#submit').on('click', function(e) {
      e.stopPropagation();
      evaluate();
      reset();
    });

    $('#response').on('click', function(e) {
      e.stopPropagation();
    });

    $(this).on('click', function(e) {

      points.push({
        'x': e.clientX,
        'y': e.clientY
      });
    });

    function evaluate() {

      //TESTS

      //squares
      //   points = [
      //   {'x': 397, 'y': 125},
      //   {'x': 628, 'y': 230},
      //   {'x': 292, 'y': 356},
      //   {'x': 523, 'y': 461},
      // ];

      // points = [
      //   {'x': 398, 'y': 94},
      //   {'x': 381, 'y': 265},
      //   {'x': 569, 'y': 111},
      //   {'x': 552, 'y': 282},
      // ];

      // points = [
      //   {'x': 0, 'y': 0},
      //   {'x': 1, 'y': 0},
      //   {'x': 0, 'y': 1},
      //   {'x': 1, 'y': 1},
      // ];

      //------------------------

      //triangles - isosceles
      // points = [
      //   {'x': 628, 'y': 230},
      //   {'x': 397, 'y': 125},
      //   {'x': 292, 'y': 356},
      // ];
      //
      // points = [
      //   {'x': 0, 'y': 0},
      //   {'x': 0, 'y': 1},
      //   {'x': 1, 'y': 1},
      // ];

      // points = [
      //   {'x': 398, 'y': 94},
      //   {'x': 381, 'y': 265},
      //   {'x': 569, 'y': 111},
      // ];

      if (points.length) {

        if (points.length === 3) { //Triangle

          var type,
            d1 = distance(points[0], points[1]),
            d2 = distance(points[1], points[2]),
            d3 = distance(points[2], points[0]);

          area = triangle_area(d1, d2, d3);

          if (is_isosceles(d1, d2, d3)) {

            alert('Isosceles!');
            type = 'isosceles';
          } else {

            alert('Just another triangle');
            type = 'other';
          }


          call_service({
            'method': 'triangle',
            'triangle': {
              'type': type
            }
          });

        } else if (points.length === 4) { //Square

          var result = is_square();

          if (result) {

            area = square_area(result);
            alert('Squared thoughts: ' + area);
            call_service({
              'method': 'square'
            });
          } else {

            total_distance();
          }

        } else {

          total_distance();
        }
      }
    }

    function call_service(call) {

      var points_base64_string = prepare_points(),
        query, rounded_area = area; //Math.round10(area, -1);

      if (call.method === 'square') {

        query = 'square?area=' + rounded_area.toString() + '&points=' + points_base64_string;
      } else {

        query = 'triangle?area=' + rounded_area.toString() + '&type=' + call.triangle.type + '&points=' + points_base64_string;
      }

      query = url + query;

      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'text/html');

      var myRequest = new Request(query);

      fetch(query, {method: 'GET', mode: 'cors'}).then(function(response) {
        return response.text();
      }).then(function(text) {
        $('#response').val(text);
      }).catch(function(error) {
         console.log(error.message);
      });

    }

    function prepare_points() {
      //build string
      var points_string = '[';
      $.each(points, function(index, value) {
        points_string += '(' + value.x.toString() + ',' + value.y.toString() + '),';
      });

      points_string = points_string.substring(0, points_string.length - 1);
      points_string += ']';

      return Base64.encode(points_string);
    }

    function total_distance() {
      var total = 0;

      $.each(points, function(index, value) {

        if (index > 0) {
          total += distance(points[index - 1], value);
        }

      });

      $('#response').val(Math.round10(total, -1));
    }

    function distance(p1, p2) {
      var a = p1.x - p2.x;
      var b = p1.y - p2.y;

      return Math.sqrt(a * a + b * b);
    }

    function square_area(a) {
      return a * a;
    }

    function is_square() {

      var d1 = distance(points[0], points[1]);
      var d2 = distance(points[0], points[2]);
      var d3 = distance(points[0], points[3]);

      if (
        (d1 === d2 && d3 === (d1 * Math.sqrt(2))) ||
        (d1 === d3 && d2 === (d1 * Math.sqrt(2)))
      ) {
        return d1;
      } else {
        return false;
      }
    }

    function triangle_area(d1, d2, d3) {
      var s = 0.5 * (d1 + d2 + d3);
      return Math.round10(Math.sqrt(s * (s - d1) * (s - d2) * (s - d3)), -1)
    }

    function is_isosceles(d1, d2, d3) {

      return (d1 === d2 || d2 === d3 || d3 === d1) ? true : false;

    }

    function reset() {
      points = [];
    }

    //https://jsfiddle.net/gabrieleromanato/qAGHT/
    var Base64 = {

      _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

      encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }

          output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
      },


      decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

          enc1 = this._keyStr.indexOf(input.charAt(i++));
          enc2 = this._keyStr.indexOf(input.charAt(i++));
          enc3 = this._keyStr.indexOf(input.charAt(i++));
          enc4 = this._keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
          }
          if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
          }

        }

        output = Base64._utf8_decode(output);

        return output;

      },

      _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

          var c = string.charCodeAt(n);

          if (c < 128) {
            utftext += String.fromCharCode(c);
          } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
          } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
          }

        }

        return utftext;
      },

      _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

          c = utftext.charCodeAt(i);

          if (c < 128) {
            string += String.fromCharCode(c);
            i++;
          } else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
          } else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
          }

        }

        return string;
      }

    }
  };

  $(function() {
    $(document).mouseEventsTest();
  });

})(jQuery, window, document);

// Closure
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // If the value is negative...
    if (value < 0) {
      return -decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();
