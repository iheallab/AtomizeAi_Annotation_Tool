import React from "react";
import { Col, Row, Card, Typography, Radio, Descriptions, Tag } from "antd";
import { DislikeOutlined, LikeOutlined } from "@ant-design/icons";

const { Title } = Typography;
import "./question.css";

interface QuestionProps {
  question_idx: number;
  question: string;
  questionValid: boolean | null;
  setQuestionValidity: React.Dispatch<React.SetStateAction<(boolean | null)[]>>;
  category: string[];
  icu_type: string[];
  context: string;
}

const Question: React.FC<QuestionProps> = ({
  question_idx,
  question,
  questionValid,
  setQuestionValidity,
  category,
  icu_type,
  context,
}) => {
  // const [api, contextHolder] = notification.useNotification();

  // const openNotification = (pauseOnHover: boolean = true) => {
  //   api.destroy();
  //   api.open({
  //     message: "Please provide feedback",
  //     duration: 1,
  //    c pauseOnHover,
  //     placement: "bottomRight",
  //   });
  // };

  // useEffect(() => {
  //   if (questionValid === false) {
  //     openNotification();
  //   }
  // }, [questionValid]);

  return (
    <Card
      hoverable
      className="question-card"
      style={{
        border: "0.1px solid rgba(128, 128, 128, 0.5)",
      }}
    >
      {/* {contextHolder} */}

      {/* ICU Type & Category - Properly Aligned */}
      <Descriptions column={1} layout="horizontal" className="question-tags">
        <Descriptions.Item label="ICU Unit Type">
          {icu_type.map((icuType) => (
            <Tag color="magenta" key={icuType}>
              {icuType}
            </Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          {category.map((cat) => (
            <Tag color="geekblue" key={cat}>
              {cat}
            </Tag>
          ))}
        </Descriptions.Item>
      </Descriptions>

      {/* Question and Context */}
      <Row gutter={[16, 16]} align="middle">
        <Col span={20} style={{ textAlign: "left" }}>
          <Title level={5} style={{ marginBottom: "4px", textAlign: "left" }}>
            {question}
          </Title>
          <Typography.Text type="secondary">
            <b>Context </b>: {context}
          </Typography.Text>
        </Col>

        {/* Validation Buttons - Always Right-Aligned */}
        <Col span={4} style={{ textAlign: "right" }}>
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
                return updatedValidity;
              })
            }
            buttonStyle="solid"
          >
            <Radio.Button
              value="like"
              className={`valid-btn ${
                questionValid === true ? "selected" : ""
              }`}
            >
              <LikeOutlined />
            </Radio.Button>

            <Radio.Button
              value="dislike"
              className={`invalid-btn ${
                questionValid === false ? "selected" : ""
              }`}
            >
              <DislikeOutlined />
            </Radio.Button>
          </Radio.Group>
        </Col>
      </Row>
    </Card>
  );
};

export default Question;
