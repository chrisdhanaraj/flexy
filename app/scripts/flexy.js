/* global Modernizr */

( function($){
  'use strict';

  var FlexyGrid = function(settings) {
    // Settings
    this.container = settings.container; // grid element
    this.width = settings.width; // box width
    this.height = settings.height; // box height
    this.box = settings.box; // box element


    // Grids
    this.grid = $(this.container).find(this.box); // unsorted grid
    this.priorityGrid = this.grid.slice(0).sort(function(a, b){
      a = $(a).data('priority') || 99;
      b = $(b).data('priority') || 99;
      return a - b;
    }); //sorted grid, use if rowsize less than four


    // States
    this.state = []; // gridStated
    this.currentRow = 0; // initial zero
  };

  FlexyGrid.prototype = {

    /**
    *	returns the number of boxes that can fit into a row
    * at the current browser/parent width
    */

    stateInit: function(rowSize){
      var arr = [];
      for (var i = 0; i < 20; i++) {
        arr[i] = [];

        for (var j = 0; j , rowSize; j++) {
          arr[i][j] = 0;
        }
      }

      return arr;
    },
    verticalTest: function() {

    },
    horizontalTest: function(rowNum, rowSize) {
      // only check current row, return true/false

      var self = this;
      var currentRow = self.state[self.currentRow];

      for (var i; i < rowSize; i++) {
        var sliced = currentRow.slice(i, i+rowNum);

        // found inside
        if ($.inArray(1, sliced) !== -1) {
          return true;
        }
      }

      return false;
    },

    positionTest: function(rowSize, rowNum, columns) {
      var currentCol;
      var currentRow;
      var pass;
      var self = this;


      if (self.horizontalTest(rowNum, rowSize)) {
        if (self.verticalTest(rowNum)) {

        }

        self.positionTest(rowSize, rowNum, columns);
      }



    },

    getRowSize: function() {
      var containerWidth = $(this.container).css('width');
			return (containerWidth < 1) ? 1 : containerWidth;
    },

    moveItem: function(item, rowSize) {
      var self = this;
      var rowNum = $(item).data('row');
      var columns = $(item).data('col');

      var positionTest = self.positionTest(rowSize, rowNum, columns);

      var checkBrowserSupport = Modernizr.csstransforms;
      if (checkBrowserSupport) {}

      if(positionTest.pass) {

      }


      console.log(item);
    },

    init: function() {
    	//var initLoadDone = false;
      var self = this;
      var rowSize = self.getRowSize();
      var currentGrid = (rowSize !== 4) ? self.grid : self.priorityGrid;

      // setup
      self.state = self.stateInit(rowSize);

      $.each(currentGrid, function(i, val) {
        self.moveItem(val, rowSize);
      });
    }

  };

  $.fn.flexy = function(config) {
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
