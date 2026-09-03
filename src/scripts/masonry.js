/* ==========================================================
   PING'S ARCHIVE — MASONRY
   ----------------------------------------------------------
   Handles:
   - homepage masonry
   - archive grid masonry
   - images
   - GIFs
   - video / loop media
   - responsive resizing
   - grid/index switching
   - Astro page swaps if enabled later
========================================================== */


const observedCards = new WeakSet();
const observedMedia = new WeakSet();
const observedGrids = new WeakSet();

let masonryFrame = null;



/* ==========================================================
   FIND ACTIVE MASONRY GRIDS
========================================================== */

function getMasonryGrids() {

  return Array.from(
    document.querySelectorAll(
      ".home-masonry, .archive-results[data-view='grid']"
    )
  );

}



/* ==========================================================
   SIZE ONE ITEM
========================================================== */

function resizeMasonryItem(item, grid) {

  /*
    Reset before measuring so an old span
    never contaminates the new measurement.
  */
  item.style.gridRowEnd = "auto";


  const styles =
    window.getComputedStyle(grid);


  const rowHeight =
    parseFloat(
      styles.getPropertyValue(
        "grid-auto-rows"
      )
    );


  const rowGap =
    parseFloat(
      styles.getPropertyValue(
        "row-gap"
      )
    ) || 0;


  if (
    !Number.isFinite(rowHeight) ||
    rowHeight <= 0
  ) {
    return;
  }


  const height =
    item.getBoundingClientRect().height;


  if (
    !Number.isFinite(height) ||
    height <= 0
  ) {
    return;
  }


  const span =
    Math.ceil(
      (height + rowGap) /
      (rowHeight + rowGap)
    );


  item.style.gridRowEnd =
    `span ${Math.max(span, 1)}`;

}



/* ==========================================================
   SIZE ONE GRID
========================================================== */

function resizeMasonryGrid(grid) {

  if (
    !grid ||
    grid.dataset.view === "index"
  ) {
    return;
  }


  const items =
    grid.querySelectorAll(
      ".masonry-card, .archive-entry"
    );


  items.forEach((item) => {

    resizeMasonryItem(
      item,
      grid
    );

  });

}



/* ==========================================================
   UPDATE EVERYTHING
========================================================== */

function updateMasonryNow() {

  masonryFrame = null;


  const grids =
    getMasonryGrids();


  grids.forEach((grid) => {

    resizeMasonryGrid(grid);

    /*
      Do not reveal the masonry until its
      first correct layout has been calculated.
    */
    grid.classList.add(
      "masonry-ready"
    );

  });

}



/*
  Schedule instead of recalculating repeatedly
  in the same browser frame.
*/

function scheduleMasonry() {

  if (masonryFrame !== null) {
    cancelAnimationFrame(
      masonryFrame
    );
  }


  masonryFrame =
    requestAnimationFrame(
      () => {

        /*
          Two frames gives the browser time to
          complete layout before measuring.
        */

        masonryFrame =
          requestAnimationFrame(
            updateMasonryNow
          );

      }
    );

}



/* ==========================================================
   MEDIA
========================================================== */

function observeMedia(media) {

  if (
    observedMedia.has(media)
  ) {
    return;
  }


  observedMedia.add(media);


  const refresh = () => {

    scheduleMasonry();

  };


  /*
    IMAGES / GIFS
  */

  if (
    media instanceof HTMLImageElement
  ) {

    if (!media.complete) {

      media.addEventListener(
        "load",
        refresh,
        { once: true }
      );

      media.addEventListener(
        "error",
        refresh,
        { once: true }
      );

    }

    return;

  }


  /*
    VIDEO / MP4 LOOPS
  */

  if (
    media instanceof HTMLVideoElement
  ) {

    media.addEventListener(
      "loadedmetadata",
      refresh
    );

    media.addEventListener(
      "loadeddata",
      refresh
    );

    media.addEventListener(
      "canplay",
      refresh
    );

    return;

  }


  /*
    AUDIO can alter detail-page geometry,
    though it normally isn't inside masonry.
  */

  if (
    media instanceof HTMLAudioElement
  ) {

    media.addEventListener(
      "loadedmetadata",
      refresh
    );

  }

}



/* ==========================================================
   RESIZE OBSERVER
========================================================== */

const cardResizeObserver =
  typeof ResizeObserver !== "undefined"
    ? new ResizeObserver(
        () => {

          scheduleMasonry();

        }
      )
    : null;



function observeCard(card) {

  if (
    observedCards.has(card)
  ) {
    return;
  }


  observedCards.add(card);


  cardResizeObserver?.observe(
    card
  );


  card
    .querySelectorAll(
      "img, video, audio"
    )
    .forEach(
      observeMedia
    );

}



/* ==========================================================
   GRID OBSERVER

   Watches the archive switching between
   grid and index views.
========================================================== */

const gridMutationObserver =
  typeof MutationObserver !== "undefined"
    ? new MutationObserver(
        () => {

          scheduleMasonry();

        }
      )
    : null;



function observeGrid(grid) {

  if (
    observedGrids.has(grid)
  ) {
    return;
  }


  observedGrids.add(grid);


  gridMutationObserver?.observe(
    grid,
    {
      attributes: true,
      attributeFilter: [
        "data-view",
        "class"
      ],
      childList: true,
      subtree: false
    }
  );


  grid
    .querySelectorAll(
      ".masonry-card, .archive-entry"
    )
    .forEach(
      observeCard
    );

}



/* ==========================================================
   INITIALIZE
========================================================== */

function initializeMasonry() {

  const grids =
    getMasonryGrids();


  grids.forEach(
    observeGrid
  );


  document
    .querySelectorAll(
      ".home-masonry img, " +
      ".home-masonry video, " +
      ".archive-results img, " +
      ".archive-results video"
    )
    .forEach(
      observeMedia
    );


  scheduleMasonry();


  /*
    A second delayed pass catches layout changes
    caused by fonts / media / browser rendering.
  */

  setTimeout(
    scheduleMasonry,
    80
  );


  setTimeout(
    scheduleMasonry,
    250
  );

}



/* ==========================================================
   EVENTS
========================================================== */

window.addEventListener(
  "load",
  initializeMasonry
);


window.addEventListener(
  "resize",
  scheduleMasonry
);


window.addEventListener(
  "pageshow",
  initializeMasonry
);


/*
  These do nothing harmful during normal navigation,
  but prepare masonry for Astro ClientRouter later.
*/

document.addEventListener(
  "astro:page-load",
  initializeMasonry
);


document.addEventListener(
  "astro:after-swap",
  initializeMasonry
);



/* ==========================================================
   FONT LOADING
========================================================== */

if (
  document.fonts &&
  document.fonts.ready
) {

  document.fonts.ready.then(
    scheduleMasonry
  );

}



/* ==========================================================
   INITIAL PASS
========================================================== */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeMasonry
  );

} else {

  initializeMasonry();

}