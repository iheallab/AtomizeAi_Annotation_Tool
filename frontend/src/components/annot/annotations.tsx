import React, { useState, useEffect } from "react";
import { Card, Button, Col, Row } from "antd";
import AnnotationComponent from "./annotation_component";

const questions = Array.from({ length: 100 }, (_, i) => ({
  question_text: `Question ${i + 1}: Sample question text here?`,
  tasks: [
    {
      table: "sample_table",
      task: `Task for question ${i + 1}`,
      sql_query: `SELECT * FROM sample_table WHERE id = ${i + 1}`,
    },
  ],
}));

const Annotations: React.FC = () => {
  useEffect(() => {
    const fetchAnnotations = async () => {
      const token = localStorage.getItem("jwt"); // ✅ Retrieve token
      if (!token) {
        console.error("No JWT found, user not authenticated");
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/annotations", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Include JWT token in request
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch annotations: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Annotations:", data); // ✅ Log annotations
      } catch (error) {
        console.error("Error fetching annotations:", error);
      }
    };

    fetchAnnotations();
  }, []);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<boolean[]>(
    Array(questions.length).fill(false)
  );

  const markAsDone = () => {
    setCompletedQuestions((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = true;
      return updated;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "90%",
        margin: "0 auto",
      }}
    >
      <AnnotationComponent
        question={questions[currentQuestionIndex]}
        // currentQuestionIndex={currentQuestionIndex}
        // setCurrentQuestionIndex={setCurrentQuestionIndex}
        // completedQuestions={completedQuestions}
      />

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <Button
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
          }
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button onClick={markAsDone}>Submit</Button>
        <Button
          onClick={() =>
            setCurrentQuestionIndex((prev) =>
              Math.min(prev + 1, questions.length - 1)
            )
          }
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Annotations;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "antd";
// import AnnotationComponent from "./annotation_component";

// const Annotations: React.FC = () => {
//   const [questions, setQuestions] = useState<any[]>([]);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [completedQuestions, setCompletedQuestions] = useState<boolean[]>([]);
//   const [loading, setLoading] = useState(true); // ✅ Track loading state

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAnnotations = async () => {
//       const token = localStorage.getItem("jwt");
//       if (!token) {
//         console.error("No JWT found, user not authenticated");
//         // return;
//         navigate("/login");
//       }

//       try {
//         const response = await fetch("http://localhost:8080/annotations", {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch annotations: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log("Fetched Annotations:", data.questions); // ✅ Log response

//         setQuestions(data.questions);
//         setCompletedQuestions(Array(data.questions.length).fill(false));
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching annotations:", error);
//       }
//     };

//     fetchAnnotations();
//   }, []);

//   // ✅ Prevents rendering before questions are loaded
//   if (loading) {
//     return <div>Loading annotations...</div>;
//   }

//   if (questions.length === 0) {
//     return <div>No questions available</div>;
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         height: "100vh",
//       }}
//     >
//       <AnnotationComponent
//         question={questions[currentQuestionIndex]}
//         currentQuestionIndex={currentQuestionIndex}
//         setCurrentQuestionIndex={setCurrentQuestionIndex}
//         completedQuestions={completedQuestions}
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
//         <Button
//           onClick={() =>
//             setCompletedQuestions((prev) => {
//               const updated = [...prev];
//               updated[currentQuestionIndex] = true;
//               return updated;
//             })
//           }
//         >
//           Submit
//         </Button>
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
