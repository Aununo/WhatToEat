import { useMemo, useState } from "react";
import { appleGallery, androidGallery } from "./data";

const TABS = [
  { id: "apple", label: "Apple", items: appleGallery },
  { id: "android", label: "Android", items: androidGallery }
];

function Card({ item }) {
  return (
    <article className="card">
      <div className="card-image">
        {item.image ? <img src={item.image} alt={item.name} loading="lazy" /> : <div className="card-image-empty" />}
      </div>
      <div className="card-body">
        <h3 className="card-name">{item.name}</h3>
        <p className="card-price">¥{item.price}</p>
      </div>
    </article>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("apple");
  const [query, setQuery] = useState("");

  const activeItems = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    const items = tab ? tab.items : [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [activeTab, query]);

  return (
    <div className="app">
      <header className="page-header">
        <h1>WhatToEat</h1>
        <div className="tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          className="search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索名字"
        />
      </header>

      <main className="page-main">
        {activeItems.length === 0 ? (
          <p className="empty">没有匹配的结果</p>
        ) : (
          <div className="grid">
            {activeItems.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
