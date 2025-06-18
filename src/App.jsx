import { useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import { HeaderBottom } from "./components/Header-Bottom/Header-bottom";
import "./components/Home/Home.css";
import { Demo } from "./components/Modal/Modal";

function App() {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <div className="home" id="home">
        <Header onSignUpClick={openModal} />
        <Demo isOpen={isModalOpen} onClose={closeModal} />
        <HeaderBottom />
      </div>
    </>
  );
}

export default App;
