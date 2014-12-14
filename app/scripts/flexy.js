/* global _, Modernizr */
// add a file-level comment explaining what this file is about and simple
// sample code for how to use flexy

(function($) {
    'use strict';

    // this configuration is for four columns
    // on a 1200px grid
    var CONFIG = {
        container: '.flexy__container',
        width: 292.5,
        height: 300,
    };

    /**
     * flexy creates the 'grid.' It sets the height/width and positioning
     * of each box
     *
     *   @param element - div container of the grid elements
     *
     */
    function flexy(element) {
        var initLoadDone = false;
        var container = element.querySelector(CONFIG.container);
        var flexyGrid = [];
        var rowSize = getRowSize();
        var elOnPage = container.querySelectorAll('.flexy__box--js');  // this string should be a constant
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
         *  Checks the row size on window resize
         *  If changed, resets the internal grid 
         *  and starts the init function
         */
        function calculateLayout() {
            var newSize = getRowSize();
            if (newSize !== rowSize) {
                rowSize = newSize;
                internalGrid = createEmptyGrid(rowSize);
                flexyGrid = [];
                init();
            }
        }

        /**
         *  Initialization function - gets all the gridElments on the page,
         *  makes them into gridElements, pushes them into the flexy container,
         *  and sets the css.
         *  
         *  Also sorts the grid by priority if rowSize is below than 4
         */
        function init() {
            var priorityGrid = _.clone(elOnPage, true);

            if (rowSize < 4) {
                priorityGrid = _.sortBy(priorityGrid, function(el) {
                    return el.getAttribute('data-priority') === null ? 99 : el.getAttribute('data-priority');
                });
            }

            _.forEach(priorityGrid, function(item) {
                flexyGrid.push(addItem(gridElement(item)));
            });
            
            // CSS the items
            _.forEach(flexyGrid, function(item) {
                moveItem(item);
                if (!initLoadDone) {
                    $(item.el).addClass('flexy__transform-animation');
                }
            });

            var totalRowNum = _.max(flexyGrid, function(item) {
                return item.rowNum;
            }).rowNum;

            $(CONFIG.container).css('height', (totalRowNum + 1) * CONFIG.height);

            if (rowSize > 1) {
                $(CONFIG.container).css('width', rowSize * CONFIG.width);      
            } else {
                $(CONFIG.container).css('width', 'auto');
            }

            initLoadDone = true;
              
        }

        /**
         *  Sets internal grid to occupied (in x,y positions) and gives the 
         *  gridElement it's start row number and column number
         * 
         *  @param: gridElement
         *  @return: gridElement
         */
        function addItem(item) {
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

        /**
         *  Loops through the internal grid to find unoccupied spaces
         * 
         *  @param: gridElement
         *  @return: obj containing start row number and column number
         */
        function getPosition(item) {  
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
                for (var currentCol = 0; currentCol < currentRow.length; currentCol+=1) {
                    var sliced = currentRow.slice(currentCol, currentCol + width);
                    if ((currentCol + width) > currentRow.length) {
                        continue;
                    }

                    if (_.indexOf(sliced, 1) !== -1) {
                        // there's a 1 in there somewhere
                        continue;
                    }

                    if (verticalTest (matrix, currentRowNumber, currentCol)) {
                        col = currentCol;
                        return true;
                    }
                }
            });


            function verticalTest(matrix, currentRowNumber, currentCol) {
                for (var vertIndex = 0; vertIndex < height; vertIndex++) {
                    if (matrix[vertIndex + currentRowNumber][currentCol] !== 0) {
                        // no space vertically
                        return false;
                    }
                }

                return true;
            }

            return {
                colPos: col,
                rowNum: rowNum
            };
        }

        /**
         *  Adds the css to move the element to grid position
         *
         *  @param: gridElement
         */
        function moveItem(item) {

            var $el = $(item.el);
            var x = item.colPos * CONFIG.width;
            var y = item.rowNum * CONFIG.height;
            
            if (Modernizr.csstransforms) {
                if (!initLoadDone) {
                    $el.css('transform', 'translate(' + x + 'px, 1000px');
                    $el.css('display', 'block');
                    window.setTimeout( function() {
                        $el.css('transform', 'translate(' + x + 'px, ' + y + 'px');
                    }, 250);
                } else {
                    $el.css('transform', 'translate(' + x + 'px, ' + y + 'px');
                }
                
            } else {
                $el.css('left', x + 'px');
                $el.css('top', y + 'px');
            }

            console.log(!$el.hasClass('flexy__transform-animation'));
            
            
            $el.css('height', CONFIG.height * item.row);
            if (rowSize !== 1) {
                $el.css('width', CONFIG.width * item.col);
            } else {
                $el.css('width', '100%');
            }

        }

        /**
         *  Initializes a bunch of empty rows to be filled in
         *
         *  @param: rowSize, i.e. number of columns in a row
         *  @return: arr, two dimensional array of 0's
         */
        function createEmptyGrid(rsize) {
            
            var arr = [];
            for (var i = 0; i < 20; i++) {
                arr[i] = [];

                for (var j = 0; j < rsize; j++) {
                    arr[i][j] = 0;
                }
            }

            return arr;
        }

        /**
         *  Finds the number of columns that would fit in the parant div 
         *  
         *  @return: rowSize, i.e. number of columns in a row
         */
        function getRowSize() {
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

    /**
     *  Container for various properties for grid blocks
     *  
     *  @param: el, div blocks
     *  @return: 
     *    el: the div element
     *    col: data-col
     *    row: data-row
     */
    function gridElement(el) {
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