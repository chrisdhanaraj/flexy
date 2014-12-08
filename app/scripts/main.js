/* global _ */

(function($) {
    // test everything

    'use strict';

    // this configuration is for four columns
    // on a 1200px grid
    var config = {
        width: 300,
        height: 270,
    };

    function flexy(element) {
        // element == the grid selector, used to collect gridElements
        var flexyGrid = [];
        var rowSize = getRowSize();
        var elOnPage = element.querySelectorAll('.flexy__box--js');
        var internalGrid = initGrid(rowSize);

        init();

        var resize = _.debounce(calculateLayout, 150);
        $(window).on('resize', resize);

        // logging purposes only I suppose
        // all the functions are used internally

        return flexyGrid;

        // ----------------
        // Functions
        // ----------------


        function calculateLayout() {
            // if row size is different, redo the grid
            var newSize = getRowSize();
            if (newSize !== rowSize) {
                rowSize = newSize;
                console.log(rowSize);
                internalGrid = initGrid(rowSize);
                flexyGrid = [];
                init();
            }
        }

        function init() {
            // grab the the internal boxes
            // make them into a gridElement
            // add them to the gridArray container
            _.forEach(elOnPage, function(item) {
                flexyGrid.push(addItem(gridElement(item)));
            });

            // CSS the items
            _.forEach(flexyGrid, function(item) {
                moveItem(item);
            });
        }

        function addItem(item) {
            // take item, compare to internal grid
            // fill up the internal grid to mark used spaces

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

                    if (_.findIndex(currentRow.slice(currentCol, width), 1) !== -1) {
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
            var $el = $(item.el);
            var x = item.colPos * config.width;
            var y = item.rowNum * config.height;

            $el.css('transform', 'translate(' + x + 'px, ' + y + 'px');
            $el.css('height', config.height * item.row);
            if (rowSize !== 1) {
                $el.css('width', config.width * item.col);
            } else {
                $el.css('width', '100%');
            }

        }

        function initGrid(rsize) {
            // create a bunch of rows based on rsize
            // the intent is to never really hit this max size
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
            var rowSize = Math.floor(element.offsetWidth / (config.width));
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
        // define amount of space and priority
        // return gridelements and properties

        // check if it's a picture one
        var $el = $(el);
        var col = $el.data('col');
        var row = $el.data('row');
        var priority = $el.data('priority');

        return {
            el: el,
            col: col,
            row: row,
            priority: priority
        };
    }

    var gridsOnPage = document.querySelectorAll('.flexy');

    _.forEach(gridsOnPage, function(item) {
        item = flexy(item);
    });


})(jQuery);
