/**
  * [
  *    {
  *      id: <string> | <number>
  *      title: <string>
  *      author: <string>
  *      year: <number>
  *      isComplete: <boolean>
  *    }
  * ]
  */

const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

// check the browser are support for local storage
function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser Anda tidak mendukung Local Storage');
        return false;
    };
    return true;
};

// create unique id
function generateId() {
    return +new Date();
};

// create object parameter
function generateObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
};

function reloadPage() {
    location.reload();
};

document.addEventListener('DOMContentLoaded', () => {
    // form input for all input about book's and save book item to the bookshelf
    const formInput = document.getElementById('form-input');
    formInput.addEventListener('submit', (e) => {
        e.preventDefault();

        // create validation form rule
        validateForm();
    });

    // form search to searching book title in the bookshelf
    const formSearch = document.getElementById('form-search');
    formSearch.addEventListener('submit', (e) => {
        e.preventDefault();

        // create validation form rule
        checkingField();

        // initialize search book function
        searchBook();
    });

    // set to default condition of checkbox
    const completeCheck = document.getElementById('complete-check');
    completeCheck.checked = false;

    // load data from local storage
    if (isStorageExist()) {
        loadDataFromStorage();
    };

    // display total length book item on the bookshelf
    displayTotalItem();

    for (const data of books) {
        console.log(data.title);
    };
});

// validate form is activated
function validateForm() {
    const bookTitleInput = document.getElementById('book-title-input');
    const bookAuthorInput = document.getElementById('book-author-input');
    const bookYearInput = document.getElementById('book-year-input');

    const warning = document.querySelector('.warning');

    if (bookTitleInput.value.trim() == '' && bookAuthorInput.value.trim() == '' && bookYearInput.value.trim() == '') {
        warning.style.display = 'block';
    } else {
        const titleError = bookTitleInput.nextElementSibling;
        const authorError = bookAuthorInput.nextElementSibling;
        const yearError = bookYearInput.nextElementSibling;

        warning.style.display = 'none';

        if (bookTitleInput.value.trim() !== '' && bookAuthorInput.value.trim() !== '' && bookYearInput.value.trim() !== '' && bookYearInput.value.trim().length === 4) {
            titleError.style.display = 'none';
            authorError.style.display = 'none';
            yearError.style.display = 'none';

            // if validation is successfull, going to add book function 
            addBook();
        } else {
            if (bookTitleInput.value.trim() == '') {
                titleError.style.display = 'inline';
                titleError.innerText = 'Judul buku tidak boleh kosong';
            } else {
                titleError.style.display = 'none';
            };

            if (bookAuthorInput.value.trim() == '') {
                authorError.style.display = 'inline';
                authorError.innerText = 'Nama penulis tidak boleh kosong';
            } else {
                authorError.style.display = 'none';
            };

            if (bookYearInput.value.trim() == '') {
                yearError.style.display = 'inline';
                yearError.innerText = 'Tahun buku tidak boleh kosong';
            } else if (bookYearInput.value.trim().length < 4) {
                yearError.style.display = 'inline';
                yearError.innerText = 'Format tahun harus terdiri dari empat angka';
            } else if (bookYearInput.value.trim().length > 4) {
                yearError.style.display = 'inline';
                yearError.innerText = 'Format tahun tidak boleh lebih dari empat angka';
            } else {
                yearError.style.display = 'none';
            };
        };
    };
};

// add book is executed
function addBook() {
    const bookTitleInput = document.getElementById('book-title-input').value.trim();
    const bookAuthorInput = document.getElementById('book-author-input').value.trim();
    const bookYearInput = document.getElementById('book-year-input').value.trim();

    const generatedID = generateId();
    const bookObject = generateObject(generatedID, bookTitleInput.toLowerCase(), bookAuthorInput.toLowerCase(), bookYearInput, false);

    const completeCheck = document.getElementById('complete-check');
    const isChecked = completeCheck.checked;
    if (isChecked) {
        bookObject.isComplete = true;
    };

    // check the same book title item and ignore duplication
    if (!books.some(book => book.title === bookTitleInput.toLowerCase())) {
        // save all input to books array
        books.push(bookObject);
        location.reload();

        // save all input to local storage
        saveData();
    } else {
        // show toast notification
        const toast = document.querySelector('.toast');
        toast.style.transform = 'translateY(0)';
        toast.innerHTML =
            `
            <i class="fa-regular fa-face-frown"></i> Judul buku "${bookTitleInput.toUpperCase()}" sudah ada didalam rak.
            `;

        setTimeout(() => {
            toast.style.transform = 'translateY(-100%)';
        }, 3000);
    };

    document.dispatchEvent(new Event(RENDER_EVENT));
};

// save data is executed
function saveData() {
    if (isStorageExist()) {
        // convert the javascript object to the string json, and store to local storage
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);

        document.dispatchEvent(new Event(SAVED_EVENT));
    };
};

// load data from storage is executed
function loadDataFromStorage() {
    // convert the string json from local storage to the javascript object
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const index of data) {
            books.push(index);
        };
    };

    document.dispatchEvent(new Event(RENDER_EVENT));
};

// create element to set display data input and others element needed
function displayBookList(bookObject) {
    const bookTitle = document.createElement('h4');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = 'penulis: ' + bookObject.author;

    const bookYear = document.createElement('p');
    bookObject.year = Number(bookObject.year);
    bookYear.innerText = 'tahun: ' + bookObject.year;

    const listWrapper = document.createElement('div');
    listWrapper.classList.add('list-wrapper');
    listWrapper.setAttribute('id', `bookID-${bookObject.id}`);

    // if checkbox input is unchecked, create this element to "belum selesai dibaca"
    if (bookObject.isComplete === false) {
        const buttonMoveToCompletedList = document.createElement('button');
        buttonMoveToCompletedList.innerText = 'selesai dibaca';

        buttonMoveToCompletedList.addEventListener('click', () => {
            moveToCompletedList(bookObject.id); // initialize button function "selesai dibaca"
        });

        const buttonRemoveFromUncompletedList = document.createElement('button');
        buttonRemoveFromUncompletedList.innerText = 'hapus buku';

        buttonRemoveFromUncompletedList.addEventListener('click', () => {
            removeFromUncompletedList(bookObject.id); // initialize button function "hapus buku"
        });

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');
        buttonGroup.append(buttonMoveToCompletedList, buttonRemoveFromUncompletedList);

        listWrapper.append(bookTitle, bookAuthor, bookYear, buttonGroup);
    } else { // if checkbox input is checked, create this element to "selesai dibaca"
        const buttonMoveToUncompletedList = document.createElement('button');
        buttonMoveToUncompletedList.innerText = 'belum selesai dibaca';

        buttonMoveToUncompletedList.addEventListener('click', () => {
            moveToUncompletedList(bookObject.id); // initialize button function "belum selesai dibaca"
        });

        const buttonRemoveFromCompletedList = document.createElement('button');
        buttonRemoveFromCompletedList.innerText = 'hapus buku';

        buttonRemoveFromCompletedList.addEventListener('click', () => {
            removeFromCompletedList(bookObject.id); // initialize button function "hapus buku"
        });

        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');
        buttonGroup.append(buttonMoveToUncompletedList, buttonRemoveFromCompletedList);

        listWrapper.append(bookTitle, bookAuthor, bookYear, buttonGroup);
    };

    return listWrapper;
};

// moving book item to bookshelf "selesai dibaca" is activated
function moveToCompletedList(bookId) {
    const bookTarget = findBookId(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;

    // save change and update data on local storage
    saveData();
    location.reload();

    document.dispatchEvent(new Event(RENDER_EVENT));
};

// moving book item to bookshelf "belum selesai dibaca" is activated
function moveToUncompletedList(bookId) {
    const bookTarget = findBookId(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;

    // save change and update data on local storage
    saveData();
    location.reload();

    document.dispatchEvent(new Event(RENDER_EVENT));
};

// find book id is activated
function findBookId(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        };
    };

    return null;
};

// delete book item on bookshelf "belum selesai dibaca" is activated
function removeFromUncompletedList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    location.reload();

    // save change and update data on local storage
    saveData();

    document.dispatchEvent(new Event(RENDER_EVENT));
};

// delete book item on bookshelf "selesai dibaca" is activated
function removeFromCompletedList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    location.reload();

    // save change and update data on local storage
    saveData();

    document.dispatchEvent(new Event(RENDER_EVENT));
};

// find book id is activated
function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        };
    };

    return -1;
};

// checking field on form search is activated
function checkingField() {
    const searchInput = document.getElementById('search-input');

    const searchError = searchInput.nextElementSibling;
    searchError.style.display = 'inline';

    if (searchInput.value.trim() == '') {
        searchError.innerText = 'Masukkan judul buku yang ingin dicari';
    } else {
        if (searchInput.value.trim() !== '') {
            searchError.style.display = 'none';
            searchBook();
        };
    };
};

// search book is activated
function searchBook() {
    const searchInput = document.getElementById('search-input').value.trim();
    const dataIndex = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(dataIndex);
    let results = false;

    const uncompletedBookList = document.getElementById('uncompleted-book-list');
    const iscompletedBookList = document.getElementById('iscompleted-book-list');

    uncompletedBookList.innerHTML = '';
    iscompletedBookList.innerHTML = '';

    // check data saved in local storage
    for (const bookItem of data) {
        // if data match, display on the page
        if (isSearchMatch(bookItem, searchInput)) {
            const listElement = displayBookList(bookItem);

            if (bookItem.isComplete === false) {
                uncompletedBookList.append(listElement);
            } else {
                iscompletedBookList.append(listElement);
            };

            results = true;
        };
    };

    // if no match result on search form, show toast notification
    if (!results) {
        const toast = document.querySelector('.toast');
        toast.style.transform = 'translateY(0)';

        setTimeout(() => {
            toast.style.transform = 'translateY(-100%)';
        }, 3000);
    };
};

// is search match is activated
function isSearchMatch(bookItem, searchInput) {
    const bookTitle = bookItem.title;
    return bookTitle.includes(searchInput.toLowerCase());
};

// display total item is activated
function displayTotalItem() {
    const uncompletedBookList = document.getElementById('uncompleted-book-list');
    const iscompletedBookList = document.getElementById('iscompleted-book-list');

    // get how length nodes element on the html collection
    const totalLengthUncompleted = uncompletedBookList.children.length;
    const totalLengthIscompleted = iscompletedBookList.children.length;

    const totalUncompleted = document.querySelector('.total-uncompleted');
    const totalIscompleted = document.querySelector('.total-iscompleted');

    // show total length book item on uncompleted book list
    if (totalLengthUncompleted === 0) {
        const notifText = document.createElement('p');
        notifText.classList.add('notif-text');
        notifText.innerText = 'tidak ada buku yang belum selesai dibaca.';

        uncompletedBookList.append(notifText);
    } else {
        totalUncompleted.innerText = totalLengthUncompleted;
    };

    // show total length book item on iscompleted book list
    if (totalLengthIscompleted === 0) {
        const notifText = document.createElement('p');
        notifText.classList.add('notif-text');
        notifText.innerText = 'tidak ada buku yang sudah selesai dibaca.';

        iscompletedBookList.append(notifText);
    } else {
        totalIscompleted.innerText = totalLengthIscompleted;
    };
};

// render all data input
document.addEventListener(RENDER_EVENT, () => {
    const uncompletedBookList = document.getElementById('uncompleted-book-list');
    const iscompletedBookList = document.getElementById('iscompleted-book-list');

    uncompletedBookList.innerHTML = '';
    iscompletedBookList.innerHTML = '';

    // check data saved in books array
    for (const bookItem of books) {
        const listElement = displayBookList(bookItem);

        if (bookItem.isComplete === false) {
            uncompletedBookList.append(listElement); // added to bookshelf "belum selesai dibaca"
        } else {
            iscompletedBookList.append(listElement); // added to bookshelf "selesai dibaca"
        };
    };
});