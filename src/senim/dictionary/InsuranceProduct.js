import React, { useState, useEffect } from 'react';
import { getPrograms } from '../../services/processService';
import { getAccessToken } from '../../services/storageService';

const InsuranceProduct = ({ onBack, onSelect, initialValue }) => {
  const [selectedValue, setSelectedValue] = useState(initialValue || null);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = getAccessToken();
        const programsData = await getPrograms('SenimNew', token);
        // Сортируем программы по коду (1, 2, 3...)
        const sortedPrograms = (programsData || []).sort((a, b) => {
          const codeA = parseInt(a.code || '0', 10);
          const codeB = parseInt(b.code || '0', 10);
          return codeA - codeB;
        });
        
        setPrograms(sortedPrograms);
      } catch (err) {
        setError(err.message || 'Не удалось загрузить программы страхования');
      } finally {
        setIsLoading(false);
      }
    };

    loadPrograms();
  }, []);

  // Обновляем selectedValue при изменении initialValue
  useEffect(() => {
    if (initialValue) {
      setSelectedValue(initialValue);
    }
  }, [initialValue]);

  const handleSelect = (program) => {
    setSelectedValue(program);
  };

  const handleSave = () => {
    if (selectedValue && onSelect) {
      onSelect(selectedValue);
    } else if (onBack) {
      onBack();
    }
  };
  return (
    <div data-layer="Insurance program selection" className="InsuranceProgramSelection" style={{width: 1512, minHeight: '100vh', justifyContent: 'flex-start', alignItems: 'stretch', display: 'inline-flex'}}>
  <div data-layer="Menu" data-property-1="Menu three" className="Menu" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderLeft: '1px #F8E8E8 solid', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="Menu button" className="MenuButton" onClick={onBack} style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', cursor: 'pointer'}}>
      <div data-svg-wrapper data-layer="Chewron left" className="ChewronLeft" style={{left: 31, top: 32, position: 'absolute'}}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L7 10.5L15 3" stroke="black" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  </div>
  <div data-layer="Insurance program" className="InsuranceProgram" style={{flex: '1 1 0', alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderRight: '1px #F8E8E8 solid', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
    <div data-layer="SubHeader" data-type="Creating an order" className="Subheader" style={{alignSelf: 'stretch', background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
      <div data-layer="Title" className="Title" style={{flex: '1 1 0', height: 85, paddingLeft: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex'}}>
        <div data-layer="Screen Title" className="ScreenTitle" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Программа страхования</div>
        <div data-layer="Save button" data-state="pressed" className="SaveButton" onClick={handleSave} style={{width: 388, height: 85, background: 'black', overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 8.98, display: 'flex', cursor: 'pointer'}}>
          <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Сохранить</div>
        </div>
      </div>
    </div>
    <div data-layer="Fields List" className="FieldsList" style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
      {isLoading ? (
        <div data-layer="Loading state" className="LoadingState" style={{alignSelf: 'stretch', height: 200, paddingLeft: 40, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Загрузка программ...</div>
        </div>
      ) : error ? (
        <div data-layer="Error state" className="ErrorState" style={{alignSelf: 'stretch', height: 200, paddingLeft: 40, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#D32F2F', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>{error}</div>
        </div>
      ) : programs.length === 0 ? (
        <div data-layer="Empty state" className="EmptyState" style={{alignSelf: 'stretch', height: 200, paddingLeft: 40, background: 'white', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#6B6D80', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Программы недоступны</div>
        </div>
      ) : (
        programs.map((program) => {
          const isSelected = selectedValue && (
            (typeof selectedValue === 'object' && selectedValue.id === program.id) ||
            (typeof selectedValue === 'string' && selectedValue === program.nameRu)
          );
          return (
            <div
              key={program.id}
              data-layer="InputContainerRadioButton"
              data-state={isSelected ? 'pressed' : 'not_pressed'}
              className="Inputcontainerradiobutton"
              onClick={() => handleSelect(program)}
              style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, background: 'white', overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex', cursor: 'pointer'}}
            >
              <div data-layer="Text container" className="TextContainer" style={{flex: '1 1 0', paddingTop: 20, paddingBottom: 20, overflow: 'hidden', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                <div data-layer="Label" className="Label" style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
                  {program.nameRu || program.nameKz || `Программа ${program.code}`}
                </div>
              </div>
              <div data-layer="Radiobutton container" className="RadiobuttonContainer" style={{width: 85, height: 85, position: 'relative', background: '#FBF9F9', overflow: 'hidden'}}>
                <div data-svg-wrapper data-layer={isSelected ? "Ellipse-on" : "Ellipse-off"} className={isSelected ? "EllipseOn" : "EllipseOff"} style={{left: 35, top: 36, position: 'absolute'}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="6.5" fill={isSelected ? "black" : "none"} stroke="black"/>
                  </svg>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
    </div>
  );
};

export default InsuranceProduct;