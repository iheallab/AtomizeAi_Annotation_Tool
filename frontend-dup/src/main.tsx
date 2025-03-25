import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { TourProvider } from "@reactour/tour";

const steps = [
  {
    selector: ".question-div",
    content: (
      <div className="text-sm">
        <h3 className="font-semibold text-base mb-2">Question & Context</h3>
        <p>
          This section contains the clinical question and supporting context.
        </p>
        <p className="mt-1">
          Carefully consider whether the question is relevant to the patient
          based on this context.
        </p>
      </div>
    ),
  },
  {
    selector: ".tasks-div",
    content: (
      <div className="text-sm">
        <h3 className="font-semibold text-base mb-2">Select Required Tasks</h3>
        <p>
          Here, you can toggle the data elements (like vitals, labs,
          medications) needed to answer the question.
        </p>
        <p className="mt-1">
          Use the switches to indicate which data you'd typically consult in a
          real-world scenario.
        </p>
      </div>
    ),
  },
  {
    selector: ".reasoning-card", // Add this class to the reasoning card container
    content: (
      <div className="text-sm">
        <h3 className="font-semibold text-base mb-2">Reasoning Section</h3>
        <p>
          This area explains how the system chose the listed tasks based on the
          question.
        </p>
        <p className="mt-1">
          You can provide feedback if the explanation is clear and medically
          relevant.
        </p>
      </div>
    ),
  },
  {
    selector: ".tasks-complete-card", // Add this class to the "Missing Values?" card
    content: (
      <div className="text-sm">
        <h3 className="font-semibold text-base mb-2">Task Completeness</h3>
        <p>
          This section asks if the selected tasks are enough to answer the
          question.
        </p>
        <p className="mt-1">
          Provide feedback if you think something is missing.
        </p>
      </div>
    ),
  },
  {
    selector: "#feedback", // The textarea already has this ID
    content: (
      <div className="text-sm">
        <h3 className="font-semibold text-base mb-2">Give Feedback</h3>
        <p>
          Use this field to give free-text feedback on the question, the tasks,
          or the system's reasoning.
        </p>
        <p className="mt-1">
          This helps us improve the question generation and task selection
          logic.
        </p>
      </div>
    ),
  },
];

const root = createRoot(document.getElementById("root")!);
root.render(
  //   <TourProvider steps={steps}>
  <TourProvider
    steps={steps}
    styles={{
      popover: (base) => ({
        ...base,
        "--reactour-accent": "#017E7C",
        borderRadius: 10,
      }),
      maskArea: (base) => ({ ...base, rx: 10 }),
      maskWrapper: (base) => ({ ...base, color: "#017E7C" }),
      badge: (base) => ({ ...base, left: "auto", right: "-0.8125em" }),
      controls: (base) => ({ ...base, marginTop: 100 }),
      close: (base) => ({ ...base, right: "auto", left: 10, top: 10 }),
    }}
  >
    <App />
  </TourProvider>
);
