let P = [], orders = [], prof = null, studentCount = 0;
const sb = (typeof SUPABASE_URL === 'string' && SUPABASE_URL && window.supabase) ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const CATS = CATEGORIES;
const pic = p => p.img ? `<img src="${p.img}" alt="${esc(p.n)}" loading="lazy" onerror="this.replaceWith(document.createTextNode('${p.e}'))">` : p.e;
const mem = {};
const S = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (k in mem ? mem[k] : d) } catch (e) { return k in mem ? mem[k] : d } }, set(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) { } } };
const $ = s => document.querySelector(s), N = n => '₦' + n.toLocaleString('en-NG'), esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let cart = S.get('sm_cart', []), me = null, f = { q: '', c: 'All', s: 'def' };
const user = () => prof, count = () => cart.reduce((a, i) => a + i.q, 0), sub = () => cart.reduce((a, i) => a + i.q * P.find(p => p.id === i.id).p, 0);
async function loadMe() { const { data: { session } } = await sb.auth.getSession(); me = null; prof = null; if (!session) return; const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).single(); if (data) { me = data.email; prof = { id: data.id, email: data.email, name: data.name || 'Student', school: data.school, sid: data.student_no, role: data.role } } }
async function loadP() { const { data, error } = await sb.from('products').select('*').order('id'); if (error) throw error; P = (data || []).map(p => ({ id: p.id, n: p.name, c: p.category, p: p.price, e: p.emoji || '🛍️', img: p.image_url || '' })); cart = cart.filter(i => P.some(p => p.id === i.id)); S.set('sm_cart', cart) }
async function loadOrders() { orders = []; if (!prof) return; const { data } = await sb.from('orders').select('*').order('id', { ascending: false }); orders = (data || []).map(o => ({ id: o.id, by: o.user_id, name: o.name, sid: o.student_no, school: o.school, phone: o.phone, addr: o.address, pay: o.payment, list: (o.items || []).map(i => i.n + ' ×' + i.q).join(', '), date: new Date(o.created_at).toLocaleDateString('en-GB'), items: o.item_count, total: o.total, status: o.status })); if (prof.role === 'admin') { const r = await sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'); studentCount = r.count || 0 } }
function toast(m) { const t = $('#toast'); t.textContent = m; t.className = 's'; clearTimeout(toast.h); toast.h = setTimeout(() => t.className = '', 2200) }
function add(id) { const i = cart.find(x => x.id === id); i ? i.q++ : cart.push({ id, q: 1 }); S.set('sm_cart', cart); toast('Added to My Items ✓'); nav() }
function qty(id, d) { const i = cart.find(x => x.id === id); i.q += d; if (i.q < 1) cart = cart.filter(x => x.id !== id); S.set('sm_cart', cart); route(1) }
function rm(id) { cart = cart.filter(x => x.id !== id); S.set('sm_cart', cart); route(1) }
function nav() {
    const h = location.hash.slice(1) || 'home'; const l = (r, t) => `<a class="l ${h === r ? 'on' : ''}" href="#${r}">${t}</a>`;
    $('#nav').innerHTML = l('home', 'Home') + l('shop', 'Shop') + l('cart', 'My Items <span class="badge">' + count() + '</span>') + (me ? (isA() ? l('admin', 'Admin') : l('dashboard', 'Dashboard')) + '<a class="l" href="#" onclick="out();return false">Logout</a>' : l('login', 'Login') + '<a class="btn" style="padding:7px 16px" href="#register">Sign up</a>')
}
async function out() { await sb.auth.signOut(); me = null; prof = null; orders = []; location.hash = 'home'; route() }
const card = p => `<div class="card"><div class="pic">${pic(p)}</div><div class="in"><span class="tag">${p.c}</span><b>${esc(p.n)}</b><span class="price">${N(p.p)}</span><button class="btn" onclick="add(${p.id})">Add to My Items</button></div></div>`;
const V = {
    home: () => `<div class="hero"><div class="wrap"><div><h1>Everything you need for school, <span>one click away</span></h1><p>Books, shoes, uniforms and bags at student-friendly prices. Order in minutes and get it delivered to your school.</p><a class="btn" href="#shop">Shop now</a> <a class="btn o" style="background:#fff" href="#register">Create account</a></div><div class="art">🎒📚👟</div></div></div>
<section><div class="wrap"><h2>Shop by category</h2><div class="cats">${Object.entries(CATS).map(([c, e]) => `<div class="cat" onclick="f.c='${c}';location.hash='shop'"><i>${e}</i>${c}</div>`).join('')}</div></div></section>
<section style="padding-top:0"><div class="wrap"><h2>Popular picks</h2><div class="grid">${[1, 4, 7, 11, 13, 16, 5, 9].map(i => P.find(p => p.id === i)).filter(Boolean).map(card).join('')}</div></div></section>
<section style="padding-top:0"><div class="wrap perks"><div class="perk"><b>🚚 Campus delivery</b>Straight to your school gate.</div><div class="perk"><b>🔒 Secure checkout</b>Pay online or on delivery.</div><div class="perk"><b>↩️ Easy returns</b>Wrong size? Swap within 7 days.</div><div class="perk"><b>🏷️ Student prices</b>Great value on every item.</div></div></section>`,
    shop: () => `<section><div class="wrap"><h2>Shop</h2><div class="bar"><input id="q" placeholder="Search books, shoes, clothes…" value="${esc(f.q)}" oninput="f.q=this.value;list()"><select onchange="f.c=this.value;list()">${['All', ...Object.keys(CATS)].map(c => `<option ${f.c === c ? 'selected' : ''}>${c}</option>`).join('')}</select><select onchange="f.s=this.value;list()"><option value="def">Sort: Featured</option><option value="lo" ${f.s == 'lo' ? 'selected' : ''}>Price: low to high</option><option value="hi" ${f.s == 'hi' ? 'selected' : ''}>Price: high to low</option></select></div><div class="grid" id="list"></div></div></section>`,
    cart: () => {
        if (!cart.length) return `<section><div class="wrap"><div class="box empty"><div style="font-size:3rem">🛒</div><h3>You have no items yet</h3><a class="btn" href="#shop">Start shopping</a></div></div></section>`;
        return `<section><div class="wrap"><h2>My Items</h2><div class="two"><div class="box">${cart.map(i => { const p = P.find(x => x.id === i.id); return `<div class="row"><div class="e">${pic(p)}</div><div class="t"><b>${esc(p.n)}</b><br><span class="price">${N(p.p)}</span></div><div class="qty"><button onclick="qty(${p.id},-1)">−</button>${i.q}<button onclick="qty(${p.id},1)">+</button></div><button class="x" onclick="rm(${p.id})">Remove</button></div>` }).join('')}</div>${summary()}</div></div></section>`
    },
    checkout: () => {
        if (!me) { S.set('sm_next', 'checkout'); location.hash = 'login'; return '' } if (!cart.length) { location.hash = 'cart'; return '' } const u = user();
        return `<section><div class="wrap"><h2>Checkout</h2><div class="two"><form class="box f" onsubmit="place(event)"><label>Full name</label><input id="cn" required value="${esc(u.name)}"><label>Student / School number</label><input id="cs" required value="${esc(u.sid || '')}"><label>Phone number</label><input id="cp" required type="tel" placeholder="080…"><label>School / delivery address</label><input id="ca" required placeholder="School name and address"><label>Payment method</label><select id="cm" onchange="payChk()"><option>Pay on delivery</option><option>Bank transfer</option><option>Debit card</option><option>Paystack</option></select><div id="pay"></div><button class="btn w" id="pb" style="margin-top:18px">Place order</button></form>${summary(true)}</div></div></section>`
    },
    login: () => `<section><div class="wrap"><div class="box auth"><h2>Welcome back</h2><label>Email</label><input id="e" type="email"><label>Password</label><input id="p" type="password"><div class="err" id="err"></div><button class="btn w" onclick="login()">Login</button><p style="text-align:center;color:var(--muted)">New here? <a href="#register" style="color:var(--blue);font-weight:700">Create an account</a></p></div></div></section>`,
    register: () => `<section><div class="wrap"><div class="box auth"><h2>Create account</h2><label>Full name</label><input id="n"><label>Email</label><input id="e" type="email"><label>School</label><input id="s" placeholder="e.g. Government College"><label>Student / School number</label><input id="sn" placeholder="e.g. STU/2026/0142"><label>Password (min 6 characters)</label><input id="p" type="password"><div class="err" id="err"></div><button class="btn w" onclick="reg()">Register</button><p style="text-align:center;color:var(--muted)">Have an account? <a href="#login" style="color:var(--blue);font-weight:700">Login</a></p></div></div></section>`,
    dashboard: () => {
        if (!me) { location.hash = 'login'; return '' } const u = user(), mine = orders;
        return `<section><div class="wrap"><h2>Hi, ${esc(u.name.split(' ')[0])} 👋</h2>${mine.some(o => o.status.startsWith('Awaiting')) ? '<div class="payb" style="margin:0 0 18px">⏳ <b>Awaiting payment confirmation.</b> We will start processing your order as soon as your transfer is confirmed.</div>' : ''}<div class="stats"><div class="stat"><b>${mine.length}</b>Orders placed</div><div class="stat"><b>${N(mine.reduce((a, o) => a + o.total, 0))}</b>Total spent</div><div class="stat"><b>${count()}</b>Items saved</div></div><div class="two"><div class="box scroll"><h3 style="margin-top:0">Order history</h3>${mine.length ? `<table><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>${mine.slice().reverse().map(o => `<tr><td>#${o.id}</td><td>${o.date}</td><td>${o.items}</td><td>${N(o.total)}</td><td><span class="st ${o.status.startsWith('Awaiting') ? 'wait' : ''}">${o.status}</span></td></tr>`).join('')}</table>` : '<div class="empty">No orders yet. <a href="#shop" style="color:var(--blue);font-weight:700">Start shopping</a></div>'}</div><div class="box"><h3 style="margin-top:0">My profile</h3><p><b>${esc(u.name)}</b><br>${esc(u.email)}<br>${esc(u.school || 'No school added')}<br>Student No: <b>${esc(u.sid || '–')}</b></p><a class="btn b w" href="#shop">Continue shopping</a></div></div></div></section>`
    },
    admin: () => {
        if (!isA()) { location.hash = 'login'; return '' }
        return `<section><div class="wrap"><h2>Admin panel</h2><div class="stats"><div class="stat"><b>${P.length}</b>Items in store</div><div class="stat"><b>${orders.length}</b>Orders</div><div class="stat"><b>${studentCount}</b>Students</div><div class="stat"><b>${N(orders.reduce((a, o) => a + o.total, 0))}</b>Total sales</div></div>
<div class="two"><div class="box scroll"><h3 style="margin-top:0">All items</h3><table><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th></th></tr>${P.map(p => `<tr><td><div class="e2">${pic(p)}</div></td><td>${esc(p.n)}</td><td>${p.c}</td><td>${N(p.p)}</td><td><button class="x" style="color:var(--blue)" onclick="edit(${p.id})">Edit</button> <button class="x" onclick="del(${p.id})">Delete</button></td></tr>`).join('')}</table></div>
<form class="box f" onsubmit="saveP(event)"><h3 id="ft" style="margin-top:0">Add new item</h3><input type="hidden" id="pid"><label>Item name</label><input id="pn" required><label>Category</label><select id="pc">${Object.keys(CATS).map(c => `<option>${c}</option>`).join('')}</select><label>Price (₦)</label><input id="pp" type="number" min="0" required><label>Photo (optional when editing)</label><input id="pf" type="file" accept="image/*"><button class="btn w" style="margin-top:16px">Save item</button><button type="button" class="btn o w" style="margin-top:8px" onclick="route()">Clear form</button></form></div>
<div class="box scroll" style="margin-top:20px"><h3 style="margin-top:0">All orders</h3>${orders.length ? `<table style="min-width:760px"><tr><th>Order</th><th>Student</th><th>Contact</th><th>Items</th><th>Total</th><th>Status</th></tr>${orders.slice().reverse().map(o => `<tr><td>#${o.id}<br><small>${o.date}</small></td><td><b>${esc(o.name || '')}</b><br>No: ${esc(o.sid || '–')}<br>${esc(o.school || '')}</td><td>${esc(o.phone || '')}<br>${esc(o.addr || '')}</td><td>${esc(o.list || o.items + ' items')}</td><td>${N(o.total)}<br><small>${esc(o.pay || '')}</small></td><td><select onchange="setSt(${o.id},this.value)">${['Awaiting payment confirmation', 'Processing', 'Out for delivery', 'Delivered'].map(s => `<option ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</table>` : '<div class="empty">No orders yet.</div>'}</div></div></section>`
    }
};
function summary(co) { const s = sub(), d = s > 0 ? 1500 : 0; return `<div class="box sum"><h3 style="margin-top:0">Order summary</h3><div><span>Subtotal (${count()} items)</span><span>${N(s)}</span></div><div><span>Delivery</span><span>${N(d)}</span></div><div class="tot"><span>Total</span><span>${N(s + d)}</span></div>${co ? '' : '<a class="btn w" href="#checkout" style="text-align:center;margin-top:12px">Proceed to checkout</a>'}</div>` }
function list() { let a = P.filter(p => (f.c === 'All' || p.c === f.c) && p.n.toLowerCase().includes(f.q.toLowerCase())); if (f.s === 'lo') a.sort((x, y) => x.p - y.p); if (f.s === 'hi') a.sort((x, y) => y.p - x.p); $('#list').innerHTML = a.length ? a.map(card).join('') : '<div class="empty">No products found.</div>' }
async function reg() {
    const n = $('#n').value.trim(), e = $('#e').value.trim().toLowerCase(), p = $('#p').value, sn = $('#sn').value.trim(), er = $('#err');
    if (!n || !/^\S+@\S+\.\S+$/.test(e)) return er.textContent = 'Enter your name and a valid email.'; if (!sn) return er.textContent = 'Enter your student or school number.'; if (p.length < 6) return er.textContent = 'Password must be at least 6 characters.';
    er.textContent = 'Creating your account…'; const { data, error } = await sb.auth.signUp({ email: e, password: p, options: { data: { name: n, school: $('#s').value.trim(), student_no: sn } } });
    if (error) return er.textContent = /database/i.test(error.message) ? 'That student number is already registered.' : error.message;
    if (!data.session) return er.textContent = 'Account created. Please confirm your email, then log in.'; await start()
}
async function login() { const er = $('#err'); er.textContent = 'Signing in…'; const { error } = await sb.auth.signInWithPassword({ email: $('#e').value.trim().toLowerCase(), password: $('#p').value }); if (error) return er.textContent = 'Incorrect email or password.'; await start() }
async function start() { await loadMe(); const nx = S.get('sm_next', null); S.set('sm_next', null); toast('Welcome to SchoolMart!'); location.hash = nx || (isA() ? 'admin' : 'dashboard') }
function payChk() {
    const m = $('#cm').value, t = sub() + 1500, k = (typeof PAYSTACK_PUBLIC_KEY === 'string' && PAYSTACK_PUBLIC_KEY.trim()) || '', b = $('#pb'); let h = '', ok = true, l = 'Place order';
    if (m === 'Bank transfer') { h = `<div class="payb"><b>Transfer ${N(t)} to:</b><div>Bank: ${esc(BANK.bank)}</div><div>Account name: ${esc(BANK.accountName)}</div><div>Account number: <b>${esc(BANK.accountNumber)}</b> <button type="button" class="x" style="color:var(--blue)" onclick="navigator.clipboard&&navigator.clipboard.writeText('${esc(BANK.accountNumber)}');toast('Account number copied')">Copy</button></div><small>Use your student number as the payment reference. Your order is confirmed once we receive the transfer.</small></div>`; l = 'I have paid – place order' }
    else if (m === 'Debit card' || m === 'Paystack') {
        if (!k) { ok = false; h = '<div class="payb err">Online payment is not active yet. Please choose Pay on delivery or Bank transfer.</div>' }
        else if (m === 'Debit card') { h = '<div class="payb"><div class="cardv"><span>💳</span><b>•••• •••• •••• ••••</b><small>Visa · Mastercard · Verve</small></div><small>Click the button to enter your card number, expiry date and CVV in Paystack’s secure window. We never see or store your card details.</small></div>'; l = 'Pay ' + N(t) + ' by card' }
        else { h = '<div class="payb"><b>Pay securely with Paystack</b><br><small>Choose card, bank transfer, USSD or bank app inside the Paystack window.</small></div>'; l = 'Pay ' + N(t) + ' with Paystack' }
    }
    $('#pay').innerHTML = h; b.disabled = !ok; b.style.opacity = ok ? 1 : .5; b.textContent = l
}
async function done(o) {
    const b = $('#pb'); if (b) b.disabled = true;
    const { error } = await sb.from('orders').insert({ name: o.name, student_no: o.sid, school: o.school, phone: o.phone, address: o.addr, payment: o.pay, items: cart.map(i => ({ id: i.id, n: P.find(p => p.id === i.id).n, q: i.q })) });
    if (error) { if (b) b.disabled = false; return toast(o.pay.includes('PAID') ? 'Payment received but the order was not saved. Contact us with: ' + o.pay : 'Could not place order: ' + error.message) }
    cart = []; S.set('sm_cart', cart); toast(o.pay === 'Pay on delivery' ? 'Order placed successfully 🎉' : o.pay === 'Bank transfer' ? 'Order received – awaiting payment confirmation' : 'Payment received – we are confirming it'); location.hash = 'dashboard'
}
function place(ev) {
    ev.preventDefault(); const m = $('#cm').value; payChk(); if ($('#pb').disabled) return;
    const o = { name: $('#cn').value.trim(), sid: $('#cs').value.trim(), school: user().school || '', phone: $('#cp').value.trim(), addr: $('#ca').value.trim(), pay: m };
    if (m === 'Bank transfer' || m === 'Pay on delivery') return done(o);
    if (typeof PaystackPop === 'undefined') return toast('Paystack could not load. Check your internet connection.');
    PaystackPop.setup({ key: PAYSTACK_PUBLIC_KEY.trim(), email: me, amount: (sub() + 1500) * 100, currency: 'NGN', ref: 'SM' + Date.now(), callback: function (r) { o.pay = m + ' – PAID (ref ' + r.reference + ')'; done(o) }, onClose: function () { toast('Payment cancelled') } }).openIframe()
}
async function route(skip, keep) {
    const h = location.hash.slice(1) || 'home';
    if (!skip) { try { await loadP(); if (h === 'dashboard' || h === 'admin') await loadOrders() } catch (e) { toast('Connection problem – check your internet') } }
    $('#app').innerHTML = (V[h] || V.home)(); if (h === 'shop') list(); nav(); if (!keep) window.scrollTo(0, 0)
}
const isA = () => prof && prof.role === 'admin';
async function setSt(id, v) { const { error } = await sb.from('orders').update({ status: v }).eq('id', id); if (error) return toast('Could not update: ' + error.message); orders.find(o => o.id === id).status = v; toast('Status updated ✓') }
function edit(id) { const p = P.find(x => x.id === id); $('#ft').textContent = 'Edit item'; $('#pid').value = id; $('#pn').value = p.n; $('#pc').value = p.c; $('#pp').value = p.p; $('#pn').scrollIntoView({ behavior: 'smooth', block: 'center' }) }
async function del(id) { if (!confirm('Delete this item from the store?')) return; const { error } = await sb.from('products').delete().eq('id', id); if (error) return toast('Could not delete: ' + error.message); await loadP(); route(1, 1) }
function readImg(f) { return new Promise(res => { const r = new FileReader(); r.onload = () => { const i = new Image(); i.onload = () => { const k = Math.min(1, 800 / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = i.width * k; c.height = i.height * k; c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); c.toBlob(res, 'image/jpeg', .82) }; i.src = r.result }; r.readAsDataURL(f) }) }
async function saveP(ev) {
    ev.preventDefault(); const id = +$('#pid').value, old = P.find(p => p.id === id), file = $('#pf').files[0], b = ev.submitter; if (b) b.disabled = true; let url = old ? old.img : '';
    if (file) { const path = 'p' + Date.now() + '.jpg', up = await sb.storage.from('product-images').upload(path, await readImg(file), { contentType: 'image/jpeg' }); if (up.error) { if (b) b.disabled = false; return toast('Photo upload failed: ' + up.error.message) } url = sb.storage.from('product-images').getPublicUrl(path).data.publicUrl }
    const row = { name: $('#pn').value.trim(), category: $('#pc').value, price: +$('#pp').value, image_url: url, emoji: old ? old.e : '🛍️' };
    const r = id ? await sb.from('products').update(row).eq('id', id) : await sb.from('products').insert(row);
    if (r.error) { if (b) b.disabled = false; return toast('Could not save: ' + r.error.message) }
    toast('Item saved – live for everyone ✓'); await loadP(); route(1, 1)
}
addEventListener('hashchange', () => route());
(async () => {
    if (!sb) { $('#app').innerHTML = '<section><div class="wrap"><div class="box empty"><h3>Store not connected yet</h3>Add your Supabase URL and key in js/config.js (see README.txt).</div></div></section>'; return }
    await loadMe(); await route();
    sb.channel('live-products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => { try { await loadP() } catch (e) { return } const h = location.hash.slice(1) || 'home'; if (h === 'shop') list(); else if (h === 'home' || h === 'cart') route(1, 1) }).subscribe()
})();
