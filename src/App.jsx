import React, { useState, useEffect, useRef } from 'react';

// Unified Brand Configuration mimicking real-world NZ logos
const STORE_BRANDS = {
  ALL: {
    name: 'ALL',
    bg: '#27272a',
    text: '#a3e635',
    border: 'rgba(163, 230, 53, 0.4)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
  },
  PAKnSAVE: {
    name: 'PAKnSAVE',
    bg: '#FACC15',
    text: '#000000',
    border: '#EAB308',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  'New World': {
    name: 'New World',
    bg: '#DC2626',
    text: '#FFFFFF',
    border: '#B91C1C',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  Woolworths: {
    name: 'Woolworths',
    bg: '#16A34A',
    text: '#FFFFFF',
    border: '#15803D',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" /><path d="M12 2v2" />
      </svg>
    ),
  },
  Bunnings: {
    name: 'Bunnings',
    bg: '#047857',
    text: '#FFFFFF',
    border: '#065F46',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  'Mitre 10': {
    name: 'Mitre 10',
    bg: '#F97316',
    text: '#000000',
    border: '#EA580C',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  Other: {
    name: 'Other',
    bg: '#3F3F46',
    text: '#FFFFFF',
    border: '#52525B',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="m10 15 5-3-5-3v6Z" />
      </svg>
    ),
  },
};

function StoreBadge({ store }) {
  const brand = STORE_BRANDS[store] || STORE_BRANDS['Other'];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '9999px',
        backgroundColor: brand.bg,
        color: brand.text,
        border: `1px solid ${brand.border}`,
        fontSize: '11px',
        fontWeight: 800,
        letterSpacing: '0.3px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {brand.icon}
      <span>{store}</span>
    </span>
  );
}

export default function App() {
  const [activeStore, setActiveStore] = useState('ALL');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Form state for adding items
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemStore, setItemStore] = useState('PAKnSAVE');
  const [itemQty, setItemQty] = useState(1);

  const [items, setItems] = useState([
    {
      id: '1',
      name: "Pam's Pure Butter 500g",
      price: 6.49,
      quantity: 1,
      store: 'PAKnSAVE',
      isCompleted: false,
      description: "Chilled Dairy • PAK'nSAVE Tauranga",
      barcode: '9400547001234',
    },
    {
      id: '2',
      name: 'Paint Shield Mitre 10 & Tape',
      price: 18.50,
      quantity: 1,
      store: 'Mitre 10',
      isCompleted: false,
      description: 'Aisle 8 • DIY House Renovation',
    },
    {
      id: '3',
      name: 'Solagard Roof Paint 10L',
      price: 189.00,
      quantity: 1,
      store: 'Bunnings',
      isCompleted: false,
      description: 'Paint & Decorating • Weekend Project',
    },
    {
      id: '4',
      name: 'Avocado Bag (5 pk)',
      price: 4.99,
      quantity: 1,
      store: 'New World',
      isCompleted: true,
      description: 'Fresh Produce',
    },
    {
      id: '5',
      name: 'Watties Baked Beans 420g',
      price: 2.29,
      quantity: 2,
      store: 'Woolworths',
      isCompleted: false,
      description: 'Canned Goods - Aisle 4',
    },
  ]);

  const storeKeys = ['ALL', 'PAKnSAVE', 'New World', 'Woolworths', 'Bunnings', 'Mitre 10', 'Other'];

  const filteredItems =
    activeStore === 'ALL'
      ? items
      : items.filter((item) => item.store === activeStore);

  const runningTotal = filteredItems
    .filter((i) => !i.isCompleted)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Toggle Completed Checkbox
  const toggleComplete = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  // Delete Item Function
  const deleteItem = (id, e) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      price: parseFloat(itemPrice) || 0,
      quantity: parseInt(itemQty, 10) || 1,
      store: itemStore,
      isCompleted: false,
      description: 'Manually added to list',
    };

    setItems((prev) => [newItem, ...prev]);
    setItemName('');
    setItemPrice('');
    setItemQty(1);
  };

  // Handle successful scan from real camera or fallback
  const handleBarcodeDetected = (barcodeValue) => {
    const randomBarcodes = [
      {
        name: `Scanned Item (${barcodeValue.slice(-4)})`,
        price: 5.89,
        store: 'PAKnSAVE',
        description: `Barcode: ${barcodeValue}`,
      },
      {
        name: `Hardware Tool (${barcodeValue.slice(-4)})`,
        price: 24.50,
        store: 'Mitre 10',
        description: `Barcode: ${barcodeValue}`,
      },
      {
        name: `Supermarket Item (${barcodeValue.slice(-4)})`,
        price: 8.99,
        store: 'Woolworths',
        description: `Barcode: ${barcodeValue}`,
      },
    ];
    const picked = randomBarcodes[Math.floor(Math.random() * randomBarcodes.length)];

    setItems((prev) => [
      {
        id: Date.now().toString(),
        name: picked.name,
        price: picked.price,
        quantity: 1,
        store: picked.store,
        isCompleted: false,
        description: picked.description,
        barcode: barcodeValue,
      },
      ...prev,
    ]);
    closeScanner();
  };

  const closeScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScannerOpen(false);
    setCameraError(null);
  };

  // Real Camera & BarcodeDetector Effect
  useEffect(() => {
    let scanInterval = null;

    if (isScannerOpen) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }, // Prefer phone rear camera
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          // Check if native BarcodeDetector API is supported on phone browser
          if ('BarcodeDetector' in window) {
            const detector = new window.BarcodeDetector({
              formats: ['ean_13', 'upc_a', 'qr_code', 'code_128', 'ean_8'],
            });

            scanInterval = setInterval(async () => {
              if (videoRef.current && videoRef.current.readyState === 4) {
                try {
                  const barcodes = await detector.detect(videoRef.current);
                  if (barcodes && barcodes.length > 0) {
                    handleBarcodeDetected(barcodes[0].rawValue);
                  }
                } catch (err) {
                  // Ignore harmless single-frame detection errors
                }
              }
            }, 300);
          }
        } catch (err) {
          setCameraError('Camera access denied or unavailable. You can use the button below to test.');
        }
      };

      startCamera();
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isScannerOpen]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#050a06',
        backgroundImage:
          'radial-gradient(at 15% 15%, rgba(132, 204, 22, 0.18) 0px, transparent 50%), radial-gradient(at 85% 85%, rgba(16, 185, 129, 0.15) 0px, transparent 50%)',
        color: '#f4f4f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '24px 16px',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '780px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header Glass Panel */}
        <div
          style={{
            background: 'rgba(20, 28, 22, 0.55)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(132, 204, 22, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#84cc16',
                  boxShadow: '0 0 12px #84cc16',
                }}
              />
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  margin: 0,
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                }}
              >
                Shared Shopping Hub <span style={{ color: '#84cc16' }}>NZ</span>
              </h1>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(163, 230, 53, 0.8)',
                margin: '6px 0 0 0',
                fontWeight: 500,
              }}
            >
              Live Share Link Active • Real-time Sync
            </p>
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #a3e635 0%, #65a30d 100%)',
              color: '#050a06',
              fontWeight: 700,
              fontSize: '14px',
              padding: '12px 20px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(132, 204, 22, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>📷 Barcode Scan</span>
          </button>
        </div>

        {/* Add Item Form */}
        <form
          onSubmit={handleAddItem}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(132, 204, 22, 0.2)',
            borderRadius: '20px',
            padding: '18px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#a1a1aa',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
              }}
            >
              Item Name
            </label>
            <input
              type="text"
              placeholder="e.g. Paint Shield Mitre 10 or Milk"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ width: '135px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#a1a1aa',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
              }}
            >
              Store
            </label>
            <select
              value={itemStore}
              onChange={(e) => setItemStore(e.target.value)}
              style={{
                width: '100%',
                background: '#0f1712',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px 12px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="PAKnSAVE">PAK&apos;nSAVE</option>
              <option value="New World">New World</option>
              <option value="Woolworths">Woolworths</option>
              <option value="Bunnings">Bunnings</option>
              <option value="Mitre 10">Mitre 10</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ width: '65px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#a1a1aa',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
              }}
            >
              Qty
            </label>
            <input
              type="number"
              min="1"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px 8px',
                color: '#fff',
                fontSize: '14px',
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ width: '90px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                color: '#a1a1aa',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
              }}
            >
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px 10px',
                color: '#a3e635',
                fontSize: '14px',
                textAlign: 'right',
                outline: 'none',
                fontWeight: 600,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: 'rgba(132, 204, 22, 0.15)',
              border: '1px solid #84cc16',
              color: '#a3e635',
              fontWeight: 700,
              fontSize: '14px',
              padding: '10px 18px',
              borderRadius: '12px',
              cursor: 'pointer',
              height: '40px',
            }}
          >
            + Add
          </button>
        </form>

        {/* Circular Store Filters & Total */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {storeKeys.map((store) => {
              const brand = STORE_BRANDS[store] || STORE_BRANDS['Other'];
              const isActive = activeStore === store;

              return (
                <button
                  key={store}
                  onClick={() => setActiveStore(store)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px 6px 6px',
                    borderRadius: '9999px',
                    backgroundColor: brand.bg,
                    color: brand.text,
                    border: `1px solid ${brand.border}`,
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.65,
                    boxShadow: isActive
                      ? '0 0 0 3px #050a06, 0 0 0 5px #a3e635, 0 8px 16px rgba(0,0,0,0.4)'
                      : '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {brand.icon}
                  </span>
                  <span>{store}</span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(132, 204, 22, 0.25)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#a1a1aa', fontWeight: 500 }}>
              Estimated Total:
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#a3e635' }}>
              ${runningTotal.toFixed(2)} NZD
            </span>
          </div>
        </div>

        {/* Grocery Items List with Delete Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleComplete(item.id)}
              style={{
                background: item.isCompleted
                  ? 'rgba(255, 255, 255, 0.01)'
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                border: item.isCompleted
                  ? '1px solid rgba(255, 255, 255, 0.05)'
                  : '1px solid rgba(132, 204, 22, 0.25)',
                boxShadow: item.isCompleted ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.25)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: item.isCompleted ? 0.45 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => {}}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#84cc16',
                    cursor: 'pointer',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: item.isCompleted ? '#71717a' : '#ffffff',
                        textDecoration: item.isCompleted ? 'line-through' : 'none',
                      }}
                    >
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(132, 204, 22, 0.15)',
                          color: '#a3e635',
                          border: '1px solid rgba(132, 204, 22, 0.3)',
                          fontWeight: 700,
                        }}
                      >
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <StoreBadge store={item.store} />

                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#a3e635',
                    minWidth: '65px',
                    textAlign: 'right',
                  }}
                >
                  ${(item.price * item.quantity).toFixed(2)}
                </span>

                {/* DELETE ITEM BUTTON */}
                <button
                  onClick={(e) => deleteItem(item.id, e)}
                  title="Delete Item"
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Scanner with Real Camera Stream */}
        {isScannerOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              zIndex: 100,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                background: '#09100c',
                border: '1px solid rgba(132, 204, 22, 0.4)',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#84cc16',
                    }}
                  />
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#a3e635',
                      margin: 0,
                    }}
                  >
                    PAK&apos;nSAVE NZ Scanner
                  </h3>
                </div>
                <button
                  onClick={closeScanner}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Real Video Viewport Frame */}
              <div
                style={{
                  height: '220px',
                  borderRadius: '16px',
                  border: '2px dashed rgba(132, 204, 22, 0.6)',
                  background: '#000',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#a3e635',
                  }}
                >
                  Align EAN-13 / UPC barcode inside frame
                </div>
              </div>

              {cameraError && (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#f87171',
                    marginTop: '10px',
                    textAlign: 'center',
                  }}
                >
                  {cameraError}
                </p>
              )}

              <button
                onClick={() =>
                  handleBarcodeDetected(
                    '9400' + Math.floor(10000000 + Math.random() * 90000000)
                  )
                }
                style={{
                  width: '100%',
                  marginTop: '16px',
                  background: '#84cc16',
                  color: '#050a06',
                  fontWeight: 800,
                  fontSize: '15px',
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Simulate Scan (Fallback)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
