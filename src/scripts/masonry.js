function resizeMasonryItem(item, grid) {

  const styles =
    window.getComputedStyle(grid);

  const rowHeight =
    parseInt(
      styles.getPropertyValue("grid-auto-rows")
    );

  const rowGap =
    parseInt(
      styles.getPropertyValue("row-gap")
    ) || 0;


  const height =
    item.getBoundingClientRect().height;


  const span =
    Math.ceil(
      (height + rowGap) /
      (rowHeight + rowGap)
    );


  item.style.gridRowEnd =
    `span ${span}`;

}



function resizeMasonryGrid(grid) {

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



function updateMasonry() {

  const grids =
    document.querySelectorAll(
      ".home-masonry, .archive-results[data-view='grid']"
    );


  grids.forEach((grid) => {

    resizeMasonryGrid(grid);

  });

}



function waitForImages() {

  const images =
    document.querySelectorAll(
      ".home-masonry img, .archive-results img"
    );


  images.forEach((image) => {

    if (image.complete) {
      return;
    }


    image.addEventListener(
      "load",
      updateMasonry
    );

  });

}



window.addEventListener(
  "load",
  () => {

    waitForImages();

    updateMasonry();

  }
);


window.addEventListener(
  "resize",
  updateMasonry
);


document.addEventListener(
  "astro:page-load",
  updateMasonry
);