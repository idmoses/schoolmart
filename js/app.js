
/* ===========================================================
   SCHOOLMART - MAIN APPLICATION JAVASCRIPT
   =========================================================== */


/* ===========================================================
   1. PRODUCT MANAGEMENT
=========================================================== */

let P = [];

function buildP() {
    const x = S.get('sm_prodx', {
        add: [],
        over: {},
        del: []
    });

    P = PRODUCTS
        .map(p => ({
            id: p.id,
            n: p.name,
            c: p.category,
            p: p.price,
            e: p.emoji || '🛍️',
            img: p.image
        }))
        .filter(p => !x.del.includes(p.id))
        .map(p => ({
            ...p,
            ...(x.over[p.id] || {})
        }))
        .concat(x.add);
}

const CATS = CATEGORIES;


/* ===========================================================
   2. PRODUCT IMAGE DISPLAY
=========================================================== */

const pic = p => p.img
    ? `<img src="${p.img}" alt="${esc(p.n)}" loading="lazy"
        onerror="this.replaceWith(document.createTextNode('${p.e}'))">`
    : p.e;


/* ===========================================================
   3. LOCAL STORAGE MANAGEMENT
=========================================================== */

const mem = {};

const S = {

    get(k, d) {
        try {
            const v = localStorage.getItem(k);

            return v
                ? JSON.parse(v)
                : (k in mem ? mem[k] : d);

        } catch (e) {
            return k in mem ? mem[k] : d;
        }
    },

    set(k, v) {
        mem[k] = v;

        try {
            localStorage.setItem(k, JSON.stringify(v));
        } catch (e) { }
    }

};


/* ===========================================================
   4. HELPER FUNCTIONS
=========================================================== */

const $ = s => document.querySelector(s);

const N = n => '₦' + n.toLocaleString('en-NG');

const esc = s => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[c]));


/* ===========================================================
   5. APPLICATION DATA
=========================================================== */

let cart = S.get('sm_cart', []);
let users = S.get('sm_users', []);
let me = S.get('sm_me', null);
let orders = S.get('sm_orders', []);

let f = {
    q: '',
    c: 'All',
    s: 'def'
};


/* ===========================================================
   6. ADMIN ACCOUNT INITIALIZATION
=========================================================== */

users = users.filter(u => u.role !== 'admin');

users.push({
    name: 'Store Admin',
    email: ADMIN.email.toLowerCase(),
    role: 'admin',
    pw: btoa(ADMIN.password)
});

S.set('sm_users', users);


/* ===========================================================
   7. USER & CART HELPER FUNCTIONS
=========================================================== */

const user = () => users.find(u => u.email === me);

const count = () => cart.reduce(
    (a, i) => a + i.q,
    0
);

const sub = () => cart.reduce(
    (a, i) => a + i.q * P.find(p => p.id === i.id).p,
    0
);


/* ===========================================================
   8. TOAST NOTIFICATIONS
=========================================================== */

function toast(m) {
    const t = $('#toast');

    t.textContent = m;
    t.className = 's';

    clearTimeout(toast.h);

    toast.h = setTimeout(() => {
        t.className = '';
    }, 2200);
}


/* ===========================================================
   9. SHOPPING CART FUNCTIONS
=========================================================== */

// Add product to cart

function add(id) {
    const i = cart.find(x => x.id === id);

    i ? i.q++ : cart.push({
        id,
        q: 1
    });

    S.set('sm_cart', cart);

    toast('Added to My Items ✓');

    nav();
}


// Update product quantity

function qty(id, d) {
    const i = cart.find(x => x.id === id);

    i.q += d;

    if (i.q < 1) {
        cart = cart.filter(x => x.id !== id);
    }

    S.set('sm_cart', cart);

    route();
}


// Remove product from cart

function rm(id) {
    cart = cart.filter(x => x.id !== id);

    S.set('sm_cart', cart);

    route();
}


/* ===========================================================
   10. NAVIGATION SYSTEM
=========================================================== */

function nav() {
    const h = location.hash.slice(1) || 'home';

    const l = (r, t) =>
        `<a class="l ${h === r ? 'on' : ''}" href="#${r}">${t}</a>`;

    $('#nav').innerHTML =
        l('home', 'Home') +
        l('shop', 'Shop') +
        l('cart', 'My Items <span class="badge">' + count() + '</span>') +

        (
            me
                ? (
                    isA()
                        ? l('admin', 'Admin')
                        : l('dashboard', 'Dashboard')
                ) +
                '<a class="l" href="#" onclick="out();return false">Logout</a>'

                : l('login', 'Login') +
                '<a class="btn" style="padding:7px 16px" href="#register">Sign up</a>'
        );
}


// Logout

function out() {
    me = null;

    S.set('sm_me', null);

    location.hash = 'home';

    route();
}


/* ===========================================================
   11. PRODUCT CARD DESIGN
=========================================================== */

const card = p => `
    <div class="card">

        <div class="pic">
            ${pic(p)}
        </div>

        <div class="in">

            <span class="tag">${p.c}</span>

            <b>${esc(p.n)}</b>

            <span class="price">${N(p.p)}</span>

            <button class="btn" onclick="add(${p.id})">
                Add to My Items
            </button>

        </div>

    </div>
`;


/* ===========================================================
   12. PAGE VIEWS / APPLICATION PAGES
=========================================================== */

const V = {

    // -------------------------
    // HOME PAGE
    // -------------------------

    home: () => `

        <div class="hero">

            <div class="wrap">

                <div>

                    <h1>
                        Everything you need for school,
                        <span>one click away</span>
                    </h1>

                    <p>
                        Books, shoes, uniforms and bags at
                        student-friendly prices. Order in minutes
                        and get it delivered to your school.
                    </p>

                    <a class="btn" href="#shop">
                        Shop now
                    </a>

                    <a class="btn o" style="background:#fff" href="#register">
                        Create account
                    </a>

                </div>

                <div class="art">
                    🎒📚👟
                </div>

            </div>

        </div>


        <!-- SHOP BY CATEGORY -->

        <section>

            <div class="wrap">

                <h2>Shop by category</h2>

                <div class="cats">

                    ${Object.entries(CATS).map(([c, e]) => `
                        <div class="cat"
                            onclick="f.c='${c}';location.hash='shop'">

                            <i>${e}</i>

                            ${c}

                        </div>
                    `).join('')}

                </div>

            </div>

        </section>


        <!-- POPULAR PRODUCTS -->

        <section style="padding-top:0">

            <div class="wrap">

                <h2>Popular picks</h2>

                <div class="grid">

                    ${[1, 4, 7, 11, 13, 16, 5, 9]
            .map(i => P.find(p => p.id === i))
            .filter(Boolean)
            .map(card)
            .join('')}

                </div>

            </div>

        </section>


        <!-- CUSTOMER BENEFITS -->

        <section style="padding-top:0">

            <div class="wrap perks">

                <div class="perk">
                    <b>🚚 Campus delivery</b>
                    Straight to your school gate.
                </div>

                <div class="perk">
                    <b>🔒 Secure checkout</b>
                    Pay online or on delivery.
                </div>

                <div class="perk">
                    <b>↩️ Easy returns</b>
                    Wrong size? Swap within 7 days.
                </div>

                <div class="perk">
                    <b>🏷️ Student prices</b>
                    Great value on every item.
                </div>

            </div>

        </section>

    `,


    // -------------------------
    // SHOP PAGE
    // -------------------------

    shop: () => `

        <section>

            <div class="wrap">

                <h2>Shop</h2>

                <div class="bar">

                    <input
                        id="q"
                        placeholder="Search books, shoes, clothes…"
                        value="${esc(f.q)}"
                        oninput="f.q=this.value;list()"
                    >

                    <select onchange="f.c=this.value;list()">

                        ${['All', ...Object.keys(CATS)].map(c => `
                            <option ${f.c === c ? 'selected' : ''}>
                                ${c}
                            </option>
                        `).join('')}

                    </select>

                    <select onchange="f.s=this.value;list()">

                        <option value="def">Sort: Featured</option>

                        <option value="lo" ${f.s == 'lo' ? 'selected' : ''}>
                            Price: low to high
                        </option>

                        <option value="hi" ${f.s == 'hi' ? 'selected' : ''}>
                            Price: high to low
                        </option>

                    </select>

                </div>

                <div class="grid" id="list"></div>

            </div>

        </section>

    `,


    // -------------------------
    // SHOPPING CART PAGE
    // -------------------------

    cart: () => {

        if (!cart.length) {
            return `

                <section>

                    <div class="wrap">

                        <div class="box empty">

                            <div style="font-size:3rem">
                                🛒
                            </div>

                            <h3>You have no items yet</h3>

                            <a class="btn" href="#shop">
                                Start shopping
                            </a>

                        </div>

                    </div>

                </section>

            `;
        }

        return `

            <section>

                <div class="wrap">

                    <h2>My Items</h2>

                    <div class="two">

                        <div class="box">

                            ${cart.map(i => {

            const p = P.find(x => x.id === i.id);

            return `

                                    <div class="row">

                                        <div class="e">
                                            ${pic(p)}
                                        </div>

                                        <div class="t">

                                            <b>${esc(p.n)}</b>

                                            <br>

                                            <span class="price">
                                                ${N(p.p)}
                                            </span>

                                        </div>

                                        <div class="qty">

                                            <button onclick="qty(${p.id},-1)">
                                                −
                                            </button>

                                            ${i.q}

                                            <button onclick="qty(${p.id},1)">
                                                +
                                            </button>

                                        </div>

                                        <button class="x" onclick="rm(${p.id})">
                                            Remove
                                        </button>

                                    </div>

                                `;

        }).join('')}

                        </div>

                        ${summary()}

                    </div>

                </div>

            </section>

        `;
    },


    // -------------------------
    // CHECKOUT PAGE
    // -------------------------

    checkout: () => {

        if (!me) {
            S.set('sm_next', 'checkout');

            location.hash = 'login';

            return '';
        }

        if (!cart.length) {
            location.hash = 'cart';

            return '';
        }

        const u = user();

        return `

            <section>

                <div class="wrap">

                    <h2>Checkout</h2>

                    <div class="two">

                        <form class="box f" onsubmit="place(event)">

                            <label>Full name</label>

                            <input
                                id="cn"
                                required
                                value="${esc(u.name)}"
                            >

                            <label>Student / School number</label>

                            <input
                                id="cs"
                                required
                                value="${esc(u.sid || '')}"
                            >

                            <label>Phone number</label>

                            <input
                                id="cp"
                                required
                                type="tel"
                                placeholder="080…"
                            >

                            <label>School / delivery address</label>

                            <input
                                id="ca"
                                required
                                placeholder="School name and address"
                            >

                            <label>Payment method</label>

                            <select id="cm" onchange="payChk()">

                                <option>Bank transfer</option>
                                <option>Debit card</option>
                                <option>Paystack</option>

                            </select>

                            <div id="pay"></div>

                            <button
                                class="btn w"
                                id="pb"
                                style="margin-top:18px"
                            >
                                Place order
                            </button>

                        </form>

                        ${summary(true)}

                    </div>

                </div>

            </section>

        `;
    },


    // -------------------------
    // LOGIN PAGE
    // -------------------------

    login: () => `

        <section>

            <div class="wrap">

                <div class="box auth">

                    <h2>Welcome back</h2>

                    <label>Email</label>

                    <input id="e" type="email">

                    <label>Password</label>

                    <input id="p" type="password">

                    <div class="err" id="err"></div>

                    <button class="btn w" onclick="login()">
                        Login
                    </button>

                    <p style="text-align:center;color:var(--muted)">

                        New here?

                        <a href="#register"
                            style="color:var(--blue);font-weight:700">
                            Create an account
                        </a>

                    </p>

                </div>

            </div>

        </section>

    `,


    // -------------------------
    // REGISTRATION PAGE
    // -------------------------

    register: () => `

        <section>

            <div class="wrap">

                <div class="box auth">

                    <h2>Create account</h2>

                    <label>Full name</label>

                    <input id="n">

                    <label>Email</label>

                    <input id="e" type="email">

                    <label>School</label>

                    <input
                        id="s"
                        placeholder="e.g. Government College"
                    >

                    <label>Student / School number</label>

                    <input
                        id="sn"
                        placeholder="e.g. STU/2026/0142"
                    >

                    <label>Password (min 6 characters)</label>

                    <input id="p" type="password">

                    <div class="err" id="err"></div>

                    <button class="btn w" onclick="reg()">
                        Register
                    </button>

                    <p style="text-align:center;color:var(--muted)">

                        Have an account?

                        <a href="#login"
                            style="color:var(--blue);font-weight:700">
                            Login
                        </a>

                    </p>

                </div>

            </div>

        </section>

    `,


    // -------------------------
    // STUDENT DASHBOARD
    // -------------------------

    dashboard: () => {

        if (!me) {
            location.hash = 'login';

            return '';
        }

        const u = user();

        const mine = orders.filter(o => o.by === me);

        return `

            <section>

                <div class="wrap">

                    <h2>
                        Hi, ${esc(u.name.split(' ')[0])} 👋
                    </h2>

                    ${mine.some(o => o.status.startsWith('Awaiting'))
                ? `
                            <div class="payb" style="margin:0 0 18px">

                                ⏳

                                <b>Awaiting payment confirmation.</b>

                                We will start processing your order
                                as soon as your transfer is confirmed.

                            </div>
                        `
                : ''
            }


                    <!-- STUDENT STATISTICS -->

                    <div class="stats">

                        <div class="stat">
                            <b>${mine.length}</b>
                            Orders placed
                        </div>

                        <div class="stat">
                            <b>
                                ${N(mine.reduce((a, o) => a + o.total, 0))}
                            </b>
                            Total spent
                        </div>

                        <div class="stat">
                            <b>${count()}</b>
                            Items saved
                        </div>

                    </div>


                    <div class="two">


                        <!-- ORDER HISTORY -->

                        <div class="box scroll">

                            <h3 style="margin-top:0">
                                Order history
                            </h3>

                            ${mine.length
                ? `

                                    <table>

                                        <tr>
                                            <th>Order</th>
                                            <th>Date</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>

                                        ${mine.slice().reverse().map(o => `

                                            <tr>

                                                <td>#${o.id}</td>

                                                <td>${o.date}</td>

                                                <td>${o.items}</td>

                                                <td>${N(o.total)}</td>

                                                <td>
                                                    <span class="st ${o.status.startsWith('Awaiting') ? 'wait' : ''}">
                                                        ${o.status}
                                                    </span>
                                                </td>

                                            </tr>

                                        `).join('')}

                                    </table>

                                `
                : `

                                    <div class="empty">

                                        No orders yet.

                                        <a href="#shop"
                                            style="color:var(--blue);font-weight:700">
                                            Start shopping
                                        </a>

                                    </div>

                                `
            }

                        </div>


                        <!-- STUDENT PROFILE -->

                        <div class="box">

                            <h3 style="margin-top:0">
                                My profile
                            </h3>

                            <p>

                                <b>${esc(u.name)}</b>

                                <br>

                                ${esc(u.email)}

                                <br>

                                ${esc(u.school || 'No school added')}

                                <br>

                                Student No:

                                <b>${esc(u.sid || '–')}</b>

                            </p>

                            <a class="btn b w" href="#shop">
                                Continue shopping
                            </a>

                        </div>

                    </div>

                </div>

            </section>

        `;
    },


    // -------------------------
    // ADMIN DASHBOARD
    // -------------------------

    admin: () => {

        if (!isA()) {
            location.hash = 'login';

            return '';
        }

        return `

            <section>

                <div class="wrap">

                    <h2>Admin panel</h2>


                    <!-- ADMIN STATISTICS -->

                    <div class="stats">

                        <div class="stat">
                            <b>${P.length}</b>
                            Items in store
                        </div>

                        <div class="stat">
                            <b>${orders.length}</b>
                            Orders
                        </div>

                        <div class="stat">
                            <b>${users.filter(u => u.role !== 'admin').length}</b>
                            Students
                        </div>

                        <div class="stat">
                            <b>
                                ${N(orders.reduce((a, o) => a + o.total, 0))}
                            </b>
                            Total sales
                        </div>

                    </div>


                    <div class="two">


                        <!-- PRODUCT MANAGEMENT TABLE -->

                        <div class="box scroll">

                            <h3 style="margin-top:0">
                                All items
                            </h3>

                            <table>

                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th></th>
                                </tr>

                                ${P.map(p => `

                                    <tr>

                                        <td>
                                            <div class="e2">
                                                ${pic(p)}
                                            </div>
                                        </td>

                                        <td>${esc(p.n)}</td>

                                        <td>${p.c}</td>

                                        <td>${N(p.p)}</td>

                                        <td>

                                            <button
                                                class="x"
                                                style="color:var(--blue)"
                                                onclick="edit(${p.id})"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                class="x"
                                                onclick="del(${p.id})"
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                `).join('')}

                            </table>

                        </div>


                        <!-- ADD / EDIT PRODUCT FORM -->

                        <form class="box f" onsubmit="saveP(event)">

                            <h3 id="ft" style="margin-top:0">
                                Add new item
                            </h3>

                            <input type="hidden" id="pid">

                            <label>Item name</label>

                            <input id="pn" required>

                            <label>Category</label>

                            <select id="pc">

                                ${Object.keys(CATS).map(c => `
                                    <option>${c}</option>
                                `).join('')}

                            </select>

                            <label>Price (₦)</label>

                            <input
                                id="pp"
                                type="number"
                                min="0"
                                required
                            >

                            <label>Photo (optional when editing)</label>

                            <input
                                id="pf"
                                type="file"
                                accept="image/*"
                            >

                            <button
                                class="btn w"
                                style="margin-top:16px"
                            >
                                Save item
                            </button>

                            <button
                                type="button"
                                class="btn o w"
                                style="margin-top:8px"
                                onclick="route()"
                            >
                                Clear form
                            </button>

                        </form>

                    </div>


                    <!-- ALL CUSTOMER ORDERS -->

                    <div class="box scroll" style="margin-top:20px">

                        <h3 style="margin-top:0">
                            All orders
                        </h3>

                        ${orders.length
                ? `

                                <table style="min-width:760px">

                                    <tr>
                                        <th>Order</th>
                                        <th>Student</th>
                                        <th>Contact</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>

                                    ${orders.slice().reverse().map(o => `

                                        <tr>

                                            <td>

                                                #${o.id}

                                                <br>

                                                <small>${o.date}</small>

                                            </td>

                                            <td>

                                                <b>${esc(o.name || '')}</b>

                                                <br>

                                                No: ${esc(o.sid || '–')}

                                                <br>

                                                ${esc(o.school || '')}

                                            </td>

                                            <td>

                                                ${esc(o.phone || '')}

                                                <br>

                                                ${esc(o.addr || '')}

                                            </td>

                                            <td>
                                                ${esc(o.list || o.items + ' items')}
                                            </td>

                                            <td>

                                                ${N(o.total)}

                                                <br>

                                                <small>${esc(o.pay || '')}</small>

                                            </td>

                                            <td>

                                                <select onchange="setSt(${o.id},this.value)">

                                                    ${[
                        'Awaiting payment confirmation',
                        'Processing',
                        'Out for delivery',
                        'Delivered'
                    ].map(s => `

                                                        <option ${o.status === s ? 'selected' : ''}>
                                                            ${s}
                                                        </option>

                                                    `).join('')}

                                                </select>

                                            </td>

                                        </tr>

                                    `).join('')}

                                </table>

                            `
                : `
                                <div class="empty">
                                    No orders yet.
                                </div>
                            `
            }

                    </div>

                </div>

            </section>

        `;
    }

};


/* ===========================================================
   13. ORDER SUMMARY
=========================================================== */

function summary(co) {

    const s = sub();

    const d = s > 0 ? 1500 : 0;

    return `

        <div class="box sum">

            <h3 style="margin-top:0">
                Order summary
            </h3>

            <div>
                <span>Subtotal (${count()} items)</span>
                <span>${N(s)}</span>
            </div>

            <div>
                <span>Delivery</span>
                <span>${N(d)}</span>
            </div>

            <div class="tot">
                <span>Total</span>
                <span>${N(s + d)}</span>
            </div>

            ${co
            ? ''
            : `
                    <a
                        class="btn w"
                        href="#checkout"
                        style="text-align:center;margin-top:12px"
                    >
                        Proceed to checkout
                    </a>
                `
        }

        </div>

    `;
}


/* ===========================================================
   14. PRODUCT SEARCH & FILTER
=========================================================== */

function list() {

    let a = P.filter(p =>

        (f.c === 'All' || p.c === f.c) &&

        p.n.toLowerCase().includes(f.q.toLowerCase())

    );

    if (f.s === 'lo') {
        a.sort((x, y) => x.p - y.p);
    }

    if (f.s === 'hi') {
        a.sort((x, y) => y.p - x.p);
    }

    $('#list').innerHTML = a.length
        ? a.map(card).join('')
        : '<div class="empty">No products found.</div>';

}


/* ===========================================================
   15. STUDENT REGISTRATION
=========================================================== */

function reg() {

    const n = $('#n').value.trim();

    const e = $('#e').value.trim().toLowerCase();

    const p = $('#p').value;

    const er = $('#err');


    if (!n || !/^\S+@\S+\.\S+$/.test(e)) {
        return er.textContent = 'Enter your name and a valid email.';
    }

    const sn = $('#sn').value.trim();

    if (!sn) {
        return er.textContent = 'Enter your student or school number.';
    }

    if (users.some(u => u.sid && u.sid.toLowerCase() === sn.toLowerCase())) {
        return er.textContent = 'That student number is already registered.';
    }

    if (p.length < 6) {
        return er.textContent = 'Password must be at least 6 characters.';
    }

    if (users.some(u => u.email === e)) {
        return er.textContent = 'That email is already registered.';
    }


    users.push({

        name: n,
        email: e,
        school: $('#s').value.trim(),
        sid: $('#sn').value.trim(),
        pw: btoa(unescape(encodeURIComponent(p)))

    });

    S.set('sm_users', users);

    start(e);

}


/* ===========================================================
   16. STUDENT LOGIN
=========================================================== */

function login() {

    const e = $('#e').value.trim().toLowerCase();

    const p = btoa(unescape(encodeURIComponent($('#p').value)));

    if (!users.some(u => u.email === e && u.pw === p)) {
        return $('#err').textContent = 'Incorrect email or password.';
    }

    start(e);

}


/* ===========================================================
   17. LOGIN SESSION MANAGEMENT
=========================================================== */

function start(e) {

    me = e;

    S.set('sm_me', e);

    const nx = S.get('sm_next', null);

    S.set('sm_next', null);

    toast('Welcome to SchoolMart!');

    location.hash = nx || (isA() ? 'admin' : 'dashboard');

}


/* ===========================================================
   18. PAYMENT METHOD VALIDATION
=========================================================== */

function payChk() {

    const m = $('#cm').value;

    const t = sub() + 1500;

    const k = (
        typeof PAYSTACK_PUBLIC_KEY === 'string' &&
        PAYSTACK_PUBLIC_KEY.trim()
    ) || '';

    const b = $('#pb');

    let h = '';

    let ok = true;

    let l = 'Place order';


    // BANK TRANSFER

    if (m === 'Bank transfer') {

        h = `

            <div class="payb">

                <b>Transfer ${N(t)} to:</b>

                <div>
                    Bank: ${esc(BANK.bank)}
                </div>

                <div>
                    Account name: ${esc(BANK.accountName)}
                </div>

                <div>

                    Account number:

                    <b>${esc(BANK.accountNumber)}</b>

                    <button
                        type="button"
                        class="x"
                        style="color:var(--blue)"
                        onclick="navigator.clipboard&&navigator.clipboard.writeText('${esc(BANK.accountNumber)}');toast('Account number copied')"
                    >
                        Copy
                    </button>

                </div>

                <small>
                    Use your student number as the payment reference.
                    Your order is confirmed once we receive the transfer.
                </small>

            </div>

        `;

        l = 'I have paid – place order';

    }


    // DEBIT CARD / PAYSTACK

    else if (m === 'Debit card' || m === 'Paystack') {

        if (!k) {

            ok = false;

            h = `
                <div class="payb err">
                    Online payment is not active yet.
                    Please choose Pay on delivery or Bank transfer.
                </div>
            `;

        }

        else if (m === 'Debit card') {

            h = `

                <div class="payb">

                    <div class="cardv">

                        <span>💳</span>

                        <b>•••• •••• •••• ••••</b>

                        <small>Visa · Mastercard · Verve</small>

                    </div>

                    <small>
                        Click the button to enter your card number,
                        expiry date and CVV in Paystack’s secure window.
                        We never see or store your card details.
                    </small>

                </div>

            `;

            l = 'Pay ' + N(t) + ' by card';

        }

        else {

            h = `

                <div class="payb">

                    <b>Pay securely with Paystack</b>

                    <br>

                    <small>
                        Choose card, bank transfer, USSD or bank app
                        inside the Paystack window.
                    </small>

                </div>

            `;

            l = 'Pay ' + N(t) + ' with Paystack';

        }

    }


    $('#pay').innerHTML = h;

    b.disabled = !ok;

    b.style.opacity = ok ? 1 : .5;

    b.textContent = l;

}


/* ===========================================================
   19. COMPLETE ORDER
=========================================================== */

function done(o) {

    orders.push(o);

    S.set('sm_orders', orders);

    cart = [];

    S.set('sm_cart', cart);

    toast(
        o.status === 'Awaiting payment confirmation'
            ? 'Order received – awaiting payment confirmation'
            : 'Order placed successfully 🎉'
    );

    location.hash = 'dashboard';

}


/* ===========================================================
   20. CHECKOUT & PAYSTACK PAYMENT
=========================================================== */

function place(ev) {

    ev.preventDefault();

    const m = $('#cm').value;

    payChk();

    if ($('#pb').disabled) return;


    // CREATE ORDER

    const o = {

        id: Math.floor(10000 + Math.random() * 89999),

        by: me,

        name: $('#cn').value.trim(),

        sid: $('#cs').value.trim(),

        school: user().school || '',

        phone: $('#cp').value.trim(),

        addr: $('#ca').value.trim(),

        pay: m,

        list: cart.map(i =>
            P.find(p => p.id === i.id).n + ' ×' + i.q
        ).join(', '),

        date: new Date().toLocaleDateString('en-GB'),

        items: count(),

        total: sub() + 1500,

        status: 'Processing'

    };


    // BANK TRANSFER

    if (m === 'Bank transfer') {

        o.status = 'Awaiting payment confirmation';

        return done(o);

    }


    // PAY ON DELIVERY

    if (m === 'Pay on delivery') {
        return done(o);
    }


    // PAYSTACK VALIDATION

    if (typeof PaystackPop === 'undefined') {

        return toast('Paystack could not load. Check your internet connection.');

    }


    // PAYSTACK PAYMENT INITIALIZATION

    PaystackPop.setup({

        key: PAYSTACK_PUBLIC_KEY.trim(),

        email: me,

        amount: o.total * 100,

        currency: 'NGN',

        ref: 'SM' + o.id + Date.now(),

        callback: function (r) {

            o.pay = m + ' – PAID (ref ' + r.reference + ')';

            done(o);

        },

        onClose: function () {

            toast('Payment cancelled');

        }

    }).openIframe();

}


/* ===========================================================
   21. PAGE ROUTING SYSTEM
=========================================================== */

function route() {

    buildP();

    cart = cart.filter(i =>
        P.some(p => p.id === i.id)
    );

    const h = location.hash.slice(1) || 'home';

    $('#app').innerHTML = (V[h] || V.home)();

    if (h === 'shop') {
        list();
    }

    nav();

    window.scrollTo(0, 0);

}


/* ===========================================================
   22. ADMIN AUTHENTICATION CHECK
=========================================================== */

const isA = () => user()?.role === 'admin';


/* ===========================================================
   23. ADMIN PRODUCT STORAGE
=========================================================== */

const px = () => S.get('sm_prodx', {
    add: [],
    over: {},
    del: []
});


/* ===========================================================
   24. UPDATE ORDER STATUS
=========================================================== */

function setSt(id, v) {

    orders.find(o => o.id === id).status = v;

    S.set('sm_orders', orders);

    toast('Status updated ✓');

}


/* ===========================================================
   25. EDIT PRODUCT
=========================================================== */

function edit(id) {

    const p = P.find(x => x.id === id);

    $('#ft').textContent = 'Edit item';

    $('#pid').value = id;

    $('#pn').value = p.n;

    $('#pc').value = p.c;

    $('#pp').value = p.p;

    $('#pn').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

}


/* ===========================================================
   26. DELETE PRODUCT
=========================================================== */

function del(id) {

    if (!confirm('Delete this item from the store?')) {
        return;
    }

    const x = px();

    x.add = x.add.filter(p => p.id !== id);

    if (PRODUCTS.some(p => p.id === id)) {
        x.del.push(id);
    }

    S.set('sm_prodx', x);

    route();

}


/* ===========================================================
   27. PRODUCT IMAGE UPLOAD & OPTIMIZATION
=========================================================== */

function readImg(f) {

    return new Promise(res => {

        if (!f) {
            return res(null);
        }

        const r = new FileReader();

        r.onload = () => {

            const i = new Image();

            i.onload = () => {

                const k = Math.min(
                    1,
                    600 / Math.max(i.width, i.height)
                );

                const c = document.createElement('canvas');

                c.width = i.width * k;

                c.height = i.height * k;

                c.getContext('2d').drawImage(
                    i,
                    0,
                    0,
                    c.width,
                    c.height
                );

                res(c.toDataURL('image/jpeg', .8));

            };

            i.src = r.result;

        };

        r.readAsDataURL(f);

    });

}


/* ===========================================================
   28. ADD / SAVE PRODUCT
=========================================================== */

async function saveP(ev) {

    ev.preventDefault();

    const x = px();

    const id = +$('#pid').value;

    const old = P.find(p => p.id === id);

    const im = await readImg($('#pf').files[0]);


    // PRODUCT INFORMATION

    const p = {

        id: id || Math.max(1000, ...P.map(q => q.id)) + 1,

        n: $('#pn').value.trim(),

        c: $('#pc').value,

        p: +$('#pp').value,

        e: old ? old.e : '🛍️',

        img: im || (old ? old.img : '')

    };


    // SAVE PRODUCT

    if (x.add.some(a => a.id === p.id)) {

        x.add = x.add.map(a =>
            a.id === p.id ? p : a
        );

    }

    else if (PRODUCTS.some(a => a.id === p.id)) {

        x.over[p.id] = p;

    }

    else {

        x.add.push(p);

    }


    S.set('sm_prodx', x);

    toast('Item saved ✓');

    route();

}


/* ===========================================================
   29. APPLICATION INITIALIZATION
=========================================================== */

// Listen for page navigation changes

addEventListener('hashchange', route);


// Load the application

route();

