/* global _ */
// add a file-level comment explaining what this file is about and simple
// sample code for how to use flexy

(function($) {
    'use strict';

    // this configuration is for four columns
    // on a 1200px grid
    var CONFIG = { 
        width: 300,
        height: 270,
    };

    /**
     * flexy creates the 'grid.' It sets the height/width and positioning
     * of each box
     *
     *   @param element - div container of the grid elements
     *
     */
    function flexy(element) {
        var flexyGrid = [];
        var rowSize = getRowSize();
        var elOnPage = element.querySelectorAll('.flexy__box--js');  // this string should be a constant
        var internalGrid = createEmptyGrid(rowSize);

        init();  // how is init() different from createEmptyGrid() ? pick better names

        
        var resize = _.debounce(calculateLayout, 150);  // constant for 150
        $(window).on('resize', resize);

        // logging purposes only I suppose
        // all the functions are used internally

        return flexyGrid;

        // ----------------
        // Functions
        // ----------------

        /**
         * What does this function do?
         * What does it return?
         */

        function calculateLayout() {
            /**
             *  Checks the row size on window resize
             *  If changed, resets the internal grid 
             *  and starts the init function
             */

            var newSize = getRowSize();
            if (newSize !== rowSize) {
                rowSize = newSize;
                internalGrid = createEmptyGrid(rowSize);
                flexyGrid = [];
                init();
            }
        }

        function init() {
            /**
             *  Initialization function - gets all the gridElments on the page,
             *  makes them into gridElements, pushes them into the flexy container,
             *  and sets the css.
             *  
             *  Also sorts the grid by priority if rowSize is below than 4
             */

            if (rowSize < 4) {
                elOnPage = _.sortBy(elOnPage, function(el) {
                    return el.getAttribute('data-priority') === null ? 99 : el.getAttribute('data-priority');
                });
            }

            _.forEach(elOnPage, function(item) {
                flexyGrid.push(addItem(gridElement(item)));
            });
            
            // CSS the items
            _.forEach(flexyGrid, function(item) {
                moveItem(item);
            });
        }

        function addItem(item) {
            /**
             *  Sets internal grid to occupied (in x,y positions) and gives the 
             *  gridElement it's start row number and column number
             * 
             *  @param: gridElement
             *  @return: gridElement
             */

            var width = Number(item.col);
            var height = Number(item.row);

            // at 1 column, there are no 2 column gridElements
            if (rowSize === 1) {
                width = 1;
            }

            // get the row number and column position of the element
            var coord = getPosition(item);

            item.colPos = coord.colPos;
            item.rowNum = coord.rowNum;

            for (var ii = 0; ii < width; ii++) {
                for (var jj = 0; jj < height; jj++) {
                    internalGrid[jj + item.rowNum][ii + item.colPos] = 1;
                }
            }

            return item;
        }

        function getPosition(item) {
            /**
             *  Loops through the internal grid to find unoccupied spaces
             * 
             *  @param: gridElement
             *  @return: obj containing start row number and column number
             */
            var width = Number(item.col);
            var height = Number(item.row);

            if (rowSize === 1) {
                width = 1;
            }

            var col = 0;
            var rowNum = 0;

            // looping through each row
            rowNum = _.findIndex(internalGrid, function(currentRow, currentRowNumber, matrix) {
                // horizontal check
                for (var currentCol = 0; currentCol < currentRow.length; currentCol++) {
                    if ((currentCol + width) > currentRow.length) {
                        break;
                    }

                    var sliced = currentRow.slice(currentCol + 1, currentCol + width);

                    if (_.indexOf(sliced, 1) !== -1) {
                        // there's a 1 in there somewhere
                        break;
                    }

                    for (var vertIndex = 0; vertIndex < height; vertIndex++) {
                        if (matrix[vertIndex + currentRowNumber][currentCol] !== 0) {
                            break;
                        }

                        // we good to go, lock it in champ
                        col = currentCol;
                        return true;
                    }
                }
            });

            return {
                colPos: col,
                rowNum: rowNum
            };
        }

        function moveItem(item) {
            /**
             *  Adds the css to move the element to grid position
             *
             *  @param: gridElement
             */

            var $el = $(item.el);
            var x = item.colPos * CONFIG.width;
            var y = item.rowNum * CONFIG.height;

            $el.css('transform', 'translate(' + x + 'px, ' + y + 'px');
            $el.css('height', CONFIG.height * item.row);
            if (rowSize !== 1) {
                $el.css('width', CONFIG.width * item.col);
            } else {
                $el.css('width', '100%');
            }

        }

        function createEmptyGrid(rsize) {
            /**
             *  Initializes a bunch of empty rows to be filled in
             *
             *  @param: rowSize, i.e. number of columns in a row
             *  @return: arr, two dimensional array of 0's
             */
            var arr = [];
            for (var i = 0; i < 20; i++) {
                arr[i] = [];

                for (var j = 0; j < rsize; j++) {
                    arr[i][j] = 0;
                }
            }

            return arr;
        }

        function getRowSize() {
            /**
             *  Finds the number of columns that would fit in the parant div 
             *  
             *  @return: rowSize, i.e. number of columns in a row
             */

            var rowSize = Math.floor(element.offsetWidth / (CONFIG.width));
            if (rowSize === 0) {
                rowSize = 1;
            }
            if (rowSize >= 4) {
                rowSize = 4;
            }

            return rowSize;
        }
    }

    function gridElement(el) {
        /**
         *  Container for various properties for grid blocks
         *  
         *  @param: el, div blocks
         *  @return: 
         *    el: the div element
         *    col: data-col
         *    row: data-row
         */
        console.log(el);
        var col = el.getAttribute('data-col');
        var row = el.getAttribute('data-row');

        return {
            el: el,
            col: col,
            row: row
        };
    }

    var gridsOnPage = document.querySelectorAll('.flexy');

    _.forEach(gridsOnPage, function(item) {
        item = flexy(item);
        console.log('flexy: ', item);
    });



})(jQuery);