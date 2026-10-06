const getPageWidth = (doc) => doc.body.getBoundingClientRect().width;

// A desktop scrollbar takes up room and a phone's doesn't. Take the gutter away
// so the page lays out the way it does on a phone.
const dropScrollbarRoom = () => {
  cy.document().then((doc) => {
    const style = doc.createElement('style');
    style.textContent = 'html { scrollbar-gutter: auto; }';
    doc.head.append(style);
  });
};

export { dropScrollbarRoom, getPageWidth };
