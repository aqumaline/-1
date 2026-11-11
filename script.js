'use strict';
const PRODUCTS = [
  {id:1,name:'Редис «Рубин»',cat:'Наборы',emoji:'🌱',bg:'#fde2dc',price:890,rating:4.9,days:7,hit:true,desc:'Острый, хрустящий, самый быстрый в наборе.'},
  {id:2,name:'Подсолнух «Хруст»',cat:'Наборы',emoji:'🌻',bg:'#fbefc2',price:990,rating:4.8,days:9,hit:true,desc:'Ореховый вкус, идеален для салатов и бутербродов.'},
  {id:3,name:'Горох «Сладкий»',cat:'Наборы',emoji:'🫛',bg:'#dff0d3',price:950,rating:4.7,days:8,hit:false,desc:'Нежные побеги со вкусом свежего гороха.'},
  {id:4,name:'Базилик «Генуя»',cat:'Травы',emoji:'🌿',bg:'#cfe9d6',price:1150,rating:4.9,days:14,hit:true,desc:'Ароматный базилик для пасты и пиццы.'},
  {id:5,name:'Кинза «Свежесть»',cat:'Травы',emoji:'🍃',bg:'#e4f2d0',price:1050,rating:4.6,days:12,hit:false,desc:'Яркий вкус, растёт плотным ковром.'},
  {id:6,name:'Лоток «Хоум» с крышкой',cat:'Аксессуары',emoji:'🧺',bg:'#e9dccd',price:1490,rating:4.8,days:0,hit:false,desc:'Многоразовый лоток с дренажем и крышкой-парником.'},
  {id:7,name:'Био-коврики, 10 шт.',cat:'Аксессуары',emoji:'🧻',bg:'#ece7d8',price:490,rating:4.7,days:0,hit:false,desc:'Заменяют землю, полностью компостируются.'},
  {id:8,name:'Стартовый микс (4 вида)',cat:'Подарки',emoji:'🎁',bg:'#fcd9cf',price:2990,rating:5.0,days:7,hit:true,desc:'Редис, горох, подсолнух и базилик в подарочной коробке.'}
];
const $ = (s, r = document) => r.querySelector(s);
const fmt = n => n.toLocaleString('ru-RU') + ' сом';
const state = {cat:'Все', q:'', sort:'def', cart:[]};
try { state.cart = JSON.parse(localStorage.getItem('rostok-cart')) || []; } catch (e) { state.cart = []; }
const save = () => { try { localStorage.setItem('rostok-cart', JSON.stringify(state.cart)); } catch (e) {} };

function toast(text, bad) {
  const t = document.createElement('div');
  t.className = 'toast' + (bad ? ' bad' : '');
  t.textContent = text;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function card(p) {
  return `<article class="card product reveal"><div class="thumb" style="background:${p.bg}"><span>${p.emoji}</span>${p.hit ? '<em class="tag" style="font-style:normal">Хит</em>' : ''}</div>
  <div class="pbody"><h3>${p.name}</h3><p>${p.desc}</p><div class="meta">★ ${p.rating}${p.days ? ' · урожай за ' + p.days + ' дн.' : ''}</div>
  <div class="buy"><span class="price">${fmt(p.price)}</span><button class="add" data-id="${p.id}">В корзину</button></div></div></article>`;
}

function renderCatalog() {
  let list = PRODUCTS.filter(p => (state.cat === 'Все' || p.cat === state.cat) && (p.name + p.desc).toLowerCase().includes(state.q));
  if (state.sort === 'asc') list.sort((a, b) => a.price - b.price);
  if (state.sort === 'desc') list.sort((a, b) => b.price - a.price);
  if (state.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  $('#products').innerHTML = list.map(card).join('');
  $('#empty').hidden = list.length > 0;
  observe();
}

function renderChips() {
  const cats = ['Все', ...new Set(PRODUCTS.map(p => p.cat))];
  $('#chips').innerHTML = cats.map(c => `<button class="chip${c === state.cat ? ' active' : ''}" data-cat="${c}">${c}</button>`).join('');
}

function renderCart() {
  const box = $('#cartItems');
  const total = state.cart.reduce((s, i) => s + i.qty * PRODUCTS.find(p => p.id === i.id).price, 0);
  $('#cartCount').textContent = state.cart.reduce((s, i) => s + i.qty, 0);
  $('#cartTotal').textContent = fmt(total);
  $('#orderForm').hidden = !state.cart.length;
  box.innerHTML = state.cart.length ? state.cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `<div class="item"><div class="em">${p.emoji}</div><div><b>${p.name}</b><br><small>${fmt(p.price)}</small>
    <div class="qty"><button data-d="-1" data-id="${p.id}" aria-label="Меньше">−</button>${i.qty}<button data-d="1" data-id="${p.id}" aria-label="Больше">+</button></div></div>
    <button class="rm" data-rm="${p.id}">Удалить</button></div>`;
  }).join('') : '<p class="empty">В корзине пока пусто. Выберите набор в каталоге.</p>';
  save();
}

function addToCart(id) {
  const it = state.cart.find(i => i.id === id);
  it ? it.qty++ : state.cart.push({id, qty:1});
  renderCart();
  toast('Добавлено в корзину: ' + PRODUCTS.find(p => p.id === id).name);
}

function openCart(open) {
  $('#drawer').classList.toggle('open', open);
  $('#overlay').classList.toggle('show', open);
  $('#drawer').setAttribute('aria-hidden', String(!open));
}

function validate(form, rules) {
  let ok = true;
  rules.forEach(([name, test, msg]) => {
    const f = form.elements[name], v = f.value.trim();
    const bad = !test(v);
    f.classList.toggle('invalid', bad);
    f.parentElement.querySelector('.err').textContent = bad ? msg : '';
    if (bad) ok = false;
  });
  return ok;
}

document.addEventListener('click', e => {
  const t = e.target;
  if (t.matches('.add')) addToCart(+t.dataset.id);
  if (t.matches('.chip')) { state.cat = t.dataset.cat; renderChips(); renderCatalog(); }
  if (t.dataset.d) {
    const it = state.cart.find(i => i.id === +t.dataset.id);
    it.qty += +t.dataset.d;
    if (it.qty < 1) state.cart = state.cart.filter(i => i !== it);
    renderCart();
  }
  if (t.dataset.rm) { state.cart = state.cart.filter(i => i.id !== +t.dataset.rm); renderCart(); }
  if (t.closest('.nav a')) closeMenu();
});

function closeMenu() { $('#nav').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false'); }
$('#burger').addEventListener('click', () => {
  const open = $('#nav').classList.toggle('open');
  $('#burger').setAttribute('aria-expanded', String(open));
});
$('#cartBtn').addEventListener('click', () => openCart(true));
$('#closeCart').addEventListener('click', () => openCart(false));
$('#overlay').addEventListener('click', () => openCart(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { openCart(false); closeMenu(); } });
$('#search').addEventListener('input', e => { state.q = e.target.value.trim().toLowerCase(); renderCatalog(); });
$('#sort').addEventListener('change', e => { state.sort = e.target.value; renderCatalog(); });
$('#subBtn').addEventListener('click', () => { addToCart(8); openCart(true); toast('Подписка: добавлен стартовый микс, скидка 15% будет применена менеджером'); });

$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (validate(f, [['name', v => v.length >= 2, 'Введите имя (минимум 2 символа)'], ['email', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Введите корректный email, например name@mail.com'], ['msg', v => v.length >= 10, 'Напишите сообщение (минимум 10 символов)']])) {
    f.reset(); toast('Сообщение отправлено. Мы ответим в течение дня.');
  } else toast('Проверьте поля формы', true);
});

$('#orderForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  if (validate(f, [['name', v => v.length >= 2, 'Введите имя'], ['phone', v => v.replace(/\D/g, '').length >= 9, 'Введите телефон, минимум 9 цифр']])) {
    state.cart = []; f.reset(); renderCart(); openCart(false);
    toast('Заказ оформлен. Менеджер позвонит вам в ближайшее время.');
  } else toast('Проверьте данные заказа', true);
});

let io;
function observe() {
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')); return; }
  io = io || new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), {threshold:.12});
  document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
}

window.addEventListener('scroll', () => $('#header').classList.toggle('scrolled', scrollY > 10), {passive:true});
$('#year').textContent = new Date().getFullYear();
$('#popularGrid').innerHTML = PRODUCTS.filter(p => p.hit).slice(0, 3).map(card).join('');
renderChips(); renderCatalog(); renderCart(); observe();
