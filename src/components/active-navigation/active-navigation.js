'use strict';

import Observe from '@nycopportunity/pttrn-scripts/src/observe/observe';

class ActiveNavigation {
  /**
   * @constructor
   *
   * @return {Object}            The instantiated pattern
   */
  constructor() {
    /**
     * Method for toggling the jump navigation item, used by the click event
     * handler and the intersection observer event handler.
     *
     * @var NodeElement
     */
     const jumpClassToggle = item => {
      for (let i = 0; i < item.parentNode.children.length; i++) {
        const sibling = item.parentNode.children[i];

        if (sibling.classList.contains('no-underline'))
          sibling.classList.remove('no-underline', 'text-alt');
      }

      item.classList.add('no-underline', 'text-alt');
    };

    /**
     * Click event handler for jump navigation items
     *
     * @var NodeElement
     */
    (element => {
      if (element) {
        let activeNavigation = element.querySelectorAll('a[href]');

        for (let i = 0; i < activeNavigation.length; i++) {
          const a = activeNavigation[i];

          a.addEventListener('click', event => {
            setTimeout(() => {
              jumpClassToggle(event.target);
            }, 200);
          });
        }
      }
    })(document.querySelector('[data-js*="active-navigation"]'));

    /**
     * Intersection Observer event handler for jump navigation items
     *
     * @var NodeElementList
     */
    (elements => {
      elements.forEach(element => {
        new Observe({
          element: element,
          trigger: (entry) => {
            if (!entry.isIntersecting) return;

            let jumpItem = document.querySelector(`a[href="#${entry.target.id}"]`);

            if (!jumpItem) return;

            jumpItem.closest('[data-js*="active-navigation-scroll"]').scrollTo({
              left: jumpItem.offsetLeft,
              top: 0,
              behavior: 'smooth'
            });

            jumpClassToggle(jumpItem);
          }
        });
      });
    })(document.querySelectorAll(Observe.selector));
  }
}

/** @type  String  Main DOM selector */
ActiveNavigation.selector = '[data-js*=\"active-navigation\"]';

export default ActiveNavigation;
