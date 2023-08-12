import { NavLink } from "react-router-dom";
import { Image, Descriptions } from "antd";


const ProfileDetails = props => {
    const { user } = props;

    return (
        <Descriptions
            title={`${user.username}'s Details`}
            bordered
            layout="vertical"
            column={4}
            id="user-details"
            className="profile-right"
        >
            <Descriptions.Item label="UserName">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Image">
                <Image src={user.image} width="256" height="312" id="user-image" />
            </Descriptions.Item>
            <Descriptions.Item label="Actions">
                <NavLink to={`/profile/${user.username}/edit`}>Edit Details</NavLink>
            </Descriptions.Item>
        </Descriptions>
    );
};

export default ProfileDetails;