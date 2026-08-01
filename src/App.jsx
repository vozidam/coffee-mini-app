import {useMemo, useState, useEffect, useRef} from "react";
import menu from "./data/menu.json";

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

  const timeInputRef = useRef(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();
  }, []);

  const openTimePicker = () => {
    if (timeInputRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        timeInputRef.current.showPicker();
      } else {
        timeInputRef.current.click();
      }
    }
  };

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
      <div className="phone">
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
              <div className="section-header">
                <button
                  className="back-btn"
                  onClick={() => setActiveTab("menu")}
                >
                  ←
                </button>
                <h2 className="section-title">Бонусы</h2>
              </div>

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
              <div className="section-header">
                <button
                  className="back-btn"
                  onClick={() => setActiveTab("menu")}
                >
                  ←
                </button>
                <h2 className="section-title">Корзина</h2>
              </div>

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
                    <div className="time-info-header">
                      <span className="input-label">Время самовывоза</span>
                      <span className="time-val">{pickupTime}</span>
                    </div>

                    <div className="time-picker-wrap">
                      <button
                        type="button"
                        className="time-btn"
                        onClick={openTimePicker}
                      >
                        🕒 Выбрать время
                      </button>

                      <input
                        ref={timeInputRef}
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: "-10px",
                          opacity: 0,
                          pointerEvents: "none",
                          width: "1px",
                          height: "1px",
                        }}
                      />
                    </div>
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
              <div className="section-header">
                <button
                  className="back-btn"
                  onClick={() => setActiveTab("menu")}
                >
                  ←
                </button>
                <h2 className="section-title">Мой заказ</h2>
              </div>

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
      </div>
    </div>
  );
}

export default App;
