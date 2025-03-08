import AnnotationComponent from "./annotation_component";

import React, { useState, useEffect, useContext } from "react";
import { Button, Space, Spin, Alert, message, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import "./annotations.css";
import { QuestionData } from "./types";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { AuthContext } from "../AuthContext";

const Annotations: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [questionValid, setQuestionValidity] = useState<(boolean | null)[]>([]);
  const [reasoningValid, setReasoningValidity] = useState<(boolean | null)[]>(
    []
  );

  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    console.log("Annotations Updated");
    messageApi.open({
      type: "success",
      content: "Annotated successfully",
      duration: 2,
    });
  };
  const errorMsg = () => {
    console.log("Error in Annotations");
    messageApi.open({
      type: "error",
      content: "Something Went Wrong",
      duration: 2,
    });
  };
  // const [taskValidity, setTaskValidity] = useState<
  //   Record<number, Record<number, boolean>>
  // >({});
  const [variableValidity, setVariableValidity] = useState<boolean[][][]>([]);
  const { logout } = useContext(AuthContext);

  const [feedback, setFeedback] = useState<Record<string, string>>({});

  // useEffect(() => {
  //   if (questions.length > 0) {
  //     // const initialValidity: Record<number, Record<number, boolean>> = {};
  //     const initialFeedback: Record<string, string> = {};

  //     // questions.forEach((q) => {
  //     //   initialValidity[q.question_id] = q.retrieval_tasks.reduce(
  //     //     (acc, task) => {
  //     //       acc[task.task_id] = task.valid ?? true;
  //     //       return acc;
  //     //     },
  //     //     {} as Record<number, boolean>
  //     //   );
  //     //   initialFeedback[q._id] = q.main_feedback || "";
  //     // });

  //     const initialValidity = questions.map((question) => {
  //       question.retrieval_tasks.map((task) =>
  //         task.variables.map((variable) => variable.valid ?? false)
  //       );
  //       setFeedback(initialFeedback);
  //     });
  //     setVariableValidity(initialValidity);
  //     // setTaskValidity(initialValidity);
  //   }
  // }, [questions]);
  useEffect(() => {
    const initialFeedback: Record<string, string> = {};
    const initialQuestionValidity: (boolean | null)[] = [];
    const initialReasoningValidity: (boolean | null)[] = [];

    if (questions.length > 0) {
      const initialValidity = questions.map((question) =>
        question.retrieval_tasks.map((task) =>
          task.variables.length > 0
            ? task.variables.map((variable) => variable.valid)
            : []
        )
      );

      setVariableValidity(initialValidity);

      questions.forEach((q, index) => {
        initialFeedback[q._id] = q.main_feedback || "";
        // console.log("Question Validity", q.question_valid);
        initialQuestionValidity[index] = q.question_valid ?? null; // Ensuring it gets set
        // console.log("Reasoning Validity", q.reasoning_valid);
        initialReasoningValidity[index] = q.reasoning_valid ?? null;
        // initialReasoningValidity[index] = true;
        // console.log("Initial Reasoning Validity", initialReasoningValidity);
      });

      setFeedback(initialFeedback);
      setQuestionValidity(initialQuestionValidity);
      setReasoningValidity(initialReasoningValidity);
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
        const response = await fetch(
          "https://backend-dot-ehr-chat-bot.uc.r.appspot.com/annotations",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched annotations:", data);
        const initialAnsweredState = data.questions.map((q: QuestionData) => {
          // return q.annotated_by == 0 ? false ?? false : true;
          return q.annotated_by == 0 ? false : true;

          // console.log(q.annotated, " for this question ", q.question);
        });
        console.log("Initial answered state:", initialAnsweredState);
        setAnsweredQuestions(initialAnsweredState);
        setQuestions(data.questions);
        // setAnsweredQuestions(new Array(data.questions.length).fill(false));
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

  const handleSubmit = async () => {
    console.log("Submitting annotation");
    console.log("Current question index:", currentQuestionIndex);
    console.log("Feedback: ", feedback[questions[currentQuestionIndex]._id]);
    // const updatedQuestion = {
    //   ...questions[currentQuestionIndex],
    //   retrieval_tasks: questions[currentQuestionIndex].retrieval_tasks.map(
    //     (task, task) => ({
    //       ...task,
    //       valid:
    //         taskValidity[questions[currentQuestionIndex].question_id]?.[
    //           task.task_id
    //         ] ?? false,
    //     })
    //   ),
    //   main_feedback: feedback[questions[currentQuestionIndex]._id] || "",
    //   // annotated_by: parseInt(localStorage.getItem("user_id") || "0"), // Ensuring annotator ID is saved
    // };
    const updatedQuestion = {
      ...questions[currentQuestionIndex],
      retrieval_tasks: questions[currentQuestionIndex].retrieval_tasks.map(
        (task, taskIndex) => ({
          ...task,
          variables: task.variables.map((variable, variableIndex) => ({
            ...variable,
            valid:
              variableValidity[currentQuestionIndex][taskIndex][variableIndex],
          })),
        })
      ),
      main_feedback: feedback[questions[currentQuestionIndex]._id] || "",
      question_valid: questionValid[currentQuestionIndex],
      reasoning_valid: reasoningValid[currentQuestionIndex],
    };
    // Update local state
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q._id === questions[currentQuestionIndex]._id ? updatedQuestion : q
      )
    );

    setAnsweredQuestions((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = true;
      return updated;
    });

    // Send the update to the backend
    const token = localStorage.getItem("jwt");

    try {
      const response = await fetch(
        "https://backend-dot-ehr-chat-bot.uc.r.appspot.com/annotations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedQuestion),
        }
      );

      if (!response.ok) {
        errorMsg();
        throw new Error(`Failed to update annotation: ${response.status}`);
      }
      success();
      console.log("Annotation updated successfully");
    } catch (error) {
      console.error("Error updating annotation:", error);
    }
  };

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
    // console.log("Answered Questions in Annotations", answeredQuestions),
    <div className="annotations-container">
      <AnnotationComponent
        key={questions[currentQuestionIndex]._id}
        question={questions[currentQuestionIndex]}
        questions_list={questions}
        answeredQuestions={answeredQuestions}
        currentQuestionIndex={currentQuestionIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        // taskValidity={taskValidity}
        // setTaskValidity={setTaskValidity}
        variableValidity={variableValidity}
        setVariableValidity={setVariableValidity}
        feedback={feedback}
        setFeedback={setFeedback}
        questionValid={questionValid}
        setQuestionValidity={setQuestionValidity}
        reasoningValid={reasoningValid}
        setReasoningValid={setReasoningValidity}
      />
      {/* <FloatButton
        icon={<ArrowLeftOutlined />}
        onClick={() => logout()}
        style={{ top: 20, right: 20 }}
      /> */}
      {/* <FloatButton
        // icon={<ArrowLeftOutlined />}
        description="Logout"
        shape="square"
        onClick={() => logout()}
        style={{ bottom: 20, left: 20 }}
      /> */}
      <Button
        type="primary"
        danger
        onClick={logout}
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          zIndex: 1000,
        }}
      >
        Logout
      </Button>

      <Space size="middle" className="navigation-buttons">
        <Button
          // type="outlined"
          variant="outlined"
          color="primary"
          onClick={() =>
            setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
          }
          disabled={currentQuestionIndex === 0}
        >
          <LeftOutlined />
        </Button>
        {contextHolder}
        <Tooltip
          title={
            reasoningValid[currentQuestionIndex] === null &&
            questionValid[currentQuestionIndex] === null
              ? "Please annotate reasoning and question validity."
              : reasoningValid[currentQuestionIndex] === null &&
                !feedback[questions[currentQuestionIndex]._id]
              ? "Please annotate reasoning validity."
              : questionValid[currentQuestionIndex] === null &&
                !feedback[questions[currentQuestionIndex]._id]
              ? "Please annotate question validity."
              : (!reasoningValid[currentQuestionIndex] ||
                  !questionValid[currentQuestionIndex]) &&
                !feedback[questions[currentQuestionIndex]._id]
              ? `Please provide feedback on why ${
                  !reasoningValid[currentQuestionIndex] &&
                  !questionValid[currentQuestionIndex]
                    ? "both reasoning and question validity"
                    : !reasoningValid[currentQuestionIndex]
                    ? "reasoning validity"
                    : "question validity"
                } is marked as false.`
              : !reasoningValid[currentQuestionIndex] &&
                !feedback[questions[currentQuestionIndex]._id]
              ? "Please provide feedback on why reasoning is marked as false."
              : !questionValid[currentQuestionIndex] &&
                !feedback[questions[currentQuestionIndex]._id]
              ? "Please provide feedback on why question validity is marked as false."
              : ""
          }
        >
          <Button
            variant="outlined"
            color="green"
            onClick={handleSubmit}
            disabled={
              !feedback[questions[currentQuestionIndex]._id] &&
              (!reasoningValid[currentQuestionIndex] ||
                !questionValid[currentQuestionIndex])
            }
          >
            Submit
          </Button>
        </Tooltip>

        <Button
          // type="outlined"
          variant="outlined"
          color="primary"
          onClick={() =>
            setCurrentQuestionIndex((prev) =>
              Math.min(prev + 1, questions.length - 1)
            )
          }
          disabled={currentQuestionIndex === questions.length - 1}
        >
          <RightOutlined />
        </Button>
      </Space>
    </div>
  );
};
export default Annotations;
