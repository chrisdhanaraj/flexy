'use strict';

/* global Modernizr, jQuery */

(function ($) {

  /** Debounce function taken from underscore */
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

  /**
   * Represents the grid system
   * @constructor
   *
   * @param {object} settings - configuration options for the grid
   */
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
    this.mobile = false;
  };

  FlexyGrid.prototype = {


    /**
     *  Sets up the initial state of the grid matrix - a bunch
     *  of columns and rows of zeroes, matching the current rowsize
     *  @function
     */

    stateInit: function(rowSize) {
      var arr = [];
      for (var i = 0; i < 20; i++) {
        arr[i] = [];

        for (var j = 0; j < rowSize; j++) {
          arr[i][j] = 0;
        }
      }

      return arr;
    },

    /**
     *  Helper function that determines the size of the row, divides the
     *  container size by the size of a item
     *  @function
     */
    getRowSize: function() {
      var containerWidth = Math.floor(parseInt($(this.container).css('width'))/this.width);
      return containerWidth < 1 ? 1 : containerWidth;
    },

    /**
     *  Takes an individual item and places it in the grid. Goes through the state
     *  and finds an open spot that matches the items specified dimensions. Then
     *  it marks the state with 1s to signify the position is occupied, and moves
     *  the box to where it should be.
     *  @function
     */

    moveItem: function(item) {
      var self = this;
      var rowNum = (self.mobile) ? parseInt($(item).data('row')) : 1;
      var columns = parseInt($(item).data('col'));

      var checkBrowserSupport = Modernizr.csstransforms;
      if (checkBrowserSupport) {}

      // checks column
      for (var currentRow = 0; currentRow < self.state.length; currentRow++) {
        var horzResult = checkRow(self.state[currentRow]);

        // if both tests pass
        if (horzResult.pass && checkCols(horzResult.col, currentRow)) {
          markState(horzResult.col, currentRow);

          if (self.mobile) {
            $(item).css({
              'left': this.width * horzResult.col + 'px',
              'top': this.height * currentRow + 'px',
              'height': this.height * columns,
              'width': this.width * rowNum
            });
          } else {
            $(item).css({
              'left' : 0,
              'top' : this.height * currentRow + 'px',
              'height': this.height * columns,
              'width' : '100%'
            });
          }

          break;
          //move item
        }
      }

      /**
       *  Helper function that checks to see if the current row has space for the box.
       *  Returns whether the row passes, and if it did what is the earliest suitable
       *  position.
       *
       *  @param {array} row - the current row in the state matrix
       *  @function
       */
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

      /**
       *  Run if the checkRow passes, this checks if the vertical spacing works
       *  starting from the position that checkRow provided.
       *
       *  @param {number} colPos - the starting index in the row where there is open space
       *  @param {array} startRow - the starting row where there is open space
       *  @function
       */

      function checkCols(colPos, startRow) {
        for (var k = 0; k < columns; k++) {
          if ($.inArray(1, self.state[startRow + k].slice(colPos, colPos + rowNum)) !== -1 ) {
            // console.log('height');
            return false;
          }
        }

        return true;
      }

      /**
       *  Run when both horizontal(checkRow) and vertical(checkCols) test passes. This runs
       *  through the matrix to mark the spot as occupied.
       *
       *  @param {number} colPos - the starting index in the row where there is open space
       *  @param {array} startRow - the starting row where there is open space
       *  @function
       */
      function markState(colPos, startRow) {
        for (var ii = 0; ii < columns; ii++) {
          for (var jj = 0; jj < rowNum; jj++) {
            self.state[startRow + ii][colPos + jj] = 1;
          }
        }
      }
    },


    /**
     *  Initial setup of FlexyGrid - this initiailzes the state matrix,
     *  choses to use either the prioritized grid or the non, and then
     *  sets up the resize event.
     *
     *  @param {boolean} firstResize - checks if a resize handler has been added yet
     *  @function
     */
    init: function(firstResize) {
      //var initLoadDone = false;
      var self = this;
      var rowSize = self.getRowSize();
      self.mobile = (rowSize > 1) ? true : false;
      var currentGrid = rowSize !== 4 ? self.grid : self.priorityGrid;

      // setup
      self.state = self.stateInit(rowSize);

      $.each(currentGrid, function (i, val) {
        self.moveItem(val, rowSize);
      });

      var resize = debounce(self.init.bind(this), 350);

      if (firstResize) {
        window.addEventListener('resize', resize);
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

    return new FlexyGrid(settings).init(true);
  };

  // how to use
  // $('.flexy__container').flexy({
  //   width: 300,
  //   height: 200
  // });
})(jQuery);
