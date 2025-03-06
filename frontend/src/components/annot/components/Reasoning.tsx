// import React from "react";
// import { Alert, Card, Space, Button } from "antd";
// import { DislikeOutlined, LikeOutlined } from "@ant-design/icons";

// interface ReasoningComponents {
//   reasoning: string;
//   reasoningValid: boolean;
//   setReasoningValid: React.Dispatch<React.SetStateAction<boolean[]>>;
//   questionIndex: number;
// }

// const Reasoning: React.FC<ReasoningComponents> = ({
//   reasoning,
//   reasoningValid,
//   setReasoningValid,
//   questionIndex,
// }) => {
//   return (
//     <div>
//       <Card title="Reasoning" hoverable>
//         <Alert
//           message={<p style={{ textAlign: "justify" }}>{reasoning}</p>}
//           // type="error"
//         />
//       </Card>
//       {/* <Alert
//         message="Very long warning text warning text text text text text text text"
//         banner
//         closable
//       /> */}
//       {/* Like & Dislike Buttons */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "flex-end",
//           marginTop: "10px",
//         }}
//       >
//         <Space>
//           <Button
//             type={reasoningValid ? "primary" : "default"} // ✅ Highlight if selected
//             icon={<LikeOutlined />}
//             onClick={() =>
//               setReasoningValid((prev: boolean[]) => {
//                 const updated = [...prev];
//                 updated[questionIndex] = true; // ✅ Mark as liked
//                 return updated;
//               })
//             }
//           />
//           <Button
//             type={!reasoningValid ? "primary" : "default"} // ✅ Highlight if selected
//             icon={<DislikeOutlined />}
//             onClick={() =>
//               setReasoningValid((prev: boolean[]) => {
//                 const updated = [...prev];
//                 updated[questionIndex] = false; // ✅ Mark as disliked
//                 return updated;
//               })
//             }
//           />
//         </Space>
//       </div>
//     </div>
//   );
// };
// export default Reasoning;

import React from "react";
import { Alert, Card } from "antd";
import { DislikeOutlined, LikeOutlined } from "@ant-design/icons";

interface ReasoningComponents {
  reasoning: string;
  reasoningValid: boolean | null;
  setReasoningValid: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  questionIndex: number;
}

const Reasoning: React.FC<ReasoningComponents> = ({
  reasoning,
  reasoningValid,
  setReasoningValid,
  questionIndex,
}) => {
  console.log("Reasoning Validity", reasoningValid);
  return (
    <Card
      title="Reasoning"
      hoverable
      extra={
        <>
          {/* ✅ Subtle Like/Dislike icons */}
          <LikeOutlined
            style={{
              color:
                reasoningValid === null
                  ? "gray"
                  : reasoningValid
                  ? "green"
                  : "gray", // ✅ Gray if null
              fontSize: "18px",
              cursor: "pointer",
              marginRight: "10px",
            }}
            onClick={() =>
              setReasoningValid((prev: (boolean | null)[]) => {
                const updated = [...prev];
                updated[questionIndex] = true; // ✅ Mark as liked
                return updated;
              })
            }
          ></LikeOutlined>
          <DislikeOutlined
            style={{
              color:
                reasoningValid === null
                  ? "gray"
                  : reasoningValid === false
                  ? "red"
                  : "gray", // ✅ Gray if null
              fontSize: "18px",
              cursor: "pointer",
            }}
            onClick={() =>
              setReasoningValid((prev: (boolean | null)[]) => {
                const updated = [...prev];
                updated[questionIndex] = false; // ✅ Mark as disliked
                return updated;
              })
            }
          />
        </>
      }
    >
      <Alert message={<p style={{ textAlign: "justify" }}>{reasoning}</p>} />
    </Card>
  );
};

export default Reasoning;
