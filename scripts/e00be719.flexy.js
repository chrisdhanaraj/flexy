!function(a){"use strict";function b(b){function e(){var a=k();a!==o?(o=a,q=j(o),n=[],f()):_.forEach(n,function(a){i(a)})}function f(){var b=_.clone(p,!0);4>o&&(b=_.sortBy(b,function(a){return null===a.getAttribute("data-priority")?99:a.getAttribute("data-priority")})),_.forEach(b,function(a){n.push(g(c(a)))});var e=_.max(n,function(a){return a.rowNum}).rowNum;a(d.container).css("height",(e+1)*d.height),o>1?a(d.container).css("width",o*d.width):a(d.container).css("width","auto"),_.forEach(n,function(a){i(a)}),l=!0}function g(a){var b=Number(a.col),c=Number(a.row);1===o&&(b=1);var d=h(a);a.colPos=d.colPos,a.rowNum=d.rowNum;for(var e=0;b>e;e++)for(var f=0;c>f;f++)q[f+a.rowNum][e+a.colPos]=1;return a}function h(a){function b(a,b,c){for(var e=0;d>e;e++)if(0!==a[e+b][c])return!1;return!0}var c=Number(a.col),d=Number(a.row);1===o&&(c=1);var e=0,f=0;return f=_.findIndex(q,function(a,d,f){for(var g=0;g<a.length;g+=1){var h=a.slice(g,g+c);if(!(g+c>a.length)&&-1===_.indexOf(h,1)&&b(f,d,g))return e=g,!0}}),{colPos:e,rowNum:f}}function i(b){var c=a(b.el),e=(a(window).width()-o*d.width)/2;1===o&&(e=0),console.log(e);var f=b.colPos*d.width+e,g=b.rowNum*d.height;Modernizr.csstransforms?l?c.css("transform","translate("+f+"px, "+g+"px"):(c.css("transform","translate("+f+"px, 1000px"),c.css("display","block"),window.setTimeout(function(){c.css("transform","translate("+f+"px, "+g+"px"),window.setTimeout(function(){c.addClass("flexy__transform-animation")},450)},250)):(c.css("left",f+"px"),c.css("top",g+"px")),c.css("height",d.height*b.row),1!==o?c.css("width",d.width*b.col):c.css("width","100%")}function j(a){for(var b=[],c=0;20>c;c++){b[c]=[];for(var d=0;a>d;d++)b[c][d]=0}return b}function k(){var a=Math.floor(b.offsetWidth/d.width);return 0===a&&(a=1),a>=4&&(a=4),a}var l=!1,m=b.querySelector(d.container),n=[],o=k(),p=m.querySelectorAll(".flexy__box--js"),q=j(o);f();var r=_.debounce(e,150);return a(window).on("resize",r),n}function c(a){var b=a.getAttribute("data-col"),c=a.getAttribute("data-row");return{el:a,col:b,row:c}}var d={container:".flexy__container",width:292.5,height:300},e=document.querySelectorAll(".flexy");_.forEach(e,function(a){a=b(a),console.log("flexy: ",a)})}(jQuery);