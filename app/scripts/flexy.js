'use strict';

/* global Modernizr, jQuery */

(function ($) {

  // ---------------------- ---------
  // underscore debounce
  // --------------------------------

  function debounce(func, wait, immediate) {
  	var timeout;
  	return function() {
  		var context = this, args = arguments;
  		var later = function() {
  			timeout = null;
  			if (!immediate) {
          func.apply(context, args);
        }
  		};
  		var callNow = immediate && !timeout;
  		clearTimeout(timeout);
  		timeout = setTimeout(later, wait);
  		if (callNow) {
        func.apply(context, args);
      }
  	};
  }

  var FlexyGrid = function FlexyGrid(settings) {
    // Settings
    this.container = settings.container; // grid element
    this.width = settings.width; // box width
    this.height = settings.height; // box height
    this.box = settings.box; // box element

    // Grids
    this.grid = $(this.container).find(this.box); // unsorted grid
    this.priorityGrid = this.grid.slice(0).sort(function (a, b) {
      a = $(a).data('priority') || 99;
      b = $(b).data('priority') || 99;
      return a - b;
    }); //sorted grid, use if rowsize less than four

    // States
    this.state = []; // gridStated
    this.firstResize = true;
  };

  FlexyGrid.prototype = {

    /**
    *	returns the number of boxes that can fit into a row
    * at the current browser/parent width
    */

    stateInit: function stateInit(rowSize) {
      var arr = [];
      for (var i = 0; i < 20; i++) {
        arr[i] = [];

        for (var j = 0; j < rowSize; j++) {
          arr[i][j] = 0;
        }
      }

      return arr;
    },

    getRowSize: function getRowSize() {
      var containerWidth = Math.floor(parseInt($(this.container).css('width'))/this.width);
      return containerWidth < 1 ? 1 : containerWidth;
    },

    moveItem: function moveItem(item) {
      var self = this;
      var rowNum = parseInt($(item).data('row'));
      var columns = parseInt($(item).data('col'));

      var checkBrowserSupport = Modernizr.csstransforms;
      if (checkBrowserSupport) {}

      // checks column
      for (var currentRow = 0; currentRow < self.state.length; currentRow++) {
        var horzResult = checkRow(self.state[currentRow]);

        // if both tests pass
        if (horzResult.pass && checkCols(horzResult.col, currentRow)) {
          markState(horzResult.col, currentRow);
          $(item).css({
            'left': this.width * horzResult.col + 'px',
            'top': this.height * currentRow + 'px',
            'height': this.height * columns,
            'width': this.width * rowNum
          });

          break;
          //move item
        }
      }

      function checkRow(row) {
        for (var j = 0; j < row.length; j++) {
          // check fail states!

          // check if bigger than row
          // break out becauase this row is dead
          // console.log(j, rowNum, row);
          if (j + rowNum > row.length) {
            // console.log('bigger than row');
            break;
          }

          // this thing is occupied
          if ($.inArray(1, row.slice(j, j + rowNum)) !== -1) {
            // console.log('occupied');
            // go to the next row
            continue;
          }

          return {
            'pass': true,
            'col': j
          };
        }

        return {
          'pass': false,
          'col': 0
        };
      }

      function checkCols(colPos, startRow) {
        for (var k = 0; k < columns; k++) {
          if ($.inArray(1, self.state[startRow + k].slice(colPos, colPos + rowNum)) !== -1 ) {
            // console.log('height');
            return false;
          }
        }

        return true;
      }

      function markState(colPos, startRow) {
        for (var ii = 0; ii < columns; ii++) {
          for (var jj = 0; jj < rowNum; jj++) {
            self.state[startRow + ii][colPos + jj] = 1;
          }
        }
      }
    },

    init: function init() {
      //var initLoadDone = false;
      var self = this;
      console.log(self);
      var rowSize = self.getRowSize();
      var currentGrid = rowSize !== 4 ? self.grid : self.priorityGrid;

      // setup
      self.state = self.stateInit(rowSize);

      $.each(currentGrid, function (i, val) {
        self.moveItem(val, rowSize);
      });

      var resize = debounce(self.init.bind(this), 400);

      if (self.firstResize) {
        window.addEventListener('resize', resize);
        self.firstResize = false;
      }
    }
  };

  $.fn.flexy = function (config) {
    var settings = $.extend({
      container: this,
      box: '.flexy__box',
      width: 300,
      height: 300
    }, config);

    return new FlexyGrid(settings).init();
  };

  // how to use
  // $('.flexy__container').flexy({
  //   width: 300,
  //   height: 200
  // });
})(jQuery);
