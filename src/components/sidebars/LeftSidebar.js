import { useState, useEffect } from "react"
import { Input, Layout, List } from "antd";
import { NavLink } from "react-router-dom";
import './LeftSidebar.css';

const LeftSidebar = props => {
    const { listItems, view } = props;
    const { Sider } = Layout;

    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState(listItems);

    const handleSearch = event => {
        setSearch(event.target.value);
    };

    useEffect(() => {
        if (search !== '') {
            setSearchResults(listItems.filter(item => item.title.toLowerCase().includes(search.toLowerCase())));
        }
        else {
            setSearchResults(listItems);
        }
    }, [search]);

    return (
        <Sider width={220} className="left-sidebar">
            <h1>{view}</h1>
            <Input placeholder="Search" onChange={handleSearch}/>
            <List
                dataSource={searchResults}
                bordered
                renderItem={item => (
                    <List.Item>
                        <NavLink to={`/task/${item.taskID}`}><h3>{item.title}</h3></NavLink>
                    </List.Item>
                )}
            />
        </Sider>
    );
};

export default LeftSidebar;