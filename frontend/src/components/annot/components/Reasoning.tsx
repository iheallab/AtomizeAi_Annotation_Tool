import React from "react";
import { Alert, Card } from "antd";

interface ReasoningComponents {
  reasoning: string;
}

const Reasoning: React.FC<ReasoningComponents> = (reasoning) => {
  return (
    <div>
      <Card title="Reasoning" hoverable>
        <Alert
          message={
            <p style={{ textAlign: "justify" }}>{reasoning.reasoning}</p>
          }
          type="success"
        />
      </Card>
      {/* <Alert
        message="Very long warning text warning text text text text text text text"
        banner
        closable
      /> */}
    </div>
  );
};
export default Reasoning;
