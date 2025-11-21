export default(db, DataTypes) => {
    const AclRule = db.define("AclRule", {
        rules:{
            type:DataTypes.ARRAY(DataTypes.STRING)
        }
    })
    return AclRule;
}