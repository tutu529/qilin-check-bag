import "./App.css";
import MyLayout from "./components/MyLayout";
import ImageDetailPage1 from "./page/ImageDetailPage1";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  // const [count, setCount] = useState(0)

  return (

      <MyLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/image-detail1" replace />} />
          <Route path="/image-detail1" element={<ImageDetailPage1 />} />
        </Routes>
      </MyLayout>
  );
}

export default App;
