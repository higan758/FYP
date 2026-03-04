import React from "react";
import { Outlet, Route } from "react-router-dom";
import Navbar from "../../components/Navbar";
import styles from "../../styles/adminDashboard.module.css";

export default function AdminLayout() {
  return (
    

      <main className={styles.mainContent}>
        <Outlet />
      </main>
  
  );
}
