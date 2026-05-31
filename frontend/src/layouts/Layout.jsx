import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ImSpinner2 } from "react-icons/im";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-black flex justify-center items-center px-2">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "25px",
            background: "#202635",
            color: "#fff",
            padding: "5px 20px",
          },
          loading: {
            icon: <ImSpinner2 className="animate-spin size-5" />,
          },
        }}
      />
    </div>
  );
}
