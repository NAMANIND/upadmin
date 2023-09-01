import React from "react";

const Navbar = () => {
  return (
    <div
      style={{
        // width: "100%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        height: "40px",
        padding: "20px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div>
        <img src="acplus.jpg" alt="Comapny logo" />
      </div>
    </div>
  );
};

export default Navbar;
