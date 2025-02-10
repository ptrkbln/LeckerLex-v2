import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-black flex justify-center items-center px-2">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
