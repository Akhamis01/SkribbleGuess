import React from 'react';
import { MDBCol, MDBIcon } from "mdbreact";
import ScrollToBottom from 'react-scroll-to-bottom';

import './Users.css';

const Users = ({ currentUser, users }) => {

    return (
        <MDBCol className="drawing-users-column" size="3">
            <div className="drawing-users">
                <h1 className="users-title">Users</h1>
                <ScrollToBottom className="users-scroll">
                    {
                        users
                            ? (
                            <div>
                                {users.map(({ name, points }) => (
                                    name === currentUser.name ?
                                        <div key={name} className="activeItem">
                                            <h3 className="font-weight-bold mb-3 current-user-users"><MDBIcon icon="check" className="indigo-text"/>&nbsp; {name}: {points} pts</h3>
                                        </div>
                                    :
                                        <div key={name} className="activeItem">
                                            <h3 className="font-weight-bold mb-3"><MDBIcon icon="check" className="indigo-text"/>&nbsp; {name}: {points} pts</h3>
                                        </div>
                                ))}
                            </div>
                            ) : null
                    }
                </ScrollToBottom>
            </div>
        </MDBCol>
    )
};

export default Users;