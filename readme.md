# Flexy

Renamed from flex-grid because I liked flexy.

## What is it

An update to the initial Flexy grid structure - removing the lodash requirement as it really wasn't too useful. Swapped from the module system to the prototype pattern.

I built it using the <picture> element comprising a lot of the core boxes (with Scott Jehl's [picturefill](https://github.com/scottjehl/picturefill) to provide browser compat), but there are boxes that don't use an image and are just a plain ole' box as well

An example can be seen at [chrisdhanaraj.github.io/flexy](chrisdhanaraj.github.io/flexy).

## How to use

- Include flexy.js
- Include flexy.scss

## Structure

Each box has three different configurable data attributes.

- **data-col** - number of columns (width)
- **data-row** - number of rows (height)
- **data-priority** - priority level (if left out, defaults to 99)

data-priority is used when the number of columns is less than 4 (four being the max number of columns). The assumption is that when the grid rearranges for smaller screen sizes, its possible you would want different content higher up.

	<article class="flexy__box flexy__box--noimg flexy__box--js" data-col="1" data-row="1">
    	<div class="flexy__text-box flexy__text-box--grey">
        	<h2 class="flexy-header">Blog</h2>
        	<p>This is an example of a no image box</p>
     	</div>
    </article>

    <article class="flexy__box flexy__box--js" data-col="1" data-row="1">
      <div class="flexy__content">
        <picture>
          <source media="(min-width: 600px)" srcset="/images/flowers__desktop.jpg">
          <img src="/images/flowers__mobile.jpg" alt="Latest Indirect Tax Reports">
        </picture>
        <div class="flexy__caption-box">
          <p class="flexy__eyebrow">Android</p>
          <p class="flexy__caption">Research the <a href="#">latest Lollipop update</a></p>
        </div>
      </div>
    </article>

## Dependencies
jQuery (making IE8 compat easy)
