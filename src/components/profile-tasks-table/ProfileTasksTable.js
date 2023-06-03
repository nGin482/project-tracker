import { Table } from "antd";
import StatusTag from "../status-tag/StatusTag";


const ProfileTasksTable = props => {

    const { tasks } = props;


    const tableColumns = [
        {
            title: 'TaskID',
            dataIndex: 'taskID',
            key: 'taskID',
            sorter: (a, b) => Number(a.taskID.slice(-1)) - Number(b.taskID.slice(-1))
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            filterSearch: true,
            filters: [
                {
                    text: 'Task',
                    value: 'task'
                },
                {
                    text: 'Bug',
                    value: 'bug'
                },
                {
                    text: 'Epic',
                    value: 'epic'
                }
            ],
            onFilter: (value, record) => record.type.toLowerCase().includes(value.toLowerCase()),
            filterMultiple: false,
            render: value => value.charAt(0).toUpperCase() + value.slice(1)
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            filterSearch: true,
            filters: [
                {
                    text: 'Session Handler',
                    value: 'session handler'
                },
                {
                    text: 'OneSpan',
                    value: 'onespan'
                }
            ],
            onFilter: (value, record) => record.title.toLowerCase().includes(value.toLowerCase())
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Project',
            dataIndex: 'project',
            key: 'project',
            filterSearch: true,
            filters: [
                {
                    text: 'Project Tracker',
                    value: 'Project-Tracker'
                },
                {
                    text: 'TV Guide',
                    value: 'TV-Guide'
                },
                {
                    text: 'TV Guide UI',
                    value: 'TV-Guide-UI'
                },
                {
                    text: 'Reading List',
                    value: 'Reading-List'
                }
                ,
                {
                    text: 'DVD Library',
                    value: 'DVD-Library'
                }
            ],
            onFilter: (value, record) => record.project.toLowerCase().includes(value.toLowerCase()),
            filterMultiple: false,
        },
        {
            title: 'Created',
            dataIndex: 'created',
            key: 'created'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filterSearch: true,
            filters: [
                {
                    text: 'Backlog',
                    value: 'backlog'
                },
                {
                    text: 'In Progress',
                    value: 'in progress'
                },
                {
                    text: 'Testing',
                    value: 'testing'
                },
                {
                    text: 'Complete',
                    value: 'complete'
                },
                {
                    text: 'Blocked',
                    value: 'blocked'
                }
            ],
            onFilter: (value, record) => record.status.toLowerCase().includes(value.toLowerCase()),
            filterMultiple: false,
            render: value => <StatusTag status={value} />
        }
    ];

    const onTableChange = (pagination, filters, sorter, extra) => {
        console.log('table', pagination, filters, sorter, extra)
    }

    return (
        <Table id="profile-tasks-table" dataSource={tasks} columns={tableColumns} onChange={onTableChange} />
    )
}

export default ProfileTasksTable;