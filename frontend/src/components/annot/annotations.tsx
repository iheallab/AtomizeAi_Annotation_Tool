import AnnotationComponent from "./annotation_component";

import React, { useState, useEffect, useContext } from "react";
import { Button, Space, Spin, Alert, message, Tooltip, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import "./annotations.css";
import { QuestionData } from "./types";
import { StepBackwardFilled, StepForwardOutlined } from "@ant-design/icons";
import { AuthContext } from "../AuthContext";
import { backendURI } from "../commons";

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
  const [openTour, setOpenTour] = useState<boolean>(false);

  const [tasksComplete, setTasksComplete] = useState<boolean[]>([]);
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
  useEffect(() => {
    const initialFeedback: Record<string, string> = {};
    const initialQuestionValidity: (boolean | null)[] = [];
    const initialReasoningValidity: (boolean | null)[] = [];
    const initialTasksComplete: boolean[] = [];

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
        initialTasksComplete[index] = q.tasks_complete;
        // initialReasoningValidity[index] = true;
        // console.log("Initial Reasoning Validity", initialReasoningValidity);
      });

      setFeedback(initialFeedback);
      setQuestionValidity(initialQuestionValidity);
      setReasoningValidity(initialReasoningValidity);
      setTasksComplete(initialTasksComplete);
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
        const response = await fetch(backendURI + "annotations", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // throw new Error(`HTTP error! status: ${response.status}`);
          navigate("/login");
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
    console.log(
      "Tasks Complete before submit:",
      tasksComplete[currentQuestionIndex]
    );

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
      tasks_complete: tasksComplete[currentQuestionIndex], // ✅ Ensure correct value is included
    };

    console.log("Updated question before API call:", updatedQuestion);

    // Update local state optimistically
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
      const response = await fetch(backendURI + "annotations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedQuestion),
      });

      if (!response.ok) {
        errorMsg();
        throw new Error(`Failed to update annotation: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Annotation updated successfully", responseData);

      // ✅ Ensure we update tasksComplete based on response
      setTasksComplete((prev) => {
        const updated = [...prev];
        updated[currentQuestionIndex] = responseData.tasks_complete; // Ensure it reflects backend value
        return updated;
      });

      success();
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

  // return (
  //   // console.log("Answered Questions in Annotations", answeredQuestions),
  //   <div className="annotations-container">
  //     <AnnotationComponent
  //       key={questions[currentQuestionIndex]._id}
  //       question={questions[currentQuestionIndex]}
  //       questions_list={questions}
  //       answeredQuestions={answeredQuestions}
  //       currentQuestionIndex={currentQuestionIndex}
  //       setCurrentQuestionIndex={setCurrentQuestionIndex}
  //       // taskValidity={taskValidity}
  //       // setTaskValidity={setTaskValidity}
  //       variableValidity={variableValidity}
  //       setVariableValidity={setVariableValidity}
  //       feedback={feedback}
  //       setFeedback={setFeedback}
  //       questionValid={questionValid}
  //       setQuestionValidity={setQuestionValidity}
  //       reasoningValid={reasoningValid}
  //       setReasoningValid={setReasoningValidity}
  //       tasksComplete={tasksComplete}
  //       setTasksComplete={setTasksComplete}
  //       openTour={openTour}
  //       setOpenTour={setOpenTour}
  //     />
  //     {/* <FloatButton
  //       icon={<ArrowLeftOutlined />}
  //       onClick={() => logout()}
  //       style={{ top: 20, right: 20 }}
  //     /> */}
  //     {/* <FloatButton
  //       // icon={<ArrowLeftOutlined />}
  //       description="Logout"
  //       shape="square"
  //       onClick={() => logout()}
  //       style={{ bottom: 20, left: 20 }}
  //     /> */}
  //     <Row
  //       style={{
  //         position: "fixed",
  //         bottom: 10,
  //         left: 10,
  //         zIndex: 1000,
  //       }}
  //     >
  //       <Col style={{ marginRight: 10 }}>
  //         <Button type="primary" danger onClick={logout}>
  //           Logout
  //         </Button>
  //       </Col>
  //       <Col>
  //         <Button type="primary" danger onClick={() => setOpenTour(true)}>
  //           Need Help?
  //         </Button>
  //       </Col>
  //     </Row>

  //     <Space size="middle" className="navigation-buttons">
  //       <Button
  //         // type="outlined"
  //         variant="outlined"
  //         color="primary"
  //         onClick={() =>
  //           setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
  //         }
  //         disabled={currentQuestionIndex === 0}
  //       >
  //         <LeftOutlined />
  //       </Button>
  //       {contextHolder}
  //       <Tooltip
  //         title={
  //           reasoningValid[currentQuestionIndex] === null &&
  //           questionValid[currentQuestionIndex] === null
  //             ? "Please annotate reasoning and question validity."
  //             : reasoningValid[currentQuestionIndex] === null &&
  //               !feedback[questions[currentQuestionIndex]._id]
  //             ? "Please annotate reasoning validity."
  //             : questionValid[currentQuestionIndex] === null &&
  //               !feedback[questions[currentQuestionIndex]._id]
  //             ? "Please annotate question validity."
  //             : (!reasoningValid[currentQuestionIndex] ||
  //                 !questionValid[currentQuestionIndex]) &&
  //               !feedback[questions[currentQuestionIndex]._id]
  //             ? `Please provide feedback on why ${
  //                 !reasoningValid[currentQuestionIndex] &&
  //                 !questionValid[currentQuestionIndex]
  //                   ? "both reasoning and question validity"
  //                   : !reasoningValid[currentQuestionIndex]
  //                   ? "reasoning validity"
  //                   : "question validity"
  //               } is marked as false.`
  //             : !reasoningValid[currentQuestionIndex] &&
  //               !feedback[questions[currentQuestionIndex]._id]
  //             ? "Please provide feedback on why reasoning is marked as false."
  //             : !questionValid[currentQuestionIndex] &&
  //               !feedback[questions[currentQuestionIndex]._id]
  //             ? "Please provide feedback on why question validity is marked as false."
  //             : ""
  //         }
  //       >
  //         <Button
  //           variant="outlined"
  //           color="green"
  //           onClick={handleSubmit}
  //           disabled={
  //             !feedback[questions[currentQuestionIndex]._id] &&
  //             (!reasoningValid[currentQuestionIndex] ||
  //               !questionValid[currentQuestionIndex])
  //           }
  //         >
  //           Submit
  //         </Button>
  //       </Tooltip>

  //       <Button
  //         // type="outlined"
  //         variant="outlined"
  //         color="primary"
  //         onClick={() =>
  //           setCurrentQuestionIndex((prev) =>
  //             Math.min(prev + 1, questions.length - 1)
  //           )
  //         }
  //         disabled={currentQuestionIndex === questions.length - 1}
  //       >
  //         <RightOutlined />
  //       </Button>
  //     </Space>
  //   </div>
  // );
  return (
    <div className="annotations-container">
      {contextHolder}
      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : error ? (
        <div className="error-container">
          <Alert message="Error" description={error} type="error" showIcon />
        </div>
      ) : !questions.length ? (
        <div className="no-questions-container">
          <Alert
            message="No Questions"
            description="No questions available."
            type="info"
            showIcon
          />
        </div>
      ) : (
        <>
          <AnnotationComponent
            key={questions[currentQuestionIndex]._id}
            question={questions[currentQuestionIndex]}
            questions_list={questions}
            answeredQuestions={answeredQuestions}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            variableValidity={variableValidity}
            setVariableValidity={setVariableValidity}
            feedback={feedback}
            setFeedback={setFeedback}
            questionValid={questionValid}
            setQuestionValidity={setQuestionValidity}
            reasoningValid={reasoningValid}
            setReasoningValid={setReasoningValidity}
            tasksComplete={tasksComplete}
            setTasksComplete={setTasksComplete}
            openTour={openTour}
            setOpenTour={setOpenTour}
          />

          {/* 🔹 Fixed Bottom Navigation Bar */}
          <Row
            justify="space-between"
            align="middle"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              background: "#fff",
              padding: "12px 16px",
              boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
              zIndex: 1000,
            }}
          >
            {/* Left: Logout Button */}
            <Col>
              <Button type="primary" danger onClick={logout}>
                Logout
              </Button>
            </Col>

            {/* Center: Navigation Controls Group */}
            <Col>
              <Space size="small">
                <Button
                  type="default"
                  // icon={<LeftOutlined />}
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={currentQuestionIndex === 0}
                >
                  {/* Previous */}
                  <StepBackwardFilled style={{ fontSize: "20px" }} />
                </Button>

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
                    // type="primary"
                    variant="solid"
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
                  type="default"
                  // icon={<RightOutlined />}
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(prev + 1, questions.length - 1)
                    )
                  }
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  {/* Next */}
                  <StepForwardOutlined style={{ fontSize: "20px" }} />
                </Button>
              </Space>
            </Col>

            {/* Right: Need Help Button */}
            <Col>
              <Button type="default" onClick={() => setOpenTour(true)}>
                Need Help?
              </Button>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};
export default Annotations;
