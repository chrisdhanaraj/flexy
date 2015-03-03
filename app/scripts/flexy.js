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
   *  State matrix to keep track of boxes
   *  @constructor
   */

  var StateMatrix = function StateMatrix(rowSize) {
    this.rowSize = rowSize;
  };

  StateMatrix.prototype = {
    /**
     *  Sets up the initial state of the grid matrix - a bunch
     *  of columns and rows of zeroes, matching the current rowsize
     */

    createState: function setup() {
      var LARGENUMBER = 20; // large number initial number, expanded if needed
      this.state = []; // reset
      for (var i = 0; i < LARGENUMBER; i++) {
        this.state[i] = [];

        for (var j = 0; j < this.rowSize; j++) {
          this.state[i][j] = 0;
        }
      }

      return this.state;
    },

    /**
     *  Run when both horizontal(checkRow) and vertical(checkCols) test passes. This runs
     *  through the matrix to mark the spot as occupied.
     *
     *  @param {number} colPos - the starting index in the row where there is open space
     *  @param {array} startRow - the starting row where there is open space
     */

    markFilled: function markFilled(colPos, startRow, columns, rowNum) {
      for (var i = 0; i < columns; i++) {
        for (var j = 0; j < rowNum; j++) {
          this.state[startRow + i][colPos + j] = 1;
        }
      }
    },

    addRows: function addRows(numberOfRows) {
      var newRow = [];
      for (var i = 0; i < this.rowSize; i++) {
        newRow.push(0);
      }

      // add more rows until difference is met
      for (; numberOfRows === 0; numberOfRows--){
        this.state.push(newRow);
      }
    }
  };

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

    // One Column state - aliased to mobile
    this.mobile = false;
  };


  /** check if window has been reszied before */
  FlexyGrid.checkIfResized = false;
  FlexyGrid.prototype = {

    /**
     *  Helper function that determines the size of the row, divides the
     *  container size by the size of a item
     */
    getRowSize: function getRowSize() {
      var containerWidth = Math.floor(parseInt($(this.container).css('width'))/this.width);
      return containerWidth < 1 ? 1 : containerWidth;
    },

    /**
     *  Helper function that checks to see if the current row has space for the box.
     *  Returns whether the row passes, and if it did what is the earliest suitable
     *  position.
     *
     *  @param {array} row - the current row in the state matrix
     */
    checkRow: function checkRow(row, rowNum) {
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
    },

    /**
     *  Run if the checkRow passes, this checks if the vertical spacing works
     *  starting from the position that checkRow provided.
     *
     *  @param {number} colPos - the starting index in the row where there is open space
     *  @param {array} startRow - the starting row where there is open space
     */
    checkCols: function checkCols(colPos, startRow, columns, rowNum) {
      var flexyContext = this;

      for (var k = 0; k < columns; k++) {
        if ($.inArray(1, flexyContext.state[startRow + k].slice(colPos, colPos + rowNum)) !== -1 ) {
          // console.log('height');
          return false;
        }
      }

      return true;
    },


    /**
     *  Takes an individual item and places it in the grid. Goes through the state
     *  and finds an open spot that matches the items specified dimensions. Then
     *  it marks the state with 1s to signify the position is occupied, and moves
     *  the box to where it should be.
     *  @function
     */

    moveItem: function moveItem(item) {
      var flexyContext = this;
      var rowNum = (flexyContext.mobile) ? parseInt($(item).data('row')) : 1;
      var columns = parseInt($(item).data('col'));

      var checkBrowserSupport = Modernizr.csstransforms;
      if (checkBrowserSupport) {}

      // checks column
      for (var currentRow = 0; currentRow < flexyContext.state.length; currentRow++) {
        var horzResult = flexyContext.checkRow(flexyContext.state[currentRow], rowNum);

        // check if we need more rows
        // if so, add rows
        if (currentRow + rowNum >= flexyContext.state.length) {
          var counter = currentRow + rowNum - flexyContext.state.length;
          flexyContext.stateMatrix.addRows(counter);
        }

        // if both tests pass
        if (horzResult.pass && flexyContext.checkCols(horzResult.col, currentRow, columns, rowNum)) {
          flexyContext.stateMatrix.markFilled(horzResult.col, currentRow, columns, rowNum);

          if (flexyContext.mobile) {
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
    },


    /**
     *  Initial setup of FlexyGrid - this initiailzes the state matrix,
     *  choses to use either the prioritized grid or the non, and then
     *  sets up the resize event.
     *
     *  @param {boolean} firstResize - checks if a resize handler has been added yet
     */
    init: function init() {
      console.log('hi, an init has occured');
      // bind this to context
      var flexyContext = this;
      var rowSize = flexyContext.getRowSize();
      flexyContext.mobile = (rowSize > 1) ? true : false;

      // grid options
      var grid = $(this.container).find(this.box); // unsorted grid
      var priorityGrid = grid.slice(0).sort(function (a, b) {
        a = $(a).data('priority') || 99;
        b = $(b).data('priority') || 99;
        return a - b;
      }); //sorted grid, use if rowsize less than four

      // choose which grid
      var currentGrid = rowSize !== 4 ? grid : priorityGrid;

      // setup state
      this.stateMatrix = new StateMatrix(rowSize);
      this.stateMatrix.createState();
      flexyContext.state = this.stateMatrix.state;


      $.each(currentGrid, function (i, val) {
        flexyContext.moveItem(val, rowSize);
      });

      if (!FlexyGrid.checkIfResized) {
        var resize = debounce(flexyContext.init.bind(flexyContext), 300);
        window.addEventListener('resize', resize);
        FlexyGrid.checkIfResized = true;
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
