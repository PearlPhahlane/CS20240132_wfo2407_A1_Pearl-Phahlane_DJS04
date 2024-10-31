class PreviewButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // Create a link element for the external CSS file
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./styles.css";

    // Append the link to the shadow root
    shadow.appendChild(link);

    // Create the container for the preview button
    this.container = document.createElement("div");
    this.container.classList.add("preview");

    // Append the container to the shadow DOM-
    shadow.appendChild(this.container);
  }
  //this gave me a big problem- it was not implemented and I had null for the list items on UI
  connectedCallback() {
    // Now that the element is connected, can safely access the attributes
    this.render();
  }
  
   render() {
    // Set up HTML content for the preview button using the attributes
    this.container.innerHTML = `
      <img class="preview__image" src="${this.getAttribute("data-image")}" alt="Book Image" />
      <div class="preview__info">
        <h3 class="preview__title">${this.getAttribute("data-title")}</h3>
        <div class="preview__author">${this.getAttribute("data-author")}</div>
      </div>
    `;
  }
}
// Define the custom element
customElements.define("book-preview-component", PreviewButton);