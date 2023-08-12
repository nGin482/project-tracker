import { Image, Menu } from "antd";


const ProfileViewMenu = props => {
    const { user, setView } = props;

    const menuItems = [
        {
            label: 'Profile',
            key: 'profile',
        },
        {
            label: 'Tasks',
            key: 'tasks'
        },
        {
            label: 'Notifications',
            key: 'notifications'
        },
        {
            label: 'Settings',
            key: 'settings'
        }
    ];
    
    return (
        <div id="profile-menu">
            {user.image && <Image src={user.image} width="256" height="312" />}
            {user.username && <h4>{user.username}</h4>}
            <Menu
                mode="vertical"
                items={menuItems}
                defaultSelectedKeys={['profile']}
                onClick={event => setView(event.key)}
                id="profile-menu-list"
            />
        </div>
    );
};

export default ProfileViewMenu;