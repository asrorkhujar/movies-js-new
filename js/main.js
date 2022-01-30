// GLOBAL VARS
const genres = [];
const watchList = JSON.parse(localStorage.getItem('watchlist')) || [];

let foundMovies = movies.slice(0, 100);
const elResult = document.querySelector('.movies__result');
elResult.textContent = movies.length;

// SEARCH FORM
const elMovieSearchForm = document.querySelector('.js-movie-search-form');
const elMovieSearchInput = elMovieSearchForm.querySelector('.js-movie-search-input');
const elGenresSelect = elMovieSearchForm.querySelector('select');
const elMinYearInput = elMovieSearchForm.querySelector('.js-start-year-input');
const elMaxYearInput = elMovieSearchForm.querySelector('.js-end-year-input');
const elSortSelect = elMovieSearchForm.querySelector('.js-sort-select');

// RESULT
const elMoviesList = document.querySelector('.movies__list');

// TEMPLATE
const elMoviesItemTemplate = document.querySelector('#movies-item-template').content;

// MODAL
const elMovieInfoModal = document.querySelector('.movie-info-modal');
const elMovieInfoModalTitle = elMovieInfoModal.querySelector('.movie-info-modal__title');
const elMovieInfoModalRating = elMovieInfoModal.querySelector('.movie-info-modal__rating');
const elMovieInfoModalYear = elMovieInfoModal.querySelector('.movie-info-modal__year');
const elMovieInfoModalDuration = elMovieInfoModal.querySelector('.movie-info-modal__duration');
const elMovieInfoModalIFrame = elMovieInfoModal.querySelector('.movie-info-modal__iframe');
const elMovieInfoModalCategories = elMovieInfoModal.querySelector('.movie-info-modal__categories');
const elMovieInfoModalSummary = elMovieInfoModal.querySelector('.movie-info-modal__summary');
const elMovieInfoModalImdbLink = elMovieInfoModal.querySelector('.movie-info-modal__imdb-link');
const elMovieInfoModalBookmarkButton = elMovieInfoModal.querySelector('.js-bookmark-button');

//WATCHLIST-MODAL-LIST
const elWatchListModal = document.querySelector('.watchlist-modal');
const elWatchListALL = elWatchListModal.querySelector('.watchlist-modal__list');
const watchListFragment = document.createDocumentFragment();

function showWatchlist() {
  elWatchListALL.innerHTML = '';

  for (let watchItem of watchList) {
    let newBookmark = `<li class="bookmark watchlist-modal__item list-group-item d-flex align-items-center justify-content-between" data-unique-id="${watchItem.imdbId}">
    <h3 class="bookmark__title h5">${watchItem.title} (${watchItem.year})</h3>
    <button class="bookmark__remove btn btn-danger btn-sm text-white" type="button" title="Remove from watchlist" data-unique-id="${watchItem.title}">&#10006;</button>
    </li>`;
    elWatchListALL.insertAdjacentHTML('beforeend', newBookmark)
  }
}

elWatchListModal.addEventListener('show.bs.modal', showWatchlist);

elWatchListModal.addEventListener('click', (evt) => {
  if (evt.target.matches('.bookmark__remove')) {
    const bookmarkIndex = watchList.findIndex(bookmark => bookmark.imdbId === evt.target.dataset.uniqueId);
    const removedBookmark = watchList.splice(bookmarkIndex, 1)[0];

    const elBookmark = elMoviesList.querySelector(`.js-bookmark-button[data-imdb-id="${removedBookmark.imdbId}"]`);
    elBookmark.classList.remove('btn-secondary');
    elBookmark.classList.add('btn-outline-secondary');
    elBookmark.textContent = 'Bookmark';

    localStorage.setItem('watchlist', JSON.stringify(watchList));
    showWatchlist();
  }
})

// FUNCTIONS
function getUniqueGenres() {
  movies.forEach(movie => {
    movie.categories.forEach(category => {
      if (!genres.includes(category)) {
        genres.push(category);
      }
    });
  });
  genres.sort();
}

function showGenreOptions() {
  const elGenresFragment = document.createDocumentFragment();
  genres.forEach(genre => {
    const elGenreOption = document.createElement('option');
    elGenreOption.textContent = genre;
    elGenreOption.value = genre;
    elGenresFragment.appendChild(elGenreOption);
  });
  elGenresSelect.appendChild(elGenresFragment);
}

function getHoursStringFromMinutes(minutes) {
  return `${Math.floor(minutes / 60)} hrs ${minutes % 60} mins`;
}

function showMovies(movies, titleRegex = '') {
  elMoviesList.innerHTML = '';
  const elMoviesFragment = document.createDocumentFragment();

  for (let movie of movies) {
    const elNewMoviesItem = elMoviesItemTemplate.cloneNode(true);
    elNewMoviesItem.querySelector('.movie__img').src = movie.smallThumbnail;
    elNewMoviesItem.querySelector('.movie__img').alt = `${movie.title} poster`;

    if (titleRegex.source !== '(?:)' && titleRegex) {
      elNewMoviesItem.querySelector('.movie__title').innerHTML = movie.title.replace(titleRegex, `<mark class="p-0" style="background-color: yellow;">${titleRegex.source}</mark>`);
    } else {
      elNewMoviesItem.querySelector('.movie__title').textContent = movie.title;
    }

    elNewMoviesItem.querySelector('.movie__rating').textContent = movie.imdbRating;
    elNewMoviesItem.querySelector('.movie__year').textContent = movie.year;
    elNewMoviesItem.querySelector('.movie__duration').textContent = getHoursStringFromMinutes(movie.runtime);
    elNewMoviesItem.querySelector('.movie__categories').textContent = `Categories: ${movie.categories.join(', ')}`;
    elNewMoviesItem.querySelector('.js-more-info-button').dataset.imdbId = movie.imdbId;
    const elBookmarkBtn = elNewMoviesItem.querySelector('.js-bookmark-button');
    elBookmarkBtn.dataset.imdbId = movie.imdbId;
    const indexMovieInWatchList = watchList.findIndex(movie => movie.imdbId === elBookmarkBtn.dataset.imdbId);

    if (indexMovieInWatchList > -1) {
      elBookmarkBtn.classList.add('btn-secondary');
      elBookmarkBtn.classList.remove('btn-outline-secondary');
      elBookmarkBtn.textContent = 'Bookmarked ✔';
    } else {
      elBookmarkBtn.classList.remove('btn-secondary');
      elBookmarkBtn.classList.add('btn-outline-secondary');
      elBookmarkBtn.textContent = 'Bookmark';
    }

    elMoviesFragment.appendChild(elNewMoviesItem);
  }

  elMoviesList.appendChild(elMoviesFragment);
}

function updateMovieInfoModal(imdbId) {
  const movie = movies.find(movie => movie.imdbId === imdbId);

  elMovieInfoModal.dataset.uniqueId = imdbId;
  elMovieInfoModalTitle.textContent = movie.title;
  elMovieInfoModalRating.textContent = movie.imdbRating;
  elMovieInfoModalYear.textContent = movie.year;
  elMovieInfoModalDuration.textContent = getHoursStringFromMinutes(movie.runtime);
  elMovieInfoModalIFrame.src = `https://www.youtube-nocookie.com/embed/${movie.youtubeId}`;
  elMovieInfoModalCategories.textContent = movie.categories.join(', ');
  elMovieInfoModalSummary.textContent = movie.summary;
  elMovieInfoModalImdbLink.href = `https://www.imdb.com/title/${movie.imdbId}`;
  elMovieInfoModalBookmarkButton.dataset.imdbId = movie.imdbId;

  const indexMovieInWatchList = watchList.findIndex(movie => movie.imdbId === imdbId);

  if (indexMovieInWatchList > -1) {
    elMovieInfoModalBookmarkButton.classList.add('btn-success');
    elMovieInfoModalBookmarkButton.classList.remove('btn-outline-success');
    elMovieInfoModalBookmarkButton.textContent = 'Bookmarked ✅';
  } else {
    elMovieInfoModalBookmarkButton.classList.remove('btn-success');
    elMovieInfoModalBookmarkButton.classList.add('btn-outline-success');
    elMovieInfoModalBookmarkButton.textContent = 'Bookmark';
  }
}

function findMovies(titleRegex) {
  return movies.filter(movie => {
    const meetsCriteria = movie.title.match(titleRegex) && (elGenresSelect.value === 'All' || movie.categories.includes(elGenresSelect.value)) && (elMinYearInput.value.trim() === '' || movie.year >= Number(elMinYearInput.value)) && (elMaxYearInput.value.trim() === '' || movie.year <= Number(elMaxYearInput.value));
    return meetsCriteria;
  });
}

function sortMovies(movies, sortType) {
  if (sortType === 'az') {
    movies.sort((a, b) => {
      if (a.title > b.title) return 1;
      if (a.title < b.title) return -1;
      return 0;
    });
  } else if (sortType === 'za') {
    movies.sort((a, b) => {
      if (a.title < b.title) return 1;
      if (a.title > b.title) return -1;
      return 0;
    });
  } else if (sortType === 'rating_asc') {
    movies.sort((a, b) => a.imdbRating - b.imdbRating);
  } else if (sortType === 'rating_desc') {
    movies.sort((a, b) => b.imdbRating - a.imdbRating);
  } else if (sortType === 'year_asc') {
    movies.sort((a, b) => a.year - b.year);
  } else if (sortType === 'year_desc') {
    movies.sort((a, b) => b.year - a.year);
  }
}

function onMovieSearchFormSubmit(evt) {
  evt.preventDefault();

  const titleRegex = new RegExp(elMovieSearchInput.value.trim(), 'gi');
  foundMovies = findMovies(titleRegex);

  if (foundMovies.length > 0) {
    sortMovies(foundMovies, elSortSelect.value);
    showMovies(foundMovies, titleRegex);

    let moviesToShow = foundMovies.slice(0, PER_PAGE_COUNT);

    showMovies(moviesToShow, titleRegex);
  } else {
    elMoviesList.innerHTML = '<div class="col-12">No film found</div>';
  }
}

function onMoviesListInfoButtonClick(evt) {
  if (evt.target.matches('.js-more-info-button')) {
    updateMovieInfoModal(evt.target.dataset.imdbId);
    return;
  }

  if (evt.target.matches('.js-bookmark-button')) {
    const elBookmarkBtn = evt.target;
    const movie = movies.find(movie => movie.imdbId === elBookmarkBtn.dataset.imdbId);
    const indexMovieInWatchList = watchList.findIndex(movie => movie.imdbId === elBookmarkBtn.dataset.imdbId);

    if (indexMovieInWatchList === -1) {
      watchList.push(movie);
      elBookmarkBtn.classList.add('btn-secondary');
      elBookmarkBtn.classList.remove('btn-outline-secondary');
      elBookmarkBtn.textContent = 'Bookmarked ✔';
    } else {
      watchList.splice(indexMovieInWatchList, 1);
      elBookmarkBtn.classList.remove('btn-secondary');
      elBookmarkBtn.classList.add('btn-outline-secondary');
      elBookmarkBtn.textContent = 'Bookmark';
    }

    localStorage.setItem('watchlist', JSON.stringify(watchList));
  }
}

// MODAL-BOOKMARK-BUTTON
function onModalInfoButtonClick(evt) {
  if (evt.target.matches('.js-bookmark-button')) {
    const elBookmarkBtn = evt.target;
    const movie = movies.find(movie => movie.imdbId === elBookmarkBtn.dataset.imdbId);
    const indexMovieInWatchList = watchList.findIndex(movie => movie.imdbId === elBookmarkBtn.dataset.imdbId);

    if (indexMovieInWatchList === -1) {
      watchList.push(movie);
      elBookmarkBtn.classList.add('btn-success');
      elBookmarkBtn.classList.remove('btn-outline-success');
      elBookmarkBtn.textContent = 'Bookmarked ✅';
    } else {
      watchList.splice(indexMovieInWatchList, 1);
      elBookmarkBtn.classList.remove('btn-success');
      elBookmarkBtn.classList.add('btn-outline-success');
      elBookmarkBtn.textContent = 'Bookmark';
    }

    localStorage.setItem('watchlist', JSON.stringify(watchList));
  }
}

function onMovieInfoModalHidden() {
  elMovieInfoModalIFrame.src = '';

  const elBookmarkBtn = elMoviesList.querySelector(`.js-bookmark-button[data-imdb-id="${elMovieInfoModal.dataset.uniqueId}"]`);
  const indexMovieInWatchList = watchList.findIndex(movie => movie.imdbId === elBookmarkBtn.dataset.imdbId);

  if (indexMovieInWatchList > -1) {
    elBookmarkBtn.classList.add('btn-secondary');
    elBookmarkBtn.classList.remove('btn-outline-secondary');
    elBookmarkBtn.textContent = 'Bookmarked ✔';
  } else {
    elBookmarkBtn.classList.remove('btn-secondary');
    elBookmarkBtn.classList.add('btn-outline-secondary');
    elBookmarkBtn.textContent = 'Bookmark';
  }
}

// EVENT LISTENERS
if (elMoviesList) {
  elMoviesList.addEventListener('click', onMoviesListInfoButtonClick);
}

if (elMovieInfoModal) {
  elMovieInfoModal.addEventListener('click', onModalInfoButtonClick);
}

// Stop iframe video playback on modal hide
if (elMovieInfoModal) {
  elMovieInfoModal.addEventListener('hidden.bs.modal', onMovieInfoModalHidden);
}

if (elMovieSearchForm) {
  elMovieSearchForm.addEventListener('submit', onMovieSearchFormSubmit);
}

// INITIATION
getUniqueGenres();
showGenreOptions();
showMovies(foundMovies, '');