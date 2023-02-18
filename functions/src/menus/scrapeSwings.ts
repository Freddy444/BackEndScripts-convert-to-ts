import cheerio from "cheerio";
import axios from "axios";
import { hashFunc } from "../utils/menusHelperFuncs";


export default async function scrapeSwings(db:FirebaseFirestore.Firestore) {

    const dishes:any [] = []
    const swingsregex = new RegExp ("((WesWings|Swings)(.*)Specials)");
    const weekdayregex = new RegExp ("Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday")


    const url = 'https://weswings.com';

    // Axios GET request to fetch the HTML content
    const response = await axios.get(url);
    const html = response.data;

    //parses  through the articles
    const articles = cheerio("article", html).filter((_,el) => 
    //cheerio goes through every article
    //filter articles for the ones that contain text that matches the regex conditions
    //boolean match, checks conditions
    swingsregex.test(cheerio(el).text())
    );

for (const article of articles.get()){
    const $ = cheerio(article)
    //const weekday = ($.find('h1').text().match(weekdayregex)?? [])[0]

    //finds lunch, dinner and brunch items based on h3 tag
    const lunchItems = $.find('h3:contains("Lunch")').nextAll('p').toArray();
    const dinnerItems =  $.find('h3:contains("Dinner")').nextAll('p').toArray();
    const brunchItems =  $.find('h3:contains("Brunch")').nextAll('p').toArray();
    
    
    // Extract the item name and description separately for each item
    const lunchspecials = lunchItems.map((item : any) => ({
        title: $.find(item).find('strong').text(),
        description: $.find(item).not('strong').text(),
        isGlutenFree: false,
        isVegan: false,
        isVegetarian: false,
        station: '',
        timeOfDay: 'Lunch',
        timestamp: new Date(),
        weekDay: ($.find('h1').text().match(weekdayregex)?? [])[0],
        uid: hashFunc($.find(item).find('strong').text())
    }));
    
     const dinnerspecials = dinnerItems.map((item : any) => ({
        title:   $.find(item).find('strong').text(),
        description:  $.find(item).not('strong').text(),
        isGlutenFree: false,
        isVegan: false,
        isVegetarian: false,
        station: '',
        timeOfDay: 'Lunch',
        timestamp: new Date(),
        weekDay: ($.find('h1').text().match(weekdayregex)?? [])[0],
        uid: hashFunc($.find(item).find('strong').text())
     }));

     const brunchspecials = brunchItems.map((item : any) => ({
        title:   $.find(item).find('strong').text(),
        description:  $.find(item).not('strong').text(),
        isGlutenFree: false,
        isVegan: false,
        isVegetarian: false,
        station: '',
        timeOfDay: 'Lunch',
        timestamp: new Date(),
        weekDay: ($.find('h1').text().match(weekdayregex)?? [])[0],
        uid: hashFunc($.find(item).find('strong').text())
     }));

    //pushes items into dishes array
    dishes.push(... brunchspecials, ... lunchspecials, ... dinnerspecials);
    
}
//uploads to database
await db.collection('menus').doc("swings").update({menu:dishes});
console.log(dishes)
}