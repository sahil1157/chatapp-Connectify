export const anotherUsersAvatar = (member, userid) => {

   return member.find(x => x._id.toString() !== userid.toString())
}