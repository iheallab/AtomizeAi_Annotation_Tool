// import React from "react";
// import { Col, Row, Typography, Radio, notification } from "antd";
// import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

// const { Title } = Typography;
// import "./question.css";

// interface QuestionProps {
//   question_idx: number;
//   question: string;
//   questionValid: boolean | null;
//   setQuestionValidity: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
// }

// const Question: React.FC<QuestionProps> = ({
//   question_idx,
//   question,
//   questionValid,
//   setQuestionValidity,
// }) => {
//   const [api, contextHolder] = notification.useNotification();
//   console.log("Question Validity in Question.tsx", questionValid);
//   const openNotification = (pauseOnHover: boolean) => () => {
//     api.open({
//       message: "Notification Title",
//       description:
//         "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
//       showProgress: true,
//       pauseOnHover,
//     });
//   };
//   return (
//     <Row className="question-row">
//       {contextHolder}
//       <Col span={18}>
//         <Title className="question-text" level={5}>
//           {question}
//         </Title>
//       </Col>
//       <Col span={6} className="like-dislike-buttons">
//         <Radio.Group
//           value={
//             questionValid === true
//               ? "like"
//               : questionValid === false
//               ? "dislike"
//               : undefined
//           } // Ensure no selection when null
//           onChange={(e) =>
//             setQuestionValidity((prev) => {
//               const updatedValidity = [...prev];
//               updatedValidity[question_idx] =
//                 e.target.value === "like"
//                   ? true
//                   : e.target.value === "dislike"
//                   ? false
//                   : null;
//               console.log(
//                 "Updated the new validity",
//                 updatedValidity[question_idx]
//               );
//               if (updatedValidity[question_idx] === false) {
//                 openNotification(true);
//               }
//               return updatedValidity;
//             })
//           }
//           buttonStyle="solid"
//         >
//           {/* Tick Button (Green) */}
//           <Radio.Button
//             value="like"
//             style={{
//               backgroundColor:
//                 questionValid === true ? "#52c41a" : "transparent",
//               color: questionValid === true ? "white" : "",
//             }}
//           >
//             <CheckOutlined />
//           </Radio.Button>

//           {/* Cross Button (Red) */}
//           <Radio.Button
//             value="dislike"
//             style={{
//               backgroundColor:
//                 questionValid === false ? "#ff4d4f" : "transparent",
//               color: questionValid === false ? "white" : "",
//             }}
//           >
//             <CloseOutlined />
//           </Radio.Button>
//         </Radio.Group>
//       </Col>
//     </Row>
//   );
// };

// export default Question;
import React, { useEffect } from "react";
import { Col, Row, Typography, Radio, notification } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Title } = Typography;
import "./question.css";

interface QuestionProps {
  question_idx: number;
  question: string;
  questionValid: boolean | null;
  setQuestionValidity: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
}

const Question: React.FC<QuestionProps> = ({
  question_idx,
  question,
  questionValid,
  setQuestionValidity,
}) => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (pauseOnHover: boolean = true) => {
    api.destroy(); // Prevent duplicate notifications
    api.open({
      message: "Please provide feedback",
      description:
        "You have selected 'Dislike'. Please provide feedback to justify your choice.",
      duration: 1,
      pauseOnHover,
      showProgress: true,
      placement: "topRight",
    });
  };

  // Use `useEffect` to detect changes and trigger notification only when `questionValid` changes to `false`
  useEffect(() => {
    if (questionValid === false) {
      openNotification();
    }
  }, [questionValid]); // Run effect only when `questionValid` changes

  return (
    <Row className="question-row">
      {contextHolder}
      <Col span={18}>
        <Title className="question-text" level={5}>
          {question}
        </Title>
      </Col>
      <Col span={6} className="like-dislike-buttons">
        <Radio.Group
          value={
            questionValid === true
              ? "like"
              : questionValid === false
              ? "dislike"
              : undefined
          }
          onChange={(e) =>
            setQuestionValidity((prev) => {
              const updatedValidity = [...prev];
              updatedValidity[question_idx] =
                e.target.value === "like"
                  ? true
                  : e.target.value === "dislike"
                  ? false
                  : null;
              console.log(
                "Updated the new validity",
                updatedValidity[question_idx]
              );
              return updatedValidity;
            })
          }
          buttonStyle="solid"
        >
          {/* Tick Button (Green) */}
          <Radio.Button
            value="like"
            style={{
              backgroundColor:
                questionValid === true ? "#52c41a" : "transparent",
              color: questionValid === true ? "white" : "",
            }}
          >
            <CheckOutlined />
          </Radio.Button>

          {/* Cross Button (Red) */}
          <Radio.Button
            value="dislike"
            style={{
              backgroundColor:
                questionValid === false ? "#ff4d4f" : "transparent",
              color: questionValid === false ? "white" : "",
            }}
          >
            <CloseOutlined />
          </Radio.Button>
        </Radio.Group>
      </Col>
    </Row>
  );
};

export default Question;
