import React, { useState, useRef, useEffect } from 'react';
import { saveAccessToken, saveRefreshToken, getAccessToken, getRefreshToken, saveUserLogin, handleUnauthorized } from './services/storageService';

const Authorization = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoginFocused, setIsLoginFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const loginInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Проверяем, была ли сессия устаревшей
  useEffect(() => {
    const sessionExpired = sessionStorage.getItem('sessionExpired');
    if (sessionExpired === 'true') {
      setError('Сессия устарела. Пожалуйста, войдите в систему заново.');
      sessionStorage.removeItem('sessionExpired');
    }
  }, []);

  // Функция для загрузки папок и списка заявлений после входа
  const loadStatementsAfterLogin = async (accessToken) => {
    try {
      // Загружаем папки и сразу начинаем загрузку заявлений для "Statement" (параллельно, если возможно)
      const foldersPromise = fetch('https://crm-arm.onrender.com/api/Statement/Folders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Сначала получаем папки
      const foldersResponse = await foldersPromise;

      // Обработка 401 - выход из системы
      if (foldersResponse.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!foldersResponse.ok) {
        console.error('Ошибка загрузки папок:', foldersResponse.status);
        return;
      }

      const foldersData = await foldersResponse.json();
      
      if (!Array.isArray(foldersData) || foldersData.length === 0) {
        console.error('Папки не найдены');
        return;
      }

      // Находим папку "Statement" или берем первую папку
      const statementFolder = foldersData.find(f => f.code === 'Statement') || foldersData[0];
      const folderType = statementFolder.code;

      // Получаем список заявлений (можно было бы сделать параллельно, но нужен folderType)
      const statementsResponse = await fetch('https://crm-arm.onrender.com/api/Statement/List', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageNumber: 1,
          pageSize: 10,
          dateFrom: null,
          dateTo: null,
          direction: 'asc',
          folderType: folderType
        }),
      });

      // Обработка 401 - выход из системы
      if (statementsResponse.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!statementsResponse.ok) {
        console.error('Ошибка загрузки заявлений:', statementsResponse.status);
        return;
      }

      const statementsData = await statementsResponse.json();
      
      // Сохраняем заявления в localStorage
      if (statementsData && statementsData.statements) {
        localStorage.setItem('api_statements', JSON.stringify(statementsData));
        console.log('Заявления загружены и сохранены:', statementsData.statements.length);
      }
    } catch (error) {
      console.error('Ошибка при загрузке заявлений после входа:', error);
      // Не прерываем процесс входа из-за ошибки загрузки заявлений
    }
  };

  const handleLogin = async () => {
    // Валидация
    if (!login.trim()) {
      setError('Введите логин');
      return;
    }
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    setLoading(true);
    setError('');

    const requestBody = {
      Login: login.trim(),
      Password: password,
    };

    const requestUrl = 'https://crm-identity.onrender.com/api/auth/login';
    const requestHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        mode: 'cors',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { raw: responseText };
      }

      if (response.status !== 200) {
        throw new Error(responseData.message || responseData.error || `Ошибка авторизации: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || `Ошибка авторизации: ${response.status}`);
      }

      if (!responseData.accessToken) {
        throw new Error('Ошибка: accessToken не получен от сервера');
      }

      if (!responseData.refreshToken) {
        throw new Error('Ошибка: refreshToken не получен от сервера');
      }

      if (typeof responseData.accessToken !== 'string' || responseData.accessToken.trim() === '') {
        throw new Error('Ошибка: accessToken невалиден');
      }

      if (typeof responseData.refreshToken !== 'string' || responseData.refreshToken.trim() === '') {
        throw new Error('Ошибка: refreshToken невалиден');
      }

      saveAccessToken(responseData.accessToken);
      saveRefreshToken(responseData.refreshToken);
      // Сохраняем логин для определения роли
      saveUserLogin(login.trim());

      const savedAccessToken = getAccessToken();
      const savedRefreshToken = getRefreshToken();

      console.log('Токен сохранен:', savedAccessToken ? 'Да' : 'Нет');
      console.log('Токен (первые 20 символов):', savedAccessToken ? savedAccessToken.substring(0, 20) + '...' : 'Нет');

      if (!savedAccessToken || savedAccessToken !== responseData.accessToken) {
        throw new Error('Ошибка: не удалось сохранить accessToken');
      }

      if (!savedRefreshToken || savedRefreshToken !== responseData.refreshToken) {
        throw new Error('Ошибка: не удалось сохранить refreshToken');
      }

      // Автоматически загружаем папки и список заявлений после входа
      await loadStatementsAfterLogin(responseData.accessToken);

      if (onLogin) {
        onLogin();
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка при авторизации. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) {
      handleLogin();
    }
  };

  const isLoginActive = isLoginFocused || login.length > 0;
  const isPasswordActive = isPasswordFocused || password.length > 0;

  return (
    <div data-layer="Authorization" className="Authorization" style={{width: '100%', height: '100vh', position: 'relative', background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
      <div data-layer="Container" className="Container" style={{width: 460, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 60, display: 'inline-flex'}}>
        <div data-layer="Name CRM" className="NameCrm" style={{width: 315, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 24, display: 'flex'}}>
          <div data-layer="Title" className="Title" style={{alignSelf: 'stretch', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word'}}>Client360</div>
          <div data-layer="Subtitle" className="Subtitle" style={{alignSelf: 'stretch', textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'black', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>Система сервисного обслуживания клиента полного цикла</div>
        </div>
        <form 
          data-layer="Form authorization" 
          className="FormAuthorization" 
          style={{alignSelf: 'stretch', background: '#FFFCFC', outline: '1px #F8E8E8 solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}
          onSubmit={handleSubmit}
        >
          <div data-layer="InputPhoneNumber" data-state={isLoginActive ? 'pressed' : 'not_pressed'} className="Inputphonenumber" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div
              data-layer="Text field container"
              className="TextFieldContainer"
              style={{
                flex: '1 1 0',
                height: 85,
                paddingTop: 20,
                paddingBottom: 20,
                paddingRight: 16,
                overflow: 'hidden',
                flexDirection: 'column',
                justifyContent: isLoginActive ? 'flex-start' : 'center',
                alignItems: 'flex-start',
                gap: isLoginActive ? 10 : 0,
                display: 'inline-flex',
                cursor: 'text'
              }}
              onClick={() => loginInputRef.current?.focus()}
            >
              <div
                data-layer="LabelDefault"
                className="Labeldefault"
                style={{
                  justifyContent: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  color: isLoginActive ? '#6B6D80' : 'black',
                  fontSize: isLoginActive ? 14 : 16,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  wordWrap: 'break-word',
                  transition: 'all 0.2s ease'
                }}
              >
                Логин
              </div>
              <input
                ref={loginInputRef}
                type="text"
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  setIsLoginFocused(true);
                }}
                onBlur={() => {
                  setIsLoginFocused(false);
                }}
                placeholder=""
                disabled={loading}
                autoComplete="username"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#071222',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  padding: 0,
                  margin: 0,
                  opacity: isLoginActive ? 1 : 0,
                  maxHeight: isLoginActive ? 40 : 0,
                  pointerEvents: isLoginActive ? 'auto' : 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>
          <div data-layer="InputPassword" data-state={isPasswordActive ? 'pressed' : 'not_pressed'} className="Inputpassword" style={{alignSelf: 'stretch', height: 85, paddingLeft: 20, overflow: 'hidden', borderBottom: '1px #F8E8E8 solid', justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'inline-flex'}}>
            <div
              data-layer="Text field container"
              className="TextFieldContainer"
              style={{
                flex: '1 1 0',
                height: 85,
                paddingTop: 20,
                paddingBottom: 20,
                paddingRight: 16,
                overflow: 'hidden',
                flexDirection: 'column',
                justifyContent: isPasswordActive ? 'flex-start' : 'center',
                alignItems: 'flex-start',
                gap: isPasswordActive ? 10 : 0,
                display: 'inline-flex',
                cursor: 'text'
              }}
              onClick={() => passwordInputRef.current?.focus()}
            >
              <div
                data-layer="LabelDefault"
                className="Labeldefault"
                style={{
                  justifyContent: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  color: isPasswordActive ? '#6B6D80' : 'black',
                  fontSize: isPasswordActive ? 14 : 16,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  wordWrap: 'break-word',
                  transition: 'all 0.2s ease'
                }}
              >
                Пароль
              </div>
              <input
                ref={passwordInputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholder=""
                disabled={loading}
                autoComplete="current-password"
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#071222',
                  fontSize: 16,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  padding: 0,
                  margin: 0,
                  opacity: isPasswordActive ? 1 : 0,
                  maxHeight: isPasswordActive ? 40 : 0,
                  pointerEvents: isPasswordActive ? 'auto' : 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>
          {error && (
            <div style={{
              alignSelf: 'stretch',
              padding: '12px 20px',
              color: '#d32f2f',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: '400',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            data-layer="LoginButton" 
            data-state="not_pressed" 
            className="Loginbutton" 
            disabled={loading}
            style={{
              alignSelf: 'stretch', 
              height: 85, 
              background: loading ? '#666' : 'black', 
              overflow: 'hidden', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              display: 'inline-flex', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              border: 'none',
              padding: 0,
              fontFamily: 'inherit'
            }}
          >
            <div data-layer="Button Text" className="ButtonText" style={{flex: '1 1 0', textBoxTrim: 'trim-both', textBoxEdge: 'cap alphabetic', textAlign: 'center', color: 'white', fontSize: 16, fontFamily: 'Inter', fontWeight: '500', wordWrap: 'break-word'}}>
              {loading ? 'Вход...' : 'Войти'}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Authorization;

