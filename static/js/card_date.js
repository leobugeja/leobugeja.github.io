function getCardDate(card_creation_date) {
	var todays_date = new Date().getTime() / 1000;
	var ageDays = Math.floor((todays_date - card_creation_date) / 86400);
	var ageMonths = Math.floor((todays_date - card_creation_date) / 2592000);
	var ageYears = Math.floor((todays_date - card_creation_date) / 31536000);

	if (ageDays == 0) {
		date_string = "today"
	} else if (ageDays < 31) {
		suffix = (ageDays == 1) ? " day ago" : " days ago";
		date_string = ageDays.toString() + suffix;
	} else if (ageMonths < 12) {
		suffix = (ageMonths == 1) ? " month ago" : " months ago";
		date_string = ageMonths.toString() + suffix;
	} else {
		suffix = (ageYears == 1) ? " year ago" : " years ago";
		date_string = ageYears.toString() + suffix;
	}
	var me = document.currentScript;
	me.parentElement.textContent = date_string;
}
