import React from "react";
import { ClipLoader } from "react-spinners"; // or any spinner from react-spinners

export const Loader: React.FC = () => (
  <div className="d-flex justify-content-center align-items-center h-100 w-100" style={{position: "absolute", top: 0, left: 0, background: "#fff", zIndex: 9999}}>
    <ClipLoader color="#007bff" size={60} />
  </div>
);