import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddRecord from './pages/AddRecord';
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
              <h1>💰軍資金💰</h1>
              <h1>投入記録・支払原資紐付管理簿</h1>
              <p>ようこそ、<strong>”{nickname}”</strong>さん
              <button onClick={signOut}>サインアウト</button></p>
            </header>

            <nav className="app-nav">
            <Link to="/add">➕ 新規登録 ➕</Link>
              <Link to="/">📋 記録一覧 📋</Link>
            </nav>

            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/add" element={<AddRecord nickname={nickname} />} />
              </Routes>
            </main>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;
