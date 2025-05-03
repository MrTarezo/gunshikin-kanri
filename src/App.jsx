import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import awsconfig from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddRecord from './pages/AddRecord';
import Home from './pages/Home';

Amplify.configure(awsconfig);

function App() {
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const loadNickname = async () => {
      try {
        await getCurrentUser(); // セッション確認
        const attributes = await fetchUserAttributes(); // ← 正しい関数名
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
          <div>
            <h1>軍資金投入記録・支払原資紐付管理簿</h1>
            <p>ようこそ、{nickname}</p>
            <button onClick={signOut}>サインアウト</button>

            <nav>
              <Link to="/">記録一覧</Link> | <Link to="/add">新規登録</Link>
            </nav>

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<AddRecord nickname={nickname} />} />
            </Routes>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;
