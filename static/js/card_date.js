function getCardDate(card_creation_date) {
   var creationDate = new Date(card_creation_date * 1000);
   var today = new Date();

   var years = today.getFullYear() - creationDate.getFullYear();
   var months = today.getMonth() - creationDate.getMonth();
   var diffDays = Math.floor((today - creationDate) / (1000 * 60 * 60 * 24));
   var date_string;

   if (years > 0) {
      date_string = years === 1 ? '1 year ago' : years + ' years ago';
   } else if (months > 0) {
      date_string = months === 1 ? '1 month ago' : months + ' months ago';
   } else {
      if (diffDays === 0) {
         date_string = 'today';
      } else {
         date_string = diffDays === 1 ? '1 day ago' : diffDays + ' days ago';
      }
   }

   var me = document.currentScript;
   me.parentElement.textContent = date_string;
}
