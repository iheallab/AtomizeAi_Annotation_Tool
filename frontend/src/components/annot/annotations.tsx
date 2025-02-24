// import React, { useState, useEffect } from "react";
// import { Card, Button, Col, Row } from "antd";
import AnnotationComponent from "./annotation_component";

// const Annotations: React.FC = () => {
//   // console.log("Annotations component rendered");
//   const [questions, setQuestions] = useState<any[]>([]);
//   useEffect(() => {
//     const fetchAnnotations = async () => {
//       const token = localStorage.getItem("jwt"); // ✅ Retrieve token
//       console.log("Token:", token);
//       if (!token) {
//         console.error("No JWT found, user not authenticated");
//         return;
//       }

//       console.log("Fetching annotations...");

//       try {
//         const response = await fetch("http://localhost:8080/annotations", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`, // ✅ Include JWT token in request
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch annotations: ${response.status}`);
//         }

//         const data = await response.json();
//         setQuestions(data.questions);
//         console.log("Fetched Annotations:", data); // ✅ Log annotations
//       } catch (error) {
//         console.error("Error fetching annotations:", error);
//       }
//     };

//     fetchAnnotations();
//   }, []);

//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [completedQuestions, setCompletedQuestions] = useState<boolean[]>(
//     Array(questions.length).fill(false)
//   );

//   const markAsDone = () => {
//     setCompletedQuestions((prev) => {
//       const updated = [...prev];
//       updated[currentQuestionIndex] = true;
//       return updated;
//     });
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         height: "100vh",
//         width: "90%",
//         margin: "0 auto",
//       }}
//     >
//       <AnnotationComponent
//         question={questions[currentQuestionIndex]}
//         // currentQuestionIndex={currentQuestionIndex}
//         // setCurrentQuestionIndex={setCurrentQuestionIndex}
//         // completedQuestions={completedQuestions}
//       />

//       <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
//         <Button
//           onClick={() =>
//             setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
//           }
//           disabled={currentQuestionIndex === 0}
//         >
//           Previous
//         </Button>
//         <Button onClick={markAsDone}>Submit</Button>
//         <Button
//           onClick={() =>
//             setCurrentQuestionIndex((prev) =>
//               Math.min(prev + 1, questions.length - 1)
//             )
//           }
//           disabled={currentQuestionIndex === questions.length - 1}
//         >
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Annotations;

import React, { useState, useEffect } from "react";
import { Button, Space, Spin, Alert } from "antd";
import { useNavigate } from "react-router-dom";

interface TaskData {
  task_id: number;
  task: string;
}

interface QuestionData {
  _id: string;
  category: string;
  question: string;
  question_id: number;
  retrieval_tasks: TaskData[];
}

const Annotations: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchAnnotations = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("jwt");

      if (!token) {
        setError("No JWT found. Please log in.");
        setIsLoading(false);
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/annotations", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched annotations:", data);

        setQuestions(data.questions);
        setCompletedQuestions(new Array(data.questions.length).fill(false));
      } catch (error) {
        console.error("Error fetching annotations:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch annotations"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnotations();
  }, []);

  const markAsDone = () => {
    setCompletedQuestions((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = true;
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Alert
          message="No Questions"
          description="No questions available."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "110vh",
        width: "90%",
        margin: "0 auto",
      }}
    >
      <AnnotationComponent
        key={questions[currentQuestionIndex]._id} // Force remount
        question={questions[currentQuestionIndex]}
      />

      <Space size="middle" style={{ marginTop: 20 }}>
        <Button
          type="primary"
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
          }
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <Button type="primary" onClick={markAsDone}>
          Submit
        </Button>

        <Button
          type="primary"
          onClick={() =>
            setCurrentQuestionIndex((prev) =>
              Math.min(prev + 1, questions.length - 1)
            )
          }
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next
        </Button>
      </Space>
    </div>
  );
};

export default Annotations;
