import React from "react";
import { Carousel } from "antd";
import "antd/dist/reset.css"; // Ensure AntD styles are applied

const Annotations: React.FC = () => {
  const contentStyle: React.CSSProperties = {
    height: "100vh", // Full viewport height
    width: "100vw", // Full viewport width
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // fontSize: "24px",
    // color: "#fff",
    background: "#364d79",
  };

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Carousel
        arrows
        infinite={false}
        prevArrow={<button style={{ backgroundColor: "#000000" }}></button>}
        // prevArrow={<button className="custom-arrow left">{"<"}</button>}
        // nextArrow={<button className="custom-arrow right">{">"}</button>}
      >
        <div>
          <h3 style={contentStyle}>Annotation 1</h3>
        </div>
        <div>
          <h3 style={contentStyle}>Annotation 2</h3>
        </div>
        <div>
          <h3 style={contentStyle}>Annotation 3</h3>
        </div>
        <div>
          <h3 style={contentStyle}>Annotation 4</h3>
        </div>
      </Carousel>
    </div>
  );
};

export default Annotations;
