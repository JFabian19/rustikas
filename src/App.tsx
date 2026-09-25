import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, Flame, ImageOff, LocateFixed, MapPin, Menu, MessageCircle, Minus, Phone, Plus, ShoppingBag, Store, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { DEFAULT_MENU_DATA, type Dish } from './data/menuData';
import { fetchMenuData } from './services/googleSheets';

const WHATSAPP_NUMBER = '51915146103';
const PHONE_DISPLAY = '915 146 103';
const DELIVERY_FEE = 5;
const CHICKEN_PARTS = ['Pecho', 'Pierna', 'Rabadilla', 'Rabadilla con cuello', 'Ala'];
const CREAMS = ['Ketchup', 'Mayonesa', 'Mostaza', 'Ají'];
const CONFIGURABLE_CATEGORIES = new Set(['menu-brasa', 'pollos', 'mostros', 'mostrazos', 'combos', 'chifa']);

const hasPresaOption = (dish?: Dish, categoryId?: string) => {
  if (!dish || !categoryId) return false;
  if (categoryId === 'pollos' || categoryId === 'mostros' || categoryId === 'mostrazos') return true;
  const text = `${dish.nombre} ${dish.descripcion || ''}`.toLowerCase();
  return text.includes('pollo') || text.includes('1/8') || text.includes('1/4') || text.includes('1/2') || text.includes('mostr') || text.includes('broaster') || text.includes('brasa');
};

const STORES = [
  {
    id: 'morro-arica',
    name: 'Local 1 - Morro de Arica',
    address: 'Morro de Arica - Curva del reservorio',
    shortName: 'Local 1 (Morro de Arica)',
    tag: 'Principal',
    badgeClass: 'tag-primary',
  },
  {
    id: 'carmen-alto',
    name: 'Local 2 - Carmen Alto',
    address: 'Jr. Huancavelica - Arco Carmen Alto',
    shortName: 'Local 2 (Carmen Alto)',
    tag: 'Sucursal',
    badgeClass: 'tag-secondary',
  },
];

interface CartItem { id: string; nombre: string; precio: string; cantidad: number; presas: string[]; cremas: string[]; nota: string; }
interface PendingDish { dish: Dish; categoryId: string; }

export default function App() {
  const [menuData, setMenuData] = useState(DEFAULT_MENU_DATA);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState(DEFAULT_MENU_DATA[0].id);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [pendingDish, setPendingDish] = useState<PendingDish | null>(null);
  const [selectedPresas, setSelectedPresas] = useState<string[]>([]);
  const [selectedCreams, setSelectedCreams] = useState<string[]>([]);
  const [itemNote, setItemNote] = useState('');
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedStore, setSelectedStore] = useState(STORES[0].id);
  const [customer, setCustomer] = useState({ name: '', address: '', reference: '', phone: '', payment: 'Yape' });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    let active = true;
    const updateMenu = async () => {
      const remoteMenu = await fetchMenuData();
      if (active && remoteMenu) {
        setMenuData(remoteMenu);
        setActiveCategory((current) => remoteMenu.some((category) => category.id === current) ? current : remoteMenu[0].id);
      }
    };

    void updateMenu();
    const refresh = window.setInterval(() => void updateMenu(), 60_000);
    return () => { active = false; window.clearInterval(refresh); };
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.cantidad, 0), [cart]);
  const productsTotal = useMemo(() => cart.reduce((sum, item) => sum + Number.parseFloat(item.precio.replace(/[^\d.]/g, '')) * item.cantidad, 0), [cart]);
  const deliveryFee = fulfillment === 'delivery' ? DELIVERY_FEE : 0;
  const total = productsTotal + deliveryFee;

  const addToCart = (dish: Dish, presas: string[] = [], cremas: string[] = [], nota = '') => {
    const trimmedNote = nota.trim();
    const id = `${dish.nombre}-${dish.precio}-${presas.join(',')}-${cremas.join(',')}-${trimmedNote}`;
    setCart((items) => {
      const existing = items.find((item) => item.id === id);
      return existing ? items.map((item) => item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item) : [...items, { id, nombre: dish.nombre, precio: dish.precio, cantidad: 1, presas, cremas, nota: trimmedNote }];
    });
  };
  const startAdd = (dish: Dish, categoryId: string) => {
    if (!CONFIGURABLE_CATEGORIES.has(categoryId)) { addToCart(dish); return; }
    setSelectedPresas([]); setSelectedCreams([]); setItemNote(''); setPendingDish({ dish, categoryId });
  };
  const changeQuantity = (id: string, amount: number) => setCart((items) => items.map((item) => item.id === id ? { ...item, cantidad: item.cantidad + amount } : item).filter((item) => item.cantidad > 0));
  const selectCategory = (id: string) => { setActiveCategory(id); setShowMenu(false); document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const togglePresa = (part: string) => setSelectedPresas((selected) => selected.includes(part) ? selected.filter((item) => item !== part) : [...selected, part]);
  const toggleCream = (cream: string) => setSelectedCreams((selected) => selected.includes(cream) ? selected.filter((item) => item !== cream) : [...selected, cream]);
  const confirmConfiguredDish = () => { if (pendingDish) { addToCart(pendingDish.dish, selectedPresas, selectedCreams, itemNote); setPendingDish(null); setSelectedPresas([]); setSelectedCreams([]); setItemNote(''); } };
  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('Tu navegador no permite compartir ubicación.'); return; }
    setLocationError(false); setLocationStatus('Solicitando permiso para tu ubicación…');
    navigator.geolocation.getCurrentPosition(({ coords }) => { setLocation({ latitude: coords.latitude, longitude: coords.longitude }); setLocationStatus('Ubicación agregada a tu pedido.'); }, () => { setLocationError(true); setLocationStatus('No pudimos obtener tu ubicación. Puedes volver a intentarlo o continuar con la dirección y referencia.'); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };
  const sendToWhatsApp = () => {
    const detail = cart.map((item, index) => {
      const extras = [
        item.presas.length ? `   • Presa: ${item.presas.join(', ')}` : '',
        item.cremas.length ? `   • Cremas: ${item.cremas.join(', ')}` : '',
        item.nota ? `   • Obs.: ${item.nota}` : '',
      ].filter(Boolean).join('\n');
      const unitPrice = Number.parseFloat(item.precio.replace(/[^\d.]/g, '')) * item.cantidad;
      return `*${index + 1}. ${item.nombre}* × ${item.cantidad}\n   S/ ${unitPrice.toFixed(2)}${extras ? `\n${extras}` : ''}`;
    }).join('\n\n');
    const storeObj = STORES.find((s) => s.id === selectedStore) || STORES[0];
    const logistics = fulfillment === 'delivery'
      ? `*ENTREGA*\n🛵 Delivery\n👤 ${customer.name}\n🏬 *Despacho desde:* ${storeObj.name}\n📍 Dirección: ${customer.address}${customer.reference.trim() ? `\n🏷️ Ref.: ${customer.reference}` : ''}${location ? `\n🗺️ Ubicación: https://www.google.com/maps?q=${location.latitude},${location.longitude}` : ''}`
      : `*ENTREGA*\n🛍️ Recoger en tienda\n👤 ${customer.name}\n📞 ${customer.phone}\n🏬 *Tienda de recojo:* ${storeObj.name}\n📍 Dirección: ${storeObj.address}`;
    const message = `🍗 *NUEVO PEDIDO · RUSTIKAS*\n━━━━━━━━━━━━━━━━\n\n*TU PEDIDO*\n${detail}\n\n━━━━━━━━━━━━━━━━\nProductos: S/ ${productsTotal.toFixed(2)}${deliveryFee > 0 ? `\nDelivery: S/ ${deliveryFee.toFixed(2)}` : ''}\n*TOTAL ESTIMADO: S/ ${total.toFixed(2)}*\n\n━━━━━━━━━━━━━━━━\n${logistics}\n💳 Pago: *${customer.payment}*`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };
  const checkoutReady = fulfillment === 'delivery' ? customer.name.trim().length > 0 && customer.address.trim().length > 0 : customer.name.trim().length > 0 && customer.phone.trim().length > 0;

  return <div className="site-shell"><div className="menu-page">
    <header className="topbar"><a href="#inicio" className="header-brand" aria-label="Inicio de Rustikas"><img src="/logo-rustikas.webp" alt="Rustikas Logo" className="header-logo-img" /><div className="brand-text-wrap"><span className="brand-title">RUSTIKAS</span><span className="brand-subtitle">POLLERÍA & GRILL</span></div></a><div className="header-actions"><a href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`} className="phone-action" aria-label={`Llamar al ${PHONE_DISPLAY}`}><Phone size={16} /> <span>{PHONE_DISPLAY}</span></a><button className="cart-icon" onClick={() => cartCount > 0 && setShowCart(true)} aria-label="Ver pedido"><ShoppingBag size={21} />{cartCount > 0 && <span>{cartCount}</span>}</button><button className="mobile-menu" onClick={() => setShowMenu((visible) => !visible)} aria-label="Ver categorías">{showMenu ? <X size={21} /> : <Menu size={21} />}</button></div></header>
    <div className="ember-strip" aria-hidden="true"><span>POLLERÍA · CHIFA · RESTAURANT · PEDIDOS AL {PHONE_DISPLAY} · </span><span>POLLERÍA · CHIFA · RESTAURANT · PEDIDOS AL {PHONE_DISPLAY} · </span></div>
    <section id="inicio" className="hero-section"><img className="hero-image" src="/hero-rustikas.webp" alt="Pollo a la brasa Rustikas" /><div className="hero-shade" /><div className="hero-content"><div className="hero-badge-kicker"><Flame size={14} fill="currentColor" /> RUSTIKAS POLLOS & PARRILLAS</div><div className="hero-headline"><span className="hero-script">Sabor que conquista</span><h1 className="hero-title">PALADARES<svg className="brush-line" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 7C45 2 135 1 198 6C150 9 70 9 20 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></h1></div><p>Pollo jugoso, piel crocante y el auténtico sabor tradicional que enciende tus sentidos.</p><button className="hero-cta" onClick={() => selectCategory('menu-brasa')}>Ver la carta <ChevronRight size={18} /></button><div className="hero-social-links" aria-label="Encuéntranos en redes y ubicación"><span>Síguenos</span><div><a className="hero-social facebook-link" href="https://www.facebook.com/profile.php?id=61551461395500&locale=es_LA#" target="_blank" rel="noreferrer" aria-label="Visitar Facebook de Rustikas"><img src="/facebook-logo.webp" alt="" /></a><a className="hero-social maps-link" href="https://www.google.com/maps/place/Rustikasa+(pollos+y+parrillas)/@-13.1793237,-74.2106207,17z/data=!3m1!4b1!4m6!3m5!1s0x9112870068d2b2e9:0x85f9c61ef4544fa9!8m2!3d-13.1793289!4d-74.2080458!16s%2Fg%2F11z59gwjj_!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" aria-label="Ver ubicación de Rustikas en Google Maps"><img src="/maps-logo.webp" alt="" /></a></div></div></div></section>
    <nav className={`category-nav ${showMenu ? 'is-open' : ''}`} aria-label="Categorías de la carta"><div className="category-nav-inner">{menuData.map((category) => <button key={category.id} onClick={() => selectCategory(category.id)} className={`${activeCategory === category.id ? 'active' : ''} ${category.destacada ? 'promotion-nav' : ''}`}>{category.nombre}</button>)}</div></nav>
      <main className="menu-content"><div className="intro-line"><span>LA CARTA</span><i /><span>RUSTIKAS</span></div>{menuData.map((category, categoryIndex) => <section id={`category-${category.id}`} key={category.id} className={`category-section ${category.destacada ? 'promotion-section' : ''}`}><div className="category-heading"><div className="heading-number">0{categoryIndex + 1}</div><div><p>{category.destacada ? 'PROMOCIÓN ESPECIAL' : 'ESPECIALIDADES'}</p><h2>{category.nombre}</h2>{category.horario && <span className="promotion-schedule">{category.horario}</span>}</div><div className="heading-flame"><Flame size={30} fill="currentColor" /></div></div>{category.items.length > 0 ? <div className="dish-grid">{category.items.map((dish) => <motion.article key={`${category.id}-${dish.nombre}`} whileHover={{ y: -4 }} transition={{ duration: 0.18 }} className={`dish-card ${category.destacada ? 'promotion-card' : ''}`}>{dish.imagen ? <div className={`dish-media ${category.destacada ? 'promotion-dish-media' : ''}`}><img className={category.destacada ? 'promotion-dish-image' : 'dish-image'} src={dish.imagen} alt={dish.nombre} loading="lazy" decoding="async" /></div> : <div className="dish-photo-placeholder" aria-label="Imagen del plato pendiente"><ImageOff size={21} /><span>IMAGEN<br />DEL PLATO</span></div>}<div className="dish-copy"><h3>{dish.nombre}</h3>{dish.descripcion && <p>{dish.descripcion}</p>}<div className="dish-bottom"><strong>{dish.precio}</strong><button onClick={() => startAdd(dish, category.id)} aria-label={`Agregar ${dish.nombre} al pedido`}><Plus size={18} strokeWidth={3} /></button></div></div></motion.article>)}</div> : <div className="empty-category-card"><p>Próximamente más platos en esta categoría.</p></div>}</section>)}</main>
    <footer className="site-footer"><img src="/logo-rustikas.webp" alt="Rustikas Pollería & Grill" /><p>Pollería · Chifa · Restaurant</p><a href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`}><Phone size={16} /> Pedidos: {PHONE_DISPLAY}</a><span>© 2026 Rustikas. Todos los derechos reservados.</span></footer>
  </div>
  <AnimatePresence>{cartCount > 0 && !showCart && !showCheckout && <motion.button initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} className="floating-cart" onClick={() => setShowCart(true)}><span className="floating-cart-icon"><ShoppingBag size={19} /></span><span><small>Tu pedido</small>{cartCount} {cartCount === 1 ? 'plato' : 'platos'}</span><b>S/ {total.toFixed(2)}</b><ChevronRight size={18} /></motion.button>}</AnimatePresence>
  <AnimatePresence>{pendingDish && <motion.div className="modal-backdrop config-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section className="config-panel" initial={{ y: 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 35, opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="config-title"><button className="close-button" onClick={() => setPendingDish(null)} aria-label="Cerrar configuración"><X size={20} /></button><p className="panel-eyebrow">PERSONALIZA TU PEDIDO</p><h2 id="config-title">{pendingDish.dish.nombre}</h2><p className="config-intro">{pendingDish.dish.descripcion || 'Personaliza las opciones de tu plato antes de agregarlo al pedido.'}</p>{hasPresaOption(pendingDish.dish, pendingDish.categoryId) && <div className="config-section"><div className="config-label-row"><label>Parte de presa <small className="config-label-sub">(Opcional)</small></label></div><div className="presa-options">{CHICKEN_PARTS.map((part) => <label key={part} className={`presa-option ${selectedPresas.includes(part) ? 'selected' : ''}`}><input type="checkbox" checked={selectedPresas.includes(part)} onChange={() => togglePresa(part)} /><span>{part}</span></label>)}</div></div>}<div className="config-section"><div className="config-label-row"><label>Cremas</label><button type="button" className="select-all" onClick={() => setSelectedCreams(selectedCreams.length === CREAMS.length ? [] : [...CREAMS])}>{selectedCreams.length === CREAMS.length ? 'Quitar todas' : 'Seleccionar todas'}</button></div><div className="cream-options">{CREAMS.map((cream) => <label key={cream} className={`cream-option ${selectedCreams.includes(cream) ? 'selected' : ''}`}><input type="checkbox" checked={selectedCreams.includes(cream)} onChange={() => toggleCream(cream)} /><span>{cream}</span></label>)}</div></div><label className="note-field"><span>Observaciones <small>Opcional</small></span><textarea value={itemNote} onChange={(event) => setItemNote(event.target.value)} placeholder="Ej.: presa bien dorada, sin ensalada, cremas aparte…" maxLength={240} /></label><button className="place-order" onClick={confirmConfiguredDish}>Agregar al pedido <Plus size={19} /></button></motion.section></motion.div>}</AnimatePresence>
  <AnimatePresence>{showCart && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="order-panel" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}><button className="close-button" onClick={() => setShowCart(false)} aria-label="Cerrar pedido"><X size={20} /></button><div className="panel-title"><ShoppingBag size={23} /><div><span>ESTÁS PIDIENDO</span><h2>Tu pedido</h2></div></div><div className="order-list">{cart.map((item) => <div className="order-row" key={item.id}><div><h3>{item.nombre}</h3><p>{item.precio}</p>{item.presas.length > 0 && <small>🍗 Presa: {item.presas.join(', ')}</small>}{item.cremas.length > 0 && <small>🥣 Cremas: {item.cremas.join(', ')}</small>}{item.nota && <small>📝 Obs.: {item.nota}</small>}</div><div className="quantity-controls"><button onClick={() => changeQuantity(item.id, -1)}><Minus size={15} /></button><span>{item.cantidad}</span><button onClick={() => changeQuantity(item.id, 1)}><Plus size={15} /></button></div><button className="remove-item" onClick={() => changeQuantity(item.id, -item.cantidad)} aria-label={`Eliminar ${item.nombre}`}><Trash2 size={17} /></button></div>)}</div><div className="totals-breakdown"><div><span>Productos</span><b>S/ {productsTotal.toFixed(2)}</b></div>{deliveryFee > 0 && <div><span>Delivery <small>Tarifa única por pedido</small></span><b>S/ {deliveryFee.toFixed(2)}</b></div>}</div><div className="total-row"><span>Total estimado</span><strong>S/ {total.toFixed(2)}</strong></div><button className="place-order" onClick={() => { setShowCart(false); setShowCheckout(true); }}>Enviar pedido <ChevronRight size={20} /></button></motion.div></motion.div>}</AnimatePresence>
  <AnimatePresence>{showCheckout && <motion.div className="modal-backdrop checkout-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section className="checkout-panel" initial={{ scale: 0.96, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 18 }} role="dialog" aria-modal="true" aria-labelledby="checkout-title"><button className="close-button" onClick={() => setShowCheckout(false)} aria-label="Cerrar"><X size={20} /></button><div className="delivery-icon"><Flame size={31} fill="currentColor" /></div><p className="panel-eyebrow">CASI LISTO</p><h2 id="checkout-title">¿Cómo recibes tu pedido?</h2><div className="fulfillment-tabs"><button className={fulfillment === 'delivery' ? 'active' : ''} onClick={() => setFulfillment('delivery')}><MapPin size={17} /> Delivery</button><button className={fulfillment === 'pickup' ? 'active' : ''} onClick={() => setFulfillment('pickup')}><ShoppingBag size={17} /> Recoger en tienda</button></div><div className="checkout-fields"><label>Nombre<input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Tu nombre" autoComplete="name" /></label>{fulfillment === 'delivery' ? <><div className="store-selector-group"><div className="store-group-header"><div className="store-header-icon"><MapPin size={16} /></div><div><span className="store-header-kicker">SUCURSAL DE DESPACHO</span><h3 className="store-group-label">¿Desde qué local deseas que te llegue el pedido?</h3></div></div><div className="store-cards">{STORES.map((st) => { const active = selectedStore === st.id; return (<label key={`del-${st.id}`} className={`store-card ${active ? 'is-selected' : ''}`}><input type="radio" name="deliveryStore" value={st.id} checked={active} onChange={() => setSelectedStore(st.id)} className="store-radio-hidden" /><div className="store-card-icon-box"><Store size={18} /></div><div className="store-card-info"><div className="store-name-row"><span className="store-title-text">{st.name}</span><span className={`store-tag-pill ${st.badgeClass}`}>{st.tag}</span></div><p className="store-address-text"><MapPin size={12} className="pin-icon" /><span>{st.address}</span></p><div className="store-badge-status"><span className="live-dot" /><span>Disponible para despacho hoy</span></div></div><div className="store-card-check"><div className={`check-circle ${active ? 'checked' : ''}`}>{active && <Check size={12} strokeWidth={3.5} />}</div></div></label>); })}</div></div><label>Dirección<input value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Av., calle, número, distrito…" autoComplete="street-address" /></label><label>Referencia <small>Opcional</small><input value={customer.reference} onChange={(event) => setCustomer({ ...customer, reference: event.target.value })} placeholder="Ej.: portón negro, frente al parque…" /></label><div className={`location-card ${locationError ? 'has-error' : ''}`}><p><strong>Comparte tu ubicación en tiempo real</strong>Dale clic al botón y acepta los permisos para compartir tu ubicación con el restaurante.</p><button type="button" onClick={requestLocation}><LocateFixed size={17} /> {location ? 'Ubicación agregada' : locationError ? 'Volver a intentar' : 'Obtener ubicación en tiempo real'}</button>{locationStatus && <small>{locationStatus}</small>}</div></> : <><label>Teléfono<input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Tu número de celular" inputMode="tel" autoComplete="tel" /></label><div className="store-selector-group"><div className="store-group-header"><div className="store-header-icon"><Store size={16} /></div><div><span className="store-header-kicker">PUNTO DE ENTREGA</span><h3 className="store-group-label">¿En qué tienda deseas recoger tu pedido?</h3></div></div><div className="store-cards">{STORES.map((st) => { const active = selectedStore === st.id; return (<label key={`pick-${st.id}`} className={`store-card ${active ? 'is-selected' : ''}`}><input type="radio" name="pickupStore" value={st.id} checked={active} onChange={() => setSelectedStore(st.id)} className="store-radio-hidden" /><div className="store-card-icon-box"><Store size={18} /></div><div className="store-card-info"><div className="store-name-row"><span className="store-title-text">{st.name}</span><span className={`store-tag-pill ${st.badgeClass}`}>{st.tag}</span></div><p className="store-address-text"><MapPin size={12} className="pin-icon" /><span>{st.address}</span></p><div className="store-badge-status"><span className="live-dot" /><span>Disponible para recojo hoy</span></div></div><div className="store-card-check"><div className={`check-circle ${active ? 'checked' : ''}`}>{active && <Check size={12} strokeWidth={3.5} />}</div></div></label>); })}</div></div></>}</div><fieldset className="payment-methods"><legend>Método de pago</legend>{['Yape', 'Tarjeta', 'Efectivo'].map((method) => <label key={method}><input type="radio" name="payment" value={method} checked={customer.payment === method} onChange={() => setCustomer({ ...customer, payment: method })} />{method}</label>)}</fieldset><div className="checkout-total"><span>Total estimado {deliveryFee > 0 && <small>Incluye S/ {deliveryFee.toFixed(2)} de delivery</small>}</span><strong>S/ {total.toFixed(2)}</strong></div><button className="whatsapp-button" disabled={!checkoutReady} onClick={sendToWhatsApp}><MessageCircle size={20} /> Enviar pedido</button></motion.section></motion.div>}</AnimatePresence>
  </div>;
}
