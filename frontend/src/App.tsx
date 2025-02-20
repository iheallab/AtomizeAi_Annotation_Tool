// import React, { useState, useEffect } from 'react';
// import { Card, Button, Divider, List, Typography, Input, Row, Col, Modal, Tabs, Table, Checkbox, Select } from 'antd';
// import { LikeOutlined, DislikeOutlined } from '@ant-design/icons';
// import tasksData from './data/instruct_dataset.json';

// const { TextArea } = Input;
// const { TabPane } = Tabs;

// const sentences = tasksData.map((q: any) => q.Question);

// const App: React.FC = () => {
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [taskModalVisible, setTaskModalVisible] = useState(false);
//   const [selectedTask, setSelectedTask] = useState<any>(null);
//   const [currentSentence, setCurrentSentence] = useState(sentences[0]);

//   const questionEntry = tasksData.find((q: any) => q.Question === currentSentence);

//   // Initialize editable retrieval tasks from the current question entry.
//   const [retrievalTasksState, setRetrievalTasksState] = useState<any[]>(questionEntry ? questionEntry["Retrieval tasks"] : []);
//   const [newTable, setNewTable] = useState('');
//   const [newTask, setNewTask] = useState('');

//   // Update retrieval tasks if currentSentence changes.
//   useEffect(() => {
//     const updatedEntry = tasksData.find((q: any) => q.Question === currentSentence);
//     setRetrievalTasksState(updatedEntry ? updatedEntry["Retrieval tasks"] : []);
//   }, [currentSentence]);

//   const showModal = () => {
//     setIsModalVisible(true);
//   };

//   const handleOk = () => {
//     setIsModalVisible(false);
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };

//   const handleThumbUp = () => {
//     console.log("Thumbs up for:", currentSentence);
//   };

//   const handleThumbDown = () => {
//     console.log("Thumbs down for:", currentSentence);
//     // if don't like the current sentence, make the Retrieval Tasks unselectable
//   };

//   // Open modal for table in the task
//   const openTaskModal = (item: any) => {
//     setSelectedTask(item);
//     setTaskModalVisible(true);
//   };

//   const columns = [
//     {
//       title: 'Variable',
//       dataIndex: 'variable',
//       key: 'variable',
//     },
//     {
//       title: 'Description',
//       dataIndex: 'description',
//       key: 'description',
//     },
//   ];

//   // Dummy data
//   const data = [
//     {
//       key: '1',
//       variable: 'Data 1',
//       description: 'Description 1',
//     },
//     {
//       key: '2',
//       variable: 'Data 2',
//       description: 'Description 2',
//     },
//   ];

//   // Add a new retrieval task from the inputs.
//   const handleAddTask = () => {
//     if (newTable && newTask) {
//       const newEntry = { table: newTable, task: newTask };
//       setRetrievalTasksState([...retrievalTasksState, newEntry]);
//       setNewTable('');
//       setNewTask('');
//     }
//   };

//   return (
//     <div style={{ padding: '100px', margin: 'center', display: 'flex', justifyContent: 'center' }}>
//       <Card style={{ width: 1000, margin: 'center', padding: '50px' }}>
//         <Row justify="space-between" align="middle">
//           <Col>
//             <Typography.Text>{currentSentence}</Typography.Text>
//           </Col>
//           <Col>
//             <Button icon={<LikeOutlined />} onClick={handleThumbUp} />
//             <Button icon={<DislikeOutlined />} onClick={handleThumbDown} />
//           </Col>
//           <Col>
//             <Button type="primary" onClick={showModal}>Database</Button>
//           </Col>
//         </Row>
//         <Divider />
//         <List
//           header={<div>Relevant Retrieval Tasks</div>}
//           bordered
//           dataSource={retrievalTasksState}
//           renderItem={(item: any) => (
//             <List.Item>
//               <Checkbox style={{ marginRight: 8 }} />
//               <Typography.Text
//                 mark
//                 onClick={() => openTaskModal(item)}
//                 style={{ cursor: 'pointer' }}
//               >
//                 {item.table || '[No Table]'}
//               </Typography.Text> {item.task}
//             </List.Item>
//           )}
//         />
//         {/* New section for adding a retrieval task */}
//         <Divider />
//         <Row gutter={16} align="middle">
//           <Col span={8}>
//             <Select
//               placeholder="Select table"
//               value={newTable}
//               onChange={(value) => setNewTable(value)}
//               style={{ width: '100%' }}
//             >
//               <Select.Option value="Table 1">Table 1</Select.Option>
//               <Select.Option value="Table 2">Table 2</Select.Option>
//             </Select>
//           </Col>
//           <Col span={12}>
//             <Input
//               placeholder="Enter task"
//               value={newTask}
//               onChange={(e) => setNewTask(e.target.value)}
//             />
//           </Col>
//           <Col span={4}>
//             <Button type="primary" onClick={handleAddTask}>Add Task</Button>
//           </Col>
//         </Row>
//         <Divider />
//         <TextArea rows={4} placeholder="Additional feedback" />
//         <Divider />
//         <Button type="primary">Submit</Button>
//       </Card>

//       <Modal title="Database" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} width={800}>
//         <Tabs defaultActiveKey="1">
//           <TabPane tab="Table 1" key="1">
//             <Table columns={columns} dataSource={data} />
//           </TabPane>
//           <TabPane tab="Table 2" key="2">
//             <Table columns={columns} dataSource={data} />
//           </TabPane>
//         </Tabs>
//       </Modal>

//       <Modal
//         title={selectedTask ? selectedTask.table : 'Table Details'}
//         visible={taskModalVisible}
//         onOk={() => setTaskModalVisible(false)}
//         onCancel={() => setTaskModalVisible(false)}
//         width={600}
//       >
//         <Table columns={columns} dataSource={data} pagination={false} />
//       </Modal>
//     </div>
//   );
// };

import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/auth/login";
import Annotations from "./components/annot/annotations";
// import  Home  from "./components/home";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Annotations />} />
      </Route>
      <Route path="/login" element={<LoginForm />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/annotations" element={<Annotations />} />
      </Route>
    </Routes>
  );
};

export default App;
