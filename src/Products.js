import React, { useState, useEffect } from 'react';
import { getAccessToken, handleUnauthorized } from './services/storageService';

const Products = ({ onSelectProduct, onBack, isCreating }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загружаем доступные продукты из API при каждом открытии экрана
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error('Токен авторизации не найден');
        }

        console.log('Загружаем доступные продукты...');
        
        const response = await fetch('https://crm-arm.onrender.com/api/Statement/GetAvailableProducts', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productOperationTypeCode: 'New'
          }),
        });

        // Обработка 401 - выход из системы
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(`Ошибка загрузки продуктов: ${response.status}`);
        }

        const productsData = await response.json();
        console.log('Получены продукты:', productsData);
        
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          throw new Error('Неверный формат данных продуктов');
        }
      } catch (err) {
        console.error('Ошибка загрузки продуктов:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleCreate = async () => {
    if (selectedProduct && onSelectProduct && !isCreating) {
      try {
        // Передаем объект продукта, а не только название
        await onSelectProduct(selectedProduct);
      } catch (error) {
        console.error('Ошибка при создании заявки:', error);
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div data-layer="Product selection page" className="ProductSelectionPage" style={{width: 1512, minHeight: '100vh', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex'}}>
      <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="Back button" className="BackButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}} onClick={handleBack}>
          <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>
      <div data-layer="Product selection section" className="ProductSelectionSection" style={{flex: '1 1 0', alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
        <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
          <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Выберите продукт</div>
            <div 
              data-layer="ActionButtonWithoutRounding" 
              data-state="pressed" 
              className="Actionbuttonwithoutrounding" 
              style={{
                width: 388, 
                height: 85, 
                background: (isCreating || !selectedProduct) ? '#666' : 'black', 
                overflow: 'hidden', 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                gap: 8.98, 
                display: 'flex', 
                cursor: (isCreating || !selectedProduct) ? 'not-allowed' : 'pointer',
                opacity: (isCreating || !selectedProduct) ? 0.7 : 1,
                transition: 'all 0.2s'
              }} 
              onClick={handleCreate}
            >
              <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
                {isCreating ? 'Создание...' : 'Создать'}
              </div>
            </div>
          </div>
        </div>
        <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div data-layer="Search panel" data-state="not_pressed" className="SearchPanel" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div data-layer="Text container" className="TextFieldContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
              <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Поиск</div>
            </div>
            <div data-layer="Clean button" className="CleanButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
              <div data-svg-wrapper data-layer="keyboard" className="Keyboard" style={{left: 31, top: 32, position: 'absolute'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.8751 6.08464V9.7513H5.80258L9.08425 6.46047L7.79175 5.16797L2.29175 10.668L7.79175 16.168L9.08425 14.8755L5.80258 11.5846H19.7084V6.08464H17.8751Z" fill="black"/>
                </svg>
              </div>
            </div>
          </div>
          <div data-layer="Fields products" className="FieldsProducts" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            {loading ? (
              <div style={{alignSelf: 'stretch', padding: 40, textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter'}}>
                Загрузка продуктов...
              </div>
            ) : error ? (
              <div style={{alignSelf: 'stretch', padding: 40, textAlign: 'center', color: '#d32f2f', fontSize: 16, fontFamily: 'Inter'}}>
                Ошибка загрузки продуктов: {error}
              </div>
            ) : products.length === 0 ? (
              <div style={{alignSelf: 'stretch', padding: 40, textAlign: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter'}}>
                Продукты не найдены
              </div>
            ) : (
              products.map((product) => (
                <div 
                  key={product.code}
                  data-layer="Product selection" 
                  className="ProductSelection" 
                  style={{
                    alignSelf: 'stretch', 
                    height: 85, 
                    paddingLeft: 20, 
                    background: selectedProduct?.code === product.code ? '#FBF9F9' : 'white', 
                    overflow: 'hidden', 
                    borderBottom: '1px #F8E8E8 solid', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center', 
                    gap: 10, 
                    display: 'inline-flex',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleProductSelect(product)}
                >
                  <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                    <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{product.nameRu || product.nameKz || product.code}</div>
                  </div>
                  <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                    {selectedProduct?.code === product.code ? (
                      <div data-svg-wrapper data-layer="Ellipse-on" className="EllipseOn" style={{left: 35, top: 36, position: 'absolute'}}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="6.5" fill="black" stroke="black"/>
                        </svg>
                      </div>
                    ) : (
                      <div data-svg-wrapper data-layer="Ellipse-off" className="EllipseOff" style={{left: 35, top: 36, position: 'absolute'}}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="6.5" stroke="black"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

