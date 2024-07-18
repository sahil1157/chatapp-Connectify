import { userSocketIDs } from "../Server.js"

export const anotherUsersAvatar = (member, userid) => {

   return member.find(x => x._id.toString() !== userid.toString())
}


export const getSockets = (users = []) => {
     return users.map(user => userSocketIDs.get(user._id.toString()))
}
