import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Modal from 'react-modal';
Modal.setAppElement('#root');
import './App.css';

Amplify.configure(awsconfig);

function App() {
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const loadNickname = async () => {
      try {
        await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setNickname(attributes.nickname || '名無し');
      } catch (err) {
        console.error('ニックネーム取得失敗:', err);
        setNickname('名無し');
      }
    };

    loadNickname();
  }, []);

  return (
<Authenticator>
  {({ signOut }) => (
    <Router>
      <div className="app-container">
      <header className="app-header">
  <div className="header-logo">
    <img src="/img/gunshikin-icon2.png" alt="軍資金アイコン" />
  </div>
  <div className="header-user">
    <span>ようこそ、<strong>“{nickname}”</strong> さん</span>
    <button onClick={signOut}>サインアウト</button>
  </div>
</header>


        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home nickname={nickname} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )}
</Authenticator>

  );
}

export default App;
