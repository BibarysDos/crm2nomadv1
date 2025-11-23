import React, { useState, useEffect } from 'react';
import { getDictionaryValues } from '../../services/processService';
import { getAccessToken } from '../../services/storageService';

const Country = ({ onBack, onSave, initialValue }) => {
  const [selectedValue, setSelectedValue] = useState(initialValue || null);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAccessToken();
        if (!token) {
          throw new Error('Токен авторизации не найден');
        }
        const data = await getDictionaryValues('DicCountry', token);
        if (Array.isArray(data)) {
          setCountries(data);
        } else {
          setCountries([]);
        }
      } catch (err) {
        console.error('Ошибка загрузки стран:', err);
        setError(err.message || 'Ошибка загрузки данных');
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  const handleSelect = (country) => {
    setSelectedValue(country);
  };

  const handleSave = () => {
    if (onSave && selectedValue) {
      onSave(selectedValue);
    }
  };

  const filteredCountries = countries.filter(country => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (country.nameRu && country.nameRu.toLowerCase().includes(searchLower)) ||
      (country.nameKz && country.nameKz.toLowerCase().includes(searchLower)) ||
      (country.code && country.code.toLowerCase().includes(searchLower))
    );
  });

  const isSelected = (country) => {
    if (!selectedValue) return false;
    if (typeof selectedValue === 'object') {
      return selectedValue.id === country.id || selectedValue.code === country.code;
    }
    return selectedValue === country.code || selectedValue === country.id || selectedValue === country.nameRu;
  };

  return (
    <div data-layer="List variants" className="ListVariants" style={{width: 1512, height: 982, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
  <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{width: 85, height: 982, background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="Menu button" className="MenuButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
      <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
        </svg>
      </div>
    </div>
    <div data-layer="OpenDocument button" className="OpendocumentButton" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid'}}>
      <div data-layer="File" className="File" style={{width: 22, height: 22, left: 31, top: 32, position: 'absolute'}}>
        <div data-svg-wrapper data-layer="Frame 1321316875" className="Frame1321316875" style={{left: 3, top: 1, position: 'absolute'}}>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 0L16.001 6V18.001C16.0009 19.1008 15.1008 20.0008 14.001 20.001H1.99023C0.890252 20.001 0.000107007 19.1009 0 18.001L0.00976562 2C0.00980161 0.900011 0.900014 4.85053e-05 2 0H10ZM2.00293 2V18.001H14.0039V7H9.00293V2H2.00293Z" fill="black"/>
          <line x1="4" y1="11.2505" x2="12.0004" y2="11.2505" stroke="black" stroke-width="1.5"/>
          <line x1="4" y1="15.2507" x2="10.0003" y2="15.2507" stroke="black" stroke-width="1.5"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div data-layer="List variants" className="ListVariants" style={{flex: '1 1 0', height: 982, background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Страна</div>
        <div data-layer="ActionButtonWithoutRounding" data-state={selectedValue ? "pressed" : "not_pressed"} className="Actionbuttonwithoutrounding" onClick={handleSave} style={{width: 388, height: 85, background: selectedValue ? 'black' : '#E0E0E0', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: selectedValue ? 'pointer' : 'not-allowed'}}>
          <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: selectedValue ? 'white' : '#9E9E9E', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
        </div>
      </div>
    </div>
    <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
      <div data-layer="Search panel" data-state="not_pressed" className="SearchPanel" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
        <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, paddingRight: 16, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск"
            style={{
              flex: '1 1 0',
              border: 'none',
              outline: 'none',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: 500,
              color: 'black',
              background: 'transparent'
            }}
          />
        </div>
        {searchTerm && (
          <div data-layer="Clean button" className="CleanButton" onClick={() => setSearchTerm('')} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', cursor: 'pointer'}}>
            <div data-svg-wrapper data-layer="keyboard" className="Keyboard" style={{left: 31, top: 32, position: 'absolute'}}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.8744 6.08464V9.7513H5.80185L9.08352 6.46047L7.79102 5.16797L2.29102 10.668L7.79102 16.168L9.08352 14.8755L5.80185 11.5846H19.7077V6.08464H17.8744Z" fill="black"/>
              </svg>
            </div>
          </div>
        )}
      </div>
      {loading && (
        <div style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, display: 'flex', alignItems: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: 500}}>
          Загрузка...
        </div>
      )}
      {error && (
        <div style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, display: 'flex', alignItems: 'center', color: '#D32F2F', fontSize: 16, fontFamily: 'Inter', fontWeight: 500}}>
          {error}
        </div>
      )}
      {!loading && !error && filteredCountries.length === 0 && (
        <div style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, display: 'flex', alignItems: 'center', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: 500}}>
          Страны не найдены
        </div>
      )}
      {!loading && !error && filteredCountries.map((country) => (
        <div
          key={country.id || country.code}
          data-layer="InputContainerRadioButton"
          data-state={isSelected(country) ? 'pressed' : 'not_pressed'}
          className="Inputcontainerradiobutton"
          onClick={() => handleSelect(country)}
          style={{
            alignSelf: 'stretch',
            height: 85,
            paddingLeft: 20,
            background: 'white',
            overflow: 'hidden',
            borderBottom: '1px #F8E8E8 solid',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 10,
            display: 'inline-flex',
            cursor: 'pointer'
          }}
        >
          <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
            <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
              {country.nameRu || country.nameKz || country.code}
            </div>
          </div>
          <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
            {isSelected(country) ? (
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
      ))}
    </div>
  </div>
    </div>
  );
};

export default Country;