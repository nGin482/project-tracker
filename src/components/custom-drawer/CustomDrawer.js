import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Drawer, Input, List } from "antd";
import { get } from "lodash";

const CustomDrawer = props => {
    const { title, view, open, listItems, onClose, switchProjectViewed } = props;

    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState(listItems);

    useEffect(() => {
        if (search !== '') {
            setSearchResults(listItems.filter(item => {
                const searchKey = view === 'projects' ? get(item, 'projectName') : get(item, 'title');
                return searchKey.toLowerCase().includes(search.toLowerCase())
            }
            ));
        }
        else {
            setSearchResults(listItems);
        }
    }, [search, listItems, view]);

    const closeDrawer = item => {
        setSearch('');
        view === 'projects' ? switchProjectViewed(item) : onClose(false)
    };

    return (
        <Drawer
            title={title}
            placement="left"
            open={open}
            onClose={closeDrawer}
        >
            <Input placeholder="Search" value={search} onChange={event => setSearch(event.target.value)}/>
            <List
                dataSource={searchResults}
                bordered
                renderItem={item => (
                    <List.Item onClick={() => closeDrawer(item)}>
                        {
                            view === 'projects' ?
                            <h3>{item.projectCode}: {item.projectName}</h3> :
                            <NavLink to={`/task/${item.taskID}`}><h3>{item.title}</h3></NavLink>
                        }
                    </List.Item>
                )}
            />
            </Drawer>
    );
};

export default CustomDrawer;