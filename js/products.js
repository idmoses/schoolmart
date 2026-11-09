
/* ===========================================================
   SCHOOLMART - PRODUCT DATABASE
   ===========================================================

   HOW TO ADD A NEW PRODUCT:

   1. Upload your product photo into the images/ folder.
      Example: images/black-school-shoes.jpg

   2. Add a new product inside the PRODUCTS array.

   3. Give every product a UNIQUE ID number.

   4. Make sure the category matches a name in CATEGORIES.

   5. Save the file and refresh your website.

   NOTE:
   The emoji displays when the product image is missing.

=========================================================== */


/* ===========================================================
   1. PRODUCT CATEGORIES
=========================================================== */

const CATEGORIES = {

    Books: '📚',
    Shoes: '👟',
    Clothes: '👕',
    Bags: '🎒',
    Stationery: '✏️'

    // Add more categories when needed.
    // Example: Accessories: '🧢',

};


/* ===========================================================
   2. PRODUCTS DATABASE
=========================================================== */

const PRODUCTS = [

    // -------------------------
    // BOOKS
    // -------------------------

    {
        id: 1,
        name: 'Mathematics Textbook',
        category: 'Books',
        price: 4500,
        image: 'images/maths-textbook.jpg',
        emoji: '📘'
    },

    {
        id: 2,
        name: 'English Language Guide',
        category: 'Books',
        price: 3800,
        image: 'images/english-guide.jpg',
        emoji: '📗'
    },

    {
        id: 3,
        name: 'Science Workbook',
        category: 'Books',
        price: 4200,
        image: 'images/science-workbook.jpg',
        emoji: '📙'
    },


    // -------------------------
    // SHOES
    // -------------------------

    {
        id: 4,
        name: 'Black School Shoes',
        category: 'Shoes',
        price: 12500,
        image: 'images/black-school-shoes.jpg',
        emoji: '👞'
    },

    {
        id: 5,
        name: 'White Canvas Sneakers',
        category: 'Shoes',
        price: 9800,
        image: 'images/white-sneakers.jpg',
        emoji: '👟'
    },

    {
        id: 6,
        name: 'Sports Trainers',
        category: 'Shoes',
        price: 15000,
        image: 'images/sports-trainers.jpg',
        emoji: '👟'
    },


    // -------------------------
    // CLOTHES & UNIFORMS
    // -------------------------

    {
        id: 7,
        name: 'School Uniform Shirt',
        category: 'Clothes',
        price: 5500,
        image: 'images/uniform-shirt.jpg',
        emoji: '👕'
    },

    {
        id: 8,
        name: 'Navy Trousers',
        category: 'Clothes',
        price: 6000,
        image: 'images/navy-trousers.jpg',
        emoji: '👖'
    },

    {
        id: 9,
        name: 'PE Kit Set',
        category: 'Clothes',
        price: 7500,
        image: 'images/pe-kit.jpg',
        emoji: '🎽'
    },

    {
        id: 10,
        name: 'Knitted Cardigan',
        category: 'Clothes',
        price: 8500,
        image: 'images/cardigan.jpg',
        emoji: '🧥'
    },


    // -------------------------
    // BAGS
    // -------------------------

    {
        id: 11,
        name: 'Student Backpack',
        category: 'Bags',
        price: 11000,
        image: 'images/backpack.jpg',
        emoji: '🎒'
    },

    {
        id: 12,
        name: 'Lunch Bag',
        category: 'Bags',
        price: 3500,
        image: 'images/lunch-bag.jpg',
        emoji: '🍱'
    },


    // -------------------------
    // STATIONERY
    // -------------------------

    {
        id: 13,
        name: 'Exercise Books (12 pack)',
        category: 'Stationery',
        price: 2400,
        image: 'images/exercise-books.jpg',
        emoji: '📓'
    },

    {
        id: 14,
        name: 'Geometry Set',
        category: 'Stationery',
        price: 2200,
        image: 'images/geometry-set.jpg',
        emoji: '📐'
    },

    {
        id: 15,
        name: 'Pen Pack (20)',
        category: 'Stationery',
        price: 1500,
        image: 'images/pens.jpg',
        emoji: '🖊️'
    },

    {
        id: 16,
        name: 'Scientific Calculator',
        category: 'Stationery',
        price: 6500,
        image: 'images/calculator.jpg',
        emoji: '🧮'
    }

];


const ADMIN = {

    email: 'admin@schoolmart.com',
    password: 'Admin@123'

};


const BANK = {

    bank: 'Paystack-titan',
    accountName: 'Stephanie Fabian',
    accountNumber: '9609256637'

};

const PAYSTACK_PUBLIC_KEY = '';


