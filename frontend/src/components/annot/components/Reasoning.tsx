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

// import React, { useEffect } from "react";
// import { Alert, Card, notification } from "antd";
// import { DislikeOutlined, LikeOutlined } from "@ant-design/icons";

// interface ReasoningComponents {
//   reasoning: string;
//   reasoningValid: boolean | null;
//   setReasoningValid: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
//   questionIndex: number;
// }

// const Reasoning: React.FC<ReasoningComponents> = ({
//   reasoning,
//   reasoningValid,
//   setReasoningValid,
//   questionIndex,
// }) => {
//   console.log("Reasoning Validity", reasoningValid);
//   const [api, contextHolder] = notification.useNotification();

//   // useEffect(() => {
//   //   if (reasoningValid === false && !feedback) {
//   //     openNotification();
//   //   }
//   // }, [reasoningValid]); // Run effect only when `questionValid` changes

//   const openNotification = (pauseOnHover: boolean = true) => {
//     api.destroy(); // Prevent duplicate notifications
//     api.open({
//       message: "Please provide feedback",
//       // description: "Please Provide Feedback as to why the question is invalid",
//       duration: 1,
//       pauseOnHover,
//       showProgress: true,
//       placement: "bottomRight",
//     });
//   };
//   return (
//     <Card
//       style={{
//         alignSelf: "center",
//         border: "0.1px solid rgba(128, 128, 128, 0.5)",
//       }}
//       title="Reasoning"
//       hoverable
//       actions={[
//         <div
//           style={{
//             width: "100%",
//             textAlign: "right",
//             paddingRight: "15px",
//           }}
//         >
//           {contextHolder}
//           <LikeOutlined
//             style={{
//               color:
//                 reasoningValid === null
//                   ? "gray"
//                   : reasoningValid
//                   ? "green"
//                   : "gray",
//               fontSize: "18px",
//               cursor: "pointer",
//             }}
//             onClick={() =>
//               setReasoningValid((prev: (boolean | null)[]) => {
//                 const updated = [...prev];
//                 updated[questionIndex] = true;
//                 return updated;
//               })
//             }
//           />
//           <DislikeOutlined
//             style={{
//               color:
//                 reasoningValid === null
//                   ? "gray"
//                   : reasoningValid === false
//                   ? "red"
//                   : "gray",
//               fontSize: "18px",
//               cursor: "pointer",
//               marginRight: "120px",
//             }}
//             onClick={() =>
//               setReasoningValid((prev: (boolean | null)[]) => {
//                 const updated = [...prev];
//                 updated[questionIndex] = false;
//                 openNotification(true);
//                 return updated;
//               })
//             }
//           />
//         </div>,
//       ]}
//     >
//       <Alert message={<p style={{ textAlign: "justify" }}>{reasoning}</p>} />
//     </Card>
//   );
// };

// export default Reasoning;

import React from "react";
import { Alert, Card, notification, Space } from "antd";
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
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (pauseOnHover: boolean = true) => {
    api.destroy(); // Prevent duplicate notifications
    api.open({
      message: "Please provide feedback",
      duration: 1,
      pauseOnHover,
      placement: "bottomRight",
    });
  };

  return (
    <Card
      style={{
        alignSelf: "center",
        border: "0.1px solid rgba(128, 128, 128, 0.5)",
      }}
      title="Reasoning"
      hoverable
      actions={[
        <div
          style={{
            width: "100%",
            textAlign: "right",
            paddingRight: "15px",
          }}
        >
          {contextHolder}
          <Space size="middle">
            <LikeOutlined
              style={{
                color: reasoningValid === true ? "green" : "gray",
                fontSize: "18px",
                cursor: "pointer",
              }}
              onClick={() =>
                setReasoningValid((prev: (boolean | null)[]) => {
                  const updated = [...prev];
                  updated[questionIndex] = true;
                  return updated;
                })
              }
            />
            <DislikeOutlined
              style={{
                color: reasoningValid === false ? "red" : "gray",
                fontSize: "18px",
                cursor: "pointer",
                marginRight: "15px",
              }}
              onClick={() =>
                setReasoningValid((prev: (boolean | null)[]) => {
                  const updated = [...prev];
                  updated[questionIndex] = false;
                  openNotification(true);
                  return updated;
                })
              }
            />
          </Space>
        </div>,
      ]}
    >
      <Alert message={<p style={{ textAlign: "justify" }}>{reasoning}</p>} />
    </Card>
  );
};

export default Reasoning;
