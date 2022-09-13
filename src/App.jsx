import React from 'react';

import axios  from 'axios';
import moment from 'moment';

import {
  signUpWithEmail,   signInWithEmail,
  sendPasswordReset, signOutOfAccount,
  setupAuthListener, getIdToken
} from './firebase';

import {
  Typography, Divider,    Button,     Empty,
  Skeleton,   Card,       Layout,     Menu,
  Modal,      Form,       Tooltip,    Popconfirm,
  Checkbox,   Input,      Radio,      Select,
  Dropdown,   DatePicker, Progress,   Calendar,
  Badge,      Spin,       Tag
} from 'antd';

import { CompactPicker } from 'react-color';

import {
  DeleteFilled,     DeleteOutlined,        EditFilled,          EditOutlined,
  FlagFilled,       FormatPainterOutlined, FileTextOutlined,    FlagOutlined,
  CalendarOutlined, FilterOutlined,        CheckCircleOutlined, SmileOutlined,
  ClearOutlined,    UserOutlined,          LockOutlined,        MailOutlined,
  LogoutOutlined,   CaretRightOutlined,    CloseOutlined,       CodeFilled,

  ContainerOutlined, PushpinOutlined,     ScheduleOutlined,     StarOutlined,
  BellOutlined,      BugOutlined,         BulbOutlined,         ExperimentOutlined,
  GiftOutlined,      HomeOutlined,        NotificationOutlined, ShoppingOutlined,
  RocketOutlined,    ThunderboltOutlined, ToolOutlined,

  ContainerFilled, PushpinFilled, ScheduleFilled,    StarFilled,
  BellFilled,      BugFilled,     BulbFilled,        ExperimentFilled,
  GiftFilled,      HomeFilled,    LockFilled,        NotificationFilled,
  ShoppingFilled,  RocketFilled,  ThunderboltFilled, ToolFilled,

  FireOutlined, FireFilled, PlusSquareOutlined, PlusSquareFilled,
  UpOutlined
} from '@ant-design/icons';

import { red, orange, yellow, gold, lime, green, cyan, blue, purple, magenta, grey } from '@ant-design/colors';

import './App.css';

const { Content, Sider } = Layout;
const { Paragraph, Text, Title, Link } = Typography;

const priorityColors = [
  red[3],  gold[5],
  blue[4], grey[4],
];

const icons = [
  { id: 'bell',      name: 'Bell',         icon: <BellOutlined         />, filled: <BellFilled         /> },
  { id: 'bug',       name: 'Bug',          icon: <BugOutlined          />, filled: <BugFilled          /> },
  { id: 'beaker',    name: 'Beaker',       icon: <ExperimentOutlined   />, filled: <ExperimentFilled   /> },
  { id: 'gift',      name: 'Present',      icon: <GiftOutlined         />, filled: <GiftFilled         /> },
  { id: 'home',      name: 'Home',         icon: <HomeOutlined         />, filled: <HomeFilled         /> },
  { id: 'lightbulb', name: 'Lightbulb',    icon: <BulbOutlined         />, filled: <BulbFilled         /> },
  { id: 'lock',      name: 'Lock',         icon: <LockOutlined         />, filled: <LockFilled         /> },
  { id: 'megaphone', name: 'Megaphone',    icon: <NotificationOutlined />, filled: <NotificationFilled /> },
  { id: 'bag',       name: 'Shopping Bag', icon: <ShoppingOutlined     />, filled: <ShoppingFilled     /> },
  { id: 'rocket',    name: 'Rocket',       icon: <RocketOutlined       />, filled: <RocketFilled       /> },
  { id: 'lightning', name: 'Thunderbolt',  icon: <ThunderboltOutlined  />, filled: <ThunderboltFilled  /> },
  { id: 'wrench',    name: 'Wrench',       icon: <ToolOutlined         />, filled: <ToolFilled         /> },
];

const host = 'https://todobox.octalwise.com';

class App extends React.Component {
  state = {
    token:        null,
    fetchingUser: true,
    loadingUser:  false,

    allTasks:          [],
    tasks:             null,
    taskModalSubtasks: [],

    sections:          null,
    currentSection:    'all',
    sectionModalColor: '#ccc',
    sectionsCollapsed: false,

    taskModalEnabled:          false,
    subtaskModalEnabled:       false,
    sectionModalEnabled:       false,
    passwordResetModalEnabled: false,

    updateTask:    null,
    updateSection: null,
    loggingUp:     false,

    visibleTaskButtons:    null,
    visibleSubtasks:       null,
    visibleSectionButtons: null,
  }

  taskFormRef          = React.createRef();
  subtaskFormRef       = React.createRef();
  sectionFormRef       = React.createRef();
  loginFormRef         = React.createRef();
  passwordResetFormRef = React.createRef();

  componentDidMount() {
    setupAuthListener(() => {
      getIdToken((token) => {
        if (token) {
          this.setState({
            token: token,
            fetchingUser: false
          }, () => this.setup());
        } else {
          this.setState({ fetchingUser: false });
        }
      });
    });

    this.setup();
  }

  setup() {
    if (!this.state.token) {
      return;
    }

    this.getTasks();
    this.getSections();
  }

  getTasks() {
    const { token } = this.state;

    if (!token) {
      return;
    }

    axios.get(`${host}/api/tasks`, { headers: { Authorization: token } })
      .then((res) => {
        this.setState({ allTasks: res.data }, () => this.loadSection());
      })
      .catch((err) => {
        console.error(err);
      });
  }

  getSections() {
    const { token } = this.state;

    if (!token) {
      return;
    }

    axios.get(`${host}/api/sections`, { headers: { Authorization: token } })
      .then((res) => {
        this.setState({ sections: res.data });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  createTaskWithData(data) {
    const { token } = this.state;

    if (!token) {
      return;
    }

    axios.post(`${host}/api/task`, data, { headers: { Authorization: token } })
      .then(() => this.getTasks())
      .catch((err) => {
        console.error(err);
      });
  }

  updateTaskWithData(id, data) {
    const { token } = this.state;

    if (!token) {
      return;
    }

    axios.put(`${host}/api/task/${id}`, data, { headers: { Authorization: token } })
      .then(() => this.getTasks())
      .catch((err) => {
        console.error(err);
      });
  }

  removeTaskWithId(id) {
    const { token } = this.state;

    if (!token) {
      return;
    }

    axios.delete(`${host}/api/task/${id}`, { headers: { Authorization: token } })
      .then(() => this.getTasks())
      .catch((err) => {
        console.error(err);
      });
  }

  createSectionWithData(data) {
    const { token } = this.state;

    if (!token) {
      return;
    }

    axios.post(`${host}/api/section`, data, { headers: { Authorization: token } })
      .then(() => this.getSections())
      .catch((err) => {
        console.error(err);
      });
  }

  updateSectionWithData(id, data) {
    const { token } = this.state;

    if (!token) {
      return;
    }

    axios.put(`${host}/api/section/${id}`, data, { headers: { Authorization: token } })
      .then(() => this.getSections())
      .catch((err) => {
        console.error(err);
      });
  }

  removeSectionWithId(id) {
    const { token } = this.state;

    if (!token) {
      return;
    }

    axios.delete(`${host}/api/section/${id}`, { headers: { Authorization: token } })
      .then(() => {
        this.setState({
          currentSection: this.state.currentSection === id && 'all'
        }, () => this.setup());
      })
      .catch((err) => {
        console.error(err);
      });
  }

  loadSection() {
    const { allTasks, currentSection } = this.state;

    if (!allTasks) {
      return;
    }

    switch (currentSection) {
      case 'all':
        this.setState({ tasks: allTasks });
        break;

      case 'today':
        this.setState({
          tasks: allTasks.filter((task) => (
            task.date === moment(moment().format('D M Y'), 'D M Y').unix() * 1000
          ))
        });
        break;

      case 'calendar':
        this.setState({ tasks: allTasks });
        break;

      case 'noSection':
        this.setState({
          tasks: allTasks.filter((task) => (
            task.section === null
          ))
        });
        break;

      default:
        this.setState({
          tasks: allTasks.filter((task) => (
            task.section === currentSection
          ))
        });
    }
  }

  getSection(id) {
    switch (id) {
      case 'all':
        return {
          id: 'all',
          name: 'All Tasks',
          icon: null,
          color: null
        }

      case 'today':
        return {
          id: 'today',
          name: 'Today',
          icon: null,
          color: null
        }

      case 'calendar':
        return {
          id: 'calendar',
          name: 'Calendar',
          icon: null,
          color: null
        }

      case 'noSection':
        return {
          id: 'noSection',
          name: 'No Section',
          icon: null,
          color: null
        }

      default:
        return this.state.sections?.find(
          (section) => section.id === id
        );
    }
  }

  getSectionIcon(id) {
    switch (id) {
      case 'all':
        return <ContainerOutlined />;

      case 'today':
        return <PushpinOutlined />;

      case 'calendar':
        return <ScheduleOutlined />;

      case 'noSection':
        return <FireOutlined />;

      default:
        let sectionIcon = this.getSection(id).icon;
        let foundIcon = icons.find((icon) => icon.id === sectionIcon);

        return sectionIcon ? foundIcon.icon : <StarOutlined />;
    }
  }

  getFilledSectionIcon(id) {
    switch (id) {
      case 'all':
        return <ContainerFilled />;

      case 'today':
        return <PushpinFilled />;

      case 'calendar':
        return <ScheduleFilled />;

      case 'noSection':
        return <FireFilled />;

      default:
        let sectionIcon = this.getSection(id).icon;
        let foundIcon = icons.find((icon) => icon.id === sectionIcon);

        return sectionIcon ? foundIcon.filled : <StarFilled />;
    }
  }

  enableTaskModal = () => {
    this.setState({ taskModalEnabled: true });
  }

  disableTaskModal = () => {
    this.setState({ taskModalEnabled: false });
  }

  enableSubtaskModal = () => {
    this.setState({ subtaskModalEnabled: true });
  }

  disableSubtaskModal = () => {
    this.setState({ subtaskModalEnabled: false });
  }

  enableSectionModal = () => {
    this.setState({ sectionModalColor: '#ccc' });
    this.setState({ sectionModalEnabled: true });
  }

  disableSectionModal = () => {
    this.setState({ sectionModalColor: '#ccc' });
    this.setState({ sectionModalEnabled: false });
  }

  enablePasswordResetModal = () => {
    this.setState({ passwordResetModalEnabled: true });
  }

  disablePasswordResetModal = () => {
    this.setState({ passwordResetModalEnabled: false });
  }

  Tasks = () => {
    const { tasks, visibleTaskButtons, visibleSubtasks } = this.state;

    const checkTask = (e, task) => {
      task.completed = e.target.checked;
      this.updateTaskWithData(task.id, task);
    }

    const checkSubtask = (e, task, index) => {
      task.subtasks[index].completed = e.target.checked;
      this.updateTaskWithData(task.id, task);
    }

    const removeTaskSection = (e, task) => {
      e.preventDefault();
      task.section = null;
      this.updateTaskWithData(task.id, task);
    }

    return tasks?.length > 0
      ? tasks.map((task) => {
        const { completed, id, name, description, priority, subtasks } = task;

        return (
          <div key={`taskWrapper${id}`}>
            <Paragraph
              key={`taskParagraph${id}`}
              style={{ marginBottom: description && visibleSubtasks !== id ? '0' : '10px' }}
              onMouseMove={() => {
                this.setState({ visibleTaskButtons: id });
              }}
              onMouseLeave={() => {
                this.setState({ visibleTaskButtons: null });
              }}
            >
              {subtasks.length > 0 &&
                <span
                  style={{
                    position: 'relative',
                    right: this.state.sectionsCollapsed ? '16px' : '18px',
                    top: '10px',
                    fontSize: '12px'
                  }}
                >
                  <UpOutlined
                    style={{
                      position: 'absolute',
                      transform: `rotate(${visibleSubtasks === id ? '180' : '0'}deg)`,
                      transition: 'all 0.3s'
                    }}
                    onClick={() => {
                      this.setState({
                        visibleSubtasks: visibleSubtasks === id ? null : id
                      });
                    }}
                  />
                </span>
              }

              <Checkbox
                style={{ padding: priority !== 4 ? '5px 5px 0 0' : '5px 1px 0 0' }}
                checked={completed}
                onChange={(e) => {
                  checkTask(e, task);
                }}
              />

              {priority !== 4 &&
                <Text
                  style={{
                    color: priorityColors[priority-1],
                    margin: '0 -5px 0 -5px'
                  }}
                >
                  &#9475;
                </Text>
              }

              <Text> </Text>

              <Text delete={completed}>
                {name}
              </Text>

              <Text> </Text>

              {visibleTaskButtons === id &&
                <EditFilled
                  style={{ color: gold.primary }}
                  onClick={() => {
                    this.setState({
                      taskModalSubtasks: subtasks,
                      updateTask: task
                    }, this.enableTaskModal());
                  }}
                />
              }

              {visibleTaskButtons === id &&
                <Popconfirm
                  title="Delete this task?"
                  icon={<DeleteOutlined style={{ color: grey.primary }} />}
                  okText="Delete"
                  okType="danger primary"
                  onConfirm={() => {
                    this.removeTaskWithId(id);
                  }}
                >
                  <DeleteFilled style={{ color: red[4] }} />
                </Popconfirm>
              }

              {(this.state.currentSection === 'all' ||
                this.state.currentSection === 'today') &&
                  this.getSection(task.section) &&
                  <Tag
                    className="section-tag"
                    color={this.getSection(task.section).color}
                    onClose={(e) => {
                      e.preventDefault();
                      removeTaskSection(e, task);
                    }}
                    closable
                  >
                    {this.getFilledSectionIcon(task.section)}
                  </Tag>
              }

              <br />

              {description && visibleSubtasks !== id &&
                <Text
                  style={{
                    fontSize: '12px',
                    position: 'relative',
                    top: '-5px'
                  }}
                  type="secondary"
                  delete={completed}
                >
                  {` ${description}`}
                </Text>
              }

              {visibleSubtasks === id &&
                subtasks.map((subtask, index) => (
                  <>
                    <Divider
                      style={ index !== 0 ? {
                        margin: '5px 0 5px 10px',
                          minWidth: 'calc(100% - 10px)',
                          width: 'calc(100% - 10px)'
                      } : { margin: '5px 0' }
                      }
                    />
                    <Paragraph
                      key={`${index}subtask${id}`}
                      style={{ margin: '0 0 0 10px' }}
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onChange={(e) => {
                          checkSubtask(e, task, index);
                        }}
                      />
                      <Text> </Text>
                      <Text delete={subtask.completed}>
                        {subtask.name}
                      </Text>
                    </Paragraph>
                  </>
                ))
              }
            </Paragraph>
            <Divider style={{ margin: '5px 0' }} />
          </div>
        )
      })
      : <Empty
          key="noTasksImage"
          style={{ padding: '25px', fontWeight: 'bold' }}
          description="No Tasks!"
          image={
            <span
              style={{
                color: '#a0a3a5',
                fontSize: '65px'
              }}
            >
              {this.getFilledSectionIcon(this.state.currentSection)}
            </span>
          }
        >
          <Button
            style={{ padding: '0 10px', marginTop: '5px' }}
            type="primary"
            onClick={() => {
              this.setState({
                updateTask: null,
                taskModalSubtasks: []
              }, this.enableTaskModal());
            }}
            ghost
          >
            <PlusSquareFilled /> Add Task
          </Button>
        </Empty>
  }

  getSectionMenuItems() {
    const { visibleSectionButtons } = this.state;

    return this.state.sections.map((section) => {
      const { id, name, icon, color } = section;

      return (
        <Menu.Item
          key={id}
          icon={icon
            ? <span style={{ color: color }}>
              {this.getSectionIcon(id)}
            </span>
            : this.state.sectionsCollapsed &&
              <span style={{ color: color }}>
                <StarOutlined />
              </span>
          }
          onMouseMove={() => {
            !this.state.sectionsCollapsed &&
              this.setState({ visibleSectionButtons: id });
          }}
          onMouseLeave={() => {
            this.setState({ visibleSectionButtons: null });
          }}
        >
          <div style={{ display: 'flex' }}>
            <div
              style={{
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {name}
            </div>
            <div>
              {visibleSectionButtons === id &&
                <EditOutlined
                  style={{ color: gold.primary }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.setState({
                      sectionModalColor: color || '#ccc',
                      updateSection: section
                    }, this.enableSectionModal())
                  }}
                />
              }
            </div>
            <div>
              {visibleSectionButtons === id &&
                <Popconfirm
                  title="Delete this section?"
                  icon={<DeleteOutlined style={{ color: grey.primary }} />}
                  okText="Delete"
                  okType="danger primary"
                  onConfirm={() => {
                    this.removeSectionWithId(id);
                  }}
                >
                  <DeleteOutlined
                    style={{ color: red[4] }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </Popconfirm>
              }
            </div>
          </div>
        </Menu.Item>
      );
    });
  }

  TaskModal = () => {
    const { updateTask, currentSection } = this.state;

    const postTask = () => {
      this.taskFormRef.current.validateFields()
        .then((vals) => {
          let newTask = {
            name: vals.name,
            description: vals.description,
            priority: vals.priority,
            date: vals.date !== false ?
            moment(moment(vals.date).format('D M Y'), 'D M Y').unix() * 1000 :
            null,
            section: vals.section,
            subtasks: this.state.taskModalSubtasks
          };

          this.createTaskWithData(newTask);

          this.taskFormRef.current.resetFields();
          this.disableTaskModal();
        }, () => {});
    }

    const putTask = () => {
      this.taskFormRef.current.validateFields()
        .then((vals) => {
          let newTask = {
            completed: this.state.updateTask.completed,
            name: vals.name,
            description: vals.description,
            priority: vals.priority,
            date: vals.date !== false ?
            moment(moment(vals.date).format('D M Y'), 'D M Y').unix() * 1000 :
            null,
            section: vals.section,
            subtasks: this.state.taskModalSubtasks
          };

          this.updateTaskWithData(this.state.updateTask.id, newTask);

          this.taskFormRef.current.resetFields();
          this.disableTaskModal();
        }, () => {});
    }

    const addSubtask = () => {
      this.subtaskFormRef.current.validateFields()
        .then((vals) => {
          let newSubtask = { name: vals.name };
          let subtasks = [...this.state.taskModalSubtasks];

          subtasks.push(newSubtask);
          this.setState({ taskModalSubtasks: subtasks });

          this.subtaskFormRef.current.resetFields();
          this.disableSubtaskModal();
        })
    }

    const removeSubtask = (index) => {
      let subtasks = [...this.state.taskModalSubtasks];
      subtasks.splice(index, 1);

      this.setState({ taskModalSubtasks: subtasks });
    }

    return (
      <Modal
        title={!updateTask ? 'Add Task' : 'Edit Task'}
        visible={this.state.taskModalEnabled}
        okText={!updateTask ? 'Add' : 'Update'}
        cancelText="Cancel"
        onOk={!updateTask ? postTask : putTask}
        onCancel={this.disableTaskModal}
        destroyOnClose
      >
        <Form
          name="create-task-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          ref={this.taskFormRef}
          initialValues={!updateTask
            ? {
              completed: false,
              priority: 4,
              date: currentSection === 'today' && moment(),
              section: currentSection !== 'all' && currentSection !== 'today' &&
              currentSection !== 'noSection' ? currentSection : null
            }
            : {
              completed: updateTask.completed,
              name: updateTask.name,
              description: updateTask.description,
              priority: updateTask.priority,
              date: updateTask.date !== null && moment(updateTask.date),
              section: updateTask.section
          }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Enter a name' }]}
          >
            <Input
              className="task-modal-name-input"
              prefix={<FormatPainterOutlined />}
              placeholder="Name"
              maxLength={75}
            />
          </Form.Item>

          <Text className="form-item-header">
            <FileTextOutlined style={{ margin: '5px' }} />
            <Text type="secondary">
              Description
            </Text>
          </Text>
          <Form.Item name="description">
            <Input.TextArea
              style={{ resize: 'none' }}
              placeholder="Description"
              rows={2}
              maxLength={100}
            />
          </Form.Item>

          <Text className="form-item-header">
            <FlagOutlined style={{ margin: '5px' }} />
            <Text type="secondary">
              Priority
            </Text>
          </Text>
          <Form.Item name="priority">
            <Radio.Group>
              { priorityColors.map((color, index) => (
                <Radio.Button key={`priorityFlag${index}`} value={index + 1}>
                  <FlagFilled style={{ color: color }} />
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item name="date">
            <DatePicker
              placeholder={moment().format('MMMM Do, YYYY')}
              format="MMMM Do, YYYY"
              suffixIcon={
                <Text>
                  <CalendarOutlined />
                </Text>
              }
            />
          </Form.Item>

          <Form.Item name="section">
            <Select
              placeholder={
                <Text>
                  <FilterOutlined style={{ marginRight: '5px' }} />
                  <Text disabled>
                    Section
                  </Text>
                </Text>
              }
              allowClear
            >
              {this.state.sections?.map((section) => (
                <Select.Option key={section.id}>
                  {this.getSectionIcon(section.id)}
                  {` ${section.name}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Text className="form-item-header">
            <CheckCircleOutlined style={{ margin: '5px' }} />
            <Text type="secondary">
              Subtasks
            </Text>
          </Text>
          <Card
            key="taskModalSubtasks"
            className="task-modal-subtasks-card"
          >
            {this.state.taskModalSubtasks.length > 0 &&
              <Card className="task-modal-subtasks-wrapper">
                { this.state.taskModalSubtasks.map((subtask, index) => (
                  <div key={`taskModalSubtask${index}`}>
                    <Text>
                      <CaretRightOutlined />
                      {` ${subtask.name}`}
                    </Text>
                    <CloseOutlined
                      style={{ float: 'right', paddingTop: '5px' }}
                      onClick={() => removeSubtask(index)}
                    />
                  </div>
                ))}
              </Card>
            }
            <Button
              type="secondary"
              size="small"
              onClick={this.enableSubtaskModal}
            >
              <PlusSquareOutlined /> Add
            </Button>
          </Card>
        </Form>

        <Modal
          title="Add Subtask"
          visible={this.state.subtaskModalEnabled}
          okText="Add"
          cancelText="Cancel"
          onOk={addSubtask}
          onCancel={this.disableSubtaskModal}
          destroyOnClose
        >
          <Form
            name="subtask-form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            ref={this.subtaskFormRef}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Enter a name' }]}
            >
              <Input
                prefix={<FormatPainterOutlined />}
                placeholder="Name"
                maxLength={25}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Modal>
    )
  }

  SectionModal = () => {
    const { updateSection } = this.state;

    const postSection = () => {
      this.sectionFormRef.current.validateFields()
        .then((vals) => {
          let newSection = {
            name: vals.name,
            icon: vals.icon,
            color: this.state.sectionModalColor
          };

          this.createSectionWithData(newSection);

          this.sectionFormRef.current.resetFields();
          this.disableSectionModal();
        }, () => {});
    }

    const putSection = () => {
      this.sectionFormRef.current.validateFields()
        .then((vals) => {
          let newSection = {
            name: vals.name,
            icon: vals.icon,
            color: this.state.sectionModalColor
          };

          this.updateSectionWithData(this.state.updateSection.id, newSection);

          this.sectionFormRef.current.resetFields();
          this.disableSectionModal();
        }, () => {});
    }

    return (
      <Modal
        title={!updateSection ? 'Add Section' : 'Update Section'}
        visible={this.state.sectionModalEnabled}
        okText={!updateSection ? 'Add' : 'Update'}
        cancelText="Cancel"
        onOk={!updateSection ? postSection : putSection}
        onCancel={this.disableSectionModal}
        destroyOnClose
      >
        <Form
          name="create-section-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          ref={this.sectionFormRef}
          initialValues={updateSection !== null && {
            name: updateSection.name,
            icon: updateSection.icon
          }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Enter a name' }]}
          >
            <Input
              prefix={<FormatPainterOutlined />}
              placeholder="Name"
              maxLength={75}
            />
          </Form.Item>

          <Form.Item name="icon">
            <Select
              placeholder={
                <Text>
                  <SmileOutlined style={{ marginRight: '5px' }} />
                  <Text disabled>
                    Icon
                  </Text>
                </Text>
              }
              allowClear
            >
              {icons.map((icon) => (
                <Select.Option key={icon.id}>
                  {icon.icon} {icon.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Text className="form-item-header">
            <ClearOutlined style={{ margin: '5px' }} />
            <Text type="secondary" >
              Color
            </Text>
          </Text>
          <Form.Item
            className="section-modal-color-picker"
            style={{ paddingLeft: '3px' }}
          >
            <CompactPicker
              color={this.state.sectionModalColor}
              colors={[
                '#888888', '#AAAAAA', '#CCCCCC', red[5],  orange[5], yellow[5],
                lime[5],   green[5],  cyan[5],   blue[5], purple[5], magenta[5],
                '#777777', '#999999', '#B0B0B0', red[6],  orange[6], yellow[6],
                lime[6],   green[6],  cyan[6],   blue[6], purple[6], magenta[6],
              ]}
              onChange={(color) => {
                this.setState({ sectionModalColor: color.hex });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    )
  }

  LoginModal = () => {
    const { loggingUp } = this.state;

    const signUp = () => {
      this.setState({ loadingUser: true });

      this.loginFormRef.current.validateFields()
        .then((vals) => {
          signUpWithEmail(vals.username, vals.email, vals.password)
            .then(() => {
              this.setState({ loadingUser: false }, () => this.setup());
              this.loginFormRef.current.resetFields();
            })
            .catch((err) => {
              console.error(err);
            });
          },
          () => {
            this.setState({ loadingUser: false });
          });
    }

    const signIn = () => {
      this.setState({ loadingUser: true });

      this.loginFormRef.current.validateFields()
        .then((vals) => {
          signInWithEmail(vals.email, vals.password, vals.persist)
            .then((user) => {
              if (user) {
                getIdToken((token) => {
                  this.setState({
                    token: token,
                    loadingUser: false
                  }, () => this.setup());
                });

                this.loginFormRef.current.resetFields();
              } else {
                this.setState({ loadingUser: false });
              }
            })
            .catch((err) => {
              console.error(err);
            });
        },
        (err) => {
          console.error(err);
          this.setState({ loadingUser: false });
        });
    }

    const resetPassword = () => {
      this.passwordResetFormRef.current.validateFields()
        .then((vals) => {
          sendPasswordReset(vals.email);

          this.passwordResetFormRef.current.resetFields();
          this.disablePasswordResetModal();
        }, () => {});
    }

    return (
      <Modal
        title={!loggingUp ? 'Sign In' : 'Sign Up'}
        visible={!this.state.token}
        onOk={!loggingUp ? signIn : signUp}
        closable={false}
        footer={[
          <Button
            key="toggleSignButton"
            style={{ float: 'left' }}
            type="secondary"
            disabled={this.state.loadingUser || this.state.fetchingUser}
            onClick={() => this.setState({ loggingUp: !loggingUp })}
          >
            {!loggingUp ? 'Sign Up' : 'Sign In'}
          </Button>,
          <Button
            key="submitButton"
            type="primary"
            loading={this.state.loadingUser}
            disabled={this.state.fetchingUser}
            onClick={!loggingUp ? signIn : signUp}
          >
            Submit
          </Button>,
        ]}
        destroyOnClose
      >
        <Spin
          style={{ fontWeight: 'bold' }}
          size="large"
          tip="Loading..."
          spinning={this.state.fetchingUser}
        >
          <Form
            name="login-form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            ref={this.loginFormRef}
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="email"
              rules={[
                { type: 'email', message: 'Enter a valid email' },
                { required: true, message: 'Enter an email' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Enter a password' },
                { type: 'string', min: 6, message: 'Enter at least six chars' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>

            {loggingUp &&
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Enter a username' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>
            }

            {!loggingUp &&
              <Form.Item>
                <Form.Item name="persist" valuePropName="checked" noStyle>
                  <Checkbox>Remember Me</Checkbox>
                </Form.Item>

                <Link style={{ float: 'right' }} onClick={this.enablePasswordResetModal}>
                  Forgot Password?
                </Link>
              </Form.Item>
            }
          </Form>
        </Spin>

        <Modal
          title="Account Recovery"
          visible={this.state.passwordResetModalEnabled}
          okText="Recover"
          cancelText="Cancel"
          onOk={resetPassword}
          onCancel={this.disablePasswordResetModal}
          destroyOnClose
        >
          <Form
            name="password-reset-form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            ref={this.passwordResetFormRef}
          >
            <Form.Item
              name="email"
              rules={[
                { type: 'email', message: 'Enter a valid email' },
                { required: true, message: 'Enter an email' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Modal>
    )
  }

  SectionsSider = () => {
    return (
      <Sider
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed'
        }}
        theme="dark"
        width={200}
        collapsed={this.state.sectionsCollapsed}
        onCollapse={(collapsed) => {
          this.setState({
            sectionsCollapsed: collapsed,
            visibleSectionButtons: null
          });
        }}
        collapsible
      >
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-around'
          }}
        >
          <div className="logo" />
        </span>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[this.state.currentSection]}
          onClick={(e) => { e.key !== 'createSection' &&
              this.setState({
                currentSection: e.key
              }, () => this.loadSection());
          }}
        >
          <Menu.Divider />

          <Menu.Item
            key="all"
            icon={
              <span style={{ color: blue[3] }}>
                <ContainerOutlined />
              </span>
            }
          >
            All Tasks
          </Menu.Item>
          <Menu.Item
            key="today"
            icon={
              <span style={{ color: red[3] }}>
                <PushpinOutlined />
              </span>
            }
          >
            Today
          </Menu.Item>
          <Menu.Item
            key="calendar"
            icon={
              <span style={{ color: purple[3] }}>
                <ScheduleOutlined />
              </span>
            }
          >
            Calendar
          </Menu.Item>
          <Menu.Item
            key="noSection"
            icon={
              <span style={{ color: orange[4] }}>
                <FireOutlined />
              </span>
            }
          >
            No Section
          </Menu.Item>

          <Menu.Divider />

          {this.state.sections && this.state.sections.length > 0 &&
            <>
              {this.getSectionMenuItems()}
              <Menu.Divider />
            </>
          }

          {this.state.sections &&
            <Menu.Item
              key="createSection"
              icon={<PlusSquareOutlined style={{ color: blue[4] }} />}
              onClick={() => {
                this.setState({
                  updateSection: null
                }, this.enableSectionModal());
              }}
            >
              Add Section
            </Menu.Item>
          }

          <Menu.Divider style={{ height: '42.5px', borderColor: '#0000' }} />
        </Menu>
      </Sider>
    )
  }

  dateCellTasks = (value) => {
    let valueMs = moment(moment(value).format('D M Y'), 'D M Y').unix() * 1000;
    let dateTasks = this.state.tasks.filter((task) => task.date === valueMs);

    return (
      <ul>
        { dateTasks.map((task) => (
          <li
            key={`badge${task.id}`}
            style={{ color: priorityColors[task.priority-1] }}
          >
            <Badge />
            <Text delete={task.completed}>
              {task.name}
            </Text>
          </li>
        ))}
      </ul>
    )
  }

  render() {
    const { token, tasks, currentSection } = this.state;

    return (
      <>
        <Layout>
          <this.SectionsSider />
        </Layout>

        <Layout
          style={{
            marginLeft: !this.state.sectionsCollapsed ? '200px' : '75px',
            transition: 'all 0.2s'
          }}
        >
          <Content style={{ padding: '25px' }}>
            {window.location.host.startsWith('localhost:') &&
              <CodeFilled
                style={{
                  position: 'fixed',
                  bottom: '10px',
                  right: '10px',
                  fontSize: '35px',
                  zIndex: '100'
                }}
              />
            }

            <Title
              style={{ display: 'flex', marginBottom: '7px' }}
              level={4}
            >
              {tasks?.length > 0 &&
               currentSection !== 'all' &&
               currentSection !== 'calendar' &&
               currentSection !== 'noSection' &&
                <Tooltip
                  title={
                    `${tasks?.filter((task) => task.completed).length}/${tasks?.length}`
                  }
                  color={ tasks?.filter((task) => task.completed).length > 0 ?
                      tasks?.filter((task) => !task.completed).length === 0 ?
                      green.primary : blue.primary
                      : grey[6]
                  }
                  placement="left"
                >
                  <Progress
                    className="task-progress"
                    style={{ padding: '2px 7px 0 0' }}
                    type="circle"
                    percent={
                      tasks?.filter((task) => task.completed).length /
                        tasks?.length
                        * 100
                    }
                    width={20}
                    strokeWidth={50}
                    strokeLinecap="butt"
                    trailColor={grey[6]}
                    showInfo={false}
                  />
                </Tooltip>
              }
              {this.getSection(currentSection).name}
            </Title>

            <Divider style={{ margin: '0 0 10px 0' }} />

            {currentSection !== 'calendar' ?
              (tasks
                ? <this.Tasks />
                : <Skeleton active={token} />)
                : <Calendar dateCellRender={this.dateCellTasks} />
            }

            <this.TaskModal />
            <this.SectionModal />
            <this.LoginModal />

            {tasks &&
             tasks.length > 0 &&
             currentSection !== 'calendar' &&
              <Button
                style={{ padding: '0 10px', marginTop: '5px' }}
                type="primary"
                onClick={() => {
                  this.setState({
                    updateTask: null,
                    taskModalSubtasks: []
                  }, this.enableTaskModal());
                }}
                ghost
              >
                <PlusSquareFilled /> Add Task
              </Button>
            }

            {token &&
              <Dropdown
                placement="bottomRight"
                trigger={['click']}
                overlay={
                  <Menu>
                    <Menu.Item
                      key="logout"
                      style={{ color: red.primary }}
                      icon={<LogoutOutlined />}
                      onClick={() => {
                        signOutOfAccount();
                        this.setState({ token: null });
                        window.location.reload();
                      }}
                    >
                      Log Out
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px'
                  }}
                  type="primary"
                  icon={<UserOutlined />}
                />
              </Dropdown>
            }
          </Content>
        </Layout>
      </>
    );
  }
}

export default App;
