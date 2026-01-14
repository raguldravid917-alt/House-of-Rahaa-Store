import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { Outlet, useNavigate } from "react-router-dom";
import Spinner from "../Spinner";
import axios from "axios";

export default function AdminRoute() {
  const [ok, setOk] = useState(false);
  const [auth, setAuth] = useAuth(); // setAuth தேவைப்படலாம்
  const navigate = useNavigate();

  useEffect(() => {
    const authCheck = async () => {
      // 👇 Debugging Logs (Console-ல் பார்க்கவும்)
      console.log("Checking Admin Access...");
      console.log("User Role:", auth?.user?.role);

      // Client Side Check (Fastest)
      if (auth?.user?.role === 1) {
          setOk(true);
      } else {
          // Server Side Double Check (More Secure)
          try {
              const res = await axios.get("http://localhost:5000/api/v1/auth/admin-auth");
              if (res.data.ok) {
                  setOk(true);
              } else {
                  setOk(false);
              }
          } catch (error) {
              console.log("Admin Check Failed", error);
              setOk(false);
          }
      }
    };

    if (auth?.token) authCheck();
  }, [auth?.token, auth?.user?.role]);

  return ok ? <Outlet /> : <Spinner path="" />;
}