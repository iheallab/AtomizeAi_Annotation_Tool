import AnnotationComponent from "./annotation_component";

import React, { useState, useEffect } from "react";
import { Button, Space, Spin, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import "./annotations.css";

interface TaskData {
  task_id: number;
  task: string;
  valid?: boolean;
}

interface QuestionData {
  _id: string;
  category: string;
  question: string;
  question_id: number;
  retrieval_tasks: TaskData[];
  feedback?: string;
}

const Annotations: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);

  const [taskValidity, setTaskValidity] = useState<
    Record<number, Record<number, boolean>>
  >({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  useEffect(() => {
    if (questions.length > 0) {
      const initialValidity: Record<number, Record<number, boolean>> = {};
      const initialFeedback: Record<string, string> = {};

      questions.forEach((q) => {
        initialValidity[q.question_id] = q.retrieval_tasks.reduce(
          (acc, task) => {
            acc[task.task_id] = task.valid ?? false;
            return acc;
          },
          {} as Record<number, boolean>
        );
        initialFeedback[q._id] = q.feedback || "";
      });

      setTaskValidity(initialValidity);
      setFeedback(initialFeedback);
    }
  }, [questions]);
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
        setAnsweredQuestions(new Array(data.questions.length).fill(false));
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
    setAnsweredQuestions((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = true;
      return updated;
    });
  };

  const handleSubmit = () => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => {
        if (q._id === questions[currentQuestionIndex]._id) {
          return {
            ...q,
            retrieval_tasks: q.retrieval_tasks.map((task) => ({
              ...task,
              valid: taskValidity[q.question_id]?.[task.task_id] ?? false,
            })),
            feedback: feedback[q._id] || "",
          };
        }
        return q;
      })
    );

    setAnsweredQuestions((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = true;
      return updated;
    });
  };

  //   if (isLoading) {
  //     return (
  //       <div
  //         style={{
  //           display: "flex",
  //           justifyContent: "center",
  //           alignItems: "center",
  //           height: "100vh",
  //         }}
  //       >
  //         <Spin size="large" />
  //       </div>
  //     );
  //   }

  //   if (error) {
  //     return (
  //       <div
  //         style={{
  //           display: "flex",
  //           justifyContent: "center",
  //           alignItems: "center",
  //           height: "100vh",
  //         }}
  //       >
  //         <Alert message="Error" description={error} type="error" showIcon />
  //       </div>
  //     );
  //   }

  //   if (!questions.length) {
  //     return (
  //       <div
  //         style={{
  //           display: "flex",
  //           justifyContent: "center",
  //           alignItems: "center",
  //           height: "100vh",
  //         }}
  //       >
  //         <Alert
  //           message="No Questions"
  //           description="No questions available."
  //           type="info"
  //           showIcon
  //         />
  //       </div>
  //     );
  //   }

  //   return (
  //     <div
  //       style={{
  //         display: "flex",
  //         flexDirection: "column",
  //         alignItems: "center",
  //         justifyContent: "center",
  //         minHeight: "110vh",
  //         width: "90%",
  //         margin: "0 auto",
  //       }}
  //     >
  //       {/* <AnnotationComponent
  //         key={questions[currentQuestionIndex]._id} // Force remount
  //         question={questions[currentQuestionIndex]}
  //         questions_list={questions}
  //         answeredQuestions={answeredQuestions}
  //         currentQuestionIndex={currentQuestionIndex}
  //         setCurrentQuestionIndex={setCurrentQuestionIndex}
  //       /> */}
  //       <AnnotationComponent
  //         key={questions[currentQuestionIndex]._id} // Forces remount
  //         question={questions[currentQuestionIndex]}
  //         questions_list={questions}
  //         answeredQuestions={answeredQuestions}
  //         currentQuestionIndex={currentQuestionIndex}
  //         setCurrentQuestionIndex={setCurrentQuestionIndex}
  //         taskValidity={taskValidity}
  //         setTaskValidity={setTaskValidity}
  //         feedback={feedback}
  //         setFeedback={setFeedback}
  //       />

  //       <Space size="middle" style={{ marginTop: 20 }}>
  //         <Button
  //           type="primary"
  //           onClick={() =>
  //             setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
  //           }
  //           disabled={currentQuestionIndex === 0}
  //         >
  //           Previous
  //         </Button>

  //         <Button type="primary" onClick={handleSubmit}>
  //           Submit
  //         </Button>

  //         <Button
  //           type="primary"
  //           onClick={() =>
  //             setCurrentQuestionIndex((prev) =>
  //               Math.min(prev + 1, questions.length - 1)
  //             )
  //           }
  //           disabled={currentQuestionIndex === questions.length - 1}
  //         >
  //           Next
  //         </Button>
  //       </Space>
  //     </div>
  //   );
  // };

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="no-questions-container">
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
    <div className="annotations-container">
      <AnnotationComponent
        key={questions[currentQuestionIndex]._id}
        question={questions[currentQuestionIndex]}
        questions_list={questions}
        answeredQuestions={answeredQuestions}
        currentQuestionIndex={currentQuestionIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        taskValidity={taskValidity}
        setTaskValidity={setTaskValidity}
        feedback={feedback}
        setFeedback={setFeedback}
      />

      <Space size="middle" className="navigation-buttons">
        <Button
          type="primary"
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
          }
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <Button type="primary" onClick={handleSubmit}>
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
