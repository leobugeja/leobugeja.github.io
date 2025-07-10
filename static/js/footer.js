const footnotes = document.querySelector('.footnotes');

if (footnotes) {
   footnotes.querySelectorAll('hr').forEach(element => element.remove());

   const backrefs = footnotes.querySelectorAll('.footnote-backref');
   backrefs.forEach(element => element.innerText = '⤴');  // ⮭🡡

   const title = 'References';
   const id = 'footnotes-label';
   const element = document.createElement('h2');
   const text = document.createTextNode(title);

   element.appendChild(text);
   element.id = id;
   footnotes.insertBefore(element, footnotes.firstChild);
}