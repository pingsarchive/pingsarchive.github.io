/* ==========================================================
   PING'S ARCHIVE — MASONRY
   ----------------------------------------------------------
   Stable Pinterest-style packing.

   Handles:
   - homepage masonry
   - archive masonry
   - images / GIFs
   - video / MP4 loops
   - fonts
   - resizing
   - grid / index switching

   The grid stays hidden only during its FIRST measurement,
   then appears already packed.
========================================================== */


const observedCards = new WeakSet();
const observedMedia = new WeakSet();
const observedGrids = new WeakSet();

const preparingGrids = new WeakSet();
const revealedGrids = new WeakSet();

let masonryFrame = null;



/* ==========================================================
   FIND MASONRY GRIDS
========================================================== */

function getMasonryGrids() {

  return Array.from(
    document.querySelectorAll(
      ".home-masonry, .archive-results[data-view='grid']"
    )
  );

}



/* ==========================================================
   SIZE ONE CARD
========================================================== */

function resizeMasonryItem(item, grid) {

  /*
    Clear the previous row span before measuring.
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
   NORMAL RECALCULATION
========================================================== */

function updateMasonryNow() {

  masonryFrame = null;


  getMasonryGrids().forEach(
    (grid) => {

      resizeMasonryGrid(grid);

    }
  );

}



function scheduleMasonry() {

  if (masonryFrame !== null) {

    cancelAnimationFrame(
      masonryFrame
    );

  }


  masonryFrame =
    requestAnimationFrame(
      () => {

        masonryFrame =
          requestAnimationFrame(
            updateMasonryNow
          );

      }
    );

}



/* ==========================================================
   WAIT FOR MEDIA
========================================================== */

function waitForImage(image) {

  return new Promise((resolve) => {


    const finish = () => {

      /*
        decode() waits for the browser to actually
        have the image ready to paint.
      */

      if (
        typeof image.decode === "function"
      ) {

        image.decode()
          .catch(() => {})
          .finally(resolve);

      } else {

        resolve();

      }

    };


    if (image.complete) {

      finish();
      return;

    }


    image.addEventListener(
      "load",
      finish,
      { once: true }
    );


    image.addEventListener(
      "error",
      resolve,
      { once: true }
    );

  });

}



function waitForVideo(video) {

  return new Promise((resolve) => {


    /*
      Metadata is enough for the browser to know
      the video's intrinsic dimensions.
    */

    if (video.readyState >= 1) {

      resolve();
      return;

    }


    video.addEventListener(
      "loadedmetadata",
      resolve,
      { once: true }
    );


    video.addEventListener(
      "error",
      resolve,
      { once: true }
    );

  });

}



function waitForGridMedia(grid) {

  const media =
    Array.from(
      grid.querySelectorAll(
        "img, video"
      )
    );


  return Promise.all(

    media.map((item) => {

      if (
        item instanceof HTMLImageElement
      ) {

        return waitForImage(item);

      }


      if (
        item instanceof HTMLVideoElement
      ) {

        return waitForVideo(item);

      }


      return Promise.resolve();

    })

  );

}



/* ==========================================================
   FIRST REVEAL

   This is the twitch reduction.

   On first page load:
   1. wait for intrinsic media sizes
   2. wait for fonts
   3. calculate masonry
   4. allow one browser layout frame
   5. calculate once more
   6. reveal
========================================================== */

async function prepareGrid(grid) {

  if (
    revealedGrids.has(grid) ||
    preparingGrids.has(grid)
  ) {

    return;

  }


  preparingGrids.add(grid);


  const fontsReady =
    document.fonts?.ready ||
    Promise.resolve();


  await Promise.all([

    waitForGridMedia(grid),

    fontsReady,

  ]);


  /*
    First measurement.
  */

  resizeMasonryGrid(grid);


  /*
    Let the browser commit that geometry.
  */

  requestAnimationFrame(
    () => {

      /*
        Final measurement before anything
        becomes visible.
      */

      resizeMasonryGrid(grid);


      requestAnimationFrame(
        () => {

          grid.classList.add(
            "masonry-ready"
          );


          revealedGrids.add(grid);

        }
      );

    }
  );

}



/* ==========================================================
   MEDIA OBSERVATION AFTER INITIAL LOAD
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


  if (
    media instanceof HTMLImageElement
  ) {

    media.addEventListener(
      "load",
      refresh
    );


    media.addEventListener(
      "error",
      refresh
    );


    return;

  }


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


    return;

  }


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
   CARD RESIZE OBSERVER
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

      subtree: false,
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
    (grid) => {

      observeGrid(grid);

      prepareGrid(grid);

    }
  );


  /*
    Also observe media that might sit inside
    the masonry but outside an observed card.
  */

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


  /*
    Later passes handle anything dynamic,
    but by this point the grid is already
    correctly revealed.
  */

  setTimeout(
    scheduleMasonry,
    150
  );


  setTimeout(
    scheduleMasonry,
    500
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


document.addEventListener(
  "astro:page-load",
  initializeMasonry
);


document.addEventListener(
  "astro:after-swap",
  initializeMasonry
);



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