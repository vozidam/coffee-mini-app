import {useMemo, useState} from "react";
import menu from "./data/menu.json";
import {useEffect} from "react";

const categories = [
  {id: "all", label: "Все"},
  {id: "coffee", label: "Кофе"},
  {id: "cold", label: "Холодное"},
  {id: "food", label: "Десерты"},
];

function App() {
  const [activeTab, setActiveTab] = useState("menu");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [pickupTime, setPickupTime] = useState("10:15");
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();
  }, []);

  const filteredMenu =
    activeCategory === "all"
      ? menu
      : menu.filter((item) => item.category === activeCategory);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);

      if (found) {
        return prev.map((item) =>
          item.id === product.id
            ? {...item, quantity: item.quantity + 1}
            : item,
        );
      }

      return [...prev, {...product, quantity: 1}];
    });
  };

  const changeQuantity = (id, action) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const quantity =
            action === "plus" ? item.quantity + 1 : item.quantity - 1;
          return {...item, quantity};
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const createOrder = () => {
    if (!cart.length) return;

    const orderNumber = Math.floor(1000 + Math.random() * 9000);

    setLastOrder({
      number: orderNumber,
      total: totalPrice,
      time: pickupTime,
      status: "Готовится",
    });

    setCart([]);
    setActiveTab("orders");
  };

  const goToCart = () => {
    setActiveTab("cart");
  };

  return (
    <div className="app-shell">
      <h1 style={{color: "red", fontSize: "40px"}}>TEST 123</h1>
      <div className="phone">
        <div className="tg-topbar">
          <div className="tg-dot" />
          <div className="tg-title-wrap">
            <span className="tg-title">North Bean Coffee</span>
            <span className="tg-subtitle">бот · mini app demo</span>
          </div>
        </div>

        <div className="hero">
          <div>
            <p className="hero-tag">Предзаказ без очереди</p>
            <h1>North Bean Coffee</h1>
            <p className="hero-text">
              Закажи кофе в Telegram и забери к нужному времени.
            </p>
          </div>
          <div className="hero-badge">7 мин</div>
        </div>

        <main className="content">
          {activeTab === "menu" && (
            <>
              <section className="promo-card">
                <div>
                  <p className="card-label">Акция дня</p>
                  <h2>-20% на круассан</h2>
                  <p className="muted">
                    При заказе любого горячего напитка до 11:00
                  </p>
                </div>
              </section>

              <section className="chips">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={
                      activeCategory === category.id
                        ? "chip active-chip"
                        : "chip"
                    }
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
                  </button>
                ))}
              </section>

              <section className="menu-grid">
                {filteredMenu.map((item) => (
                  <article className="product-card" key={item.id}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="product-image"
                    />

                    <div className="product-body">
                      <div className="product-row">
                        <div>
                          <h3>{item.name}</h3>
                          <p className="muted">{item.description}</p>
                        </div>
                        {item.badge && (
                          <span className="mini-badge">{item.badge}</span>
                        )}
                      </div>

                      <div className="product-footer">
                        <strong>{item.price} ₽</strong>
                        <button
                          className="primary-btn"
                          onClick={() => addToCart(item)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}

          {activeTab === "bonus" && (
            <section className="stack">
              <div className="bonus-main">
                <p className="card-label">Бонусная карта</p>
                <h2>4 / 6 кофе</h2>
                <p className="muted">Еще две покупки — и напиток бесплатно</p>

                <div className="stamp-row">
                  <span className="stamp filled">☕</span>
                  <span className="stamp filled">☕</span>
                  <span className="stamp filled">☕</span>
                  <span className="stamp filled">☕</span>
                  <span className="stamp">☕</span>
                  <span className="stamp">☕</span>
                </div>
              </div>

              <div className="info-card">
                <h3>Промокод</h3>
                <p>
                  <strong>WELCOME10</strong> — скидка 10% на следующий заказ
                </p>
              </div>

              <div className="info-card">
                <h3>Адрес</h3>
                <p>ул. Ленина, 18</p>
                <p className="muted">Ежедневно с 8:00 до 22:00</p>
              </div>
            </section>
          )}

          {activeTab === "cart" && (
            <section className="stack">
              <h2 className="section-title">Корзина</h2>

              {!cart.length ? (
                <div className="empty-card">
                  <p>Корзина пока пустая</p>
                  <p className="muted">Добавь что-нибудь из меню</p>
                </div>
              ) : (
                <>
                  <div className="cart-list">
                    {cart.map((item) => (
                      <div className="cart-item" key={item.id}>
                        <div>
                          <h3>{item.name}</h3>
                          <p className="muted">{item.price} ₽ за 1 шт.</p>
                        </div>

                        <div className="qty-box">
                          <button
                            onClick={() => changeQuantity(item.id, "minus")}
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => changeQuantity(item.id, "plus")}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="info-card">
                    <label className="input-label">Время самовывоза</label>
                    <input
                      className="time-input"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                    />
                  </div>

                  <div className="checkout-card">
                    <div className="checkout-row">
                      <span>Товаров</span>
                      <strong>{totalItems}</strong>
                    </div>
                    <div className="checkout-row">
                      <span>Итого</span>
                      <strong>{totalPrice} ₽</strong>
                    </div>

                    <button className="checkout-btn" onClick={createOrder}>
                      Подтвердить заказ
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === "orders" && (
            <section className="stack">
              <h2 className="section-title">Мой заказ</h2>

              {lastOrder ? (
                <div className="order-card">
                  <p className="card-label">Заказ оформлен</p>
                  <h2>#{lastOrder.number}</h2>
                  <p>Забрать в {lastOrder.time}</p>
                  <p className="muted">Сумма: {lastOrder.total} ₽</p>

                  <div className="order-steps">
                    <div className="order-step done">1. Принят</div>
                    <div className="order-step active-step">2. Готовится</div>
                    <div className="order-step">3. Можно забирать</div>
                  </div>
                </div>
              ) : (
                <div className="empty-card">
                  <p>Пока нет заказов</p>
                  <p className="muted">Оформи первый предзаказ в меню</p>
                </div>
              )}
            </section>
          )}
        </main>

        {activeTab === "menu" && cart.length > 0 && (
          <button className="floating-cart" onClick={goToCart}>
            <span>Корзина · {totalItems}</span>
            <strong>{totalPrice} ₽</strong>
          </button>
        )}

        <nav className="bottom-nav">
          <button
            className={activeTab === "menu" ? "nav-btn active-nav" : "nav-btn"}
            onClick={() => setActiveTab("menu")}
          >
            Меню
          </button>
          <button
            className={activeTab === "bonus" ? "nav-btn active-nav" : "nav-btn"}
            onClick={() => setActiveTab("bonus")}
          >
            Бонусы
          </button>
          <button
            className={activeTab === "cart" ? "nav-btn active-nav" : "nav-btn"}
            onClick={() => setActiveTab("cart")}
          >
            Корзина
          </button>
          <button
            className={
              activeTab === "orders" ? "nav-btn active-nav" : "nav-btn"
            }
            onClick={() => setActiveTab("orders")}
          >
            Заказы
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;
