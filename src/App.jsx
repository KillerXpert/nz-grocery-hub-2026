import React, { useState, useEffect, useRef } from 'react';

// Brand styling for NZ retail stores
const STORE_BRANDS = {
  ALL: {
    name: 'ALL',
    bg: '#27272a',
    text: '#a3e635',
    border: 'rgba(163, 230, 53, 0.4)',
    icon: '❖',
  },
  PAKnSAVE: {
    name: 'PAKnSAVE',
    bg: '#FACC15',
    text: '#000000',
    border: '#EAB308',
    icon: '🛒',
  },
  'New World': {
    name: 'New World',
    bg: '#DC2626',
    text: '#FFFFFF',
    border: '#B91C1C',
    icon: '🍎',
  },
  Woolworths: {
    name: 'Woolworths',
    bg: '#16A34A',
    text: '#FFFFFF',
    border: '#15803D',
    icon: '🍏',
  },
  Bunnings: {
    name: 'Bunnings',
    bg: '#047857',
    text: '#FFFFFF',
    border: '#065F46',
    icon: '🔨',
  },
  'Mitre 10': {
    name: 'Mitre 10',
    bg: '#F97316',
    text: '#000000',
    border: '#EA580C',
    icon: '🔧',
  },
  Other: {
    name: 'Other',
    bg: '#3F3F46',
    text: '#FFFFFF',
    border: '#52525B',
    icon: '📦',
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
      }}
    >
      <span>{brand.icon}</span>
      <span>{store}</span>
    </span>
  );
}

export default function App() {
  const [activeStore, setActiveStore] = useState('ALL');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [lookupStatus, setLookupStatus] = useState('');

  // Editing State
  const [editingItem, setEditingItem] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(false);

  // Form state
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
      description: "Chilled Dairy • PAK'nSAVE",
      barcode: '9400547001234',
      imageUrl: 'https://images.openfoodfacts.org/images/products/940/054/700/1234/front_en.3.200.jpg',
    },
    {
      id: '2',
      name: 'Paint Shield Mitre 10 & Tape',
      price: 18.50,
      quantity: 1,
      store: 'Mitre 10',
      isCompleted: false,
      description: 'Aisle 8 • DIY House Renovation',
      imageUrl: '',
    },
  ]);

  const storeKeys = ['ALL', 'PAKnSAVE', 'New World', 'Woolworths', 'Bunnings', 'Mitre 10', 'Other'];

  const filteredItems =
    activeStore === 'ALL' ? items : items.filter((item) => item.store === activeStore);

  const runningTotal = filteredItems
    .filter((i) => !i.isCompleted)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const toggleComplete = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
  };

  const deleteItem = (id, e) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const openEditModal = (item, e) => {
    e.stopPropagation();
    setEditingItem({ ...item });
  };

  const saveEditItem = (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;

    setItems((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    setEditingItem(null);
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
      description: 'Manually added',
      imageUrl: '',
    };

    setItems((prev) => [newItem, ...prev]);
    setItemName('');
    setItemPrice('');
    setItemQty(1);
  };

  // REAL LIVE BARCODE API LOOKUP (With Image Extraction)
  const handleBarcodeDetected = async (barcodeValue) => {
    setLookupStatus(`Searching barcode ${barcodeValue}...`);

    try {
      // 1. Open Food Facts v0 API
      const offResponse = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcodeValue}.json`
      );
      const offData = await offResponse.json();

      if (offData && offData.status === 1 && offData.product) {
        const prod = offData.product;
        const brand = prod.brands ? prod.brands.split(',')[0].trim() : '';
        const title = prod.product_name || prod.product_name_en || 'Recognised Grocery Item';
        
        // Extract real image URL from Open Food Facts
        const img =
          prod.image_front_small_url ||
          prod.image_front_url ||
          prod.image_small_url ||
          prod.image_url ||
          '';

        const fullName =
          brand && !title.toLowerCase().includes(brand.toLowerCase())
            ? `${brand} - ${title}`
            : title;

        let detectedStore = 'Woolworths';
        const brandUpper = brand.toUpperCase();
        if (brandUpper.includes('PAMS') || brandUpper.includes('VALUE')) {
          detectedStore = 'PAKnSAVE';
        } else if (
          brandUpper.includes('WOOLWORTHS') ||
          brandUpper.includes('HOMEBRAND') ||
          brandUpper.includes('COUNTDOWN')
        ) {
          detectedStore = 'Woolworths';
        }

        addItemToList({
          name: fullName,
          price: 0.00,
          store: detectedStore,
          description: `Verified Barcode: ${barcodeValue} • ${
            prod.categories ? prod.categories.split(',')[0] : 'Grocery'
          }`,
          barcode: barcodeValue,
          imageUrl: img,
        });
        return;
      }

      // 2. UPCItemDB Fallback
      const upcResponse = await fetch(
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcodeValue}`
      );
      const upcData = await upcResponse.json();

      if (upcData && upcData.items && upcData.items.length > 0) {
        const found = upcData.items[0];
        const title = found.title || 'Recognised Product';
        const brand = found.brand ? `${found.brand} - ` : '';
        const img = found.images && found.images.length > 0 ? found.images[0] : '';

        addItemToList({
          name: `${brand}${title}`,
          price: 0.00,
          store: 'Other',
          description: `Verified Barcode: ${barcodeValue}`,
          barcode: barcodeValue,
          imageUrl: img,
        });
        return;
      }

      // 3. Fallback for unlisted barcodes
      addItemToList({
        name: `Scanned Barcode: ${barcodeValue}`,
        price: 0.00,
        store: 'Other',
        description: `Unlisted in database — tap ✏️ to edit details`,
        barcode: barcodeValue,
        imageUrl: '',
      });
    } catch (error) {
      addItemToList({
        name: `Scanned Barcode: ${barcodeValue}`,
        price: 0.00,
        store: 'Other',
        description: `Offline Read • Barcode # ${barcodeValue}`,
        barcode: barcodeValue,
        imageUrl: '',
      });
    } finally {
      closeScanner();
    }
  };

  const addItemToList = (productData) => {
    setItems((prev) => [
      {
        id: Date.now().toString(),
        name: productData.name,
        price: productData.price || 0,
        quantity: 1,
        store: productData.store || 'Other',
        isCompleted: false,
        description: productData.description,
        barcode: productData.barcode,
        imageUrl: productData.imageUrl || '',
      },
      ...prev,
    ]);
  };

  const closeScanner = () => {
    isScanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScannerOpen(false);
    setCameraError(null);
    setLookupStatus('');
  };

  useEffect(() => {
    let scanInterval = null;

    if (isScannerOpen) {
      isScanningRef.current = false;

      const startCamera = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        try {
          let stream;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
            });
          } catch (e) {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play().catch(() => {});
          }

          if ('BarcodeDetector' in window) {
            const detector = new window.BarcodeDetector({
              formats: ['ean_13', 'upc_a', 'qr_code', 'code_128', 'ean_8'],
            });

            scanInterval = setInterval(async () => {
              if (
                videoRef.current &&
                videoRef.current.readyState >= 2 &&
                !isScanningRef.current
              ) {
                try {
                  const barcodes = await detector.detect(videoRef.current);
                  if (barcodes && barcodes.length > 0) {
                    const code = barcodes[0].rawValue;
                    if (code && code.length >= 8) {
                      isScanningRef.current = true;
                      handleBarcodeDetected(code);
                    }
                  }
                } catch (err) {}
              }
            }, 300);
          }
        } catch (err) {
          setCameraError('Camera permission denied or unavailable.');
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
      }}
    >
      <div
        style={{
          maxWidth: '780px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'rgba(20, 28, 22, 0.55)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(132, 204, 22, 0.3)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Shared Shopping Hub <span style={{ color: '#84cc16' }}>NZ</span>
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(163, 230, 53, 0.8)', margin: '6px 0 0 0' }}>
              Live Barcode API • Image & Detail Editor
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
            }}
          >
            📷 Barcode Scan
          </button>
        </div>

        {/* Add Item Form */}
        <form
          onSubmit={handleAddItem}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
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
                fontWeight: 600,
              }}
            >
              ITEM NAME
            </label>
            <input
              type="text"
              placeholder="e.g. Pam's Butter or Paint"
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
                fontWeight: 600,
              }}
            >
              STORE
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
                fontWeight: 600,
              }}
            >
              QTY
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
                textAlign: 'center',
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
                fontWeight: 600,
              }}
            >
              PRICE ($)
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
                textAlign: 'right',
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
              padding: '10px 18px',
              borderRadius: '12px',
              cursor: 'pointer',
              height: '40px',
            }}
          >
            + Add
          </button>
        </form>

        {/* Store Filters */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    backgroundColor: brand.bg,
                    color: brand.text,
                    border: `1px solid ${brand.border}`,
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.65,
                  }}
                >
                  <span>{brand.icon}</span>
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
            }}
          >
            <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Estimated Total: </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#a3e635' }}>
              ${runningTotal.toFixed(2)} NZD
            </span>
          </div>
        </div>

        {/* Item List with Images & Edit Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleComplete(item.id)}
              style={{
                background: item.isCompleted
                  ? 'rgba(255, 255, 255, 0.01)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: item.isCompleted
                  ? '1px solid rgba(255, 255, 255, 0.05)'
                  : '1px solid rgba(132, 204, 22, 0.25)',
                borderRadius: '16px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: item.isCompleted ? 0.45 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => {}}
                  style={{ width: '20px', height: '20px', accentColor: '#84cc16' }}
                />

                {/* Product Image Thumbnail */}
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{
                      width: '44px',
                      height: '44px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      background: '#ffffff',
                      padding: '2px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}
                  >
                    📦
                  </div>
                )}

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
                          fontWeight: 700,
                        }}
                      >
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '3px 0 0 0' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <StoreBadge store={item.store} />

                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#a3e635',
                    minWidth: '60px',
                    textAlign: 'right',
                  }}
                >
                  ${(item.price * item.quantity).toFixed(2)}
                </span>

                {/* EDIT ITEM BUTTON */}
                <button
                  onClick={(e) => openEditModal(item, e)}
                  title="Edit Item Details"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  ✏️
                </button>

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
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EDIT PRODUCT MODAL */}
        {editingItem && (
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
              zIndex: 110,
            }}
          >
            <form
              onSubmit={saveEditItem}
              style={{
                width: '100%',
                maxWidth: '420px',
                background: '#09100c',
                border: '1px solid rgba(132, 204, 22, 0.4)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#a3e635', margin: 0 }}>
                  ✏️ Edit Product Details
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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

              {editingItem.imageUrl && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={editingItem.imageUrl}
                    alt={editingItem.name}
                    style={{
                      maxHeight: '100px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      background: '#fff',
                      padding: '4px',
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                  PRODUCT NAME
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                    STORE
                  </label>
                  <select
                    value={editingItem.store}
                    onChange={(e) => setEditingItem({ ...editingItem, store: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#0f1712',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      padding: '10px',
                      color: '#fff',
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

                <div style={{ width: '80px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                    QTY
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantity: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      padding: '10px',
                      color: '#fff',
                      textAlign: 'center',
                    }}
                  />
                </div>

                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                    PRICE ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      padding: '10px',
                      color: '#a3e635',
                      fontWeight: 700,
                      textAlign: 'right',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#a1a1aa', marginBottom: '4px' }}>
                  DESCRIPTION / NOTES
                </label>
                <input
                  type="text"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#84cc16',
                  color: '#050a06',
                  fontWeight: 800,
                  fontSize: '15px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Barcode Scanner Modal */}
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
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#a3e635', margin: 0 }}>
                  {lookupStatus ? '🔍 Searching Barcode Database...' : 'PAK\'nSAVE NZ Scanner'}
                </h3>
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

              <div
                style={{
                  height: '220px',
                  borderRadius: '16px',
                  border: '2px dashed rgba(132, 204, 22, 0.6)',
                  background: '#000',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {lookupStatus && (
                <p
                  style={{
                    fontSize: '13px',
                    color: '#a3e635',
                    marginTop: '10px',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  {lookupStatus}
                </p>
              )}
              {cameraError && (
                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '10px' }}>
                  {cameraError}
                </p>
              )}

              <button
                onClick={() => handleBarcodeDetected('9300675045797')}
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
                Simulate Scan (Coke Vanilla 1.5L)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
