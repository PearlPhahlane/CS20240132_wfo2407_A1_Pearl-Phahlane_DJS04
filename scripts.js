import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'
import './bookPreviewComponent.js';

// object storing the imported data
const bookData = {
  books,
  authors,
  genres,
  BOOKS_PER_PAGE,
}

//Functions
//This function is to be able to Preview the book
const bookPreview = { 
  create: function(book) {
    // Create an instance of the custom web component
    const previewComponent = document.createElement("book-preview-component");

    // Set attributes for the book preview component
    previewComponent.setAttribute("data-preview", book.id);
    previewComponent.setAttribute("data-image", book.image);
    previewComponent.setAttribute("data-title", book.title);
    previewComponent.setAttribute("data-author", bookData.authors[book.author]);

    return previewComponent;
  },

// add these new elements to the end of the HTML element's child list
  append: function(starting, newItems, fragment, books) {
    for(const book of books.slice(0, BOOKS_PER_PAGE)) {
      starting.appendChild(bookPreview.create(book));
      newItems.appendChild(bookPreview.create(book));
      fragment.appendChild(bookPreview.create(book));
    }
    //this is where the new added eements will be located in the DOM
    document.querySelector("[data-list-items]").appendChild(newItems);
    document.querySelector("[data-list-items]").appendChild(fragment);
  },
};
//function within searchDropdown object with method create 
  const searchDropdown = { create: function(data, placeholder, elementSelector){
    const genreAndAuthor = document.createDocumentFragment();
    const firstOption = document.createElement("option");
    firstOption.value = "any";
    firstOption.innerText = placeholder;
    genreAndAuthor.appendChild(firstOption);

    for(const [id, name] of Object.entries(data)) {
      const option = document.createElement("option");
      option.value = id;
      option.innerText = name;
      genreAndAuthor.appendChild(option);
    }
    //where it will be added in HTML using CSS selector string elementSelector
    document.querySelector(elementSelector).appendChild(genreAndAuthor);

  },
};


//bookSearh object with function to search for books and returning the results using filter method 
const bookSearch = {
  filter: function(books, filters) {
    const result = [];
    const seen = new Set(); // Track unique books by title and author combination

    for (const book of books) {
      let genreMatch = filters.genre === "any"; // Allow any genre

      // Check if the book's genres include the selected genre
      for (const singleGenre of book.genres) {
        if (singleGenre === filters.genre) {
          genreMatch = true; // Found a matching genre
          break; // No need to check further genres
        }
      }

      // Create a unique key based on title and author
      const uniqueKey = `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;

      // Check for title and author conditions
      if (
        (filters.title.trim() === "" ||
          book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.author === "any" || book.author === filters.author) &&
        genreMatch &&
        !seen.has(uniqueKey) // Ensure this book hasn't been added yet
      ) {
        seen.add(uniqueKey); // Mark this book as seen
        result.push(book); // Add to results if it's not a duplicate
      }
    }

    return result;
  },

  updateUI: function(matches, page) {
    const listItems = document.querySelector("[data-list-items]");
    listItems.innerHTML = ""; // Clear previous results to avoid duplicates

    const newItems = document.createDocumentFragment(); // Use a fragment for performance
    for (const book of matches.slice(
      (page - 1) * bookData.BOOKS_PER_PAGE,
      page * bookData.BOOKS_PER_PAGE
    )) {
      const bookElement = bookPreview.create(book);
      newItems.appendChild(bookElement); // Append each book to the fragment
    }

    listItems.appendChild(newItems); // Add all new items at once

    // Check if there are results to display
    if (matches.length < 1) {
      document
        .querySelector("[data-list-message]")
        .classList.add("list__message_show");
    } else {
      document
        .querySelector("[data-list-message]")
        .classList.remove("list__message_show");
    }

    // Update show more button
    document.querySelector("[data-list-button]").disabled =
      matches.length - page * bookData.BOOKS_PER_PAGE < 1;
    document.querySelector("[data-list-button]").innerHTML = `
     Show more (${matches.length - page * bookData.BOOKS_PER_PAGE > 0 ? matches.length - page * bookData.BOOKS_PER_PAGE : 0})
   `;

    window.scrollTo({ top: 0, behavior: "smooth" });
  },
};

//Initialize
let page = 1;
let matches = bookData.books;

//Initial book preview
//call append method of bookPreview 
bookPreview.append (
  document.createDocumentFragment(),
  document.createDocumentFragment(),
  document.createDocumentFragment(),
  matches
);


//Show more button will be disabled before search and will show remaining books 
const listButton = document.querySelector("[data-list-button]");
const remainingBooks = matches.length - page * bookData.BOOKS_PER_PAGE;
listButton.disabled = remainingBooks > 0;
listButton.innerText = `Show more (${remainingBooks > 0 ? remainingBooks : 0})`;

// Initialize search dropdowns
searchDropdown.create(bookData.genres, "All Genres", "[data-search-genres]");
searchDropdown.create(bookData.authors, "All Authors", "[data-search-authors]");

//Event Listners

document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
})

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
})

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
})

document.querySelector("[data-settings-form]").addEventListener("submit", (event) => {
   event.preventDefault();
   const { theme } = Object.fromEntries(new FormData(event.target));

   document.documentElement.style.setProperty("--color-dark", theme === "night" ? "255, 255, 255" : "10, 10, 20");
   document.documentElement.style.setProperty( "--color-light", theme === "night" ? "10, 10, 20" : "255, 255, 255");

   document.querySelector("[data-settings-overlay]").open = false;
 });


document.querySelector("[data-search-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);

    // Filter books based on user input
    const result = bookSearch.filter(bookData.books, filters);
    page = 1; // Reset the page to the first page of results
    matches = result; // Update matches to the filtered result
    bookSearch.updateUI(matches, page); // Update the UI with the new matches

    // Close the search overlay
    document.querySelector("[data-search-overlay]").open = false;
  });

document.querySelector("[data-list-button]").addEventListener("click", () => {
  page += 1;
  bookSearch.updateUI(matches, page);
});


document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook;
            } 
        
            active = result;
        }
    }
    
    if (active) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = active.image;
        document.querySelector('[data-list-image]').src = active.image;
        document.querySelector('[data-list-title]').innerText = active.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = active.description;
    }
});