import { useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import { HeaderBottom } from "./components/Header-Bottom/Header-bottom";
import "./components/Home/Home.css";
import { Demo } from "./components/Modal/Modal";
import { Box } from "@chakra-ui/react";
import { AppRoutes } from "./routes/AppRoutes";

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
        <Box as="main" >
          <AppRoutes />
        </Box>
      </div>
    </>
  );
}


export default App;
